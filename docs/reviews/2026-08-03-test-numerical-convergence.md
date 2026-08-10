# Test Numerical Convergence — scientific, execution, and media review

## Scope

This review covers the researcher-scale topic:

> B · Calculation Preparation → Test Numerical Convergence

It also covers four subordinate implementation guides:

- Converge Basis Cutoffs and Real-Space Grids;
- Converge k-Point Sampling and Smearing;
- Converge Finite Size, Vacuum, and Image Interactions;
- Converge q-Meshes, Response Grids, and Interpolation.

The decision is **reviewed within the declared educational and execution scope**.

The public topic consolidates the useful scientific meaning of former migration sources O09 and O20. It does not restore them as parallel reader-facing operations and does not expose the old numbered taxonomy.

## Scientific framing

The overview correctly separates:

1. program completion;
2. internal solver convergence;
3. stability of a named observable against external numerical controls;
4. robustness to model or method choices;
5. support for a scientific claim.

Only the third item is numerical convergence. The article does not use program exit, an SCF threshold, one final-point difference, or a recommended parameter as a substitute for observable-specific evidence.

The reviewed article also preserves these boundaries:

- convergence is defined for a named observable and intended comparison;
- the B-stage result is a shared baseline, not convergence evidence for every
  D-stage observable;
- material geometry and numerical controls form a feedback loop when relaxation
  moves outside the tested family;
- tolerances are stated in the units and scale of the decision;
- state identity must remain comparable across a sweep;
- basis and real-space grids can be coupled;
- k-point sampling and smearing can be coupled;
- absolute quantities, differences, forces, stresses, and response properties may converge differently;
- vacuum alone does not remove every periodic-image interaction;
- response-solver convergence, coarse q-grid convergence, interpolation validation, and final integration-grid convergence are separate questions;
- convergence can be non-monotonic, anisotropic, or interrupted by state switching;
- convergence evidence has a bounded reuse domain;
- numerical convergence does not establish method accuracy, physical-model adequacy, ground-state identity, stability, or claim support.

The article gives no universal cutoff, basis size, charge-density ratio, FFT grid, k-point density, smearing width, vacuum, supercell, q mesh, solver threshold, or stopping tolerance.

## Sources

The source set was checked for relevance to the claims made:

- Quantum ESPRESSO 7.5 `pw.x` documentation supports the distinction between electronic, ionic-energy, force, basis, grid, occupation, smearing, and k-point controls;
- Quantum ESPRESSO 7.5 `ph.x` documentation supports separate q meshes, electronic k meshes, response thresholds, and electron–phonon sampling controls;
- Monkhorst and Pack support systematic special-point Brillouin-zone grids;
- Methfessel and Paxton support one high-precision metallic integration method;
- Blöchl, Jepsen, and Andersen support the improved tetrahedron method and its distinct integration properties;
- Lejaeghere et al. support the distinction between code-to-code precision and broader accuracy questions;
- Prandini et al. and the SSSP archive support multi-observable pseudopotential verification and plane-wave convergence testing;
- PseudoDojo supports defined pseudopotential training and grading rather than universal transferability;
- Ismail-Beigi supports direct treatment of periodic image interactions in confined systems;
- Freysoldt et al. support finite-supercell and correction issues for point defects;
- the 2022 finite-size study supports the warning that naive empirical extrapolation may fail;
- Baroni et al. support the layered structure of density-functional perturbation theory calculations;
- Giustino supports the multiple sampling and interpolation layers in electron–phonon calculations.

Every source appears in the appropriate article or guide and in the corresponding source manifest. Semantic source support, DOI or page reachability, rendered-link presence, and software execution remain independent checks.

## Exact overview source record

