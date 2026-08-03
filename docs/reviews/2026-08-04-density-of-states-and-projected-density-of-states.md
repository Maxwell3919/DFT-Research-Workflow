# Scientific review — Density of States and Projected Density of States

Reviewed: 2026-08-04

Scope:

> D2 · Electronic Structure → Density of States and Projected Density of States

## Decision

The topic is **reviewed within the declared educational and execution scope**. It adds no operation taxonomy, stable-route change, or material-specific calculation claim.

The overview distinguishes the full-zone DOS integral from a band path, a stated normalization from an arbitrary plot scale, numerical broadening from a lifetime, an internal Fermi shift from cross-calculation alignment, a projector-defined PDOS from a basis-independent atomic observable, and a Kohn--Sham DOS from a measured spectral function.

## Source semantic support

- https://doi.org/10.1007/BF01341914 and https://doi.org/10.1103/PhysRev.140.A1133 support the periodic eigenvalue framework.
- https://doi.org/10.1103/PhysRevB.49.16223, https://doi.org/10.1103/PhysRevB.40.3616, and https://doi.org/10.1103/PhysRevLett.82.3296 support the tetrahedron and smearing discussion.
- https://www.quantum-espresso.org/Doc/INPUT_DOS.html and https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html support the official `dos.x` and projector implementation boundary.
- https://vasp.at/wiki/DOSCAR and https://vasp.at/wiki/LORBIT support energy-resolved/integrated DOS, spin-resolved output, and the qualitative local-projection boundary.

## Numerical and execution boundary

The companion script uses invented DOS and projection arrays. It executes no DFT code and ingests no material data. Execution success is not DOS convergence, a real electron count, projector validation, a material band gap, bonding, charge transfer, magnetic order, lifetime, or a scientific conclusion.

The media are original conceptual diagrams of invented data. No external figure was copied.

## Review conclusion

The topic is complete for its present teaching scope. It gives readers the definition, comparison conditions, and evidence boundary needed to interpret a DOS or PDOS without turning a smooth curve or coloured component into an unsupported physical claim.
