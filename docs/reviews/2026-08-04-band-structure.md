# Scientific review — Band Structure

Reviewed: 2026-08-04

Scope:

> D2 · Electronic Structure → Band Structure

## Decision

The topic is **reviewed within the declared educational and execution scope**. It adds no operation taxonomy, stable-route change, or material-specific calculation claim.

The overview defines a band diagram as state-specific eigenvalues on a declared reciprocal-space path. It distinguishes cell and reciprocal conventions, path visualization and a full-zone extremum search, Fermi shifts and cross-calculation alignment, spin/SOC/magnetic state, direct diagonalization and interpolation, branch ordering and symmetry, numerical completion and observable convergence, and an eigenvalue gap from quasiparticle, optical, transport, and experimental claims.

## Source semantic support

- https://doi.org/10.1007/BF01341914 and https://doi.org/10.1103/PhysRev.140.A1133 support Bloch labelling and the Kohn--Sham eigenvalue framework.
- https://doi.org/10.1016/j.commatsci.2010.05.010, https://doi.org/10.1016/j.commatsci.2016.01.017, and https://seekpath.readthedocs.io/en/latest/ support crystallographic path conventions and reproducible path construction, not a claim that a path contains all extrema.
- https://www.quantum-espresso.org/Doc/INPUT_BANDS.html and https://quantum-espresso.org/Doc/pp_user_guide/node8.html support the software-specific distinction between eigenvalue output, ordering, overlap, and symmetry analysis.
- https://doi.org/10.1103/PhysRevB.56.12847 and https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/notes_interpolations/ support the localized-representation and interpolation discussion.
- https://doi.org/10.1103/PhysRev.139.A796 and https://doi.org/10.1063/1.1564060 support the explicit boundary between semilocal Kohn--Sham eigenvalues, GW, and screened-hybrid calculations.

## Numerical and execution boundary

The topic gives no universal path density, k mesh, empty-band count, smearing, cutoff, force threshold, gap tolerance, or interpolation setting. The two companion scripts use invented reciprocal vectors and eigenvalue fields; they execute no DFT code and ingest no material data. They verify path metadata arithmetic and the logical distinction between path extrema and a full-grid search.

The media are original conceptual diagrams of invented data. Execution success is not eigenvalue convergence, a real band structure, a direct or indirect material gap, a symmetry representation, a carrier valley, a quasiparticle spectrum, an optical gap, a transport result, or a scientific conclusion.

## Review conclusion

The topic is complete for its present teaching scope. It provides the reader with the comparison object and evidence boundaries needed to reuse a band plot without mistaking it for a full electronic-structure conclusion.
