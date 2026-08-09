---
topic_slug: compositional-phase-stability-and-convex-hulls
status: reviewed
---

A compositional phase diagram asks which combination of phases minimizes the relevant thermodynamic potential at a fixed overall composition. A convex hull turns a compatible set of phase energies into that competition. It can identify candidate ground states, decomposition products, and the energy by which a represented phase lies above the lower envelope.

The answer is always conditional on the candidate set, energy model, normalization, and thermodynamic variables. A negative formation energy is only a comparison with the selected elemental references; it is not, by itself, evidence that the compound is stable against all competing phases.

## Decide whether the system is closed or open

In a closed system, the chemical components and overall composition are fixed. The equilibrium state may be a single phase or a mixture whose weighted compositions reproduce that overall composition. The minimized quantity is commonly a static 0 K energy in a basic DFT hull, or a Gibbs free energy when pressure and temperature contributions are included.

An open system exchanges one or more species with reservoirs. Its composition may change, so a grand-potential or chemical-potential construction answers a different question. A closed-composition convex hull, an open-reservoir stability region, and an experimentally prepared nominal composition should not be combined under an unqualified statement that a phase is “stable.”

## Formation energy supplies coordinates, not the verdict

For a compound containing `n_i` atoms of each element `i`, a per-atom formation energy can be written

```text
ΔE_f = [E_compound - Σ_i n_i μ_i^ref] / Σ_i n_i .
```

`E_compound` is the comparable static energy of the declared phase and state. `μ_i^ref` is the energy per atom of the chosen elemental reference. The denominator fixes the normalization, and the elemental endpoints appear at zero by convention.

A negative `ΔE_f` means that this particular elemental decomposition is energetically uphill within the model. It does not exclude decomposition into other compounds. Hull stability requires comparison with every lower-energy mixture represented in the candidate set.

## Composition lives on a simplex

Atomic fractions satisfy `x_i = n_i / Σ_j n_j` and `Σ_i x_i = 1`. A binary system has one independent composition coordinate, a ternary system lies on a triangle, and an `m`-component system occupies an `(m-1)`-dimensional simplex.

All entries must share a consistent component basis and normalization. Primitive cells, conventional cells, formula units, and atoms are interchangeable only after explicit conversion. Partial occupancy, vacancies, charged species, and molecular reservoirs require balanced components rather than informal formula matching.

## The lower convex envelope represents allowed mixtures

Let phases `j` coexist with nonnegative fractions `λ_j`. At overall composition `x`,

```text
Σ_j λ_j = 1
Σ_j λ_j x_j = x
G_mix(x) = Σ_j λ_j G_j .
```

`x_j` is the composition vector of phase `j` and `G_j` is its potential in a common normalization. Minimizing `G_mix` under mass balance produces the lower convex envelope.

A tie line has a physical meaning: Every point on it is a macroscopic mixture of its endpoints, not an interpolated homogeneous crystal structure.

## Binary tie lines and multicomponent facets use the same rule

In a binary system, hull vertices are connected by line segments. A point above a segment can lower its potential by separating into the endpoint phases with lever-rule proportions. In a ternary or higher-dimensional system, the supporting objects become facets in the full composition space.

A plotting projection is not the optimization itself. Decomposition coefficients should be obtained from the complete composition vectors and then checked by reconstructing both composition and energy.

## Energy above hull identifies the represented decomposition force

For candidate `k`,

```text
E_hull(x_k) = min_{λ_j ≥ 0} Σ_j λ_j G_j

E_above_hull,k = G_k - E_hull(x_k) .
```

A positive `E_above_hull` is the driving force toward the minimizing represented mixture. A value of zero means that the point lies on the computed envelope within the numerical and geometric tolerance. It may be a vertex, part of a degenerate facet, or numerically indistinguishable from one.

The decomposition products and coefficients are part of the result. The scalar distance alone hides the balanced reaction that defines it and whether that reaction changes when a competitor is added.

## Polymorphs compete before compositions do

