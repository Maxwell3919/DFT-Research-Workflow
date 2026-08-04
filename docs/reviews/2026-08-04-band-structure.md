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

The topic gives no universal path density, k mesh, empty-band count, smearing, cutoff, force threshold, gap tolerance, or interpolation setting. `build-reciprocal-path-ledger` is a bounded real Silicon execution: COD 9013102 → spglib/SeeK-path → QE 7.5 SCF and band path → `bands.x` output → hash-bound local redraw. `compare-band-path-and-full-zone-extrema` now adds a separate real QE 7.5 SCF → `bands` → `bands.x` 8×8×8 teaching mesh with `nosym=.true.` and 260 time-reversal-equivalent k points. Its 0.617 eV sampled separation differs from the 0.574 eV path sample; that difference demonstrates that two limited samplings cannot be silently equated, rather than supplying a fundamental gap.

The Silicon band and path/mesh SVGs are original redraws from committed real-output ledgers; the retained conceptual media are invented explanatory diagrams. The bounded Silicon execution is not numerical convergence, a direct or indirect material gap, a symmetry representation, a carrier valley, a quasiparticle spectrum, an optical gap, a transport result, or a scientific conclusion.

## Review conclusion

The topic is complete for its present teaching scope. It provides the reader with the comparison object and evidence boundaries needed to reuse a band plot without mistaking it for a full electronic-structure conclusion.
