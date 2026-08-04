---
topic_slug: topological-invariants-and-boundary-states
status: reviewed
---

Topological analysis asks whether a declared gapped electronic subspace can be continuously deformed into a reference without closing the relevant gap or breaking the protecting symmetry. A topological invariant is therefore a property of a Hamiltonian, occupied/target subspace, symmetry class, filling, and Brillouin-zone domain. It is not a label inferred from orbital character, band inversion language, one band-path crossing, or a visually striking surface band.

## First identify the space in which the invariant lives

A Chern number is an integer Brillouin-zone integral of Berry curvature for a gapped two-dimensional subspace. A time-reversal-symmetric insulator instead may carry a `Z2` index; crystalline, chiral, particle-hole, and other symmetries admit still different invariants. The calculation must state which symmetries are retained by the Hamiltonian, including spin--orbit coupling, magnetism, non-collinearity, and any external field or structural distortion. An invariant protected by a symmetry that the actual model breaks is not the invariant of that model.

The relevant gap is also part of the claim. A global direct gap separating the selected subspace throughout the Brillouin zone permits a band-subspace invariant. An indirect-gap metal, semimetallic node, entanglement ambiguity, or a Fermi level placed inside a band needs a different question and often a different invariant. A small gap may be physically decisive and numerically fragile: check it in the full zone, not only on a conventional band path.

## Equivalent formulas are not interchangeable inputs

For an appropriate two-dimensional gapped subspace,

```text
C = (1 / 2 pi) sum_n integral_BZ Omega_n(k) d^2k.
```

`Omega_n(k)` is Berry curvature of band `n`, the sum is over the declared subspace, and the Brillouin-zone orientation fixes the sign. The integral is dimensionless only when the whole periodic zone, gauge-compatible subspace, and gap condition are respected. A local curvature map, a partial-zone integral, or an integer rounded from an unconverged mesh is not a Chern-number calculation.

Wilson loops transport the selected subspace around reciprocal-space loops. Their eigenphases (hybrid Wannier centres) can reveal a winding or partner switching pattern, but only after the loop family, orientation, mesh, occupied subspace, gauge transport, and symmetry convention are fixed. Parity eigenvalues at time-reversal invariant momenta can offer a shortcut to a `Z2` index only in the additional presence of inversion symmetry and with correctly identified occupied states. A parity table from a non-centrosymmetric structure cannot be promoted to that shortcut.

## A boundary spectrum is a second calculation

Bulk--boundary correspondence connects suitable bulk topology to robust boundary phenomena under stated assumptions; it does not predict every visible slab band. A finite slab, ribbon, or surface Green-function calculation introduces an orientation, termination, thickness or embedding, surface potential, reconstruction/disorder model, chemical potential, and projection convention. Trivial dangling-bond bands, quantum-well states, and termination-dependent resonances can appear in the same energy range as a desired topological signal.

Compare a boundary calculation with the bulk gap and projected bulk continuum for the same Hamiltonian. Check localization layer by layer, the connection of a candidate mode across the relevant gap, its response to symmetry-preserving perturbations, and thickness or embedding convergence. A crossing in one surface path is not by itself evidence of a protected state; conversely, a finite slab can hybridize opposite boundaries and obscure a state that survives in a semi-infinite limit.

## Convergence and provenance are part of the classification

Consume a state-identical parent calculation or a separately validated reduced representation; record structure, magnetic state, SOC convention, potentials/basis, k mesh, selected bands, energy reference, symmetry detection tolerance, invariant method, mesh/loop definitions, gauge choices, and the full convergence series. If a Wannier Hamiltonian is used, its band and symmetry agreement with the parent state must be established on the domain used for the invariant and boundary calculation. Interpolating more points cannot repair a wrong subspace or a broken symmetry.

Test changes that could close a small gap, alter the subspace, or violate a protecting symmetry. Keep numerical convergence separate from robustness to method choices, and keep both separate from experimental identification. **Berry Phase and Berry Curvature** supplies geometric quantities but does not classify a phase. **Wannier Function Construction** supplies a representation but does not validate topology. **Electronic Transport** and **Quantum Transport** require their own scattering, device, or response models. This topic does not establish synthesis, a protected boundary observation, quantized transport, a device property, or a material conclusion.

## Sources and methods

- [Kane and Mele, Z2 topological order in the quantum spin Hall effect](https://doi.org/10.1103/PhysRevLett.95.146802)
- [Fu and Kane, topological invariants with inversion symmetry](https://doi.org/10.1103/PhysRevB.76.045302)
- [Qi and Zhang, topological insulators and superconductors](https://doi.org/10.1103/RevModPhys.83.1057)
- [Rhim, Bardarson, and Slager, bulk--boundary correspondence](https://doi.org/10.1103/PhysRevB.97.115143)
- [Gresch et al., Z2Pack invariant calculations](https://doi.org/10.1103/PhysRevB.95.075146)
