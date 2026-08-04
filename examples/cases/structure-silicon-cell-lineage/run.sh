#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$root/source" "$root/output" "$root/derived" "$root/figures" "$root/input"
cp "$root/../../practical-guides/data/silicon-qe/silicon-cod-9013102.cif" "$root/source/silicon-cod-9013102.cif"
"${PYTHON:-python3}" "$root/parse.py" | tee "$root/output/run.stdout"
