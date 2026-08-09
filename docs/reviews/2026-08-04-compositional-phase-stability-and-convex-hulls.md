# Compositional Phase Stability and Convex Hulls — scientific, execution, source, data, and media review

## Scope

This review covers:

> D1 · Energetics and Stability → Compositional Phase Stability and Convex Hulls

and two subordinate worked examples:

- Rebuild a Li–P Convex Hull from an OQMD Snapshot;
- Stress-Test a Hull Against a Missing Competitor.

The decision is **reviewed within the declared educational and execution scope**. The batch does not change the A–E or D1–D5 registry and does not use the retired operation taxonomy as public navigation.

## Scientific review

The overview correctly separates:

- elemental-reference formation energy from stability against all represented mixtures;
- a homogeneous phase from a composition-balanced multiphase mixture;
- binary tie lines from higher-dimensional facets while retaining the same constrained minimization;
- energy above hull from the decomposition reaction that defines it;
- polymorph selection at one composition from deletion of higher states;
- a computed envelope from candidate-set completeness;
- raw DFT energies from corrections and finite-temperature free-energy terms;
- closed-system composition space from open-reservoir chemical-potential space;
- thermodynamic driving force from kinetic persistence and experimental synthesis;
- SCF completion from convergence of hull membership and decomposition identity.

Every displayed equation defines symbols, normalization, purpose, and conditions. The article prescribes no universal energy-above-hull threshold, cutoff, k mesh, smearing, structural search size, convergence tolerance, temperature correction, or chemical-potential range.

## Source review

- Wang et al. provide a primary first-principles phase-diagram treatment in a multicomponent battery chemistry.
- Bartel et al. directly analyse decomposition reactions, including interpretation for stable and unstable compounds.
- Sun et al. provide the primary large-scale empirical study of inorganic crystalline metastability and do not justify a universal synthesizability cutoff.
- Jain et al. establish the fitted compatibility treatment used to mix GGA and GGA+U energies in the cited scheme.
- Todd et al. develop chemical-potential diagrams and their relation to phase stability.
- Materials Project documentation defines its phase-diagram, correction, and chemical-potential implementations and boundaries.
- pymatgen documents the phase-diagram analysis objects used by many production workflows.
- Kirklin et al. describe OQMD, the source of the frozen real-material dataset.

Reviewed source records:

- https://doi.org/10.1021/cm702327g
- https://doi.org/10.1038/s41524-018-0143-2
- https://doi.org/10.1126/sciadv.1600225
- https://doi.org/10.1103/PhysRevB.84.045115
- https://doi.org/10.1021/jacs.1c06229
- https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds
- https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability
- https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/chemical-potential-diagrams-cpds
- https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram
- https://doi.org/10.1007/s11837-013-0755-4

The practical pages additionally use the official OQMD REST documentation and API-access/licensing page. Every URL was visited before writing. Reachability, semantic support, database provenance, local execution, and scientific validity remain separate evidence classes.

## Real-data and execution review

`oqmd-li-p-binary-20260804.json` is a frozen response from a keyless public OQMD query for binary Li–P entries. It stores the exact request URL, retrieval timestamp, OQMD source timestamp, API version, returned fields, 46 compact rows, and CC BY 4.0 attribution. The repository does not claim to have rerun the underlying OQMD calculations.

`li_p_convex_hull.py` uses the Python 3.12 standard library to parse integer Li–P formulas, select the lowest returned record at each of 19 compositions, add elemental formation-energy endpoints, construct the lower binary hull, interpolate tie lines, and compare reconstructed distances with the API `stability` field. It asserts the seven snapshot-specific hull vertices and the Li₂P decomposition endpoints and fractions.

The maximum reconstruction residual is approximately `2.55 × 10⁻9 eV/atom`, consistent with independent decimal rounding in the frozen fields. The test threshold of `10⁻8 eV/atom` is a stored-data reconstruction tolerance, not a convergence or accuracy target for DFT.

The phase-set test withholds LiP entry 17007 and confirms that the unchanged Li₄P₃ entry 2053607 moves from `0.00452626 eV/atom` above the complete-set hull onto the reduced-set hull. This verifies candidate-set sensitivity in the fixture only.

Execution success is not DFT convergence for a real calculation. It verifies frozen-response parsing, normalization, lower-envelope geometry, tie-line interpolation, database-field reconstruction, and declared phase exclusion. It does not independently establish OQMD accuracy, candidate completeness, a physical Li–P ground state, finite-temperature equilibrium, kinetic persistence, synthesis, or an experimental conclusion.

## Media review

The two SVGs are original plots generated locally from the attributed frozen OQMD data:

- all 46 returned rows, lowest-per-composition points, and the reconstructed lower hull;
- a side-by-side candidate-set sensitivity comparison with Li₄P₃ highlighted.

They are plots of a real public DFT database snapshot, not screenshots of a private run, publisher figures, or evidence that this repository executed DFT. Figure text, captions, alt text, the data snapshot, and the media manifest carry the same provenance boundary.

## Validation boundary

Repository validation, source audits, deterministic reconstruction, Astro build, responsive browser checks, no-JavaScript checks, Hosted CI, and exact-SHA Pages smoke can establish the implemented pages, data lineage, and declared geometry. They cannot establish the physical accuracy or completeness of the underlying DFT dataset or any stronger materials conclusion.
