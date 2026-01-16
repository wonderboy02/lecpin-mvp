# Serena MCP Server - HTTP Mode
# 영구 실행용 스크립트

uvx --from git+https://github.com/oraios/serena serena start-mcp-server `
  --transport sse `
  --host 127.0.0.1 `
  --port 8000 `
  --project "C:\Users\wondo\dev\lecpin-mvp"
