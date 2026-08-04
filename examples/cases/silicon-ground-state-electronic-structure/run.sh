#!/usr/bin/env bash
# Historical QE 7.5 command chain.  This case has no UPF payload by design.
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
pseudo="$root/pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF"
expected='ae3aefd0811f9499dbc4a72f1f9ae02ef4fc7f3568bf6f559b68668719c69e2b'
if ! test -s "$pseudo"; then
  echo "PRECONDITION FAILED: obtain the declared SSSP UPF separately at $pseudo; its body is not public in this case." >&2
  exit 2
fi
if test "$(sha256sum "$pseudo" | awk '{print $1}')" != "$expected"; then
  echo "PRECONDITION FAILED: supplied UPF hash differs from source/pseudopotentials.json." >&2
  exit 2
fi
for program in pw.x bands.x dos.x ph.x; do command -v "$program" >/dev/null || { echo "PRECONDITION FAILED: $program is not in PATH" >&2; exit 2; }; done
runtime="$root/runtime-output"
if test -e "$runtime"; then echo "Refusing to overwrite $runtime; select a new runtime directory." >&2; exit 2; fi
stage() {
  local name="$1"
  mkdir -p "$runtime/$name/pseudo" "$runtime/$name/out"
  cp "$pseudo" "$runtime/$name/pseudo/"
  cp "$root/input/"*.in "$runtime/$name/"
}
serial_pw() {
  local name="$1" input="$2" output="$3"
  stage "$name"
  ( cd "$runtime/$name"; OMP_NUM_THREADS=4 pw.x -in "$input" > "$output" 2> "${output%.out}.err" )
}
mpi_pw() {
  local name="$1" input="$2" output="$3"
  stage "$name"
  ( cd "$runtime/$name"; OMP_NUM_THREADS=8 mpirun -np 4 pw.x -in "$input" > "$output" 2> "${output%.out}.err" )
}
mkdir -p "$runtime"
# Actual recorded 3 by 3 cutoff/k-mesh matrix and fixed-cell relaxation.
for input in "$root"/input/si_e*_k*.in; do
  name="$(basename "${input%.in}")"
  mpi_pw "convergence-$name" "$(basename "$input")" "$name.out"
done
serial_pw relax si-relax.in si-relax.out
# Actual restart and interrupted-relaxation restart pairs share their save tree.
stage restart
( cd "$runtime/restart"; OMP_NUM_THREADS=4 pw.x -in fresh.in > fresh.out 2> fresh.err; OMP_NUM_THREADS=4 pw.x -in restart.in > restart.out 2> restart.err )
stage relax-restart
( cd "$runtime/relax-restart"; OMP_NUM_THREADS=4 pw.x -in segment1.in > segment1.out 2> segment1.err; OMP_NUM_THREADS=4 pw.x -in segment2-restart.in > segment2-restart.out 2> segment2-restart.err )
# Actual recorded ground-state/electronic and Gamma response program order.
stage electronic
(
  cd "$runtime/electronic"
  export OMP_NUM_THREADS=8
  mpirun -np 4 pw.x -in scf.in > scf.out 2> scf.err
  mpirun -np 4 pw.x -in bands.in > bands-pw.out 2> bands-pw.err
  bands.x -in bands.x.in > bandsx.out 2> bandsx.err
  mpirun -np 4 pw.x -in dos-nscf.in > dos-nscf.out 2> dos-nscf.err
  dos.x -in dos.x.in > dosx.out 2> dosx.err
)
stage gamma-phonon
(
  cd "$runtime/gamma-phonon"; export OMP_NUM_THREADS=8
  mpirun -np 4 pw.x -in si-gamma-scf.in > si-gamma-scf.out 2> si-gamma-scf.err
  mpirun -np 4 ph.x -in si-gamma-ph.in > si-gamma-ph.out 2> si-gamma-ph.err
)
stage dielectric
(
  cd "$runtime/dielectric"; export OMP_NUM_THREADS=8
  mpirun -np 4 pw.x -in si-epsilon-scf.in > si-epsilon-scf.out 2> si-epsilon-scf.err
  mpirun -np 4 ph.x -in si-epsilon-ph.in > si-epsilon-ph.out 2> si-epsilon-ph.err
)
echo "Runtime outputs are isolated in runtime-output/; inspect each stdout/stderr before any claim."
