#!/usr/bin/env bash
if [[ "${CASE_RUN_ROOT_ACTIVE:-}" == "1" ]]; then
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  active_root=$(CDPATH= cd -- "${CASE_RUN_ROOT:?FAIL internal run root is missing.}" && pwd -P) || exit 2
  [[ "$case_dir" == "$active_root" && -f "$active_root/.case-run-root" ]] || { printf 'FAIL internal run root marker is invalid.\n' >&2; exit 2; }
else
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  : "${CASE_RUN_ROOT:?FAIL set CASE_RUN_ROOT to an existing empty external directory; committed case artifacts are never rerun in place.}"
  run_root=$(CDPATH= cd -- "$CASE_RUN_ROOT" && pwd -P) || { printf 'FAIL CASE_RUN_ROOT must be an existing directory.\n' >&2; exit 2; }
  if [[ "$run_root" == "$case_dir" || "$run_root" == "$case_dir/"* ]] || [[ -n "$(find "$run_root" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    printf 'FAIL CASE_RUN_ROOT must be an empty external directory, not this case or its child.\n' >&2; exit 2
  fi
  cp -a "$case_dir/." "$run_root/"
  : > "$run_root/.case-run-root"
  exec env CASE_RUN_ROOT_ACTIVE=1 CASE_RUN_ROOT="$run_root" bash "$run_root/run.sh" "$@"
fi
# Run only inside an existing allocation.  This script never calls sbatch/salloc.
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$case_dir"

pseudo_file='C.pbe-n-kjpaw_psl.1.0.0.UPF'
expected_pseudo_sha='9900d1efd50b9848e31849f39094b33348486b400ee51e0f3922f716137cf3d7'
: "${PSEUDO_DIR:?Set PSEUDO_DIR to the directory containing the public PSLibrary pseudo.}"
pw_command=${PW_COMMAND:-pw.x}
bands_command=${BANDS_COMMAND:-bands.x}
launcher=${QE_LAUNCHER:-}
run_stage=${RUN_STAGE:-all}
case "$run_stage" in
  scf|bands) ;;
  all)
    printf 'FAIL RUN_STAGE=all is intentionally blocked: run RUN_STAGE=scf, complete its independent audit and parent evidence, then run RUN_STAGE=bands.\n' >&2
    exit 2
    ;;
  *)
    printf 'FAIL RUN_STAGE must be scf, bands, or all (all is fail-closed pending independent SCF review).\n' >&2
    exit 2
    ;;
esac

test -x "$pw_command" || command -v "$pw_command" >/dev/null
test -x "$bands_command" || command -v "$bands_command" >/dev/null
test -r "$PSEUDO_DIR/$pseudo_file"
actual_pseudo_sha=$(sha256sum "$PSEUDO_DIR/$pseudo_file" | awk '{print $1}')
if [[ "$actual_pseudo_sha" != "$expected_pseudo_sha" ]]; then
  printf 'FAIL pseudo SHA-256 mismatch: %s\n' "$actual_pseudo_sha" >&2
  exit 1
fi

runtime=$(mktemp -d "$case_dir/.runtime.XXXXXX")
flush_runtime() {
  local artifact
  for artifact in graphene.scf.stdout graphene.scf.stderr graphene.scf.exit graphene.bands.parent-scf.stdout graphene.bands.parent-scf.stderr graphene.bands.parent-scf.exit graphene.bands.pw.stdout graphene.bands.pw.stderr graphene.bands.pw.exit graphene.bands.x.stdout graphene.bands.x.stderr graphene.bands.x.exit graphene.bands.dat; do
    [[ -f "$runtime/$artifact" ]] && cp "$runtime/$artifact" "output/$artifact"
  done
  return 0
}
cleanup() { flush_runtime || true; rm -rf "$runtime"; }
trap cleanup EXIT
mkdir -p "$runtime/pseudo" "$runtime/tmp"
ln -s "$PSEUDO_DIR/$pseudo_file" "$runtime/pseudo/$pseudo_file"
cp input/graphene.scf.in "$runtime/graphene.scf.in"
cp input/graphene.bands.in "$runtime/graphene.bands.in"
cp input/graphene.bands.x.in "$runtime/graphene.bands.x.in"

