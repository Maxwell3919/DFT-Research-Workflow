#!/usr/bin/env bash
# Native QE 7.5 replay template assembled from recorded stage inputs. It is not
# the uncaptured historical launcher and this case has no UPF payload by design.
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
pseudo_dir="${PSEUDO_DIR:-$root/pseudo}"
pseudo="$pseudo_dir/Si.pbe-n-rrkjus_psl.1.0.0.UPF"
expected='ae3aefd0811f9499dbc4a72f1f9ae02ef4fc7f3568bf6f559b68668719c69e2b'
qe_pw="${QE_PW:-pw.x}"
qe_bands="${QE_BANDS:-bands.x}"
qe_dos="${QE_DOS:-dos.x}"
qe_ph="${QE_PH:-ph.x}"
qe_launcher="${QE_LAUNCHER:-}"
if ! test -s "$pseudo"; then
  echo "PRECONDITION FAILED: prepare the exact archive member outside the repository with python3 prepare-replay.py --download-pseudopotential --output-dir /absolute/new/path, then set PSEUDO_DIR." >&2
  exit 2
fi
if test "$(sha256sum "$pseudo" | awk '{print $1}')" != "$expected"; then
  echo "PRECONDITION FAILED: supplied UPF hash differs from source/pseudopotentials.json." >&2
  exit 2
fi
for program in "$qe_pw" "$qe_bands" "$qe_dos" "$qe_ph"; do command -v "$program" >/dev/null || { echo "PRECONDITION FAILED: $program is not in PATH" >&2; exit 2; }; done
runtime="${RUNTIME_DIR:-$root/runtime-output}"
if test -e "$runtime"; then echo "Refusing to overwrite $runtime; select a new runtime directory." >&2; exit 2; fi
stage() {
  local name="$1"
  mkdir -p "$runtime/$name/pseudo" "$runtime/$name/out"
  cp "$pseudo" "$runtime/$name/pseudo/"
  cp "$root/input/"*.in "$runtime/$name/"
  cp "$root/input/full-zone/scf.in" "$runtime/$name/full-zone-scf.in"
  cp "$root/input/full-zone/bands.in" "$runtime/$name/full-zone-bands.in"
  cp "$root/input/full-zone/bands.x.in" "$runtime/$name/full-zone-bands.x.in"
}
run_qe() {
  local executable="$1" input="$2" output="$3"
  if test -n "$qe_launcher"; then
    local -a launcher
    read -r -a launcher <<< "$qe_launcher"
    "${launcher[@]}" "$executable" -in "$input" > "$output" 2> "${output%.out}.err"
  else
    "$executable" -in "$input" > "$output" 2> "${output%.out}.err"
  fi
}
mkdir -p "$runtime"
# Replay the recorded 3 by 3 cutoff/k-mesh inputs and fixed-cell relaxation.
for input in "$root"/input/si_e*_k*.in; do
  name="$(basename "${input%.in}")"
  stage "convergence-$name"
  ( cd "$runtime/convergence-$name"; run_qe "$qe_pw" "$(basename "$input")" "$name.out" )
done
stage relax
( cd "$runtime/relax"; run_qe "$qe_pw" si-relax.in si-relax.out )
# In this replay, each restart pair shares its newly created runtime save tree.
stage restart
( cd "$runtime/restart"; run_qe "$qe_pw" fresh.in fresh.out; run_qe "$qe_pw" restart.in restart.out )
stage relax-restart
( cd "$runtime/relax-restart"; run_qe "$qe_pw" segment1.in segment1.out; run_qe "$qe_pw" segment2-restart.in segment2-restart.out )
# Replay the recorded ground-state/electronic and Gamma-response stage order.
stage electronic
(
  cd "$runtime/electronic"
  run_qe "$qe_pw" scf.in scf.out
  run_qe "$qe_pw" bands.in bands-pw.out
  run_qe "$qe_bands" bands.x.in bandsx.out
  run_qe "$qe_pw" dos-nscf.in dos-nscf.out
  run_qe "$qe_dos" dos.x.in dosx.out
)
stage gamma-phonon
(
  cd "$runtime/gamma-phonon"
  run_qe "$qe_pw" si-gamma-scf.in si-gamma-scf.out
  run_qe "$qe_ph" si-gamma-ph.in si-gamma-ph.out
)
stage dielectric
(
  cd "$runtime/dielectric"
  run_qe "$qe_pw" si-epsilon-scf.in si-epsilon-scf.out
  run_qe "$qe_ph" si-epsilon-ph.in si-epsilon-ph.out
)
stage full-zone
(
  cd "$runtime/full-zone"
  run_qe "$qe_pw" full-zone-scf.in scf.out
  run_qe "$qe_pw" full-zone-bands.in bands-pw.out
  run_qe "$qe_bands" full-zone-bands.x.in bandsx.out
)
echo "Runtime outputs are isolated in runtime-output/; this replay does not prove historical continuity. Inspect each stdout/stderr before any claim."
