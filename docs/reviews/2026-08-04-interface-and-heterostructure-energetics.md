# Scientific review — Interface and Heterostructure Energetics

Reviewed: 2026-08-04

Scope:

> D1 · Energetics and Stability → Interface and Heterostructure Energetics

## Decision

The topic is **reviewed within the declared educational and execution scope**. It changes neither the A–E/D1–D5 registry nor stable public routes.

The article distinguishes the state identity of a coherent contact from bulk constituents; reservoir-dependent interface excess from constrained binding and work of separation; interfacial area scaling from coherent strain stored through finite thickness; structural terminations and lateral registries; periodic-superlattice from vacuum-slab boundary conditions; SCF completion from convergence of the requested interface observable; and energetic comparisons from kinetics, fracture, transport, and experimental claims.

## Source semantic support

- https://doi.org/10.1063/1.333084 supports systematic lattice-match candidate generation, not a claim that a retained cell is a stable interface.
- https://doi.org/10.1038/s41524-019-0160-9 supports interface excess-energy definitions, chemical-potential dependence, and the area-versus-volume strain distinction.
- https://pymatgen.org/pymatgen.analysis.interfaces.html supports software terminology and coherent-interface construction only.
- https://doi.org/10.1039/D4DD00031E supports contemporary interface workflow context without making its numerical settings a universal prescription.
- https://doi.org/10.1103/PhysRevB.91.165413 and https://arxiv.org/abs/1504.06192 support the Al/TiN Table 2 numerical snapshot, definitions, and the authors' reported contact-separation outcomes.
- https://doi.org/10.1103/PhysRevB.68.125403, https://doi.org/10.1038/s41467-024-45003-w, https://www.2dhub.org/bidb/bidb.html, and https://doi.org/10.1038/s41699-021-00200-9 provide independent interface and layered-heterostructure context.

Every source has a named role; URL reachability is a separate time-bound audit and does not establish numerical accuracy or a new material result.

## Numerical and scientific boundary review

The article supplies no universal cutoff, k mesh, vacuum, supercell, strain tolerance, force threshold, SCF threshold, smearing, Hubbard parameter, or dispersion prescription. The two ledger and lattice-match scripts use invented teaching values. They execute no DFT code and make no material claim.

The Al/TiN script reads only the committed seven-row published table snapshot. It asserts the DOI, units, selected values, transfer labels, and deterministic rendering. The original SVG is a derived-public-data redraw, not a copied paper figure. The repository does not claim to have rerun the underlying calculations.

Execution success is not interface-energy convergence, a stable atomic contact, a global registry minimum, a cleavage barrier, a fracture prediction, a finite-temperature morphology, experimental transfer, band alignment, transport, or device performance.

## Review conclusion

The main page is necessary and complete for its scope: it gives the reader a state-specific energy ledger and enough boundaries to decide what evidence is required before reuse. The three subordinate guides keep arithmetic, candidate enumeration, and a real published case separate from software-neutral science.
