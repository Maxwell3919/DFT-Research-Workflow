#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 parse.py >/dev/null
python3 - <<'PY'
import json
r=json.load(open('derived/captured-run-summary.json', encoding='utf-8'))
for key in ('qe_version', 'scf_iterations', 'fermi_energy_ev', 'mesh_points', 'path_points', 'selected_band_crossing_intervals'):
 print(f'{key}={r[key]}')
dos=r['gaussian_dos_like']
for key in ('source_printed_k_weight_sum', 'source_printed_weighted_state_sum', 'gaussian_sigma_ev', 'energy_grid_points', 'trapezoidal_integral_states_per_cell', 'dos_at_fermi_states_per_ev_per_cell'):
 print(f'{key}={dos[key]}')
print('dos_like_boundary=' + dos['claim_boundary'])
real=r['dos_x']
for key in ('fermi_energy_ev_as_printed_by_dos_x', 'energy_grid_points', 'dos_at_nearest_fermi_grid_point_states_per_ev_per_cell', 'integrated_states_at_grid_end_per_cell'):
 print(f'dos_x_{key}={real[key]}')
print('dos_x_boundary=' + real['claim_boundary'])
print(f"rerun_nscf_c_bands_unconverged_markers={r['rerun_nscf_c_bands_unconverged_markers']}")
print(f"rerun_bands_c_bands_unconverged_markers={r['rerun_bands_c_bands_unconverged_markers']}")
screen=r['exploratory_convergence_screen']
for key, value in screen['metrics'].items():
 print(f'convergence_{key}={value}')
print('convergence_exploratory_screen_status=' + screen['exploratory_screen_status'])
fit=r['bounded_eos_screen']['quadratic_fit']
for key in ('c2_ry_per_bohr6', 'curvature_d2e_dv2_ry_per_bohr6', 'residual_rms_ry', 'mathematical_status'):
 print(f'eos_{key}={fit[key]}')
print('eos_boundary=' + r['bounded_eos_screen']['claim_boundary'])
print('G4=NOT TESTED; G5=NOT CLAIMED')
PY
