# Aluminium metallic electronic structure (QE 7.5)

This terminal-first case preserves one continuous fcc-Al teaching workflow:
metallic SCF, a uniform full-zone NSCF calculation, and an explicit band path.
It records the exact inputs, full stdout, separate stderr, input/output hashes,
and a compact human-readable excerpt.  The inputs use
`occupations='smearing'`, Marzari-Vanderbilt smearing (`degauss=0.02 Ry`), and
an 8x8x8 mesh; those are settings from this run, not universal or converged
recommendations.

Run `python3 parse.py`, `bash extract.sh`, and `bash check.sh` to reproduce the
case-local checks and the PNG from the captured output/fixture tables.
`run.sh` prints the recorded stage commands but deliberately refuses to submit
another QE calculation.  A new run needs separate authorization, a fresh
observable tolerance, isolated runtime paths, and a new evidence directory.

G1 and G2 cover only this captured QE execution and its SCF electronic
threshold.  G3 confirms the captured stage artifacts.  There is no k-mesh,
smearing, cutoff, empty-band, or DOS-broadening series, so G4 remains `NOT
TESTED`; the case makes no G5 material conclusion.  It does not establish a
converged DOS/Fermi surface, EOS, elastic property, carrier density, transport
property, or any materials conclusion.
