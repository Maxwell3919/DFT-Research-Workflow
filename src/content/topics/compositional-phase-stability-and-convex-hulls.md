---
topic_slug: compositional-phase-stability-and-convex-hulls
status: reviewed
---

Use a compositional convex hull when the question is whether a represented phase can lower its thermodynamic potential by decomposing into other represented phases. The output must include the candidate ledger, hull vertices or facets, balanced decomposition coefficients, energy above hull, tolerance, and every phase-set decision.

Use **Rebuild a Li-P Convex Hull from an OQMD Snapshot** to inspect a public-data post-processing path, then **Stress-Test a Hull Against a Missing Competitor** to test phase-set sensitivity.

## Start from a candidate ledger

Every row needs an exact composition vector, structure and state identity, raw energy, corrections, compatible final energy, common normalization, method identity, numerical evidence, source or search identity, and inclusion or exclusion reason.

## Choose a closed or open system

A closed system fixes components and overall composition. An open system exchanges declared species with reservoirs and requires a transformed potential. These answer different scientific questions.

## Compute the formation coordinate

A common per-atom formation energy is

$$
\Delta E_{\mathrm f}
=
\frac{E_{\mathrm{compound}}-\sum_i n_i\mu_i^{\mathrm{ref}}}
{\sum_i n_i}.
$$

A negative $\Delta E_{\mathrm f}$ means that the selected elemental decomposition is uphill within the model. It does not exclude decomposition into compounds.

<!-- A negative `ΔE_f` means that this particular elemental decomposition is energetically uphill within the model. -->

## Use full composition vectors

Represent every phase by $\mathbf{x}_j$ in one component basis. Primitive cells, conventional cells, and formula units are interchangeable only after explicit conversion. Partial occupancy, vacancies, charge, and molecular reservoirs require balanced components rather than informal formula matching.

## Solve the lower envelope

Let $\mathcal S$ be the declared phase set, including candidate $k$ when its energy above hull is evaluated. With every $G_j$ in the same normalization, solve

$$
G_{\mathrm{hull}}^{\mathcal S}(\mathbf{x})
=
\min_{\{\lambda_j\}}
\sum_{j\in\mathcal S}\lambda_jG_j
$$

subject to

$$
\lambda_j\ge0,\qquad
\sum_{j\in\mathcal S}\lambda_j=1,\qquad
\sum_{j\in\mathcal S}\lambda_j\mathbf{x}_j=\mathbf{x}.
$$

## Verify mixture meaning

Every point on it is a macroscopic mixture of its endpoints, not an interpolated homogeneous crystal structure. In higher dimensions, use the full composition vectors rather than trusting a plotting projection.

## Recover the decomposition

Store the nonzero $\lambda_j$, phase identities, and balanced reaction. Reconstruct both target composition and mixture energy. The scalar hull distance alone hides the products and whether they change when a competitor is added.

## Compute energy above hull

For candidate $k$ in the same phase set,

$$
E_{\mathrm{above\,hull},k}^{\mathcal S}
=
G_k-G_{\mathrm{hull}}^{\mathcal S}(\mathbf{x}_k)
\ge0.
$$

<!-- E_above_hull,k = G_k - E_hull(x_k) -->

Classify zero only within an explicit tolerance. Do not clamp a materially negative value to zero; inspect normalization, phase-set membership, optimizer constraints, and tolerance instead.

## Compare polymorphs first

At one composition, compare genuine polymorphs, magnetic states, and orderings under one compatibility model before allowing the lowest record onto the envelope. Retain higher states for provenance and metastability.

## Record the phase set

A computed hull is monotonic with respect to adding candidates: a newly admitted lower phase can leave the envelope unchanged or lower it. “On hull” is always conditional on the documented search, filters, versions, duplicate policy, and exclusions.

## Apply one compatibility model

All phases must share compatible exchange-correlation, core or basis, relativistic and magnetic treatment, numerical quality, energy definition, and correction scheme. Preserve raw energy, each correction, corrected energy, scheme version, and eligibility separately.

## Converge the hull output

Rebuild under numerical refinements that can shift competitors unequally. SCF convergence is necessary but does not establish convergence of energy above hull or decomposition identity.

<!-- SCF convergence of each record is necessary but does not establish convergence of `E_above_hull` or decomposition identity. -->

If vertices, facets, or decomposition products change within plausible variation, report the result as unresolved or near-degenerate.

## Stress-test missing competitors

Withhold represented vertices, add plausible candidates, or perturb near-hull values under a documented uncertainty model. Create a new derived result for every phase set. Never delete an inconvenient lower phase from the source ledger.

## Add temperature and pressure consistently

Before rebuilding, apply the same type of free-energy model to every phase:

$$
G_j(T,p)=E_{\mathrm{DFT},j}+F_{\mathrm{vib},j}
+F_{\mathrm{el},j}+F_{\mathrm{conf},j}+pV_j+G_{\mathrm{other},j}.
$$

Partial thermal treatment is not a finite-temperature phase diagram.

## Transform open reservoirs explicitly

For reservoir species in $\mathcal R$,

$$
\Phi=G-\sum_{i\in\mathcal R}\mu_iN_i.
$$

<!-- Φ = G - Σ_{i in R} μ_i N_i -->

Chemical potentials remain constrained by host equilibrium, elemental precipitation, competing phases, and stated conditions.

## Keep chemical-potential diagrams distinct

A stability polygon in chemical-potential space must not be read as a range of bulk compositions. A composition-space tie simplex does not specify an experimental pressure or activity without a reservoir model.

## Avoid a universal metastability cutoff

These distributions do not provide a universal energy-above-hull threshold that separates synthesizable from impossible materials. Kinetics, surfaces, defects, entropy, pressure history, precursors, and model error can change accessibility without changing the static hull definition.

## Diagnose data and geometry

Check missing endpoints, inconsistent reduction, duplicate phases, negative or non-normalized fractions, mixed correction schemes, incompatible magnetic states, and asymmetric thermal terms. Rebuild representative facets from the machine-readable table.

## Inspect the public-data example

This is a real public DFT-data case, not a claim that this project reran the underlying calculations. The frozen OQMD Li-P result checks parsing, attribution, normalization, and convex geometry at source precision; it does not independently establish energy accuracy or phase-space completeness.

## Preserve the result and claim boundary

Store candidate rows, vectors, raw and corrected energies, source versions, phase-set decisions, tolerance, vertices, facets, decompositions, residual checks, and hashes. A hull can support bounded ground-state and decomposition claims for that set and model. It does not establish exhaustive search, mechanical or phonon stability, kinetic persistence, finite-temperature equilibrium without required terms, synthesis, or experimental realization.

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