Several structures, magnetic states, orderings, or calculation records can share one composition. The lowest compatible potential at that composition can participate in the lower envelope. Higher polymorphs should still be retained because they may matter for metastability, transformations, finite-temperature ordering, and provenance.

First distinguish genuine polymorphs from duplicate calculations. Then verify that their Hamiltonians, corrections, magnetic states, and thermodynamic terms are compatible. An energy ordering between incompatible records is not a valid polymorph comparison.

## Candidate completeness limits every stability claim

A computed hull is monotonic with respect to adding candidates: a newly admitted lower phase can leave the envelope unchanged or move it downward, never upward. A phase is therefore “on hull” only relative to the searched and documented candidate set. An omitted competitor can promote another phase to a false vertex and alter decomposition reactions elsewhere.

The candidate inventory should be appropriate to the question and may include known experimental phases, database records, prototypes, orderings, magnetic states, and structure-search results. Exhaustive completeness is rarely provable. Record the sources, filters, exclusions, duplicate policy, and database or retrieval version so the claim remains auditable.

## Comparable energies require one compatibility model

All phases in one hull should use a compatible exchange--correlation treatment, core or basis convention, relativistic and magnetic model, numerical quality, and energy definition. Chemistry-dependent corrections can be used only through one documented scheme applied consistently to all eligible entries.

Mixed GGA/GGA+U compatibility corrections, for example, are fitted bookkeeping rules within a specific methodology. They are not raw total energies or universal constants. Store the raw energy, each correction, the corrected energy, scheme version, and eligibility separately. Never combine corrected and uncorrected entries silently or apply the same correction twice.

## Numerical precision must resolve the envelope

SCF convergence of each record is necessary but does not establish convergence of `E_above_hull` or decomposition identity. Basis quality, k sampling, smearing, relaxation, magnetic initialization, cell choice, and method corrections can shift competitors unequally.

Rebuild the hull under defensible numerical refinements and, separately, alternative physical initial states. Near the envelope, test whether plausible energy changes alter vertices, facets, or decomposition products. If the classification changes under the relevant uncertainty, report the phase as unresolved or near-degenerate rather than converting a small nominal distance into a categorical conclusion.

The numerical series estimates fixed-state precision. Alternative initial states test candidate search and basin robustness; report their effects on hull vertices, facets, and decomposition products as a separate evidence class.

Stored database precision is also not calculation precision. An independent reconstruction may agree only to the rounding exposed by the source.

## Temperature and pressure change every phase potential

A static DFT hull is usually a 0 K electronic approximation. At finite conditions, each phase may require

```text
G_j(T,p) = E_DFT,j + F_vib,j(T) + F_el,j(T)
           + F_conf,j(T) + pV_j + G_other,j(T,p) .
```

All phases must be treated consistently. Adding vibrational free energy to one candidate while leaving its competitors at static energy does not create a finite-temperature phase diagram. Numerical smearing used for SCF convergence is not automatically a physical electronic free-energy term.

The hull must be rebuilt after these contributions are added because different phases shift by different amounts.

## Open reservoirs lead to grand potentials

If species in set `R` exchange with reservoirs, a transformed potential is

```text
Φ = G - Σ_{i in R} μ_i N_i .
```

The chemical potentials are constrained by elemental precipitation, host equilibrium, competing phases, and the chosen temperature or pressure model. Gas pressure, electrochemical voltage, and growth conditions enter only through a declared relation to those reservoir potentials.

## Chemical-potential diagrams are a dual view

In chemical-potential space, each phase contributes an affine grand-potential surface, and the lower envelope partitions the space into domains where different phases minimize the potential. This is dual to the composition-space hull, but the axes and scientific question differ.

A stability polygon in chemical-potential space must not be read as a range of bulk compositions, and a tie triangle in composition space does not specify an experimental pressure without a reservoir model.

## Metastability is not a universal distance cutoff

Many synthesized materials lie above a computed 0 K hull. Empirical datasets can characterize the energy scales at which metastable phases have been reported, but those scales depend on chemistry, synthesis route, and model uncertainty. These distributions do not provide a universal energy-above-hull threshold that separates synthesizable from impossible materials.

