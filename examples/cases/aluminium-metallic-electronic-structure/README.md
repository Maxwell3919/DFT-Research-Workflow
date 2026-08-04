# Aluminium metallic electronic structure (QE 7.5)

This terminal-first case preserves one continuous fcc-Al teaching workflow:
metallic SCF, a uniform full-zone NSCF calculation, and an explicit band path.
It records the exact inputs, full stdout, separate stderr, input/output hashes,
and a compact human-readable excerpt.  The inputs use
`occupations='smearing'`, Marzari-Vanderbilt smearing (`degauss=0.02 Ry`), and
an 8x8x8 mesh; those are settings from this run, not universal or converged
recommendations.

Run `python3 parse.py`, `bash extract.sh`, and `bash check.sh` to reproduce the
case-local checks and the CSV tables/PNG directly from captured QE stdout.
The source `fixture-*.csv` files are retained only as a historical audit aid;
the parser never reads them.  To execute a new isolated run, provide an
authorized executable/wrapper and pseudopotential directory through `QE_PW`
and `QE_PSEUDO_DIR`, then point `RUN_OUTPUT_ROOT` at a **new** directory. The
script hash-checks the Al UPF and refuses any runtime directory that exists or
overlaps committed evidence.

G1 and G2 cover only this captured QE execution and its SCF electronic
threshold.  G3 confirms the captured stage artifacts.  There is no k-mesh,
smearing, cutoff, empty-band, or DOS-broadening series, so G4 remains `NOT
TESTED`; the case makes no G5 material conclusion.  It does not establish a
converged DOS/Fermi surface, EOS, elastic property, carrier density, transport
property, or any materials conclusion.
