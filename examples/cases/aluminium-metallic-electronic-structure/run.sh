#!/usr/bin/env bash
# Execute only into a new, caller-selected runtime directory.  Committed
# evidence is immutable; this route never writes output/, derived/, or figures/.
set -euo pipefail

case_dir="$(cd "$(dirname "$0")" && pwd)"
for required_var in QE_PW QE_PSEUDO_DIR RUN_OUTPUT_ROOT; do
  if [[ -z "${!required_var:-}" ]]; then
    printf 'FAIL set %s before executing this isolated QE workflow\n' "$required_var" >&2
    exit 2
  fi
done

[[ -x "$QE_PW" ]] || { echo "FAIL QE_PW is not executable" >&2; exit 2; }
[[ -d "$QE_PSEUDO_DIR" ]] || { echo "FAIL QE_PSEUDO_DIR is not a directory" >&2; exit 2; }
[[ ! -e "$RUN_OUTPUT_ROOT" ]] || { echo "FAIL RUN_OUTPUT_ROOT already exists; refusing overwrite" >&2; exit 2; }

pseudo_name='Al.pbe-n-rrkjus_psl.1.0.0.UPF'
pseudo_expected='cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e'
pseudo_path="$QE_PSEUDO_DIR/$pseudo_name"
[[ -f "$pseudo_path" ]] || { echo "FAIL declared Al pseudopotential is absent" >&2; exit 2; }
[[ "$(sha256sum "$pseudo_path" | awk '{print $1}')" == "$pseudo_expected" ]] || { echo "FAIL Al pseudopotential SHA-256 mismatch" >&2; exit 2; }

mkdir -p "$RUN_OUTPUT_ROOT"
runtime_dir="$(cd "$RUN_OUTPUT_ROOT" && pwd)"
case_output="$(cd "$case_dir/output" && pwd)"
[[ "$runtime_dir" != "$case_output" && "$runtime_dir" != "$case_dir"/* ]] || { echo "FAIL runtime directory overlaps committed case evidence" >&2; exit 2; }

cp "$case_dir/input/scf.in" "$case_dir/input/nscf.in" "$case_dir/input/bands.in" "$runtime_dir/"
ln -s "$QE_PSEUDO_DIR" "$runtime_dir/pseudo"
cd "$runtime_dir"
run_stage() {
  local input="$1" output="$2" stderr="$3"
  "$QE_PW" -in "$input" > "$output" 2> "$stderr"
  grep -Fqx '   JOB DONE.' "$output" || { echo "FAIL $input lacks a terminal JOB DONE marker" >&2; exit 1; }
  ! grep -Fq 'Error in routine' "$output" || { echo "FAIL $input reports a QE fatal error" >&2; exit 1; }
}
run_stage scf.in scf.out scf.err
run_stage nscf.in nscf-full.out nscf-full.err
run_stage bands.in bands.out bands.err
printf 'PASS runtime evidence written only under %s\n' "$runtime_dir"
