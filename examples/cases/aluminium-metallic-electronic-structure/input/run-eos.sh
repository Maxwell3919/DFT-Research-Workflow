#!/usr/bin/env bash
# Execute the prepared five-point E(V) screen only in a new external root.
set -euo pipefail

case_dir="$(cd "$(dirname "$0")/.." && pwd)"
for required_var in QE_PW QE_PSEUDO_DIR RUN_OUTPUT_ROOT; do
  if [[ -z "${!required_var:-}" ]]; then
    printf 'FAIL set %s before executing the external E(V) screen\n' "$required_var" >&2
    exit 2
  fi
done
[[ -x "$QE_PW" ]] || { echo 'FAIL QE_PW is not executable' >&2; exit 2; }
[[ -d "$QE_PSEUDO_DIR" ]] || { echo 'FAIL QE_PSEUDO_DIR is not a directory' >&2; exit 2; }
[[ ! -e "$RUN_OUTPUT_ROOT" ]] || { echo 'FAIL RUN_OUTPUT_ROOT already exists; refusing overwrite' >&2; exit 2; }

pseudo_name='Al.pbe-n-rrkjus_psl.1.0.0.UPF'
pseudo_expected='cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e'
pseudo_path="$QE_PSEUDO_DIR/$pseudo_name"
[[ -f "$pseudo_path" ]] || { echo 'FAIL declared Al pseudopotential is absent' >&2; exit 2; }
[[ "$(sha256sum "$pseudo_path" | awk '{print $1}')" == "$pseudo_expected" ]] || { echo 'FAIL Al pseudopotential SHA-256 mismatch' >&2; exit 2; }

python3 "$case_dir/input/generate_eos_inputs.py" --output-dir "$RUN_OUTPUT_ROOT"
runtime_dir="$(cd "$RUN_OUTPUT_ROOT" && pwd)"
[[ "$runtime_dir" != "$case_dir" && "$runtime_dir" != "$case_dir"/* ]] || { echo 'FAIL runtime directory overlaps committed case evidence' >&2; exit 2; }
ln -s "$QE_PSEUDO_DIR" "$runtime_dir/pseudo"
cd "$runtime_dir"
for input in al-eos-*.in; do
  stem="${input%.in}"
  "$QE_PW" -in "$input" >"$stem.out" 2>"$stem.err"
  grep -Fqx '   JOB DONE.' "$stem.out" || { echo "FAIL $input lacks a terminal JOB DONE marker" >&2; exit 1; }
  [[ ! -s "$stem.err" ]] || { echo "FAIL $input wrote stderr; retain it for inspection" >&2; exit 1; }
done
python3 "$case_dir/input/parse_eos.py" --run-dir "$runtime_dir" --out-dir "$runtime_dir/assessment"
printf 'PASS external bounded E(V) screen written under %s; no EOS/elastic acceptance is implied\n' "$runtime_dir"
