# Model-building practical-guide pilot — content, execution, and media review

## Scope

This review covers four subordinate pages under:

> A · Structures → Build or Modify a Computational Model

The reviewed pages are:

- Build and Repeat Cells with ASE;
- Construct Surfaces, Vacuum, and Adsorbates with ASE;
- Apply Structure Transformations with pymatgen;
- Build a Two-Dimensional Monolayer Model.

They are implementation and worked-example views of one existing researcher-scale topic. They are not additional DFT operations and do not change the A–E topic registry.

The decision is **reviewed within the declared educational and execution scope**.

## Software versions and official sources

The execution environment is pinned to:

- ASE 3.29.0;
- `pymatgen-core` 2026.7.31;
- Python 3.12.

ASE documentation supports the `Atoms` object, integer repetition, general supercell construction, surface builders, adsorbate placement, vacuum centering, and the `mx2` builder used by the pages. The ASE PyPI release page supports the exact installed distribution version.

pymatgen documentation supports core `Structure` objects and the standard transformation classes used for supercells, deformation, and species replacement. The `pymatgen-core` PyPI release page supports the exact installed distribution version.

All implementation sources are declared in `sources/practical-guide-links.json`. Source relevance, current link reachability, rendered-link presence, and software execution are checked separately.

## Executable evidence

Each page identifies one companion script:

- `examples/practical-guides/ase_repeat_cells.py`;
- `examples/practical-guides/ase_surface_vacuum_adsorbates.py`;
- `examples/practical-guides/pymatgen_structure_transformations.py`;
- `examples/practical-guides/ase_monolayer_model.py`.

`examples/practical-guides/validate_pilot.py` checks the exact installed package versions, loads all four scripts, executes their `run()` functions, and writes a machine-readable report when an artifact directory is supplied.

The assertions cover only the statements made by the pages:

- atom-count and determinant multipliers for cell repetition;
- preservation or declaration of periodic-boundary flags;
- slab and adsorbate atom counts;
- adsorbate placement above the substrate candidate;
- actual cell and empty-region geometry;
- supercell and deformation volume ratios;
- species substitution and preservation of the parent object;
- composition, periodicity, atomic extent, and cell geometry of the generated monolayer.

The scripts calculate no electronic energy and call no electronic-structure engine.

## Scientific boundaries

The pages correctly preserve these distinctions:

- an unchanged integer repeat may be an equivalent representation of an ideal periodic crystal;
- a defect, ordering, strain, composition change, interface, surface, or constrained geometry changes the physical model;
- a generated surface or adsorbate position is a candidate, not a stable configuration;
- vacuum is part of the boundary model and is not automatically converged;
- a builder argument does not establish an experimental value or a DFT-relaxed value;
- a species replacement does not by itself define a dilute dopant calculation;
- a generated monolayer is not experimental provenance;
- successful structure generation does not establish energetic, dynamic, thermal, or mechanical stability;
- execution success is not numerical convergence;
- one converged example would not establish transferability to another material or method.

The numerical values used by the examples are explicitly demonstration values. The pages do not recommend a universal lattice parameter, strain, slab thickness, vacuum size, adsorption height, supercell, or coverage.

## Media review

The four displayed SVGs are original project diagrams. They were created for this repository and do not reproduce official manuals, publisher figures, GUI assets, or licensed software content.

Every asset is declared in `workflow/practical-guide-media.json` with:

- a stable media identifier;
- the guide it belongs to;
- repository path;
- original-media provenance;
- creation date;
- reuse basis;
- caption;
- alt text.

The media illustrate cell repetition, slab/vacuum identity, transformation lineage, and two-dimensional periodicity. They do not depict calculated results.

## Interface review

The parent topic exposes restrained static groups for Practical Guides and Worked Examples. The subordinate pages use ordinary static routes, breadcrumbs, copyable code and paths, text metadata, and original diagrams. No client-side JavaScript is required.

The interface avoids:

- software popularity rankings;
- progress dashboards;
- a fixed Inputs/Outputs article contract;
- hidden tab content;
- screenshots as the only instruction;
- code rendered only as images.

Responsive and no-JavaScript behaviour require browser validation before merge.

## Deliberate exclusions

This pilot does not include:

- a public `/tools/` directory;
- a complete software registry;
- screenshots from official manuals;
- database downloads or experimental structures;
- production DFT inputs;
- relaxation or molecular dynamics;
- energies, forces, stresses, bands, phonons, or response properties;
- parameter convergence;
- stability, synthesizability, or ground-state claims;
- validation of the demonstration lattice, strain, vacuum, adsorption height, or monolayer geometry.

## Evidence boundary

Semantic source review establishes that the pages describe the cited APIs within the declared scope. External-link auditing establishes time-bounded reachability. Browser smoke establishes rendered routes, links, media, responsiveness, and no-JavaScript reading. Python execution establishes the declared structural transformations under the pinned package versions.

None of those checks establishes numerical convergence, a production computational model, a validated DFT setup, or a scientific conclusion.
