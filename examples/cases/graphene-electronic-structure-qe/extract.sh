#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -s derived/graphene-band-summary.json ]]; then
  python3 - <<'PY'
import json
record = json.load(open('derived/graphene-band-summary.json', encoding='utf-8'))
for key in ('scf_total_energy_ry', 'fermi_energy_ev', 'band_kpoints', 'band_count', 'minimum_path_distance_to_fermi_ev'):
    print(f'{key}={record[key]}')
print('boundary=' + record['claim_boundary'])
PY
else
  python3 - <<'PY'
import json
plan = json.load(open('qe_plan.json', encoding='utf-8'))
parameters = plan['case_parameters']
print('state=prepared-not-run')
print('scf_k_mesh=' + 'x'.join(map(str, parameters['numerical_starting_choices']['scf_k_mesh'])))
print('path=' + '-'.join(parameters['path']['labels']))
print('boundary=No vacuum, cutoff, k-mesh, smearing, path, or observable convergence series has been run.')
PY
fi
