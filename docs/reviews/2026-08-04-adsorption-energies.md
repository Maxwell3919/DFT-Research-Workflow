# Scientific review — Adsorption Energies

Reviewed: 2026-08-04

Scope:

> D1 · Energetics and Stability → Adsorption Energies

Files reviewed:

- `src/content/topics/adsorption-energies.md`
- `src/content/practical-guides/build-adsorption-energy-ledger.md`
- `src/content/practical-guides/compare-adsorption-sites-and-coverage.md`
- `src/content/practical-guides/replot-cmr-co-adsorption.md`
- three companion scripts, three original SVG renderings, and one frozen CMR JSON subset

## Decision

The topic is **reviewed within the declared educational and execution scope**. It changes neither the A–E/D1–D5 registry nor stable public routes and does not promote the retired numbered operation taxonomy.

The main narrative defines adsorption as a reaction-conditioned, state-conditioned energy difference. It covers molecular and dissociative ledgers, sign and normalization, average versus differential adsorption, interaction and deformation components, clean-slab compatibility, candidate sites and final-state relabelling, coverage and finite-cell separation, relaxation, molecular references, localized-basis superposition error, slab electrostatics, method dependence, observable convergence, thermal and reservoir terms, electrochemical ensembles, environment, failure modes, provenance, and kinetics-versus-thermodynamics boundaries.

## Source semantic support

- https://doi.org/10.1021/acs.jpcc.7b12258 and https://cmr.fysik.dtu.dk/adsorption/adsorption.html support the benchmark reaction definitions, coverage scope, calculation construction, method comparisons, and public data interpretation.
- https://wiki.fysik.dtu.dk/cmr-files/adsorption.db is the exact binary database acquired for the four-row extraction. The acquired object was 3,719,168 bytes with SHA-256 `2ea151bbf599868fb48d615b784f8bf9c82cac94f51baf85697e1c28e025e9bf`.
- https://cmr.fysik.dtu.dk/index.html declares CMR databases under CC BY-SA 4.0 and supports the snapshot and original-redraw reuse basis.
- https://doi.org/10.1103/PhysRevB.85.235149 supports exchange–correlation transferability and the bounded meaning of a BEEF-vdW ensemble estimate.
- https://doi.org/10.1103/PhysRevB.46.16067 supports adsorbate–substrate, adsorbate–adsorbate, coverage, and asymmetric-slab dipole considerations.
- https://doi.org/10.1021/ja3080117 supports the importance of adsorbed-molecule entropy; https://doi.org/10.1021/ja407293b is retained because the original paper has a published correction.
- https://doi.org/10.1021/jp047349j supports the computational hydrogen electrode transformation and does not support treating a neutral vacuum slab as a complete electrochemical interface.
- https://doi.org/10.1103/PhysRevB.65.035406 supports chemical-potential-dependent surface composition and atomistic thermodynamics.
- https://doi.org/10.1080/00268977000101561 supports the counterpoise construction for finite atom-centred basis sets.
- https://doi.org/10.1063/1.1329672 supports the separation between endpoint adsorption energetics and a minimum-energy path or barrier.
- https://docs.ase-lib.org/ase/build/surface.html and https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder support structure and candidate-site construction only; the article does not use them as evidence of a stable site.

Every link was selected for a stated semantic role. URL reachability remains a separate time-bound audit and does not establish scientific correctness or reuse rights beyond the explicit CMR licence record.

## Numerical and scientific boundary review

The article gives no universal cutoff, k mesh, slab thickness, vacuum, lateral cell, coverage, smearing, force threshold, SCF threshold, adsorption height, solvation correction, Hubbard parameter, or convergence tolerance. All numerical values outside the cited CMR subset are labelled invented fixtures.

The central distinctions are explicit:

- raw total energy versus a balanced adsorption reaction;
- negative adsorption energy versus experimental realizability;
- average versus differential adsorption energy;
- adsorption versus frozen-fragment interaction and deformation energies;
- starting site label versus final relaxed state;
- physical coverage dependence versus periodic-cell sensitivity;
- SCF completion versus adsorption-observable convergence;
- static electronic energy versus adsorption free energy;
- neutral fixed-electron slab versus electrochemical constant-potential state;
- endpoint thermodynamics versus barriers, rates, and catalytic activity.

The CMR subset is bounded to four exact rows of a published full-coverage, top-site fcc(111) benchmark. The repository does not claim to have rerun the underlying CMR calculations. The plot must not be used as a low-coverage benchmark, experimental surface assignment, catalyst ranking, or universal functional assessment.

## Execution and media review

The first two scripts execute no DFT code and ingest no material data. They verify deterministic ledger arithmetic, normalization, average-versus-differential energies, explicit free-energy summation, matched-state grouping, final-site relabelling, and finite-cell comparison using invented values.

The third script reads only the committed four-row JSON snapshot. It asserts the source DOI, CC BY-SA 4.0 label, source-database hash, row IDs, metal order, exact selected PBE values, sign pattern, method spreads, and deterministic rendering. The repository does not claim to have rerun the underlying CMR calculations.

The first two media assets are conceptual plots of invented data. The third is an original plot of real public calculation data, not a copied source figure. Its footer, caption, alt text, snapshot, source URL, database hash, access date, DOI, licence, and no-rerun boundary remain visible or machine traceable.

Execution success is not adsorption-energy convergence for a real calculation. It does not establish a real adsorption configuration, global site minimum, coverage, finite-cell limit, free energy, equilibrium population, kinetic barrier, operando surface, experimental realizability, catalytic performance, or method accuracy.

## Review conclusion

The topic is necessary but complete for its present scope: readers can identify the scientific question, input states, changed quantities, output meaning, comparison conditions, numerical and physical error sources, evidence needed for reuse, and unsupported conclusions. Practical material is subordinate to the scientific page, software use is bounded to construction or post-processing, and the real-data figure adds traceability without impersonating a new calculation.
