#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
printf '%s\n' 'Captured commands (documentation only; no job submission):'
sed -n '2,4p' output/recorded-commands.txt
printf '%s\n' 'BLOCKED: re-execution requires separate authorization and a fresh evidence directory.' >&2
exit 2
