#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
evidence_dir="$root/output/qe-run"
: "${QE_PW:?Set QE_PW to the pw.x executable.}"
: "${QE_PSEUDO_DIR:?Set QE_PSEUDO_DIR to the directory containing the two hash-identified PBE PAW PSL files.}"

if [[ ! -s "$root/input/al111-h-fcc-scf.in" ]]; then
  echo "Missing prepared input; run: python3 parse.py --prepare" >&2
  exit 2
fi
if [[ -e "$evidence_dir" ]]; then
  echo "Refusing to overwrite existing $evidence_dir; preserve or deliberately move prior evidence first." >&2
  exit 2
fi

runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/al111-h-qe.XXXXXX")"
record_written=0
flush_best_effort_record() {
  local wrapper_status="$1"
  if [[ "$record_written" -eq 0 && -f "$evidence_dir/pw.stdout" && -f "$evidence_dir/pw.stderr" && ! -e "$evidence_dir/execution-record.json" ]]; then
    python3 "$root/recover_execution.py" \
      --evidence-dir "$evidence_dir" \
      --origin 'future-run-best-effort-exit-recovery' \
      --host-label 'Talos' \
      --launcher "${QE_LAUNCHER:-direct}" \
      --walltime-boundary "${SLURM_TIMELIMIT:-unknown}" \
      --wrapper-exit-code "$wrapper_status" || true
  fi
}
cleanup_runtime() {
  local wrapper_status="$?"
  trap - EXIT TERM INT
  flush_best_effort_record "$wrapper_status"
  rm -rf "$runtime_dir"
  exit "$wrapper_status"
}
trap cleanup_runtime EXIT
trap 'exit 143' TERM INT
mkdir -p "$evidence_dir" "$runtime_dir/scratch"
cp "$root/input/al111-h-fcc-scf.in" "$evidence_dir/al111-h-fcc-scf.in"
cp "$root/input/al111-h-fcc-scf.in" "$runtime_dir/al111-h-fcc-scf.in"
ln -s "$QE_PSEUDO_DIR" "$runtime_dir/pseudo"

python3 - "$root/source/pseudopotential-provenance.json" "$QE_PSEUDO_DIR" <<'PY'
import hashlib, json, sys
provenance = json.load(open(sys.argv[1], encoding='utf-8'))
for item in provenance['files']:
    path = f"{sys.argv[2]}/{item['filename']}"
    actual = hashlib.sha256(open(path, 'rb').read()).hexdigest()
    if actual != item['sha256']:
        raise SystemExit(f"SHA-256 mismatch for {item['filename']}: {actual}")
PY
( cd "$QE_PSEUDO_DIR" && sha256sum Al.pbe-n-kjpaw_psl.1.0.0.UPF H.pbe-kjpaw_psl.1.0.0.UPF ) | \
  sed -E 's#  \./?#  #; s#  .*/#  #' > "$evidence_dir/pseudo.sha256"

set +e
if [[ -n "${QE_LAUNCHER:-}" ]]; then
  read -r -a launcher <<<"$QE_LAUNCHER"
  ( cd "$runtime_dir" && "${launcher[@]}" "$QE_PW" -in al111-h-fcc-scf.in ) >"$evidence_dir/pw.stdout" 2>"$evidence_dir/pw.stderr"
else
  ( cd "$runtime_dir" && "$QE_PW" -in al111-h-fcc-scf.in ) >"$evidence_dir/pw.stdout" 2>"$evidence_dir/pw.stderr"
fi
scf_exit_code=$?
set -e

python3 "$root/recover_execution.py" \
  --evidence-dir "$evidence_dir" \
  --origin 'future-wrapper-generated-from-raw' \
  --host-label 'Talos' \
  --launcher "${QE_LAUNCHER:-direct}" \
  --walltime-boundary "${SLURM_TIMELIMIT:-unknown}" \
  --wrapper-exit-code "$scf_exit_code"
record_written=1
exit "$scf_exit_code"
