# strict mode

set shell := ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

test:
    @ bun test --preload ./src/ticktick/api.mock

dev:
    @ bun run ./src/index.ts
