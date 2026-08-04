#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
failed=0
required=(README.md environment.txt source/9013102.cif input/retrieval.json output/cod-response.headers output/downloaded-at.txt output/run.log derived/9013102.analysis.json derived/parsed-summary.json figures/README.md run.sh check.sh extract.sh parse.py analyze_structure.py manifest.json)
for path in "${required[@]}"; do
  if [[ -s "$path" ]]; then printf 'PASS required artifact exists: %s\n' "$path"; else printf 'FAIL missing or empty artifact: %s\n' "$path"; failed=1; fi
done
if grep -Eq '^HTTP/.* 200 ' output/cod-response.headers; then printf 'PASS COD server returned HTTP 200\n'; else printf 'FAIL COD HTTP 200 marker absent\n'; failed=1; fi
if python3 parse.py; then printf 'PASS parser accepted hash-bound CIF and analysis\n'; else printf 'FAIL parser rejected CIF lineage\n'; failed=1; fi
if [[ $failed -ne 0 ]]; then exit 1; fi
printf 'PASS G0 required files and hash-bound parser lineage are present\n'
printf 'PASS G1 captured COD HTTPS retrieval returned HTTP 200\n'
printf 'WARN G2 NOT TESTED: a database retrieval has no solver threshold\n'
printf 'PASS G3 CIF, HTTP headers, and parser products are present\n'
printf 'WARN G4 NOT TESTED: no observable convergence protocol was run\n'
printf 'WARN G5 NOT CLAIMED: retrieval and parsing do not support a physical conclusion\n'
