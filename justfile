# strict mode

set shell := ["/bin/bash", "-e", "-u", "-o", "pipefail", "-c"]

test:
    @ bun test
