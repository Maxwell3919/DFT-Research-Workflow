#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 parse.py >/dev/null
python3 - <<'PY'
import json
r=json.load(open('derived/captured-run-summary.json', encoding='utf-8'))
for key in ('qe_version', 'scf_iterations', 'fermi_energy_ev', 'mesh_points', 'path_points', 'selected_band_crossing_intervals'):
 print(f'{key}={r[key]}')
print('G4=NOT TESTED; G5=NOT CLAIMED')
PY
