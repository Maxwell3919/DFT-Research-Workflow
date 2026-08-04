---
topic_slug: compositional-phase-stability-and-convex-hulls
status: reviewed
---

A compositional phase diagram asks which combination of phases minimizes the relevant thermodynamic potential at a fixed overall composition. A convex hull turns a compatible set of phase energies into that competition. It can identify candidate ground states, decomposition products, and the energy by which a represented phase lies above the lower envelope.

The answer is always conditional on the candidate set, energy model, normalization, and thermodynamic variables. A negative formation energy is only a comparison with the selected elemental references; it is not, by itself, evidence that the compound is stable against all competing phases.

## Decide whether the system is closed or open

In a closed system, the chemical components and overall composition are fixed. The equilibrium state may be a single phase or a mixture whose weighted compositions reproduce that overall composition. The minimized quantity is commonly a static 0 K energy in a basic DFT hull, or a Gibbs free energy when pressure and temperature contributions are included.

An open system exchanges one or more species with reservoirs. Its composition may change, so a grand-potential or chemical-potential construction answers a different question. A closed-composition convex hull, an open-reservoir stability region, and an experimentally prepared nominal composition should not be combined under an unqualified statement that a phase is “stable.”

## Formation energy supplies the common coordinates

For a compound containing `n_i` atoms of each element `i`, a per-atom formation energy can be written

```text
ΔE_f = [E_compound - Σ_i n_i μ_i^ref] / Σ_i n_i .
```

`E_compound` is the comparable static energy of the declared phase and state. `μ_i^ref` is the energy per atom of the chosen elemental reference. The denominator fixes the normalization, and the elemental endpoints appear at zero by convention.

A negative `ΔE_f` means that decomposition into those elemental references is uphill within the model. It does not exclude decomposition into other compounds. Hull stability requires comparison with every lower-energy mixture represented in the candidate set.

All entries must share a consistent component basis and normalization. Primitive cells, conventional cells, formula units, and atoms are interchangeable only after explicit conversion. Partial occupancy, vacancies, charged species, and molecular reservoirs require balanced components rather than informal formula matching.

## The lower envelope represents phase mixtures

Let phases `j` coexist with nonnegative fractions `λ_j`. At overall composition `x`,

```text
Σ_j λ_j = 1
Σ_j λ_j x_j = x
G_mix(x) = Σ_j λ_j G_j .
```

`x_j` is the composition vector of phase `j` and `G_j` is its potential in a common normalization. Minimizing `G_mix` under mass balance produces the lower convex envelope.

A tie line in a binary system or a facet in a multicomponent system represents a macroscopic phase mixture. It is not an interpolation between homogeneous crystal structures. Decomposition coefficients must reconstruct both the target composition and the mixture energy within a stated tolerance.

For candidate `k`,

```text
E_hull(x_k) = min_{λ_j ≥ 0} Σ_j λ_j G_j

E_above_hull,k = G_k - E_hull(x_k) .
```

A positive `E_above_hull` is the driving force toward the minimizing represented mixture. A value of zero means that the point lies on the computed envelope within the numerical and geometric tolerance. The decomposition products and coefficients are part of the result; the scalar distance alone hides the reaction that defines it.

## Polymorphs compete before compositions do

Several structures, magnetic states, orderings, or calculation records can share one composition. The lowest compatible potential at that composition can participate in the lower envelope. Higher polymorphs should still be retained because they may matter for metastability, transformations, finite-temperature ordering, and provenance.

First distinguish genuine polymorphs from duplicate calculations. Then verify that their Hamiltonians, corrections, magnetic states, and thermodynamic terms are compatible. An energy ordering between incompatible records is not a valid polymorph comparison.

## Candidate completeness limits every stability claim

Adding a new candidate can leave the lower envelope unchanged or move it downward; it cannot move it upward. A phase is therefore “on hull” only relative to the searched and documented candidate set. An omitted competitor can promote another phase to a false vertex and alter decomposition reactions elsewhere.

The candidate inventory should be appropriate to the question and may include known experimental phases, database records, prototypes, orderings, magnetic states, and structure-search results. Exhaustive completeness is rarely provable. Record the sources, filters, exclusions, duplicate policy, and database or retrieval version so the claim remains auditable.

## Comparable energies require one compatibility model

