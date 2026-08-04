#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
awk 'toupper($1) ~ /^HTTP/ {line=$0} END {print line}' output/cod-response.headers
python3 - <<'PY'
import json
p=json.load(open('derived/parsed-summary.json'))
for key in ('formula', 'atom_count', 'cell_a_ang', 'minimum_distance_ang', 'source_sha256'):
    print(f'{key}={p[key]}')
PY
