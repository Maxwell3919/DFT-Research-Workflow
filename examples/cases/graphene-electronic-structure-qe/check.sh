#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

failed=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failed=1; }

for path in README.md environment.txt qe_plan.json pseudo-provenance.json pseudo-manifest.json source/graphene-primitive-model.json input/graphene.scf.in input/graphene.bands.in input/graphene.bands.x.in output/README.md derived/README.md figures/README.md run.sh check.sh extract.sh parse.py manifest.json; do
  if [[ -s "$path" ]]; then pass "G0 required prepared artifact: $path"; else fail "G0 missing or empty: $path"; fi
done

if python3 parse.py --static >/dev/null; then pass 'G0 strict static plan/input/pseudo audit'; else fail 'G0 strict static audit rejected the prepared case'; fi

runtime_outputs=(output/graphene.scf.stdout output/graphene.scf.stderr output/graphene.scf.exit output/graphene.bands.parent-scf.stdout output/graphene.bands.parent-scf.stderr output/graphene.bands.parent-scf.exit output/graphene.bands.pw.stdout output/graphene.bands.pw.stderr output/graphene.bands.pw.exit output/graphene.bands.x.stdout output/graphene.bands.x.stderr output/graphene.bands.x.exit output/graphene.bands.dat)
have_outputs=1
for path in "${runtime_outputs[@]}"; do [[ -f "$path" ]] || have_outputs=0; done
if [[ "$have_outputs" -eq 1 ]]; then
  if python3 parse.py >/dev/null; then
    pass 'G1 independent SCF, bands-parent SCF, bands pw.x, and bands.x exit codes/stdout/stderr/termination markers are present'
    pass 'G2 recorded SCF convergence marker is present'
    pass 'G3 SCF, bands, bands.x, and parseable band data are complete'
  else
    fail 'G1/G2/G3 strict execution-output parser rejected artifacts'
  fi
else
  warn 'G1 NOT TESTED: no complete QE output set has been returned'
  warn 'G2 NOT TESTED: no SCF convergence marker has been returned'
  warn 'G3 NOT TESTED: no complete SCF-to-bands artifact chain has been returned'
fi
warn 'G4 NOT TESTED: no vacuum, cutoff, k-mesh, smearing, or path convergence series exists.'
warn 'G5 NOT CLAIMED: a fixed Gamma-K-M-Gamma path cannot establish full-zone electronic properties or a material conclusion.'
exit "$failed"
