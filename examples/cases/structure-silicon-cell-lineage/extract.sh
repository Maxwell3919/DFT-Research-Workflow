#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
python3 - "$root/derived/structure-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1])); print('formula=',r['source']['formula']); print('primitive_atoms=',r['primitive']['atoms']); print('path=',r['reciprocal_path']['path'])
PY
