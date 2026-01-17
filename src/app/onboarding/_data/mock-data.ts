import type { UserTaskWithRelations, LectureWithCompetencies, Task, Submission, Feedback } from "@/types"

// Mock Lecture with Competencies
const MOCK_LECTURE: LectureWithCompetencies = {
  id: "onboarding-lecture-123",
  user_id: "user-123",
  title: "5. Dynamic Programming, Part 1: SRTBOT, Fib, DAGs, Bowling",
  youtube_url: "https://www.youtube.com/watch?v=r4-cftqTcdI",
  youtube_id: "r4-cftqTcdI",
  thumbnail_url: "/onboarding-lecture-thumbnail.webp",
  language: "en",
  duration_seconds: 3180,
  transcript: null,
  status: "completed",
  error_message: null,
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:30:00Z",
  competencies: [
    {
      id: "comp-1",
      lecture_id: "onboarding-lecture-123",
      name: "동적 프로그래밍 기본 개념 (SRTBOT 원칙)",
      description: "Subproblems, Relate, Topological order, Base case, Original problem, Time analysis - 동적 프로그래밍의 체계적 접근 방법을 이해하고 적용합니다",
      order_index: 1,
      created_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "comp-2",
      lecture_id: "onboarding-lecture-123",
      name: "Memoization과 Tabulation 기법",
      description: "Top-down(재귀 + 메모이제이션)과 Bottom-up(반복문 + 테이블) 접근 방식의 이해 및 구현 능력",
      order_index: 2,
      created_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "comp-3",
      lecture_id: "onboarding-lecture-123",
      name: "DAG(방향성 비순환 그래프)에서의 최단 경로",
      description: "위상 정렬을 활용한 동적 프로그래밍 최적화 기법",
      order_index: 3,
      created_at: "2025-01-15T10:30:00Z"
    }
  ]
}

// Mock Task
const MOCK_TASK: Task = {
  id: "onboarding-task-123",
  lecture_id: "onboarding-lecture-123",
  title: "볼링 점수 계산 시스템 구현",
  description: "동적 프로그래밍을 활용하여 볼링 게임의 점수를 계산하는 시스템을 구현합니다. 각 프레임의 점수를 효율적으로 계산하고, 스트라이크와 스페어 보너스를 정확히 처리해야 합니다.",
  reason: "이 과제는 강의에서 다룬 SRTBOT 원칙을 실제 문제에 적용하는 좋은 예시입니다. 부분문제 정의, 관계 설정, 기저 조건 등을 직접 설계하면서 동적 프로그래밍의 핵심 개념을 체득할 수 있습니다.",
  estimated_time: "2-3시간",
  difficulty: "intermediate",
  tech_stack: ["JavaScript", "Algorithm", "Dynamic Programming"],
  steps: [
    {
      order: 1,
      title: "문제 분석 및 부분문제 정의",
      content: "볼링 점수 계산의 규칙을 분석하고, SRTBOT 원칙에 따라 부분문제를 정의합니다."
    },
    {
      order: 2,
      title: "재귀 관계 수립",
      content: "각 프레임의 점수가 이전 프레임과 어떤 관계를 가지는지 수식으로 표현합니다."
    },
    {
      order: 3,
      title: "Memoization 구현",
      content: "Top-down 방식으로 재귀 함수를 작성하고, 중복 계산을 방지하기 위한 메모이제이션을 적용합니다."
    },
    {
      order: 4,
      title: "Tabulation으로 최적화",
      content: "Bottom-up 방식으로 반복문을 사용하여 더 효율적인 솔루션을 구현합니다."
    },
    {
      order: 5,
      title: "테스트 케이스 작성",
      content: "다양한 경우(스트라이크, 스페어, 일반 점수)에 대한 테스트를 작성하고 검증합니다."
    }
  ],
  success_criteria: [
    "모든 볼링 규칙(스트라이크, 스페어, 10프레임)을 정확히 구현",
    "시간 복잡도 O(n) 달성",
    "코드에 명확한 주석으로 SRTBOT 각 단계 표시",
    "최소 5개 이상의 테스트 케이스 통과"
  ],
  github_repo_url: "https://github.com/example/bowling-score-calculator",
  created_at: "2025-01-15T11:00:00Z",
  updated_at: "2025-01-15T11:00:00Z"
}

