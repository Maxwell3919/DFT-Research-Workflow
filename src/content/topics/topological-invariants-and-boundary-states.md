---
topic_slug: topological-invariants-and-boundary-states
status: reviewed
---

Topological analysis asks whether a declared electronic subspace can be continuously deformed into a reference without closing the relevant gap or breaking the protecting symmetry. A topological invariant is therefore a property of a Hamiltonian, subspace, filling, symmetry class, and Brillouin-zone domain.

It is not a label inferred from orbital character, “band inversion” language, one high-symmetry-path crossing, or a visually striking surface band. Those features can motivate a calculation, but they do not replace it.

## Define the subspace, gap, and symmetry first

Different symmetry classes support different invariants. A two-dimensional gapped subspace may carry a Chern number. A time-reversal-symmetric insulating state may carry a `Z2` index. Crystalline, chiral, particle-hole, and other symmetries lead to other classifications.

State which symmetries are actually present in the Hamiltonian, including spin--orbit coupling, magnetism, non-collinearity, external fields, and structural distortions. An invariant protected by a symmetry that the model breaks is not an invariant of that model.

The relevant band separation must hold throughout the domain used for the invariant. A full-zone check is essential when the gap is small, the bands are entangled, the Fermi level intersects a band, or the system is semimetallic. A conventional band path can miss the gap closing that changes the classification.

## Match the formula to its assumptions

For an appropriate two-dimensional gapped subspace, the Chern number is

```text
C = (1 / 2π) Σ_n ∫_BZ Ω_n(k) d²k .
```

`Ω_n(k)` is the Berry curvature of band `n`, the sum covers the declared subspace, and the Brillouin-zone orientation fixes the sign. The result is an integer only after the whole periodic zone, subspace continuity, and numerical integration are treated consistently.

A curvature map, partial-zone integral, or rounded value from an unconverged mesh is not a Chern-number result.

Wilson loops transport the selected subspace around reciprocal-space loops. Their eigenphases can reveal winding or partner switching, but only after the loop family, orientation, k mesh, subspace, gauge transport, and symmetry convention are fixed.

Parity eigenvalues at time-reversal-invariant momenta provide a shortcut to a `Z2` index only when inversion symmetry is present and the occupied states are correctly identified. A parity table from a non-centrosymmetric or symmetry-broken structure cannot be used for that formula.

## A reduced Hamiltonian must reproduce the relevant physics

Wannier or other reduced Hamiltonians can make dense invariant and boundary calculations practical. They are not automatically faithful merely because their interpolated bands look smooth.

Validate the reduced representation against the parent calculation over the complete energy and momentum domain needed for the invariant. Check band order, degeneracies, symmetry eigenvalues, SOC and magnetic structure, and the gap. Interpolating more points cannot repair a wrong subspace or a broken protecting symmetry.

The choice of disentanglement window can itself change the selected subspace. Preserve the projections, windows, symmetry constraints, and comparison with the parent Hamiltonian.

## Boundary states require a second, geometry-specific calculation

Bulk--boundary correspondence connects suitable bulk topology to robust boundary phenomena under stated assumptions. It does not imply that every slab or ribbon band is topological.

A boundary calculation introduces orientation, termination, thickness or semi-infinite embedding, reconstruction, disorder, surface potential, chemical potential, and projection choices. Trivial dangling-bond bands, quantum-well states, and termination-dependent resonances can occur in the same energy range as a topological boundary mode.

Compare the boundary spectrum with the projected bulk continuum for the same Hamiltonian. Test layer localization, connectivity across the relevant gap, response to symmetry-preserving perturbations, and thickness or embedding convergence. A crossing along one surface path is not sufficient evidence. Conversely, a thin slab can hybridize its two surfaces and obscure a state that survives in the semi-infinite limit.

## Converge the classification, not only the plot

Record the structure, magnetic and SOC state, basis or potentials, parent k mesh, selected bands, symmetry tolerance, invariant formula, integration mesh or loop family, gauge convention, and complete convergence series.

Test every numerical or modelling change that could close the gap, alter the subspace, or break the protecting symmetry. Keep three questions distinct:

1. Did the numerical method converge?
2. Is the classification robust to defensible model choices?
3. Has a corresponding experimental boundary phenomenon been observed?

**Berry Phase and Berry Curvature** supplies geometric quantities but does not classify a phase. **Wannier Function Construction** supplies a representation but does not validate topology. **Electronic Transport** and **Quantum Transport** require additional response, scattering, and device models.

This topic can establish a topological classification and a compatible boundary-state calculation for a declared Hamiltonian and domain. It does not establish synthesis, experimental observation, quantized transport, disorder robustness outside the tested model, or device performance.

## Sources and methods

- [Kane and Mele, Z2 topological order in the quantum spin Hall effect](https://doi.org/10.1103/PhysRevLett.95.146802)
- [Fu and Kane, topological invariants with inversion symmetry](https://doi.org/10.1103/PhysRevB.76.045302)
- [Qi and Zhang, topological insulators and superconductors](https://doi.org/10.1103/RevModPhys.83.1057)
- [Rhim, Bardarson, and Slager, bulk--boundary correspondence](https://doi.org/10.1103/PhysRevB.97.115143)
- [Gresch et al., Z2Pack invariant calculations](https://doi.org/10.1103/PhysRevB.95.075146)
