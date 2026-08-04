# Scientific review — Fermi Surface and Full-Brillouin-Zone Analysis

Reviewed: 2026-08-05

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

The practical page now leads with a bounded real execution: Quantum ESPRESSO 7.5 `pw.x` SCF, `nscf`, and `bands` runs for an explicit one-atom fcc Al cell. The stored ledger has 512 full-zone points and 145 direct path points, with the emitted `7.8018 eV` Fermi reference and source-output hashes. The original two-dimensional fixture remains only as an auxiliary geometric warning. Execution success is not Fermi-surface convergence, a material pocket, carrier density, velocity, interpolation validation, transport result, instability, or scientific conclusion.

The companion script uses an invented two-dimensional reciprocal-space energy field. It is retained only for the auxiliary geometric warning; the primary Al ledger is parsed from actual QE output.

The primary media are original plots reconstructed from the actual QE scalar outputs; the auxiliary media are original conceptual diagrams of invented data. No external figure was copied.

The media are original conceptual diagrams of invented data. That statement applies only to the retained auxiliary fixture; the primary Al figure is a new plot from the stored QE-derived rows.

## Review conclusion

The topic is complete for its present bounded teaching scope. It provides a real mesh/path comparison and the evidence boundary necessary to interpret a sampled equal-energy rendering without confusing it with DOS, band-path, carrier-count, transport, or converged material evidence.
