#!/usr/bin/env bash
set -euo pipefail
root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"
fail=0
for f in source/si-diamond-conventional.xyz source/graphene-hbn-component-model.json input/POSCAR.si-2x2x2-vacancy input/POSCAR.graphene-hbn-bilayer output/si-2x2x2-vacancy.xyz output/graphene-hbn-bilayer.xyz output/run.stdout derived/structure-candidates-report.json derived/structure-candidates-metrics.csv figures/structure-candidates-xz.png manifest.json; do
  if test -s "$root/$f"; then echo "PASS G0 $f exists and is non-empty"; else echo "FAIL G0 $f missing"; fail=1; fi
done
if python3 - "$root/derived/structure-candidates-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1],encoding='utf-8'))
v=r['vacancy_candidate']; i=r['interface_candidate']
assert v['parent_atoms']==64 and v['candidate_atoms']==63 and v['removed_site_index']==0
assert v['vacancy_site_fractional_coordinate']==[0.0,0.0,0.0]
assert i['graphene_atoms']==8 and i['hbn_atoms']==8 and i['candidate_atoms']==16
assert i['pbc']==[True,True,False] and i['interlayer_separation_ang'] == 3.35
assert i['imposed_inplane_mismatch_percent']==0.0
assert r['pymatgen_crosscheck']['vacancy_atoms']==63 and r['pymatgen_crosscheck']['interface_atoms']==16
PY
then echo "PASS G1 ASE construction and pymatgen cross-check assertions passed"; else echo "FAIL G1 structure assertions failed"; fail=1; fi
echo "WARN G2 no solver or geometry optimizer was run"
echo "PASS G3 vacancy and bilayer exports, metrics, stdout, and PNG are present"
echo "NOT TESTED G4 no defect-size, registry, strain, vacuum, or energy convergence study"
echo "NOT CLAIMED G5 no defect, interface, stability, or electronic conclusion"
exit "$fail"
