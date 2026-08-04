# Reviewed source links — corrective and continuing audit

## Why this audit exists

The initial reviewed-topic batches checked that cited URLs were present in rendered pages and that the sources supported the surrounding scientific statements. Browser smoke did not request the external destinations. A later manual check also found that four ASE links used a retired documentation host and returned 404.

This audit therefore keeps three questions separate:

1. **Semantic source review** — whether a source supports the statement for which it is cited.
2. **External-link reachability** — whether the cited destination responds under declared audit rules at a stated time.
3. **Rendered-link presence** — whether the public page contains the intended hyperlink.

None of these checks validates a material, model, method, numerical result, or scientific conclusion.

## Current scope

The machine-readable authority is `sources/reviewed-links.json`. The current inventory covers thirty reviewed article/review pairs:

- Obtain a Material Structure;
- Build or Modify a Computational Model;
- Choose the DFT Method and Computational Setup;
- Test Numerical Convergence;
- Optimize the Structure;
- Calculate the Reference Ground State;
- Relative Energies and Formation Energies;
- Equation of State and Structural Phase Stability;
- Compositional Phase Stability and Convex Hulls;
- Defect Formation Energies and Charge States;
- Surface Energy and Work Function;
- Adsorption Energies;
- Interface and Heterostructure Energetics;
- Band Structure.
- Density of States and Projected Density of States;
- Fermi Surface and Full-Brillouin-Zone Analysis;
- Charge Density, Difference Density, and Charge Partitioning;
- Electrostatic Potential and Band Alignment;
- Chemical Bonding Analysis;
- Magnetic Configuration and Ground-State Comparison.
- Magnetic Anisotropy and Exchange Interactions.
- Elastic Constants and Mechanical Properties.
- Dielectric Response and Born Effective Charges.
- Polarization and Ferroelectricity.
- Piezoelectric Response.

- Harmonic Phonons.
- Anharmonic Phonons.
- Lattice Thermal Transport.
- Electron--Phonon Coupling.
- Conventional Superconductivity.

The manifest declares 196 unique HTTPS destinations. Some sources legitimately support more than one topic. Each article/review pair must contain exactly its declared source set, while the network layer requests each unique URL once and records every topic that reuses it.

Any undeclared URL, missing URL, duplicate URL inside one topic, inconsistent source kind, non-HTTPS URL, unexpected unique-URL count, or retired ASE host fails deterministic validation.

## Historical ASE correction

The original corrective batch replaced four retired `wiki.fysik.dtu.dk` links in both the model-construction article and its review:

- ASE Building things → `https://docs.ase-lib.org/ase/build/build.html`;
- ASE Surfaces, vacuum, and adsorbates → `https://docs.ase-lib.org/ase/build/surface.html`;
- ASE Atoms and periodic boundary conditions → `https://docs.ase-lib.org/ase/atoms.html`;
- ASE Constraints → `https://docs.ase-lib.org/ase/constraints.html`.

The first accepted network audit covered 33 unique URLs across the first three topics. It returned 31 ordinary HTTP or DOI successes and used a controlled browser fallback for two IUCr pages that returned HTTP 403 to the ordinary client. All 33 were reachable under the declared semantics, and no 404 or soft-404 remained.

That result is historical evidence. Every expanded manifest requires a fresh network audit before its content batch can be merged. A later accepted eight-topic run covered 76/76 unique destinations; the nine-topic Compositional Phase Stability and Convex Hulls batch covered 82/82; the ten-topic Defect Formation Energies and Charge States batch covered 91/91; the eleven-topic Surface Energy and Work Function batch covered 102/102; the twelve-topic Adsorption Energies batch expands the inventory to 114 and therefore requires its own Hosted CI result.

The Adsorption Energies authoring environment completed a fresh 114/114 network audit on 2026-08-04. The later Interface and Heterostructure Energetics batch expanded the inventory to 119 and completed a fresh local 119/119 audit before its successful Hosted CI run. The Band Structure batch expanded the inventory to 128 and completed a fresh local 128/128 network audit on 2026-08-04. Density of States and Projected Density of States expanded it to 133, Fermi Surface and Full-Brillouin-Zone Analysis to 137, Charge Density, Difference Density, and Charge Partitioning to 143, Electrostatic Potential and Band Alignment to 145, Chemical Bonding Analysis to 151, and Magnetic Configuration and Ground-State Comparison to 153. Two local 153-source runs each encountered one transient `fetch failed` result on a different pre-existing Phonopy document; direct HTTPS header checks returned 200 for both affected URLs. Magnetic Anisotropy and Exchange Interactions expands the inventory to 156 and completed a fresh local 156/156 audit on 2026-08-04, including the encoded Liechtenstein DOI resolver URL and the two live VASP SOC/anisotropy documentation pages. Hosted CI remains the independent acceptance record for every merged batch. Each local observation is separate from its pull-request CI evidence.

