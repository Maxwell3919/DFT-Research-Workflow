#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
check_root="$(mktemp -d "${TMPDIR:-/tmp}/silicon-case-check.XXXXXX")"
trap 'rm -rf "$check_root"' EXIT
cp -a "$root" "$check_root/case"
"${PYTHON:-python3}" "$check_root/case/parse.py" --check
