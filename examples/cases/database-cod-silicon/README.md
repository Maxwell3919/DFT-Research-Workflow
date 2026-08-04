# COD Silicon record 9013102: direct HTTPS retrieval

This terminal-first case records a real direct download from the Crystallography
Open Database (COD), followed by deterministic CIF inspection. `source/` is the
downloaded CIF; `output/` preserves the HTTP headers, retrieval time, and run
summary; `derived/` holds analysis generated from that exact file by the
case-local ASE/spglib script.

Run `bash run.sh` to re-download and inspect the record. The parser and check
are intentionally hash-bound to the captured object, so a changed upstream
record fails rather than silently becoming the documented result. Run
`bash check.sh` for the fast acceptance gates and `bash extract.sh` for the
small, traceable output excerpt.

The case verifies a successful HTTP retrieval and a parseable conventional
eight-atom Si representation. It does not validate the database's identity,
experimental provenance, crystallographic quality, thermodynamic stability, or
any DFT calculation or scientific conclusion. COD content is accessed under
the database's stated open-data terms; users must check the record-level source
and reuse context before using it beyond this bounded teaching example.
