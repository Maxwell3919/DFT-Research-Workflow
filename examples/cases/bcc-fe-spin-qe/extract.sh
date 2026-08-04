#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
output_root="${CASE_OUTPUT_ROOT:-$root/output}"
if ! compgen -G "$output_root/*.out" >/dev/null; then
  printf 'NOT TESTED: no QE outputs are present; run only in an authorized allocation.\n'
  exit 0
fi
CASE_OUTPUT_ROOT="$output_root" CASE_REUSE_DERIVED=1 python3 "$root/parse.py"
attempt_id="$(python3 - "$output_root/run-status.json" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['attempt_id'])
PY
)"
python3 - "$root/derived/$attempt_id/bcc-fe-spin-summary.json" <<'PY'
import json, sys
record = json.load(open(sys.argv[1], encoding="utf-8"))
primary = record["primary_comparison"]
print("delta_ry_per_fe_primitive_cell=" + str(primary["delta_ry_per_fe_primitive_cell"]))
print("fm_total_magnetization_bohr_mag_per_cell=" + str(primary["fm_total_magnetization_bohr_mag_per_cell"]))
print("g4=" + record["gates"]["G4"]["status"])
print("g5=" + record["gates"]["G5"]["status"])
PY
