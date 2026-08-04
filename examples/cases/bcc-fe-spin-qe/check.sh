#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
output_root="${CASE_OUTPUT_ROOT:-$root/output}"
failed=0
required=(README.md environment.txt run.sh check.sh extract.sh parse.py manifest.json input/qe_plan.json input/candidate-set.json input/pseudopotential-manifest.json input/fm-k8.scf.in input/fm-k10.scf.in input/fm-k12.scf.in input/nm-k12.scf.in source/pseudopotential-provenance.json source/qe-7.5-reference-index.json output/README.md derived/README.md figures/README.md)
for path in "${required[@]}"; do
  if [[ -s "$root/$path" ]]; then printf 'PASS G0 required artifact: %s\n' "$path"; else printf 'FAIL G0 missing artifact: %s\n' "$path"; failed=1; fi
done
if python3 - "$root" <<'PY'
import hashlib, json, sys
from pathlib import Path
root=Path(sys.argv[1]); plan=json.loads((root/'input/qe_plan.json').read_text()); config=json.loads((root/'input/candidate-set.json').read_text()); pseudo=json.loads((root/'input/pseudopotential-manifest.json').read_text())['pseudopotentials'][0]
assert plan['decision']=='pass' and plan['scientific_protocol_id']==config['protocol_id'] and plan['qe_version']=='7.5'
assert pseudo['filename']=='Fe.pbe-spn-kjpaw_psl.0.2.1.UPF' and pseudo['sha256']=='2317a0d3b136c09b6263e1ba328b505fb1ebf33bb4b28dc3df9e39af3184ef19'
assert [c['id'] for c in config['candidates']]==['fm-k8','fm-k10','fm-k12','nm-k12']
for c in config['candidates']:
    text=(root/c['input']).read_text(); assert "pseudo_dir = './pseudo'" in text and 'conv_thr = 1.0d-10' in text
assert 'nspin = 2' in (root/'input/fm-k12.scf.in').read_text()
assert 'nspin = 1' in (root/'input/nm-k12.scf.in').read_text()
print('input plan, pseudo declaration, and declared FM/NM candidate set are internally consistent')
PY
then printf 'PASS G0 staged inputs have a consistent plan and pseudo declaration\n'; else printf 'FAIL G0 staged input consistency\n'; failed=1; fi

if ! compgen -G "$output_root/*.out" >/dev/null; then
  if [[ -f "$root/output/attempt-01-slurm-launch-failure/failure-manifest.json" ]]; then
    printf 'FAIL G1 attempt-01 Slurm launcher failed before pw.x started; failure evidence is preserved\n'
    failed=1
  else
    printf 'NOT TESTED G1 no pw.x output has been recorded\n'
  fi
  printf 'NOT TESTED G2 no SCF convergence marker has been recorded\n'
  printf 'PASS G3 strict parser and declared output destinations are staged\n'
  printf 'NOT TESTED G4 no parameter-convergence series has been recorded\n'
  printf 'NOT CLAIMED G5 FM/NM staging makes no magnetic ground-state claim\n'
  exit "$failed"
fi
if CASE_OUTPUT_ROOT="$output_root" CASE_REUSE_DERIVED=1 python3 "$root/parse.py"; then
  printf 'PASS G1 declared QE outputs ended normally according to strict parser\n'
  printf 'PASS G2 declared SCF convergence markers passed strict parser\n'
  printf 'PASS G3 parsed summary and derived PNG are present\n'
  attempt_id=$(python3 - "$output_root/run-status.json" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['attempt_id'])
PY
)
  g4=$(python3 - "$root/derived/$attempt_id/bcc-fe-spin-summary.json" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['gates']['G4']['status'])
PY
)
  if [[ "$g4" == PASS ]]; then printf 'PASS G4 declared FM k-mesh total-energy screen passed\n'; else printf 'FAIL G4 declared FM k-mesh total-energy screen failed\n'; failed=1; fi
  printf 'NOT CLAIMED G5 FM/NM does not establish a complete magnetic ground state\n'
else
  printf 'FAIL G1/G2/G3 strict QE output parser rejected the recorded outputs\n'
  failed=1
fi
exit "$failed"
