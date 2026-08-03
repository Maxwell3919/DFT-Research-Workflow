# Scientific review — Fermi Surface and Full-Brillouin-Zone Analysis

Reviewed: 2026-08-04

Scope:

> D2 · Electronic Structure → Fermi Surface and Full-Brillouin-Zone Analysis

## Decision

The topic is **reviewed within the declared educational and execution scope**. It adds no operation taxonomy, stable-route change, or material-specific calculation claim.

The overview separates a full-zone equal-energy set from a path crossing or DOS, code-reported Fermi energy from cross-calculation alignment, interpolation density from interpolation validity, sheet geometry from carrier or transport claims, and a Kohn--Sham isosurface from an experimental Fermi surface.

## Source semantic support

- https://doi.org/10.1007/BF01341914 and https://doi.org/10.1103/PhysRev.140.A1133 support periodic eigenvalue labelling.
- https://doi.org/10.1103/PhysRev.119.1153 supports the qualified Luttinger discussion; it is not used to equate a Kohn--Sham rendering with a measured carrier density.
- https://doi.org/10.1103/PhysRevB.56.12847 and https://doi.org/10.1103/PhysRevB.75.195121 support the Wannier/interpolation discussion.
- https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/, https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/, and https://quantum-espresso.org/Doc/pp_user_guide/node8.html support the implementation-specific full-grid/post-processing boundary.

## Numerical and execution boundary

The companion script uses an invented two-dimensional reciprocal-space energy field. It executes no DFT code and ingests no material data. Execution success is not Fermi-surface convergence, a material pocket, carrier density, velocity, interpolation validation, transport result, instability, or scientific conclusion.

The media are original conceptual diagrams of invented data. No external figure was copied.

## Review conclusion

The topic is complete for its present teaching scope. It provides the geometry, comparison conditions, and evidence boundary necessary to interpret a full-zone equal-energy rendering without confusing it with DOS, band-path, carrier-count, or transport evidence.