## Semantic review boundary

All thirty article/review pairs are required to use exact bounded source inventories. The current source classes include:

- crystallographic standards, databases, and symmetry documentation;
- ASE and pymatgen implementation documentation plus primary model-construction methods;
- Quantum ESPRESSO documentation and primary DFT method papers;
- primary Brillouin-zone integration, pseudopotential verification, finite-size, reproducibility, and density-functional perturbation theory sources for numerical convergence;
- official optimization, electronic-state, thermodynamic, and phase-diagram documentation;
- primary optimization, reference-state, finite-temperature DFT, formation-energy correction, decomposition-reaction, finite-strain EOS, compression, elastic-stability, convex-hull, metastability, chemical-potential, public materials-database, charged-defect correction, transition-level, and finite-temperature defect-thermodynamics methods;
- current official defect-thermodynamics implementation documentation;
- primary surface-energy, polar-surface, dipole-correction, atomistic-thermodynamics, equilibrium-shape, work-function, and real public surface-dataset sources plus official work-function implementation documentation;
- primary adsorption-reaction, coverage, exchange–correlation uncertainty, adsorbate-entropy and correction, electrochemical-reference, basis-superposition, and reaction-path sources, plus official candidate-building documentation and the CC BY-SA 4.0 CMR benchmark database;
- primary Bloch, Kohn--Sham, standardized reciprocal-path, density-of-states, Wannier-interpolation, Luttinger-volume, GW, screened-hybrid, charge-partitioning, potential-lineup, COHP, plane-wave projection, ELF, and density-topology sources, plus official SeeK-path, Quantum ESPRESSO, VASP, Wannier90, and COHP documentation for the D2 electronic-structure topics.
- primary local-spin-density exchange theory and official noncollinear/SOC directional-energy documentation for the D2 magnetic-anisotropy and exchange topic.
- primary quantum-mechanical stress and elastic-stability methods plus official finite-difference elastic-modulus documentation for the D3 elastic-response topic.
- primary DFPT response methods and official Quantum ESPRESSO/VASP dielectric and Born-effective-charge documentation for the D3 dielectric-response topic.
- primary modern-polarization theory and official Berry-phase implementation documentation for the D3 polarization and ferroelectricity topic.
- primary DFPT strain/electric-field methods and official piezoelectric-response documentation for the D3 piezoelectric topic.

- primary harmonic lattice-dynamics and non-analytic-correction methods plus official Quantum ESPRESSO and Phonopy documentation for the D3 harmonic-phonons topic.
- primary higher-order force-constant, phonon-self-energy, and strongly anharmonic methods plus official Phono3py and Quantum ESPRESSO documentation for the D3 anharmonic-phonons topic.
- primary first-principles phonon-BTE methods plus official Phono3py and ShengBTE documentation for the D3 lattice-thermal-transport topic.
- the Giustino first-principles EPC review plus official Quantum ESPRESSO and EPW documentation for the D3 electron-phonon-coupling topic.
- the McMillan and Allen--Dynes transition-temperature methods plus official Quantum ESPRESSO and EPW documentation for the D3 conventional-superconductivity topic.

A source reused by two topics is not duplicated into two network requests. Reuse does not broaden the source beyond the statements reviewed in each topic.

## Deterministic manifest mode

`scripts/audit-reviewed-links.mjs --manifest-only` runs without network access and verifies:

- exact agreement between every reviewed article, its review, and its topic source set;
- the manifest-declared unique URL count;
- valid `page` and `doi` source kinds;
- consistent kinds when a URL supports multiple topics;
- HTTPS-only sources;
- absence of the retired ASE documentation host;
- presence of this audit record.

This mode is part of the ordinary repository check.

## Network audit mode

The dedicated CI job requests every unique destination and stores a JSON evidence artifact.

- A normal documentation page must return HTTP 2xx after redirects and must not expose a 404/not-found title or first-level heading.
- A page that returns HTTP 401 or 403 to the ordinary client is retried once in controlled headless Chrome. The access method and result are recorded.
- A DOI is checked at `doi.org`. HTTP 2xx or a valid publisher redirect is accepted. This establishes resolver recognition, not publisher access after the redirect.
- Transient network failures and selected 429/5xx responses receive bounded retries.
- Any remaining failed destination fails the job.

The report stores the topic slugs associated with every unique source, so cross-topic reuse remains auditable without repeated network requests.

## Evidence boundary

The network job is independent of the static build. A source outage cannot be disguised as successful page rendering, and an external outage is not misreported as an Astro build failure.

External reachability is time-bound. A passing run does not guarantee future availability, regional access, publisher access, semantic correctness, or scientific validity. A failing future run requires link review; it does not automatically invalidate every scientific statement previously supported by that source.
