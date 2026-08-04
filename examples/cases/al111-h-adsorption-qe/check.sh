#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
fail=0

for f in qe_plan.json source/pseudopotential-provenance.json source/qeguard-pseudo-manifest.json source/ase-construction.json input/al111-h-fcc.xyz input/al111-h-fcc-scf.in output/al111-h-fcc-initial.xyz; do
  if [[ -s "$root/$f" ]]; then echo "PASS G0 $f exists and is non-empty"; else echo "FAIL G0 $f missing"; fail=1; fi
done
if python3 - "$root/source/ase-construction.json" <<'PY'
import json, sys
r=json.load(open(sys.argv[1], encoding='utf-8'))
assert r['atoms'] == {'Al': 16, 'H': 1}
assert r['periodicity'] == [True, True, False]
assert r['site_label'] == 'fcc hollow candidate'
assert r['empty_cell_length_ang'] >= 23.9
assert r['H_above_highest_Al_ang'] > 0.0
PY
then echo "PASS G0 ASE slab, vacuum, and one H-candidate assertions passed"; else echo "FAIL G0 construction assertions"; fail=1; fi

if [[ -f "$root/output/qe-run/pw.stdout" ]]; then
  if bash "$root/extract.sh"; then echo "FAIL G1 terminal-failed QE attempt recovered from stdout/stderr"; fail=1; else echo "FAIL G1 terminal-failure extraction failed"; fail=1; fi
  for f in derived/qe-scf-summary.json derived/geometry-summary.csv figures/al111-h-fcc-xz.png manifest.json; do
    if [[ -s "$root/$f" ]]; then echo "PASS G3 $f is present"; else echo "FAIL G3 $f missing"; fail=1; fi
  done
  echo "NOT TESTED G2 scheduler cancellation prevents a completed-execution or numerical-result assessment"
else
  echo "NOT TESTED G1 no QE output has been supplied"
  echo "NOT TESTED G2 no completed-execution assessment"
  echo "NOT TESTED G3 derived QE artifacts await terminal extraction"
fi
echo "NOT TESTED G4 no cutoff, k-mesh, slab-thickness, vacuum, or site comparison convergence study"
echo "NOT CLAIMED G5 no adsorption energy, preferred site, relaxed geometry, or physical conclusion"
exit "$fail"
