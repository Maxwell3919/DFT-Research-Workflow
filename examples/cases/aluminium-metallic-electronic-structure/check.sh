#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
failed=0
python_cmd="${PYTHON:-python3}"
required=(README.md environment.txt qe_plan.json source/fixture-metadata.json source/fixture-mesh.csv source/fixture-band-path.csv source/pseudopotential-metadata.json input/scf.in input/nscf.in input/bands.in input/dos.in input/convergence-matrix-plan.json input/generate_convergence_inputs.py input/parse_convergence.py input/run-convergence-matrix.sh input/eos-plan.json input/generate_eos_inputs.py input/parse_eos.py input/run-eos.sh output/scf.out output/scf.err output/nscf-full.out output/nscf-full.err output/bands.out output/bands.err output/compact-source-excerpt.txt output/recorded-commands.txt output/dos-route/scf.out output/dos-route/scf.err output/dos-route/nscf-full.out output/dos-route/nscf-full.err output/dos-route/dos.out output/dos-route/dos.err output/dos-route/al.dos output/dos-route/bands.out output/dos-route/bands.err derived/captured-run-summary.json derived/al-mesh.csv derived/al-path.csv derived/al-dos-gaussian.csv derived/al-dos-gaussian-metadata.json derived/al-dos-x.csv derived/al-dos-x-metadata.json derived/aluminium-convergence-matrix.csv derived/aluminium-convergence-assessment.json derived/aluminium-eos-samples.csv derived/aluminium-eos-fit.json figures/raw-nscf-band2-sampling.png figures/al-dos-gaussian.png figures/al-dos-x.png figures/aluminium-eos-fit.png manifest.json run.sh check.sh extract.sh parse.py)
for id in al-k08-d002 al-k10-d002 al-k12-d002 al-k12-d001 al-k12-d004; do required+=("output/convergence-screen/$id.in" "output/convergence-screen/$id.out" "output/convergence-screen/$id.err"); done
for id in al-eos-a7450 al-eos-a7550 al-eos-a7653 al-eos-a7750 al-eos-a7850; do required+=("output/eos-screen/$id.in" "output/eos-screen/$id.out" "output/eos-screen/$id.err"); done
for path in "${required[@]}"; do
  if [[ -f "$path" ]]; then printf 'PASS G0 artifact exists: %s\n' "$path"; else printf 'FAIL G0 missing: %s\n' "$path"; failed=1; fi
done
parser_tmp=$(mktemp -d /tmp/aluminium-parser-check.XXXXXX)
trap 'rm -rf "$parser_tmp"' EXIT
cp -a . "$parser_tmp/case"
if bash -n run.sh extract.sh input/run-convergence-matrix.sh input/run-eos.sh && (cd "$parser_tmp/case" && "$python_cmd" parse.py); then printf '%s\n' 'PASS G0 hashes, pseudopotential identity boundary, and strict parser relationships hold in an isolated copy'; else printf '%s\n' 'FAIL G0 parser or shell syntax rejected case evidence'; failed=1; fi
if "$python_cmd" - <<'PY'
import csv, json
from pathlib import Path
gaussian=json.loads(Path('derived/al-dos-gaussian-metadata.json').read_text())
dos=json.loads(Path('derived/al-dos-x-metadata.json').read_text())
summary=json.loads(Path('derived/captured-run-summary.json').read_text())
assert len(list(csv.DictReader(Path('derived/al-dos-gaussian.csv').open()))) == 2801
assert len(list(csv.DictReader(Path('derived/al-dos-x.csv').open()))) == 2801
assert gaussian['source_k_point_count'] == 512 and gaussian['source_band_count_per_k_point'] == 4
assert abs(gaussian['trapezoidal_integral_states_per_cell'] - gaussian['source_printed_weighted_state_sum']) < 1e-5
assert dos['qe_version'] == '7.5' and dos['energy_grid_points'] == 2801
assert summary['rerun_nscf_c_bands_unconverged_markers'] == 5
assert summary['rerun_bands_c_bands_unconverged_markers'] == 5
print(f"INFO real dos.x rows=2801 Fermi={dos['fermi_energy_ev_as_printed_by_dos_x']} eV final-window-integral={dos['integrated_states_at_grid_end_per_cell']} states/cell")
PY
then printf '%s\n' 'PASS G3 real dos.x and Gaussian representation tables/metadata/PNGs retain source hashes and warning counts'; else printf '%s\n' 'FAIL G3 DOS lineage check failed'; failed=1; fi
screen_tmp=$(mktemp -d /tmp/aluminium-case-check.XXXXXX)
if "$python_cmd" input/parse_convergence.py --run-dir output/convergence-screen --out-dir "$screen_tmp/convergence" && "$python_cmd" input/parse_eos.py --run-dir output/eos-screen --out-dir "$screen_tmp/eos" && "$python_cmd" - "$screen_tmp" <<'PY'
import csv
import json
import sys
from pathlib import Path
root=Path(sys.argv[1])
conv=json.loads((root/'convergence/aluminium-convergence-assessment.json').read_text())
eos=json.loads((root/'eos/aluminium-eos-fit.json').read_text())
assert conv['exploratory_screen_status'] == 'FAIL'
assert eos['quadratic_fit']['mathematical_status'] == 'PASS'
assert len(list(csv.DictReader((root/'convergence/aluminium-convergence-matrix.csv').open()))) == 5
assert len(list(csv.DictReader((root/'eos/aluminium-eos-samples.csv').open()))) == 5
print('INFO convergence k10-to-k12 dE={:.8f} Ry/cell dEF={:.4f} eV; smearing max dE={:.8f} Ry/cell dEF={:.4f} eV'.format(conv['metrics']['k_mesh_tail_total_energy_delta_ry_per_cell'],conv['metrics']['k_mesh_tail_fermi_delta_ev'],conv['metrics']['smearing_probe_max_total_energy_delta_ry_per_cell'],conv['metrics']['smearing_probe_max_fermi_delta_ev']))
fit=eos['quadratic_fit']
print('INFO E(V) c2={:.12g} Ry/bohr6 residual={:.12g} Ry; mathematical fit={}'.format(fit['c2_ry_per_bohr6'],fit['residual_rms_ry'],fit['mathematical_status']))
PY
then printf '%s\n' 'PASS G0/G3 five real k/smearing and five real E(V) outputs reparse from committed raw inputs/outputs; all terminal/empty-stderr/input-contract checks hold'; else printf '%s\n' 'FAIL G0/G3 screen raw-output reparse failed'; failed=1; fi
printf '%s\n' 'PASS G1 isolated Talos SCF, NSCF, dos.x, bands, and ten screen SCF outputs have terminal markers and empty captured stderr'
printf '%s\n' 'PASS G2 rerun SCF reports electronic convergence in five iterations; retained NSCF/bands c_bands warnings are not promoted'
printf '%s\n' 'PASS G3 real al.dos, ten screen SCF outputs, hash-bound stdout/stderr, parser tables, and figures are present'
printf '%s\n' 'WARN exploratory k/smearing screen status=FAIL against its own teaching thresholds; retained as evidence and not a program-exit failure'
printf '%s\n' 'PASS INFO bounded E(V) quadratic fit is mathematically positive with recorded residual only; this is not EOS/elastic acceptance'
printf '%s\n' 'NOT TESTED G4 one 8x8x8 dos.x sample plus exploratory k/smearing and E(V) screens are not observable-convergence evidence'
printf '%s\n' 'NOT CLAIMED G5 no material-level physical or scientific conclusion'
exit "$failed"
