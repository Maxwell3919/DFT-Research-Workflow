---
topic_slug: compositional-phase-stability-and-convex-hulls
status: reviewed
---

A compositional phase diagram asks which combination of phases has the lowest thermodynamic potential at an overall composition. A convex hull turns a set of comparable phase energies into that competition. It can identify ground-state candidates, decomposition products, and the energy by which a represented phase misses the lower envelope. Its answer is conditional on the candidate set, energy model, thermodynamic variables, and reference conventions; a negative formation energy alone is not a stability result.

## Pose a closed- or open-system question first

For a closed system, fix the chemical components, total composition, pressure, temperature model, and allowed phase set. The equilibrium construction may split the material into several phases as long as their weighted compositions reproduce the overall composition. The relevant state minimizes an extensive thermodynamic potential, commonly a static electronic energy for a declared 0 K model or Gibbs free energy when pressure and temperature contributions are included.

An open system exchanges one or more species with reservoirs. Its composition need not remain fixed, so a grand-potential or chemical-potential construction answers a different question. Do not mix a closed-composition hull, a reservoir-dependent stability window, and an experimentally prepared nominal composition under one unqualified word such as “stable.”

## Formation energy supplies coordinates, not the verdict

For a compound containing amounts `n_i` of elements `i`, a per-atom formation energy may be written

```text
ΔE_f = [E_compound - Σ_i n_i μ_i^ref] / Σ_i n_i
```

`E_compound` is the comparable static total energy of the compound's declared state. `μ_i^ref` is the energy per atom of the selected elemental reference state for element `i`. The denominator is the total number of atoms in the represented formula or cell, so `ΔE_f` has units of energy per atom. The elemental references appear at zero by this convention.

This subtraction measures the compound relative to separated elemental references. A negative `ΔE_f` means that this particular elemental decomposition is energetically uphill within the model. It does not rule out decomposition into other compounds. Convex-hull stability requires comparison against every lower-energy mixture represented by the candidate set.

## Composition lives on a simplex

Write the atomic fractions as `x_i = n_i / Σ_j n_j`, with `Σ_i x_i = 1`. A binary system has one independent coordinate; a ternary system lies on a triangle; an `m`-component system has an `(m-1)`-dimensional composition simplex. The energy axis adds one dimension to this composition space.

All points must use the same components and normalization. A formula unit, primitive cell, conventional cell, and atom are valid bookkeeping choices only when converted consistently. Charged species, variable stoichiometry, molecular reservoirs, and vacancies require an explicitly balanced component basis rather than an informal chemical formula match.

## The lower convex envelope represents allowed mixtures

Suppose phases `j` may coexist with nonnegative amounts `λ_j`. Their mixture at overall composition `x` obeys

```text
Σ_j λ_j = 1
Σ_j λ_j x_j = x
G_mix(x) = Σ_j λ_j G_j
```

Here `x_j` is the composition vector of phase `j`, `G_j` is its chosen potential in a common normalization, and `λ_j` is its atomic or formula-unit fraction under that normalization. Minimizing `G_mix` subject to mass balance produces the lower convex envelope. At static 0 K, `G_j` is often approximated by corrected DFT energy or formation energy; at finite conditions it must be replaced by the appropriate free energy.

This is why a straight tie line has physical meaning. Every point on it is a macroscopic mixture of its endpoints, not an interpolated homogeneous crystal structure.

## Binary tie lines and multicomponent facets carry the same rule

In a binary diagram, hull vertices are connected by line segments. A candidate above a segment can lower its potential by separating into the two endpoint phases with lever-rule proportions. In a ternary system, the supporting objects are triangular facets; in higher dimensions they are simplices or more general facets after degeneracies are handled.

The geometry can admit more than two products when the overall composition lies on a multicomponent facet. A plotting projection must not be mistaken for the optimization itself. Decomposition coefficients should come from the full composition vectors and mass-balance solution, then be checked by reconstructing both composition and energy.

## Energy above hull measures a represented decomposition driving force

For candidate `k` at composition `x_k`, define

```text
E_hull(x_k) = min_{λ_j ≥ 0} Σ_j λ_j G_j
              subject to Σ_j λ_j = 1 and Σ_j λ_j x_j = x_k

E_above_hull,k = G_k - E_hull(x_k)
```

`E_hull` is the lowest mixture potential available in the declared candidate set. `E_above_hull,k` uses the same per-atom or per-formula normalization as `G_k`. A positive value identifies an energetic driving force toward the minimizing mixture within this model. A zero value means that the point lies on the computed envelope; it can be a vertex, lie on a degenerate facet, or be numerically indistinguishable from one.

