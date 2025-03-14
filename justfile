export TICKTICK_TEST := "true"

set shell := ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

tests := `fd -0 --exclude zap --exclude tests .test.ts | tr '\0' ' '`

test: typecheck unit-test e2e-test

[private]
bun-test *args:
    @ bun test --preload ./src/ticktick/api.mock {{ args }}

unit-test: (bun-test tests)

e2e-test:
    @ bun test \
      --timeout 15000 \
      --bail \
      --preload ./src/ticktick/api.mock \
      ./tests/e2e.test.tsx

test-keybindings:
    @ bun test --preload ./src/ticktick/api.mock ./src/keybindings/*.test.ts

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

[private]
local-build:
    bun build \
      --target=node \
      --splitting \
      --external react-devtools-core \
      ./src/index.ts \
      --outdir=./build
    cp -r ./node_modules/yoga-wasm-web/dist/yoga.wasm ./build/yoga.wasm

[private]
local-run:
    bun run ./build/index.js

run: typecheck local-build local-run

storybook:
    bun run storybook