Kinetic barriers, surfaces, defects, epitaxy, finite-size effects, entropy, pressure history, precursors, and model error can preserve or favour an off-hull phase. Conversely, an on-hull phase may remain inaccessible because no viable formation pathway exists.

## Formation and decomposition energies answer different reactions

Formation energy references the selected elemental states. Decomposition energy references the lowest balanced mixture at the candidate composition. The latter may involve compounds, elements plus compounds, or the candidate itself when it lies on the envelope.

Always retain the balanced reaction, coefficient convention, sign, and normalization alongside the scalar energy. A quantity called “decomposition energy” is not portable without that definition.

## Diagnose geometry and data before interpreting the hull

Common failures include missing elemental endpoints, inconsistent composition reduction, duplicate phases, fractions that do not sum to one, incompatible correction schemes, mixed magnetic models, and free-energy terms applied to only part of the dataset. A visually plausible hull can survive all of these errors.

Check representative facets by reconstructing mass balance and energy. Inspect every near-hull candidate. Treat triangulation details, numerical degeneracy, and plotting projections as implementation choices rather than physical conclusions.

## A real-data rebuild remains a post-processing result

The accompanying Li--P example freezes 46 rows from the public OQMD REST API, keeps their entry and calculation identities, selects the lowest compatible record at each represented composition, adds elemental endpoints, and reconstructs the binary lower envelope.

This is a real public DFT-data case, not a claim that this project reran the underlying calculations. The locally generated plot demonstrates parsing, normalization, provenance, and hull geometry for that snapshot. It does not independently validate OQMD energies, exhaust the Li--P phase space, or establish that any phase is synthesizable.

## Preserve the phase ledger

A reusable result includes exact composition vectors, structure and state identifiers, raw energies and units, reference energies, corrections and scheme versions, finite-temperature terms, convergence evidence, inclusion and exclusion decisions, source versions, hull vertices and facets, decomposition coefficients, and residual checks.

Store the machine-readable candidate table and derived hull together with hashes. When the phase set or compatibility model changes, create a new derived result linked to the original records rather than overwriting the earlier interpretation.

## Keep adjacent stability questions separate

Equation-of-state analysis compares structural branches at fixed composition, while a compositional hull permits mixtures across compositions. Defect formation, surfaces, adsorption, and interfaces introduce reservoirs, finite-size models, or excess quantities that require their own reference constructions.

Mechanical and phonon stability test distortions of a represented phase, not competition against other compositions. Reaction pathways and dynamics address barriers and rates. None of these questions can be replaced by one static hull distance.

## What this topic establishes

This topic can support bounded claims about candidate ground states, decomposition products, and energy above hull for a declared phase set and thermodynamic model. It also explains how those claims change for open reservoirs and finite-temperature potentials.

It does not establish global structure-search completeness, mechanical or dynamical stability, kinetic persistence, finite-temperature equilibrium without the required free energies, experimental synthesis, or accuracy of the underlying electronic-structure method.

## Sources and methods

- [Wang and co-workers, first-principles Li–Fe–P–O phase diagram](https://doi.org/10.1021/cm702327g)
- [Bartel and co-workers, decomposition reactions and stability](https://doi.org/10.1038/s41524-018-0143-2)
- [Sun and co-workers, the thermodynamic scale of inorganic crystalline metastability](https://doi.org/10.1126/sciadv.1600225)
- [Jain and co-workers, compatible GGA and GGA+U formation energies](https://doi.org/10.1103/PhysRevB.84.045115)
- [Todd and co-workers, chemical-potential diagrams](https://doi.org/10.1021/jacs.1c06229)
- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project thermodynamic-stability and correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [Materials Project chemical-potential diagrams](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/chemical-potential-diagrams-cpds)
- [pymatgen phase-diagram analysis API](https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram)
- [Kirklin and co-workers, the Open Quantum Materials Database](https://doi.org/10.1007/s11837-013-0755-4)
