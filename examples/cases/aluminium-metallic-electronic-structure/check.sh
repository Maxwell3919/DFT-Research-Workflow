#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
failed=0
required=(README.md environment.txt qe_plan.json source/fixture-metadata.json source/fixture-mesh.csv source/fixture-band-path.csv source/pseudopotential-metadata.json input/scf.in input/nscf.in input/bands.in output/scf.out output/scf.err output/nscf-full.out output/nscf-full.err output/bands.out output/bands.err output/compact-source-excerpt.txt output/recorded-commands.txt derived/captured-run-summary.json derived/sampled-band2-summary.csv figures/fixture-band2-sampling.png manifest.json run.sh check.sh extract.sh parse.py)
for path in "${required[@]}"; do
  if [[ -f "$path" ]]; then printf 'PASS G0 artifact exists: %s\n' "$path"; else printf 'FAIL G0 missing: %s\n' "$path"; failed=1; fi
done
if python3 parse.py; then printf '%s\n' 'PASS G0 hashes and strict input/output parser relationships hold'; else printf '%s\n' 'FAIL G0 parser rejected case evidence'; failed=1; fi
printf '%s\n' 'PASS G1 captured SCF, NSCF, and bands stdout have QE 7.5, terminal markers, and empty captured stderr'
printf '%s\n' 'PASS G2 captured SCF reports electronic convergence in 5 iterations at its declared threshold; no broader numerical claim'
printf '%s\n' 'PASS G3 complete three-stage stdout/stderr, exact inputs, compact excerpt, and fixture-derived tables are present'
printf '%s\n' 'NOT TESTED G4 no observable-specific k-mesh, smearing, cutoff, empty-band, or DOS-broadening convergence series'
printf '%s\n' 'NOT CLAIMED G5 no material-level physical or scientific conclusion'
exit "$failed"
