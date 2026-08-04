#!/usr/bin/env bash
# Execute only inside an existing one-task Slurm allocation.  It never copies a
# UPF or restart tree into the public case directory.
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
expected_sha="2317a0d3b136c09b6263e1ba328b505fb1ebf33bb4b28dc3df9e39af3184ef19"
pseudo_name="Fe.pbe-spn-kjpaw_psl.0.2.1.UPF"
: "${QE_PW:?Set QE_PW to the QE 7.5 pw.x executable.}"
: "${QE_PSEUDO_DIR:?Set QE_PSEUDO_DIR to the directory containing the declared Fe UPF.}"
: "${CASE_ATTEMPT_ID:?Set CASE_ATTEMPT_ID to a new attempt identifier, for example attempt-02-mpirun.}"
if [[ ! "$CASE_ATTEMPT_ID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  printf 'FAIL CASE_ATTEMPT_ID must be a lowercase hyphenated identifier\n' >&2
  exit 2
fi
output_root="$root/output/$CASE_ATTEMPT_ID"
if [[ -e "$output_root" ]]; then
  printf 'FAIL attempt output directory already exists; choose a new CASE_ATTEMPT_ID\n' >&2
  exit 2
fi

if [[ ! -x "$QE_PW" ]]; then
  printf 'FAIL QE_PW is not executable\n' >&2
  exit 2
fi
if [[ ! -r "$QE_PSEUDO_DIR/$pseudo_name" ]]; then
  printf 'FAIL declared pseudopotential is not readable\n' >&2
  exit 2
fi
actual_sha="$(sha256sum "$QE_PSEUDO_DIR/$pseudo_name" | awk '{print $1}')"
if [[ "$actual_sha" != "$expected_sha" ]]; then
  printf 'FAIL pseudopotential SHA-256 mismatch: %s\n' "$actual_sha" >&2
  exit 2
fi
launcher_text="${QE_LAUNCHER:-srun --ntasks=1 --cpus-per-task=1}"
read -r -a launcher <<<"$launcher_text"
runtime="$(mktemp -d "${TMPDIR:-/tmp}/bcc-fe-spin-qe.XXXXXX")"
cleanup() { rm -rf -- "$runtime"; }
trap cleanup EXIT
mkdir -p "$runtime/input" "$runtime/work" "$output_root"
cp "$root"/input/*.in "$runtime/input/"
ln -s "$QE_PSEUDO_DIR" "$runtime/pseudo"

declare -a ids=(fm-k8 fm-k10 fm-k12 nm-k12)
declare -a completed_ids=()
declare -a completed_codes=()
write_status() {
  local status_tmp="$output_root/.run-status.json.tmp"
  {
    printf '{\n  "case_id": "bcc-fe-spin-qe",\n  "attempt_id": "%s",\n  "pseudopotential_sha256": "%s",\n  "runs": [' "$CASE_ATTEMPT_ID" "$actual_sha"
    for status_index in "${!completed_ids[@]}"; do
      [[ "$status_index" -gt 0 ]] && printf ','
      printf '\n    {"id": "%s", "exit_code": %s}' "${completed_ids[$status_index]}" "${completed_codes[$status_index]}"
    done
    printf '\n  ]\n}\n'
  } >"$status_tmp"
  mv "$status_tmp" "$output_root/run-status.json"
}
for index in "${!ids[@]}"; do
  id="${ids[$index]}"
  set +e
  (cd "$runtime" && "${launcher[@]}" "$QE_PW" -in "input/$id.scf.in" >"$id.out" 2>"$id.err")
  exit_code=$?
  set -e
  # Reject rather than publish output that exposes a private absolute path.
  if grep -Eq '/(home|Users)/[A-Za-z0-9._-]+' "$runtime/$id.out" "$runtime/$id.err"; then
    printf 'FAIL runtime output contains a private absolute path for %s\n' "$id" >&2
    exit 2
  fi
  cp "$runtime/$id.out" "$output_root/$id.out"
  cp "$runtime/$id.err" "$output_root/$id.err"
  completed_ids+=("$id")
  completed_codes+=("$exit_code")
  write_status
  if [[ "$exit_code" -ne 0 ]]; then
    printf 'FAIL QE returned nonzero for %s\n' "$id" >&2
    exit "$exit_code"
  fi
done
CASE_OUTPUT_ROOT="$output_root" python3 "$root/parse.py"
printf 'PASS completed FM/NM candidate and FM k-mesh screening runs; inspect check.sh before any interpretation\n'
