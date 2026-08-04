#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"; fail=0
for f in source/silicon-cod-9013102.cif output/POSCAR.primitive output/silicon-primitive-2x2x2.xyz derived/structure-report.json derived/seekpath-primitive.json derived/cif-analysis.json figures/silicon-conventional-xy.png manifest.json; do
 if test -s "$root/$f"; then echo "PASS G0 $f exists and is non-empty"; else echo "FAIL G0 $f missing"; fail=1; fi
done
if python3 - "$root/derived/structure-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1])); assert r['primitive']['atoms']==2; assert r['supercell']['atoms']==16; assert all(x['number']==227 for x in r['symmetry_tolerance_sweep'])
PY
then echo "PASS G1 deterministic structure operations and symmetry sweep passed"; else echo "FAIL G1 parser assertions"; fail=1; fi
echo "WARN G2 no solver/optimizer was run"; echo "PASS G3 converted structures, report, reciprocal path, and PNG are present"; echo "NOT TESTED G4 no observable convergence study"; echo "NOT CLAIMED G5 no physical or DFT scientific conclusion"; exit "$fail"
