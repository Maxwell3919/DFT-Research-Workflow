#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$root/source" "$root/output" "$root/derived" "$root/figures" "$root/input"
"${PYTHON:-python3}" "$root/parse.py" | tee "$root/output/run.stdout"
