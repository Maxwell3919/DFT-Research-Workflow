#!/usr/bin/env bash
set -euo pipefail
root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"
python3 - "$root/derived/structure-candidates-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1],encoding='utf-8'))
v=r['vacancy_candidate']; i=r['interface_candidate']
print('vacancy_parent_atoms=',v['parent_atoms'])
print('vacancy_candidate_atoms=',v['candidate_atoms'])
print('removed_site_fractional_coordinate=',v['vacancy_site_fractional_coordinate'])
print('interface_formula=',i['formula'])
print('interface_atoms=',i['candidate_atoms'])
print('interlayer_separation_ang=',i['interlayer_separation_ang'])
print('imposed_inplane_mismatch_percent=',i['imposed_inplane_mismatch_percent'])
PY
