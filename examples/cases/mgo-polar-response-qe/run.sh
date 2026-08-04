#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"
: "${QE_PW:?Set QE_PW to a verified QE 7.5 pw.x executable.}"
: "${QE_PH:?Set QE_PH to a verified QE 7.5 ph.x executable.}"
: "${QE_PSEUDO_DIR:?Set QE_PSEUDO_DIR to a directory containing the declared UPF files.}"

if [[ -e output/mgo-scf.out || -e output/mgo-scf.err || -e output/mgo-scf.exit || -e output/mgo-ph.out || -e output/mgo-ph.err || -e output/mgo-ph.exit || -e output/run-status.txt || -e output/mgo_polar.dyn ]]; then
  echo "Refusing to overwrite existing output evidence." >&2
  exit 2
fi

python3 - "$QE_PSEUDO_DIR" <<'PY'
import hashlib, json, sys
from pathlib import Path
root = Path.cwd(); pseudo_dir = Path(sys.argv[1]); manifest = json.loads((root / 'input/pseudopotentials.json').read_text())
for item in manifest['pseudopotentials']:
    path = pseudo_dir / item['filename']
    if not path.is_file(): raise SystemExit(f"missing declared pseudopotential: {item['filename']}")
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != item['sha256']: raise SystemExit(f"pseudopotential SHA-256 mismatch: {item['filename']}")
PY

mkdir output
runtime_parent="${RUN_TMP_PARENT:-${TMPDIR:-/tmp}}"
runtime="$(mktemp -d "$runtime_parent/mgo-polar-response-qe.XXXXXX")"
cleanup() {
  rm -rf -- "$runtime"
}
trap cleanup EXIT HUP INT TERM
install -m 0644 input/mgo-scf.in "$runtime/mgo-scf.in"
install -m 0644 input/mgo-ph.in "$runtime/mgo-ph.in"
mkdir "$runtime/pseudo"
for pseudo in Mg.pbe-spnl-kjpaw_psl.1.0.0.UPF O.pbe-n-kjpaw_psl.0.1.UPF; do
  install -m 0644 "$QE_PSEUDO_DIR/$pseudo" "$runtime/pseudo/$pseudo"
done
read -r -a runner <<< "${QE_RUNNER:-srun --ntasks=1 --cpus-per-task=1 --time=00:10:00}"
cd "$runtime"
set +e
"${runner[@]}" "$QE_PW" -in mgo-scf.in > "$root/output/mgo-scf.out" 2> "$root/output/mgo-scf.err"
scf_status=$?
set -e
printf '%s\n' "$scf_status" > "$root/output/mgo-scf.exit"
if (( scf_status != 0 )); then
  printf 'pw.x exited %s; ph.x was not started.\n' "$scf_status" > "$root/output/run-status.txt"
  exit "$scf_status"
fi
set +e
"${runner[@]}" "$QE_PH" -in mgo-ph.in > "$root/output/mgo-ph.out" 2> "$root/output/mgo-ph.err"
ph_status=$?
set -e
printf '%s\n' "$ph_status" > "$root/output/mgo-ph.exit"
if (( ph_status != 0 )); then
  printf 'pw.x exited 0; ph.x exited %s.\n' "$ph_status" > "$root/output/run-status.txt"
  exit "$ph_status"
fi
if [[ ! -s mgo_polar.dyn ]]; then
  printf 'pw.x and ph.x exited zero but the requested dynamical matrix is missing.\n' > "$root/output/run-status.txt"
  exit 2
fi
install -m 0644 mgo_polar.dyn "$root/output/mgo_polar.dyn"
printf 'pw.x and ph.x commands exited zero; run extract.sh and check.sh before any claim.\n' > "$root/output/run-status.txt"