All phases in one hull should use a compatible exchange--correlation treatment, core or basis convention, relativistic and magnetic model, numerical quality, and energy definition. Chemistry-dependent corrections can be used only through one documented scheme applied consistently to all eligible entries.

Mixed GGA/GGA+U compatibility corrections, for example, are fitted bookkeeping rules within a specific methodology. They are not raw total energies or universal constants. Store the raw energy, each correction, the corrected energy, scheme version, and eligibility separately. Never combine corrected and uncorrected entries silently or apply the same correction twice.

## Converge the envelope, not only the individual calculations

SCF convergence of every phase is necessary but does not establish convergence of `E_above_hull`, hull membership, or the decomposition reaction. Basis quality, k sampling, smearing, relaxation, magnetic initialization, cell choice, and method corrections can shift competitors unequally.

Rebuild the hull under defensible numerical refinements and alternative physical initial states. Near the envelope, test whether plausible energy changes alter vertices, facets, or decomposition products. If the classification changes under the relevant uncertainty, report the phase as unresolved or near-degenerate rather than converting a small nominal distance into a categorical conclusion.

Stored database precision is also not calculation precision. An independent reconstruction may agree only to the rounding exposed by the source.

## Temperature, pressure, and reservoirs change the potential

A static DFT hull is usually a 0 K electronic approximation. At finite conditions, each phase may require

```text
G_j(T,p) = E_DFT,j + F_vib,j(T) + F_el,j(T)
           + F_conf,j(T) + pV_j + G_other,j(T,p) .
```

All phases must be treated consistently. Adding vibrational free energy to one candidate while leaving its competitors at static energy does not create a finite-temperature phase diagram. Numerical smearing used for SCF convergence is not automatically a physical electronic free-energy term.

If species in set `R` exchange with reservoirs, a transformed potential is

```text
Φ = G - Σ_{i in R} μ_i N_i .
```

The chemical potentials are constrained by elemental precipitation, host equilibrium, competing phases, and the chosen temperature or pressure model. A chemical-potential diagram is a dual description of stability under fixed reservoirs; it is not a plot of allowed bulk compositions.

## Metastability and synthesis require separate evidence

A phase above a static hull has a thermodynamic driving force toward a represented decomposition, but that number is not a universal synthesizability threshold. Kinetic barriers, surfaces, defects, epitaxy, finite-size effects, entropy, pressure history, precursors, and model error can preserve or favour an off-hull phase. Conversely, an on-hull phase may remain inaccessible because no viable formation pathway exists.

Formation energy and decomposition energy also describe different reactions. The first references elemental states. The second references the lowest balanced mixture at the candidate composition. Always retain the balanced decomposition reaction, coefficient convention, sign, and normalization alongside the energy.

## Diagnose geometry and data before interpreting the hull

Common failures include missing elemental endpoints, inconsistent composition reduction, duplicate phases, fractions that do not sum to one, incompatible correction schemes, mixed magnetic models, and free-energy terms applied to only part of the dataset. A visually plausible hull can survive all of these errors.

Check representative facets by reconstructing mass balance and energy. Inspect every near-hull candidate. Treat triangulation details, numerical degeneracy, and plotting projections as implementation choices rather than physical conclusions.

## A public-data rebuild remains a post-processing result

The accompanying Li--P example freezes 46 rows from the public OQMD REST API, keeps their entry and calculation identities, selects the lowest compatible record at each represented composition, adds elemental endpoints, and reconstructs the binary lower envelope.

The locally generated plot demonstrates parsing, normalization, provenance, and hull geometry for that snapshot. It does not mean this project reran the underlying DFT calculations, independently validated OQMD energies, exhausted the Li--P phase space, or established that any phase is synthesizable.

## Preserve the phase ledger

A reusable result includes exact composition vectors, structure and state identifiers, raw energies and units, reference energies, corrections and scheme versions, finite-temperature terms, convergence evidence, inclusion and exclusion decisions, source versions, hull vertices and facets, decomposition coefficients, and residual checks.

Store the machine-readable candidate table and derived hull together with hashes. When the phase set or compatibility model changes, create a new derived result linked to the original records rather than overwriting the earlier interpretation.

This topic can support bounded claims about candidate ground states, decomposition products, and energy above hull for a declared phase set and thermodynamic model. It does not establish global structure-search completeness, mechanical or dynamical stability, kinetic persistence, finite-temperature equilibrium without the required free energies, experimental synthesis, or accuracy of the underlying electronic-structure method.

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