run_program() {
  local stage=$1 program=$2 input_file=$3
  local status=0
  if [[ -n "$launcher" ]]; then
    read -r -a launcher_words <<< "$launcher"
    "${launcher_words[@]}" "$program" -in "$input_file" > "$stage.stdout" 2> "$stage.stderr" || status=$?
  else
    "$program" -in "$input_file" > "$stage.stdout" 2> "$stage.stderr" || status=$?
  fi
  printf 'exit_code=%s\n' "$status" > "$stage.exit"
  return "$status"
}

verify_scf_parent() {
  python3 - "$case_dir" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
evidence_path = root / 'output/scf-parent-evidence.json'
if not evidence_path.is_file():
    raise SystemExit('FAIL bands requires output/scf-parent-evidence.json from an independently audited SCF stage')
evidence = json.loads(evidence_path.read_text(encoding='utf-8'))
expected = {
    'schema_version': '1.0',
    'case_id': 'graphene-qe-2d-teaching',
    'scientific_protocol_id': 'graphene-qe-7.5-band-path-teaching-v1',
    'stage': 'scf',
}
for key, value in expected.items():
    if evidence.get(key) != value:
        raise SystemExit(f'FAIL parent evidence {key} does not match the active case contract')
artifacts = evidence.get('artifacts')
if not isinstance(artifacts, dict):
    raise SystemExit('FAIL parent evidence has no artifact hash map')
for relative in ('input/graphene.scf.in', 'output/graphene.scf.stdout', 'output/graphene.scf.stderr', 'output/graphene.scf.exit', 'output/execution-environment.txt'):
    path = root / relative
    actual = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
    if artifacts.get(relative) != actual:
        raise SystemExit(f'FAIL parent evidence does not bind {relative}')
audit_path = root / 'output/graphene.scf-qeguard-audit.json'
actual_audit = hashlib.sha256(audit_path.read_bytes()).hexdigest() if audit_path.is_file() else None
if evidence.get('scf_qeguard_audit_sha256') != actual_audit:
    raise SystemExit('FAIL parent evidence does not bind output/graphene.scf-qeguard-audit.json')
audit = json.loads(audit_path.read_text(encoding='utf-8'))
if audit.get('decision') != 'pass' or audit.get('gates', {}).get('execution_completion') != 'pass':
    raise SystemExit('FAIL parent QE guard audit is not a passing SCF execution-completion record')
PY
}

version_line=$(cd "$runtime" && { "$pw_command" -version 2>&1 || true; } | rg -m1 'Program PWSCF v\.7\.5' || true)
if [[ -z "$version_line" ]]; then
  printf 'FAIL PW_COMMAND did not identify as QE 7.5\n' >&2
  exit 1
fi
if [[ "$run_stage" == bands ]]; then verify_scf_parent; fi
if [[ "$run_stage" == scf ]]; then environment_record=output/execution-environment.txt; else environment_record=output/bands-execution-environment.txt; fi
printf 'pwscf_version=%s\n' "$(sed -E 's/[[:space:]]+/ /g' <<< "$version_line")" > "$environment_record"
printf 'pseudo_file=%s\npseudo_sha256=%s\nlauncher=%s\nstage=%s\n' "$pseudo_file" "$actual_pseudo_sha" "${launcher:-<none>}" "$run_stage" >> "$environment_record"
(
  cd "$runtime"
  if [[ "$run_stage" == scf ]]; then
    run_program graphene.scf "$pw_command" graphene.scf.in
  else
    run_program graphene.bands.parent-scf "$pw_command" graphene.scf.in
    run_program graphene.bands.pw "$pw_command" graphene.bands.in
    run_program graphene.bands.x "$bands_command" graphene.bands.x.in
  fi
)
flush_runtime
if [[ "$run_stage" == bands ]]; then python3 parse.py --write-derived --write-manifest; fi
exit 0
