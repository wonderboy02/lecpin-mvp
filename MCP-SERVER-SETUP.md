# MCP 서버 중복 실행 방지 설정 가이드

## 📋 목차

1. [문제 상황](#-문제-상황)
2. [해결 방법 개요](#-해결-방법-개요)
3. [사전 준비](#-사전-준비)
4. [설정 단계](#-설정-단계)
   - [Step 1: PowerShell 스크립트 작성](#step-1-powershell-스크립트-작성)
   - [Step 2: VSCode Tasks 설정](#step-2-vscode-tasks-설정)
   - [Step 3: Claude Code 설정 변경](#step-3-claude-code-설정-변경)
   - [Step 4: 테스트 및 확인](#step-4-테스트-및-확인)
5. [작동 원리](#-작동-원리)
6. [트러블슈팅](#-트러블슈팅)
7. [FAQ](#-faq)

---

## 🔴 문제 상황

### 현재 문제점

Claude Code를 터미널에서 여러 번 실행하거나 VSCode 창을 여러 개 열면 **MCP(Model Context Protocol) 서버 프로세스가 중복으로 실행**됩니다.

```
터미널 1에서 claude code 실행
  → Serena MCP 서버 프로세스 1 시작
  → Context7 MCP 서버 프로세스 1 시작

터미널 2에서 claude code 실행
  → Serena MCP 서버 프로세스 2 시작 (중복!)
  → Context7 MCP 서버 프로세스 2 시작 (중복!)

터미널 3에서 claude code 실행
  → Serena MCP 서버 프로세스 3 시작 (중복!)
  → Context7 MCP 서버 프로세스 3 시작 (중복!)
```

### 왜 이런 일이 발생하나요?

기존 MCP 서버는 **stdio(표준 입출력) 방식**으로 실행됩니다:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    }
  }
}
```

이 방식은 **Claude Code를 실행할 때마다 새로운 프로세스를 생성**합니다.

### 문제의 영향

- **메모리 낭비**: 동일한 서버가 여러 개 실행됨
- **성능 저하**: 각 프로세스가 독립적으로 리소스 사용
- **관리 어려움**: 어떤 프로세스가 실행 중인지 파악 어려움

---

## ✅ 해결 방법 개요

### 핵심 아이디어

**stdio 방식 → HTTP/SSE 방식으로 전환**

```
기존 (stdio):
  Claude Code 실행 → 새 MCP 서버 프로세스 생성

변경 후 (HTTP/SSE):
  MCP 서버 한 번만 시작 (포트 20001, 20002)
  Claude Code 실행 → 기존 HTTP 서버에 연결
```

### MCP 프로토콜의 전송 방식

MCP는 동일한 프로토콜이지만 **전송 방식(Transport)**을 선택할 수 있습니다:

| 전송 방식 | 설명 | 중복 실행 |
|----------|------|-----------|
| **stdio** | 프로세스 직접 실행 | ✗ 매번 새 프로세스 |
| **HTTP** | HTTP 서버로 연결 | ✓ 기존 서버 재사용 |
| **SSE** | Server-Sent Events | ✓ 기존 서버 재사용 |

**중요:** HTTP/SSE로 바꿔도 **제공하는 도구와 기능은 완전히 동일**합니다!

### 구현 전략

1. **MCP 서버를 독립 프로세스로 실행** (포트 20001, 20002 사용)
2. **VSCode 열 때 자동으로 서버 시작** (이미 실행중이면 스킵)
3. **Claude Code는 HTTP로 연결** (stdio 대신)

---

## 🛠️ 사전 준비

### 필수 조건

- ✅ **Windows** (PowerShell 사용)
- ✅ **VSCode** 설치됨
- ✅ **Claude Code** 설치됨
- ✅ **Node.js** 및 **Python** 환경

### 현재 MCP 서버 확인

터미널에서 현재 MCP 서버 상태를 확인합니다:

```bash
claude mcp list
```

**예상 출력:**
```
context7: npx -y @upstash/context7-mcp - ✓ Connected
serena: uvx --from git+https://github.com/oraios/serena serena start-mcp-server - ✓ Connected
```

---

## 📝 설정 단계

### Step 1: PowerShell 스크립트 작성

#### 1-1. 포트 체크 유틸리티 스크립트

**파일:** `scripts/check-port.ps1`

이 스크립트는 특정 포트가 사용 중인지 확인합니다.

```powershell
# 포트 사용 여부 확인 함수
param(
    [int]$Port
)

$connection = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue

if ($connection.TcpTestSucceeded) {
    # 포트가 사용 중
    return $true
} else {
    # 포트가 비어있음
    return $false
}
```

**사용 예시:**
```powershell
.\scripts\check-port.ps1 -Port 20001
# 출력: True (사용중) 또는 False (비어있음)
```

#### 1-2. MCP 서버 시작 스크립트

**파일:** `scripts/start-mcp-servers.ps1`

이 스크립트는 포트를 체크하고 필요시 MCP 서버를 시작합니다.

```powershell
# MCP 서버 자동 시작 스크립트
# VSCode에서 프로젝트를 열 때 자동으로 실행됩니다

$ErrorActionPreference = "SilentlyContinue"

Write-Host "🔍 MCP 서버 상태 확인 중..." -ForegroundColor Cyan

# 포트 설정
$SERENA_PORT = 20001
$CONTEXT7_PORT = 20002

# 포트 체크 함수
function Test-PortInUse {
    param([int]$Port)

    $connection = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Serena MCP 서버 시작
if (Test-PortInUse -Port $SERENA_PORT) {
    Write-Host "✓ Serena MCP Server: 이미 실행 중 (포트 $SERENA_PORT)" -ForegroundColor Green
} else {
    Write-Host "🚀 Serena MCP Server 시작 중... (포트 $SERENA_PORT)" -ForegroundColor Yellow

    $serenaArgs = @(
        "--from", "git+https://github.com/oraios/serena",
        "serena", "start-mcp-server",
        "--transport", "sse",
        "--host", "127.0.0.1",
        "--port", "$SERENA_PORT",
        "--project", "$PSScriptRoot\.."
    )

    Start-Process -FilePath "uvx" -ArgumentList $serenaArgs -WindowStyle Hidden

    # 서버 시작 대기 (최대 5초)
    $timeout = 5
    $elapsed = 0
    while (-not (Test-PortInUse -Port $SERENA_PORT) -and $elapsed -lt $timeout) {
        Start-Sleep -Milliseconds 500
        $elapsed += 0.5
    }

    if (Test-PortInUse -Port $SERENA_PORT) {
        Write-Host "✓ Serena MCP Server: 시작 완료" -ForegroundColor Green
    } else {
        Write-Host "⚠ Serena MCP Server: 시작 실패 (타임아웃)" -ForegroundColor Red
    }
}

# Context7 MCP 서버 시작
if (Test-PortInUse -Port $CONTEXT7_PORT) {
    Write-Host "✓ Context7 MCP Server: 이미 실행 중 (포트 $CONTEXT7_PORT)" -ForegroundColor Green
} else {
    Write-Host "🚀 Context7 MCP Server 시작 중... (포트 $CONTEXT7_PORT)" -ForegroundColor Yellow

    $context7Args = @(
        "-y", "@upstash/context7-mcp",
        "--transport", "http",
        "--port", "$CONTEXT7_PORT"
    )

    Start-Process -FilePath "npx" -ArgumentList $context7Args -WindowStyle Hidden

    # 서버 시작 대기 (최대 5초)
    $timeout = 5
    $elapsed = 0
    while (-not (Test-PortInUse -Port $CONTEXT7_PORT) -and $elapsed -lt $timeout) {
        Start-Sleep -Milliseconds 500
        $elapsed += 0.5
    }

    if (Test-PortInUse -Port $CONTEXT7_PORT) {
        Write-Host "✓ Context7 MCP Server: 시작 완료" -ForegroundColor Green
    } else {
        Write-Host "⚠ Context7 MCP Server: 시작 실패 (타임아웃)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📡 MCP 서버 준비 완료" -ForegroundColor Cyan
Write-Host "   - Serena:   http://127.0.0.1:$SERENA_PORT/sse" -ForegroundColor Gray
Write-Host "   - Context7: http://127.0.0.1:$CONTEXT7_PORT" -ForegroundColor Gray
Write-Host ""
```

**스크립트 설명:**

1. **포트 체크**: `Test-PortInUse` 함수로 포트 사용 여부 확인
2. **조건부 시작**: 포트가 비어있으면 서버 시작, 사용중이면 스킵
3. **백그라운드 실행**: `Start-Process -WindowStyle Hidden`로 보이지 않게 실행
4. **타임아웃 처리**: 최대 5초 대기 후 성공/실패 판단

#### 1-3. MCP 서버 중지 스크립트 (선택사항)

**파일:** `scripts/stop-mcp-servers.ps1`

수동으로 MCP 서버를 종료하고 싶을 때 사용합니다.

```powershell
# MCP 서버 중지 스크립트
# 수동으로 MCP 서버를 종료할 때 사용

Write-Host "🛑 MCP 서버 종료 중..." -ForegroundColor Yellow

# Serena 프로세스 종료
$serenaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*uvx*" -or $_.CommandLine -like "*serena*" }
if ($serenaProcesses) {
    $serenaProcesses | Stop-Process -Force
    Write-Host "✓ Serena MCP Server 종료됨" -ForegroundColor Green
} else {
    Write-Host "ℹ Serena MCP Server가 실행 중이 아닙니다" -ForegroundColor Gray
}

# Context7 프로세스 종료
$context7Processes = Get-Process | Where-Object { $_.CommandLine -like "*context7*" }
if ($context7Processes) {
    $context7Processes | Stop-Process -Force
    Write-Host "✓ Context7 MCP Server 종료됨" -ForegroundColor Green
} else {
    Write-Host "ℹ Context7 MCP Server가 실행 중이 아닙니다" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✓ MCP 서버 정리 완료" -ForegroundColor Cyan
```

---

### Step 2: VSCode Tasks 설정

VSCode가 프로젝트를 열 때 자동으로 MCP 서버를 시작하도록 설정합니다.

#### 2-1. `.vscode/tasks.json` 생성

**파일:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start MCP Servers",
      "type": "shell",
      "command": "pwsh",
      "args": [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "${workspaceFolder}/scripts/start-mcp-servers.ps1"
      ],
      "runOptions": {
        "runOn": "folderOpen"
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": false,
        "clear": false
      },
      "problemMatcher": [],
      "isBackground": false
    }
  ]
}
```

**설정 설명:**

| 필드 | 값 | 설명 |
|------|-----|------|
| `label` | "Start MCP Servers" | 작업 이름 |
| `type` | "shell" | 셸 명령 실행 |
| `command` | "pwsh" | PowerShell 실행 |
| `args` | `-File script.ps1` | 스크립트 경로 |
| `runOptions.runOn` | "folderOpen" | **폴더 열 때 자동 실행** |
| `presentation.reveal` | "always" | 출력 패널 항상 표시 |
| `presentation.focus` | false | 패널에 포커스 안함 |

#### 2-2. 작동 확인

VSCode를 닫고 다시 열면:

1. **터미널 패널 자동 열림**
2. **"Start MCP Servers" 작업 실행됨**
3. **MCP 서버 상태 출력:**
   ```
   🔍 MCP 서버 상태 확인 중...
   🚀 Serena MCP Server 시작 중... (포트 20001)
   ✓ Serena MCP Server: 시작 완료
   🚀 Context7 MCP Server 시작 중... (포트 20002)
   ✓ Context7 MCP Server: 시작 완료

   📡 MCP 서버 준비 완료
      - Serena:   http://127.0.0.1:20001/sse
      - Context7: http://127.0.0.1:20002
   ```

두 번째 VSCode 창을 열면:
```
🔍 MCP 서버 상태 확인 중...
✓ Serena MCP Server: 이미 실행 중 (포트 20001)
✓ Context7 MCP Server: 이미 실행 중 (포트 20002)

📡 MCP 서버 준비 완료
```

---

### Step 3: Claude Code 설정 변경

기존 stdio 설정을 제거하고 HTTP 엔드포인트로 변경합니다.

#### 3-1. 현재 설정 백업 (선택사항)

터미널에서:

```bash
# Windows
copy .claude\settings.json .claude\settings.json.backup

# 또는 VSCode에서 파일 복사
```

#### 3-2. `.claude/settings.json` 수정

**파일:** `.claude/settings.json`

**변경 전:**
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
      ]
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ]
    }
  }
}
```

**변경 후:**
```json
{
  "mcpServers": {
    "serena": {
      "url": "http://127.0.0.1:20001/sse",
      "transport": "sse"
    },
    "context7": {
      "url": "http://127.0.0.1:20002",
      "transport": "http"
    }
  }
}
```

**주요 변경 사항:**

| 서버 | 기존 (stdio) | 변경 후 (HTTP/SSE) |
|------|-------------|-------------------|
| **Serena** | `command` + `args` | `url`: `http://127.0.0.1:20001/sse`<br>`transport`: `sse` |
| **Context7** | `command` + `args` | `url`: `http://127.0.0.1:20002`<br>`transport`: `http` |

#### 3-3. 설정 적용

**방법 A - Claude Code 재시작:**

터미널에서:
```bash
# 기존 Claude Code 종료 (Ctrl+C)
# 다시 시작
claude
```

**방법 B - MCP 재연결:**

Claude Code 내부에서:
```
/mcp
```

서버 상태를 확인합니다.

---

### Step 4: 테스트 및 확인

#### 4-1. MCP 서버 상태 확인

**터미널에서:**
```bash
claude mcp list
```

**예상 출력:**
```
Checking MCP server health...

serena: http://127.0.0.1:20001/sse (SSE) - ✓ Connected
context7: http://127.0.0.1:20002 (HTTP) - ✓ Connected
```

✅ **stdio가 아닌 HTTP/SSE로 표시되어야 합니다!**

#### 4-2. 중복 실행 방지 테스트

**테스트 시나리오:**

1. **터미널 1에서 Claude Code 실행:**
   ```bash
   claude
   ```
   → MCP 서버 연결 확인

2. **터미널 2에서 Claude Code 실행:**
   ```bash
   claude
   ```
   → 동일한 MCP 서버에 연결 (새 프로세스 생성 안됨)

3. **작업 관리자에서 프로세스 확인:**
   - `node` 프로세스: **1개만** 실행 중 (Context7)
   - `python` 또는 `uvx` 프로세스: **1개만** 실행 중 (Serena)

#### 4-3. 포트 사용 확인

PowerShell에서:
```powershell
Get-NetTCPConnection -LocalPort 20001,20002 | Select-Object LocalPort, State, OwningProcess
```

**예상 출력:**
```
LocalPort State      OwningProcess
--------- -----      -------------
20001     Listen     12345
20002     Listen     67890
```

✅ **두 포트 모두 LISTEN 상태여야 합니다.**

#### 4-4. 기능 테스트

Claude Code 내부에서 MCP 도구를 사용해봅니다:

```
/mcp
```

또는 Claude에게 질문:
```
serena의 find_symbol 도구를 사용할 수 있어?
```

✅ **정상적으로 도구 목록이 표시되고 사용 가능해야 합니다.**

---

## ⚙️ 작동 원리

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         Windows 시스템                           │
│                                                                 │
│  ┌───────────────┐         ┌───────────────┐                  │
│  │  VSCode 창 1  │         │  VSCode 창 2  │                  │
│  │               │         │               │                  │
│  │ 폴더 열기     │         │ 폴더 열기     │                  │
│  │   ↓           │         │   ↓           │                  │
│  │ tasks.json    │         │ tasks.json    │                  │
│  │   ↓           │         │   ↓           │                  │
│  │ start-mcp-    │         │ start-mcp-    │                  │
│  │ servers.ps1   │         │ servers.ps1   │                  │
│  └───────┬───────┘         └───────┬───────┘                  │
│          │                         │                           │
│          │ 포트 체크               │ 포트 체크                 │
│          ↓                         ↓                           │
│  ┌─────────────────────────────────────────────┐              │
│  │         포트 20001 사용중?                   │              │
│  │         NO → Serena 시작                    │              │
│  │         YES → 기존 서버 재사용               │              │
│  │                                              │              │
│  │         포트 20002 사용중?                   │              │
│  │         NO → Context7 시작                  │              │
│  │         YES → 기존 서버 재사용               │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │ Serena MCP       │      │ Context7 MCP     │               │
│  │ (독립 프로세스)   │      │ (독립 프로세스)   │               │
│  │ 포트: 20001      │      │ 포트: 20002      │               │
│  │ Transport: SSE   │      │ Transport: HTTP  │               │
│  └────────┬─────────┘      └────────┬─────────┘               │
│           │                         │                          │
│           └─────────┬───────────────┘                          │
│                     │                                          │
│                     │ HTTP 연결                                │
│                     ↓                                          │
│           ┌──────────────────┐                                 │
│           │  Claude Code     │                                 │
│           │  (터미널 1, 2, 3)│                                 │
│           └──────────────────┘                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 실행 흐름

**최초 실행 (VSCode 창 1):**

```
1. VSCode 폴더 열기
   ↓
2. tasks.json 자동 실행
   ↓
3. start-mcp-servers.ps1 실행
   ↓
4. 포트 20001 체크 → 비어있음
   ↓
5. Serena 서버 시작 (백그라운드)
   ↓
6. 포트 20002 체크 → 비어있음
   ↓
7. Context7 서버 시작 (백그라운드)
   ↓
8. "📡 MCP 서버 준비 완료" 출력
   ↓
9. Claude Code 실행
   ↓
10. HTTP로 MCP 서버 연결 ✓
```

**두 번째 실행 (VSCode 창 2 또는 터미널 2):**

```
1. VSCode 폴더 열기 (또는 claude 명령 실행)
   ↓
2. tasks.json 자동 실행
   ↓
3. start-mcp-servers.ps1 실행
   ↓
4. 포트 20001 체크 → 이미 사용중!
   ↓
5. "✓ Serena MCP Server: 이미 실행 중" 출력
   ↓
6. 포트 20002 체크 → 이미 사용중!
   ↓
7. "✓ Context7 MCP Server: 이미 실행 중" 출력
   ↓
8. Claude Code 실행
   ↓
9. 기존 HTTP 서버에 연결 ✓ (새 프로세스 생성 안됨)
```

### 프로세스 라이프사이클

```
┌──────────────┐
│ 컴퓨터 부팅  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ VSCode 실행  │
└──────┬───────┘
       │
       ↓
┌────────────────────┐
│ MCP 서버 시작      │
│ (독립 프로세스)    │
│ - VSCode와 분리됨  │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ VSCode 종료        │
│ → MCP 서버는      │
│   계속 실행중      │
└──────┬─────────────┘
       │
       ↓
┌────────────────────┐
│ 컴퓨터 재부팅/     │
│ 로그아웃           │
│ → MCP 서버 종료 ✓  │
└────────────────────┘
```

---

## 🔧 트러블슈팅

### 문제 1: VSCode에서 tasks.json이 자동 실행되지 않음

**증상:**
- VSCode를 열어도 MCP 서버가 시작되지 않음
- 터미널에 아무 출력이 없음

**원인:**
- `runOptions.runOn: "folderOpen"` 설정 누락
- VSCode 자동 작업 실행 권한 문제

**해결 방법:**

1. **VSCode 설정 확인:**
   - `Ctrl + ,` → 설정 열기
   - 검색: "task.allowAutomaticTasks"
   - ✅ 체크되어 있어야 함

2. **수동 실행 테스트:**
   - `Ctrl + Shift + P`
   - "Tasks: Run Task" 입력
   - "Start MCP Servers" 선택
   - 정상 실행되는지 확인

3. **.vscode/tasks.json 재확인:**
   ```json
   "runOptions": {
     "runOn": "folderOpen"  // ← 이 부분 확인
   }
   ```

---

### 문제 2: 포트 충돌 (20001, 20002가 이미 사용중)

**증상:**
```
⚠ Serena MCP Server: 시작 실패 (타임아웃)
```

**원인:**
- 다른 애플리케이션이 동일한 포트 사용

**해결 방법:**

1. **포트 사용 확인:**
   ```powershell
   Get-NetTCPConnection -LocalPort 20001,20002 | Select-Object LocalPort, State, OwningProcess
   ```

2. **프로세스 확인:**
   ```powershell
   Get-Process -Id <OwningProcess ID>
   ```

3. **포트 변경:**

   `scripts/start-mcp-servers.ps1` 수정:
   ```powershell
   $SERENA_PORT = 20003   # 변경
   $CONTEXT7_PORT = 20004 # 변경
   ```

   `.claude/settings.json` 수정:
   ```json
   {
     "mcpServers": {
       "serena": {
         "url": "http://127.0.0.1:20003/sse",  // 변경
         "transport": "sse"
       },
       "context7": {
         "url": "http://127.0.0.1:20004",  // 변경
         "transport": "http"
       }
     }
   }
   ```

---

### 문제 3: Claude Code에서 MCP 서버 연결 실패

**증상:**
```bash
claude mcp list
# 출력:
serena: http://127.0.0.1:20001/sse (SSE) - ✗ Failed to connect
```

**원인:**
- MCP 서버가 실제로 시작되지 않음
- 방화벽이 로컬 연결 차단
- 잘못된 URL 설정

**해결 방법:**

1. **서버 실행 여부 확인:**
   ```powershell
   Get-NetTCPConnection -LocalPort 20001 -ErrorAction SilentlyContinue
   ```

2. **수동으로 서버 시작:**
   ```powershell
   # Serena 수동 시작
   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --transport sse --host 127.0.0.1 --port 20001

   # Context7 수동 시작
   npx -y @upstash/context7-mcp --transport http --port 20002
   ```

3. **브라우저에서 테스트:**
   - Serena: `http://127.0.0.1:20001/sse` 접속
   - Context7: `http://127.0.0.1:20002` 접속
   - 연결 오류가 아닌 응답이 와야 함

4. **.claude/settings.json 재확인:**
   ```json
   "url": "http://127.0.0.1:20001/sse",  // 끝에 /sse 있는지 확인
   "transport": "sse"  // "sse" 철자 확인
   ```

---

### 문제 4: PowerShell 실행 정책 오류

**증상:**
```
파일을 로드할 수 없습니다. 이 시스템에서 스크립트를 실행할 수 없으므로...
```

**원인:**
- Windows PowerShell 실행 정책이 제한됨

**해결 방법:**

**방법 A - 관리자 권한으로 정책 변경 (권장):**
```powershell
# PowerShell 관리자로 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**방법 B - 일회성 우회:**
```powershell
pwsh -ExecutionPolicy Bypass -File .\scripts\start-mcp-servers.ps1
```

**방법 C - tasks.json에 우회 추가 (이미 적용됨):**
```json
"args": [
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  "${workspaceFolder}/scripts/start-mcp-servers.ps1"
]
```

---

### 문제 5: MCP 서버가 너무 많은 메모리 사용

**증상:**
- 작업 관리자에서 Node.js/Python 프로세스가 많은 메모리 사용

**해결 방법:**

1. **중복 프로세스 확인:**
   ```powershell
   Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*" }
   ```

2. **모든 MCP 서버 종료:**
   ```powershell
   .\scripts\stop-mcp-servers.ps1
   ```

3. **수동으로 프로세스 종료:**
   ```powershell
   Stop-Process -Name "node","python" -Force
   ```

4. **VSCode 재시작:**
   - VSCode 완전 종료
   - 다시 열기
   - 단 하나의 MCP 서버만 시작되는지 확인

---

### 문제 6: MCP 도구가 보이지 않음

**증상:**
- Claude Code에서 `/mcp` 입력시 도구 목록이 비어있음
- Serena 도구 (`find_symbol` 등)를 사용할 수 없음

**원인:**
- MCP 서버 연결은 성공했지만 도구 로드 실패
- 잘못된 transport 방식

**해결 방법:**

1. **MCP 서버 버전 확인:**
   ```bash
   # Serena 버전
   uvx --from git+https://github.com/oraios/serena serena --version

   # Context7 버전
   npx -y @upstash/context7-mcp --help
   ```

2. **서버 로그 확인:**

   서버를 포그라운드로 실행해서 오류 확인:
   ```powershell
   # Serena 포그라운드 실행
   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --transport sse --host 127.0.0.1 --port 20001
   ```

3. **Claude Code 캐시 삭제:**
   ```bash
   # Claude Code 완전 종료
   # 캐시 삭제 (Windows)
   Remove-Item -Path "$env:APPDATA\.claude\cache" -Recurse -Force

   # Claude Code 재시작
   ```

---

## ❓ FAQ

### Q1: VSCode를 닫으면 MCP 서버도 종료되나요?

**A:** 아니요. MCP 서버는 **독립 프로세스**로 실행되기 때문에 VSCode를 닫아도 계속 실행됩니다.

**종료 방법:**
- 컴퓨터 재부팅/로그아웃
- 수동 종료: `.\scripts\stop-mcp-servers.ps1`
- 작업 관리자에서 프로세스 종료

**이게 문제인가요?**
- 아닙니다! 이것이 **의도된 동작**입니다.
- 여러 VSCode 창/터미널에서 동일한 서버를 재사용할 수 있습니다.
- 메모리 효율적입니다 (단일 프로세스만 유지).

---

### Q2: 포트 번호를 변경해도 되나요?

**A:** 네, 자유롭게 변경 가능합니다.

**변경 위치:**
1. `scripts/start-mcp-servers.ps1`:
   ```powershell
   $SERENA_PORT = 30001   # 원하는 포트
   $CONTEXT7_PORT = 30002 # 원하는 포트
   ```

2. `.claude/settings.json`:
   ```json
   "url": "http://127.0.0.1:30001/sse"
   ```

**권장 포트 범위:**
- **20000-29999**: 잘 사용되지 않는 안전한 범위
- **49152-65535**: 동적/사설 포트 범위

**피해야 할 포트:**
- 3000 (Next.js, React 개발 서버)
- 8000, 8080 (일반 웹 서버)
- 5000 (Flask 등)
- 4200 (Angular)

---

### Q3: stdio 방식과 HTTP 방식의 기능 차이가 있나요?

**A:** 없습니다. **제공하는 도구와 기능은 완전히 동일**합니다.

MCP 프로토콜은 전송 방식(Transport)과 무관하게 동일한 스펙을 따릅니다:

```
┌─────────────────────────┐
│   MCP Protocol (동일)   │  ← 도구, 리소스, 프롬프트
├─────────────────────────┤
│  Transport Layer (선택) │
│  - stdio                │
│  - HTTP                 │
│  - SSE                  │
└─────────────────────────┘
```

**차이점:**
- **stdio**: 프로세스 직접 실행, 매번 새 인스턴스
- **HTTP/SSE**: 네트워크 연결, 단일 서버 재사용

**동일한 부분:**
- 제공하는 도구 목록
- 도구의 기능
- 응답 형식

---

### Q4: 다른 컴퓨터에서도 MCP 서버를 사용할 수 있나요?

**A:** 네, 가능합니다. 하지만 보안 설정이 필요합니다.

**현재 설정 (로컬 전용):**
```powershell
--host 127.0.0.1  # localhost만 허용
```

**네트워크 공유 설정:**
```powershell
--host 0.0.0.0  # 모든 네트워크 인터페이스에서 접근 허용
```

**Claude Code 설정:**
```json
{
  "url": "http://192.168.1.100:20001/sse"  // 서버 컴퓨터의 IP
}
```

**⚠️ 보안 주의사항:**
- 방화벽 설정 필요
- 인증 메커니즘 추가 권장
- 신뢰할 수 있는 네트워크에서만 사용

---

### Q5: MCP 서버가 시작되는데 너무 오래 걸립니다

**A:** 초기 시작 시간을 줄일 수 있습니다.

**원인:**
- `uvx`, `npx`가 패키지를 처음 다운로드할 때 시간 소요
- Python/Node.js 인터프리터 초기화 시간

**해결 방법:**

1. **사전 설치:**
   ```bash
   # Serena 사전 설치
   uvx --from git+https://github.com/oraios/serena serena --version

   # Context7 사전 설치
   npx -y @upstash/context7-mcp --help
   ```

2. **타임아웃 늘리기:**

   `scripts/start-mcp-servers.ps1`:
   ```powershell
   $timeout = 10  # 5초 → 10초로 증가
   ```

3. **시스템 시작시 자동 실행 (Windows 작업 스케줄러):**

   PowerShell 관리자로 실행:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File C:\path\to\start-mcp-servers.ps1"
   $trigger = New-ScheduledTaskTrigger -AtLogOn
   Register-ScheduledTask -TaskName "MCP Servers" -Action $action -Trigger $trigger
   ```

---

### Q6: MCP 서버를 업데이트하려면 어떻게 하나요?

**A:** 기존 서버를 종료하고 다시 시작하면 최신 버전이 자동으로 설치됩니다.

**업데이트 절차:**

1. **MCP 서버 종료:**
   ```powershell
   .\scripts\stop-mcp-servers.ps1
   ```

2. **캐시 삭제 (선택사항):**
   ```bash
   # uvx 캐시 삭제 (Serena)
   uvx --from git+https://github.com/oraios/serena serena --version  # 최신 버전 다운로드

   # npx 캐시 삭제 (Context7)
   npm cache clean --force
   ```

3. **VSCode 재시작:**
   - VSCode를 다시 열면 자동으로 최신 버전 시작

4. **수동 업데이트:**
   ```powershell
   # Serena 최신 버전 설치
   uvx --from git+https://github.com/oraios/serena@latest serena start-mcp-server --transport sse --host 127.0.0.1 --port 20001
   ```

---

### Q7: 프로젝트를 다른 팀원과 공유할 때 설정도 공유되나요?

**A:** 부분적으로 공유됩니다.

**Git에 포함되는 파일 (팀 공유):**
- ✅ `scripts/start-mcp-servers.ps1`
- ✅ `scripts/stop-mcp-servers.ps1`
- ✅ `.vscode/tasks.json`

**Git에 포함되지 않는 파일 (개인 설정):**
- ❌ `.claude/settings.json` (각자 수동 설정 필요)

**팀원이 해야 할 설정:**

1. **Claude Code 설정 변경:**

   `.claude/settings.json` 수동 수정:
   ```json
   {
     "mcpServers": {
       "serena": {
         "url": "http://127.0.0.1:20001/sse",
         "transport": "sse"
       },
       "context7": {
         "url": "http://127.0.0.1:20002",
         "transport": "http"
       }
     }
   }
   ```

2. **VSCode 자동 작업 허용:**
   - VSCode 설정에서 "task.allowAutomaticTasks" 활성화

**프로젝트 범위 MCP 설정 (권장):**

`.mcp.json` 파일을 프로젝트 루트에 추가하면 팀 전체가 공유 가능:

```json
{
  "mcpServers": {
    "serena": {
      "url": "http://127.0.0.1:20001/sse",
      "transport": "sse"
    },
    "context7": {
      "url": "http://127.0.0.1:20002",
      "transport": "http"
    }
  }
}
```

---

### Q8: Windows가 아닌 macOS/Linux에서도 사용할 수 있나요?

**A:** 네, 가능합니다. Bash 스크립트로 변환하면 됩니다.

**macOS/Linux용 스크립트:**

`scripts/start-mcp-servers.sh`:

```bash
#!/bin/bash

echo "🔍 MCP 서버 상태 확인 중..."

SERENA_PORT=20001
CONTEXT7_PORT=20002

# 포트 체크 함수
check_port() {
    nc -z 127.0.0.1 $1 2>/dev/null
    return $?
}

# Serena MCP 서버 시작
if check_port $SERENA_PORT; then
    echo "✓ Serena MCP Server: 이미 실행 중 (포트 $SERENA_PORT)"
else
    echo "🚀 Serena MCP Server 시작 중... (포트 $SERENA_PORT)"
    uvx --from git+https://github.com/oraios/serena serena start-mcp-server \
        --transport sse \
        --host 127.0.0.1 \
        --port $SERENA_PORT \
        --project "$(pwd)" &

    # 서버 시작 대기
    for i in {1..10}; do
        if check_port $SERENA_PORT; then
            echo "✓ Serena MCP Server: 시작 완료"
            break
        fi
        sleep 0.5
    done
fi

# Context7 MCP 서버 시작
if check_port $CONTEXT7_PORT; then
    echo "✓ Context7 MCP Server: 이미 실행 중 (포트 $CONTEXT7_PORT)"
else
    echo "🚀 Context7 MCP Server 시작 중... (포트 $CONTEXT7_PORT)"
    npx -y @upstash/context7-mcp --transport http --port $CONTEXT7_PORT &

    for i in {1..10}; do
        if check_port $CONTEXT7_PORT; then
            echo "✓ Context7 MCP Server: 시작 완료"
            break
        fi
        sleep 0.5
    done
fi

echo ""
echo "📡 MCP 서버 준비 완료"
echo "   - Serena:   http://127.0.0.1:$SERENA_PORT/sse"
echo "   - Context7: http://127.0.0.1:$CONTEXT7_PORT"
echo ""
```

**실행 권한 부여:**
```bash
chmod +x scripts/start-mcp-servers.sh
```

**tasks.json 수정:**
```json
{
  "command": "bash",
  "args": [
    "${workspaceFolder}/scripts/start-mcp-servers.sh"
  ]
}
```

---

## 📚 추가 참고 자료

### 관련 문서

- [Claude Code 공식 문서](https://code.claude.com/docs)
- [MCP 프로토콜 스펙](https://modelcontextprotocol.io/)
- [Serena GitHub](https://github.com/oraios/serena)
- [Context7 문서](https://upstash.com/docs/context7)

### 유용한 명령어 모음

```bash
# MCP 서버 상태 확인
claude mcp list

# MCP 서버 연결 테스트
/mcp  # Claude Code 내부에서

# 포트 사용 확인 (PowerShell)
Get-NetTCPConnection -LocalPort 20001,20002

# 프로세스 확인
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*" }

# MCP 서버 수동 시작
.\scripts\start-mcp-servers.ps1

# MCP 서버 중지
.\scripts\stop-mcp-servers.ps1
```

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-01-16 | 1.0.0 | 초기 문서 작성 |

---

## 📧 지원 및 문의

문제가 발생하거나 질문이 있으시면:

1. **GitHub Issues**: 프로젝트 이슈 트래커에 등록
2. **Claude Code 공식 지원**: https://github.com/anthropics/claude-code/issues
3. **팀 내부 문의**: 프로젝트 관리자에게 연락

---

**작성자**: Claude Code
**최종 수정**: 2026-01-16
