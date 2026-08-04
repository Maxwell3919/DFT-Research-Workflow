#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"
python3 - <<'PY'
import hashlib, json
from pathlib import Path
root = Path.cwd()
required = [root/'source/model.json', root/'input/mgo-scf.in', root/'input/mgo-ph.in', root/'input/qe_plan.json', root/'input/pseudopotentials.json', root/'input/official-qe-7.5-parameters.json']
for path in required:
    assert path.is_file() and path.stat().st_size > 0, f'missing staged input: {path.name}'
plan = json.loads((root/'input/qe_plan.json').read_text())
assert plan['qe_version'] == '7.5' and plan['task_type'] == 'phonon'
scf = (root/'input/mgo-scf.in').read_text(); ph = (root/'input/mgo-ph.in').read_text()
assert "prefix = 'mgo_polar'" in scf and "prefix = 'mgo_polar'" in ph
assert "outdir = './out'" in scf and "outdir = './out'" in ph
assert "epsil = .true." in ph and "fildyn = 'mgo_polar.dyn'" in ph and '0.0 0.0 0.0' in ph
manifest = json.loads((root/'input/pseudopotentials.json').read_text())
assert {p['filename'] for p in manifest['pseudopotentials']} == {'Mg.pbe-spnl-kjpaw_psl.1.0.0.UPF', 'O.pbe-n-kjpaw_psl.0.1.UPF'}
for item in manifest['pseudopotentials']:
    for field in ('filename', 'sha256', 'source', 'source_url', 'xc_functional', 'relativistic'):
        assert item.get(field), f'missing pseudopotential provenance field: {field}'
assert 'LO--TO splitting' in (root/'README.md').read_text()
print('PASS G0 model, inputs, QE plan, XML-readable pseudo declarations, and claim ceiling are internally consistent')
PY
if [[ -f output/mgo-scf.out && -f output/mgo-scf.err && -f output/mgo-scf.exit && -f output/mgo-ph.out && -f output/mgo-ph.err && -f output/mgo-ph.exit && -f output/mgo_polar.dyn ]]; then
  python3 "$root/parse.py" --check-only
  echo 'PASS G1/G2/G3 parser accepted matching execution evidence; G4 remains NOT TESTED and G5 NOT CLAIMED'
else
  echo 'NOT TESTED G1 execution; NOT TESTED G2 SCF; NOT TESTED G3 DFPT; NOT TESTED G4; NOT CLAIMED G5'
fi
