#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
python3 - "$root/derived/graphene-model-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1])); print('vacuum_atoms=',r['vacuum_model']['atoms']); print('H_height=',r['construction']['H_above_highest_C_ang']); print('pbc=',r['vacuum_model']['pbc'])
PY
