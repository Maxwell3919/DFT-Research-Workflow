#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
"${PYTHON:-python3}" "$root/parse.py" --check