// Mock Submission
const MOCK_SUBMISSION: Submission = {
  id: "onboarding-submission-123",
  task_id: "onboarding-task-123",
  user_id: "user-123",
  submission_type: "github",
  github_repo_url: "https://github.com/example/my-bowling-solution",
  file_path: null,
  description: "Memoization과 Tabulation 두 가지 방식으로 모두 구현했습니다.",
  status: "completed",
  attempt_number: 1,
  created_at: "2025-01-17T10:00:00Z",
  updated_at: "2025-01-17T14:30:00Z"
}

// Mock Feedback
const MOCK_FEEDBACK: Feedback = {
  id: "onboarding-feedback-123",
  submission_id: "onboarding-submission-123",
  overall_score: 85,
  grade: "Good",
  summary: "전반적으로 동적 프로그래밍의 핵심 개념을 잘 이해하고 구현했습니다. 특히 SRTBOT 원칙을 따른 체계적인 접근이 인상적입니다. 시간 복잡도 최적화를 더 개선할 여지가 있습니다.",
  code_quality: {
    readability: 90,
    maintainability: 85,
    correctness: 90,
    best_practices: 75
  },
  strengths: [
    {
      title: "SRTBOT 원칙 체계적 적용",
      detail: "부분문제 정의, 재귀 관계, 위상 정렬, 기저 조건을 명확하게 구분하여 구현했습니다. 주석으로 각 단계를 표시한 점이 훌륭합니다.",
      file: "bowling-calculator.js"
    },
    {
      title: "Memoization 올바른 구현",
      detail: "Map 자료구조를 활용하여 중복 계산을 효과적으로 방지했습니다. 캐시 키 설계가 적절합니다.",
      file: "bowling-calculator.js"
    },
    {
      title: "테스트 커버리지",
      detail: "엣지 케이스를 포함한 다양한 테스트 케이스를 작성했습니다. 특히 퍼펙트 게임과 거터 게임 테스트가 좋습니다.",
      file: "bowling-calculator.test.js"
    }
  ],
  improvements: [
    {
      title: "Tabulation 최적화 필요",
      detail: "현재 구현은 O(n) 시간, O(n) 공간을 사용하지만, 슬라이딩 윈도우 기법으로 공간 복잡도를 O(1)로 개선할 수 있습니다.",
      severity: "major",
      suggestion: "최근 2-3개 프레임의 값만 유지하고 이전 값들은 버리는 방식으로 개선해보세요.",
      file: "bowling-calculator.js"
    },
    {
      title: "에러 처리 보완",
      detail: "잘못된 입력값(음수, 11 이상의 핀 수)에 대한 유효성 검사가 부족합니다.",
      severity: "minor",
      suggestion: "입력 검증 로직을 추가하고, 명확한 에러 메시지를 반환하도록 개선하세요.",
      file: "bowling-calculator.js"
    },
    {
      title: "변수명 개선",
      detail: "일부 변수명(예: 'dp', 'arr')이 너무 간결하여 가독성이 떨어집니다.",
      severity: "suggestion",
      suggestion: "'dp' 대신 'frameScores', 'arr' 대신 'rolls'와 같이 명확한 이름을 사용하세요.",
      file: "bowling-calculator.js"
    }
  ],
  next_steps: [
    "공간 복잡도 최적화: O(n) → O(1) 개선",
    "에러 처리 추가: 입력 유효성 검사 및 예외 처리",
    "코드 리팩토링: 변수명 개선 및 함수 분리",
    "다음 강의(DP Part 2) 진행 후 더 복잡한 문제에 도전"
  ],
  created_at: "2025-01-17T14:30:00Z"
}

// Complete Mock User Task
export const MOCK_USER_TASK: UserTaskWithRelations = {
  id: "onboarding-user-task-123",
  user_id: "user-123",
  lecture_id: "onboarding-lecture-123",
  task_id: "onboarding-task-123",
  submission_id: "onboarding-submission-123",
  feedback_id: "onboarding-feedback-123",
  current_step: "feedback",
  status: "in_progress",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-17T14:30:00Z",
  lecture: MOCK_LECTURE,
  task: MOCK_TASK,
  submission: MOCK_SUBMISSION,
  feedback: MOCK_FEEDBACK
}

// Mock Stats Data
export const MOCK_STATS = {
  inProgress: 1,
  completed: 0,
  total: 1
}
