#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"; fail=0
for f in source/graphene-unit.xyz output/graphene-2x2-vacuum.xyz output/POSCAR.graphene-2x2-H-ontop input/POSCAR.graphene-2x2-vacuum derived/graphene-model-report.json figures/graphene-H-xz.png manifest.json; do if test -s "$root/$f"; then echo "PASS G0 $f exists and is non-empty"; else echo "FAIL G0 $f missing"; fail=1; fi; done
if python3 - "$root/derived/graphene-model-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1])); assert r['vacuum_model']['atoms']==8; assert r['adsorbate_model']['atoms']==9; assert r['vacuum_model']['pbc']==[True,True,False]; assert r['construction']['empty_cell_length_ang']>=23.9
PY
then echo "PASS G1 ASE 2D/slab/adsorbate assertions passed"; else echo "FAIL G1 parser assertions"; fail=1; fi
echo "WARN G2 no solver/optimizer was run"; echo "PASS G3 exported structure and real plot are present"; echo "NOT TESTED G4 no observable convergence"; echo "NOT CLAIMED G5 no physical conclusion"; exit "$fail"