The decomposition products and their coefficients are part of the result. Reporting only a scalar distance hides which chemical reaction defines that distance and whether the reaction changes when a competitor is added.

## Polymorphs compete before compositions do

Several structures, magnetic states, orderings, or numerical records may share one composition. Only the lowest compatible potential at that composition can define the lower envelope, but the higher polymorphs must not be silently discarded. Their relative energies can matter for metastability, transformation pathways, temperature-dependent order, and provenance.

First group records by exact composition and declared thermodynamic state, then distinguish duplicate calculations from genuine polymorphs. Select the lowest eligible record for hull geometry while retaining the others and their state identities. If two records use incompatible Hamiltonians or corrections, their ordering is not a valid polymorph comparison.

## Candidate completeness is part of every hull result

A computed hull is monotonic with respect to adding candidates: a newly admitted lower phase can leave the envelope unchanged or move it downward, never upward. Consequently, a point can be “on hull” only relative to a searched and documented phase set. Withholding one competitor can promote another composition to a vertex and change decomposition reactions elsewhere.

Candidate enumeration should cover known experimental phases, database entries, relevant prototypes, orderings, magnetic states, and structure-search results appropriate to the question. Completeness cannot normally be proven for arbitrary crystal structures. Record search sources, filters, exclusions, duplicate policy, and database/version timestamps so that “stable in this hull” remains auditable.

## Comparable energies require one coherent energy model

Every phase entering one envelope must share a compatible exchange-correlation model, pseudopotential or all-electron convention, relativistic treatment, Hubbard scheme, magnetic treatment, numerical convergence quality, and energy definition. Element-dependent or chemistry-dependent corrections may improve systematic formation-energy errors, but only when applied through one documented scheme to all eligible entries.

Jain and co-workers showed why directly mixing GGA and GGA+U energies needs fitted compatibility corrections in the Materials Project scheme. Such a correction is neither a raw DFT total energy nor a universal physical constant. Store raw energy, correction terms, corrected energy, scheme version, and eligibility separately; never subtract a correction twice or compare corrected and uncorrected records without justification.

## Numerical precision must resolve the envelope, not merely each SCF

Hull membership depends on energy differences between unrelated structures, compositions, cells, and sometimes magnetic states. SCF convergence of each record is necessary but does not establish convergence of `E_above_hull` or decomposition identity. Basis, k sampling, smearing, cell size, relaxation, spin initialization, and method choices can shift competitors unequally.

Converge the ranking and decomposition reaction near the envelope. Rebuild the hull under defensible numerical refinements, alternative initial states, and uncertainty perturbations. If plausible energy changes swap facets or vertices, report the membership as unresolved rather than converting a small nominal distance into a categorical claim. Database decimal precision is also distinct from calculation precision; reconstruction may agree only to the stored rounding.

## Finite temperature and pressure change every phase potential

A static formation-energy hull is usually a 0 K electronic approximation. At conditions `(T,p)`, each phase should contribute a consistently modelled Gibbs free energy,

```text
G_j(T,p) = E_DFT,j + F_vib,j(T) + F_el,j(T) + F_conf,j(T) + pV_j + G_other,j(T,p)
```

`E_DFT,j` is the static electronic term. `F_vib`, `F_el`, and `F_conf` are vibrational, physical electronic, and configurational free-energy contributions in the same normalization; `pV_j` is pressure–volume work; `G_other` denotes only additional explicitly justified terms. Numerical occupation smearing is not automatically a physical `F_el` term.

The hull must be rebuilt after these contributions are added because different phases shift by different amounts. Adding temperature to one candidate while leaving competitors at static energy does not create a finite-temperature phase diagram.

## Open reservoirs lead to grand potentials

If species in set `R` exchange with reservoirs, a useful transformed potential is

```text
Φ = G - Σ_{i in R} μ_i N_i
```

`G` is the phase Gibbs energy, `N_i` is the amount of exchangeable component `i`, and `μ_i` is its reservoir chemical potential in matching energy-per-particle units. Minimizing `Φ` compares phases after accounting for material supplied to or removed from reservoirs. Oxygen partial pressure, electrochemical voltage, and growth conditions enter only through a declared relation between experimental variables and chemical potentials.

Chemical potentials cannot be chosen independently without bounds. Elemental precipitation, competing compounds, charge neutrality, and the selected temperature/pressure model restrict the allowed domain. A chemical-potential stability region is therefore conditional on the same compatible phase ledger as the closed-system hull.

## Chemical-potential diagrams are a dual view

For phase `j`, the grand-potential expression is affine in chemical-potential space. The lower envelope of these planes partitions that space into domains where different phases minimize the potential. This chemical-potential diagram is dual to the composition-space convex-hull construction, but the axes and scientific question differ.