The reviewed overview and this review use the same bounded source set:

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO 7.5 `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Monkhorst and Pack](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen](https://doi.org/10.1103/PhysRevB.49.16223)
- [Lejaeghere et al.](https://doi.org/10.1126/science.aad3000)
- [Prandini et al.](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP archive](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Ismail-Beigi](https://doi.org/10.1103/PhysRevB.73.233103)
- [Freysoldt et al.](https://doi.org/10.1103/RevModPhys.86.253)
- [Baroni et al.](https://doi.org/10.1103/RevModPhys.73.515)

## Executable evidence

Current declared companion bindings are:

- `examples/practical-guides/silicon_qe_convergence.py` for the basis/grid and
  k-point/smearing guides;
- `examples/practical-guides/convergence_finite_size.py` for finite size;
- `examples/practical-guides/convergence_response_grids.py` for response grids.

The earlier basis/grid and k-point/smearing synthetic claim-checkers remain
conceptual teaching support; they are not the declared execution scripts for
those two pages. The retained synthetic companions check bounded table logic.
The scripts calculate no electronic energy and call no electronic-structure
engine.

`silicon_qe_convergence.py` does not execute QE or inspect inputs. It verifies
nine expected output hashes, requires literal electronic-convergence and
`JOB DONE` markers, parses final total energies, derives cutoff/mesh labels from
filenames, and reports differences to one stored row.

Execution success is not numerical convergence. None of those checks establishes
numerical convergence for a real calculation, a transferable parameter set, a
valid residual-error law, or a scientific conclusion.

## Media review

The four displayed convergence diagrams are original project SVGs. They illustrate:

- a coupled basis/grid surface;
- a k-point/smearing matrix;
- independent finite-size asymptotes and a false plateau;
- the reference-state, response, interpolation, and final-integration chain.

They are conceptual diagrams, not plots of calculated data. Every asset is declared in `workflow/practical-guide-media.json` with a stable ID, guide binding, repository path, creation date, original-media reuse basis, caption, and alt text. No publisher figure, manual screenshot, GUI asset, or unpublished calculation plot is copied.

### Silicon execution addendum (2026-08-04)

Two guides bind stored outputs recorded as QE 7.5 data in
`examples/practical-guides/data/silicon-qe/convergence/`: nine fixed-cell SCF
runs of CC0 COD 9013102 Silicon over 30/40/50 Ry and 6³/8³/10³ meshes. The
standard-library reconstruction verifies all output SHA-256 values plus the
electronic-convergence and `JOB DONE` markers and regenerates two original SVGs.
The calculation has fixed occupations, so it is not a smearing study. It reports
only total-energy differences to one stored comparison row; it does not establish
force, stress, band, DOS, response, transferable-cutoff, or material convergence.

## Interface review

The stable parent route remains `/operations/test-numerical-convergence/`. The four guides are ordinary static child routes under `/guides/`. The parent should expose four restrained cards without changing `workflow/topics.json` or the A–E topic count.

All code and illustrative output remain selectable text. The pages require no client-side JavaScript and must pass desktop, 390 px, and no-JavaScript browser checks before merge.

## Deliberate exclusions

This review does not treat the bounded Silicon output matrix as a production
convergence dataset. It includes no force, stress, band, phonon, EPC, or transport
result; no pseudopotential payload or licensed asset; no scheduler protocol; no
transferable convergence prescription; and no validation of a physical model or
scientific claim.

## Evidence boundary

Repository validation can establish source coverage, route generation, media provenance, analysis-script execution, and rendered behaviour. External audits can establish time-bounded reachability. Browser smoke can establish that the reviewed overview and child pages are publicly readable and responsive.

None of those checks establishes numerical convergence, physical robustness, method accuracy, transferability, or scientific support for any real DFT study.

## Operation-depth addendum (2026-08-11)

The cutoff and k-point guides now put a transparent manual route before optional
helpers: a working directory, complete QE templates, deterministic input
generation, local execution, site-placeholder Slurm arrays, fail-first output
inspection, CSV extraction, plotting, and a declared decision rule. These are
documented procedures; no new QE calculation is claimed.

The stored Silicon evidence still contains only the existing nine fixed-
occupation SCF outputs. Its charge-density cutoff remains paired at eight times
the wavefunction cutoff, so it does not independently converge `ecutrho`. The
stored Aluminium screen contains five cross-shaped k-mesh/smearing samples and
its predeclared exploratory assessment is `FAIL`; it is not a completed
two-dimensional metallic convergence matrix. These limits remain visible in
the guides and cannot be upgraded by build, parser, or browser success.
