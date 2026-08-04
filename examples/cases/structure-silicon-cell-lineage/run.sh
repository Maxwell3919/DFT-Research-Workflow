#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$root/source" "$root/output" "$root/derived" "$root/figures" "$root/input"
test -s "$root/source/silicon-cod-9013102.cif"
"${PYTHON:-python3}" "$root/parse.py" | tee "$root/output/run.stdout"