One view fixes overall composition and permits phase mixtures; the other fixes reservoir potentials and permits composition to change. A stability polygon in chemical-potential space must not be read as a range of bulk compositions, and a tie triangle in composition space does not directly specify an experimental gas pressure without a reservoir model.

## Metastability is not a universal distance cutoff

Many synthesized materials lie above a computed 0 K hull. Sun and co-workers analysed large datasets to characterize empirical metastability scales, while also showing their dependence on chemistry and synthesis context. These distributions do not provide a universal energy-above-hull threshold that separates synthesizable from impossible materials.

Kinetic barriers, surfaces, finite-size effects, defects, entropy, precursors, epitaxy, pressure history, and database/model error can preserve or favour an off-hull phase. Conversely, an on-hull prediction can remain inaccessible because no viable pathway exists. Treat `E_above_hull` as a thermodynamic driving-force descriptor within a model, then gather separate kinetic and experimental evidence for realizability.

## Decomposition energy and formation energy answer different reactions

Formation energy references the selected elemental states. Decomposition energy references the lower-energy combination that balances the candidate composition. The latter may involve only compounds, elements plus compounds, or the candidate itself when it lies on the envelope. Bartel and co-workers emphasize that the sign and interpretation of decomposition reactions require care, especially for stable compounds whose conventional energy-above-hull is zero.

Always print the balanced reaction and coefficient convention beside the energy. A scalar called “decomposition energy” without its reaction, sign definition, normalization, and handling of stable phases is not portable between datasets or software.

## Diagnose geometry and data failures before interpretation

Common failures include an omitted elemental endpoint, fractions that do not sum to one, formulas reduced inconsistently, duplicate records counted as distinct phases, and a composition coordinate derived from strings that cannot represent disorder or partial occupancy. Collinear or nearly degenerate points can also make a chosen triangulation unstable while leaving the physical lower envelope well defined.

Energy failures include mixed correction schemes, unconverged polymorphs, different magnetic models, incompatible reference energies, and free-energy terms applied to only part of the phase set. A visually plausible hull can survive all of these mistakes. Reconstruct mass balance and energy for representative facets, compare stored database stability values with an independent geometry calculation at their published precision, and inspect every near-hull candidate.

## A real-data rebuild is still a post-processing result

The accompanying Li–P example freezes 46 rows returned by the public OQMD REST API, retains entry and calculation labels, selects the lowest compatible row at each of 19 represented compositions, adds elemental endpoints under the formation-energy convention, and reconstructs the binary lower envelope. The original plot is generated locally from that snapshot and attributes the CC BY 4.0 dataset.

This is a real public DFT-data case, not a claim that this project reran the underlying calculations. Agreement with OQMD's stored stability values checks parsing, normalization, and hull geometry to the precision of the returned decimals. It does not independently validate OQMD energies, establish an exhaustive Li–P phase diagram, or prove any phase synthesizable.

## Preserve a phase ledger, not just a rendered hull

A reusable record contains formulas and exact composition vectors; structure and state identifiers; raw energies and units; reference energies; every correction and scheme version; temperature and pressure terms; numerical settings and convergence evidence; inclusion, exclusion, and duplicate decisions; source database release or retrieval time; code/library version; hull vertices, facets, decomposition coefficients, and residual checks.

Store the machine-readable candidate table and derived result together with hashes. A rounded image is evidence of presentation, not sufficient provenance for reuse. When the phase set changes, create a new derived hull linked to the unchanged source records rather than overwriting the earlier interpretation.

## Connect the result to adjacent stability questions

Relative and formation energies provide the comparable ledger on which a hull is built. Equation-of-state analysis compares structural branches and pressure effects at fixed composition; a compositional hull permits mixtures across compositions. Defect formation energies, surfaces, adsorption, and interfaces introduce reservoirs, finite-size models, or excess quantities that need their own reference constructions.

Mechanical and phonon stability test distortions of a represented phase, not competition against other compositions. Reaction pathways and dynamics address barriers and rates. Experimental phase identification tests whether a predicted or known phase occurs under stated conditions. None of these questions can be replaced by one zero-temperature hull distance.

## What this topic establishes

This topic establishes how comparable phase potentials, mass balance, and a lower convex envelope support bounded claims about candidate ground states, decomposition products, and energy above hull. It also establishes how the answer changes for open reservoirs and why candidate completeness, numerical uncertainty, corrections, and thermodynamic conditions belong to the result.

It does not prove global structure-search completeness, dynamical or mechanical stability, kinetic persistence, finite-temperature equilibrium without corresponding free energies, experimental synthesis, or accuracy of the underlying electronic-structure method.

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
