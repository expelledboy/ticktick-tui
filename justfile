# strict mode

set shell := ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

tests := `fd -0 --exclude zap .test.ts | tr '\0' ' '`

test:
    @ bun test \
      --bail --timeout 15000 \
      --preload ./src/ticktick/api.mock \
      {{ tests }}

dev:
    bun run ./src/index.ts

typecheck:
    bun tsc --noEmit

keylogger:
    tail -f ~/.cache/ticktick-tui/keylogger.json

logs:
    tail -f ~/.cache/ticktick-tui/logs.log

reset-cache:
    rm -rf ~/.cache/ticktick-tui/cache.json

bun2nix:
    bun2nix -o bun.nix

build: bun2nix
    nix build
