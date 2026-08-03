---
topic_slug: lattice-thermal-transport
status: reviewed
---

Lattice thermal transport asks how vibrational degrees of freedom carry heat in one declared material model and environment. In a crystalline phonon picture, the result is a thermal-conductivity tensor, not a single material label: it depends on temperature, structure, dimensionality, isotopes, defects, boundaries, scattering model, and the transport equation. A harmonic dispersion or an anharmonic linewidth is an input to this question, not its answer.

## From modes to a heat-current response

In a particle-like phonon treatment, a common schematic form is

```text
κ_αβ = (1/V) Σ_qν C_qν v_qν,α F_qν,β .
```

`κ_αβ` is the lattice thermal-conductivity tensor, `V` is the chosen bulk normalization volume, `C_qν` is the mode heat-capacity contribution, `v_qν,α` is the group-velocity component, and `F_qν,β` is the nonequilibrium response to a temperature gradient along `β`. In a two-dimensional material the reported normalization convention needs special care: an arbitrary vacuum height changes a volume-normalized number without changing the isolated layer. State the convention and do not compare it directly with a bulk value whose geometry and normalization differ.

The relaxation-time approximation (RTA) sets `F` from a mode lifetime and treats selected scattering as an independent decay. The direct solution of the linearized phonon Boltzmann transport equation (LBTE) retains coupling between modes through a collision operator. RTA and direct-LBTE numbers may be useful comparisons, but neither is automatically the definitive answer: their difference diagnoses the role of collective normal processes within the declared model, while omitted four-phonon, isotope, defect, boundary, electron, and temperature-renormalization effects remain separate assumptions.

## What a transport calculation consumes

The phonon frequencies, eigenvectors, group velocities, and harmonic force constants must be compatible with the anharmonic force constants that determine phonon--phonon scattering. A polar correction, crystal cell, masses, temperature-dependent effective spectrum, and reference electronic state must refer to the same model. Force-constant truncation, supercell range, displacement-force accuracy, reciprocal meshes, energy-conservation integration, and the treatment of unstable modes can all alter both velocities and collision phase space.

Isotope disorder, boundary scattering, extrinsic defects, finite sample size, nanostructure, and electron scattering cannot be silently folded into an intrinsic phonon--phonon result. A boundary-limited calculation requires an explicit geometry and boundary model; it is not a substitute for a measured film, grain, or device. Likewise, a bulk periodic calculation does not establish the thermal conductance of an interface or a nanoscale contact.

## Lifetimes, RTA, direct LBTE, and coherence are distinct models

A linewidth or lifetime obtained from three-phonon perturbation theory is a mode-resolved scattering quantity under declared conservation and broadening rules. In RTA it becomes one ingredient in a diagonal heat-current response. Direct LBTE constructs and solves a coupled collision problem, whose memory and numerical conditioning can become material parts of the calculation. Convergence of an RTA tensor therefore does not prove convergence of a direct-LBTE tensor, and a completed direct solve does not prove that the collision model is complete.

The standard particle-like formulation also retains only diagonal, intra-band heat-current terms. Near-degenerate bands or complex crystals can require an inter-band or Wigner transport treatment, with additional velocity-matrix and linewidth conditions. It is a different observable model, not a cosmetic post-processing option. Do not compare an inter-band result with a particle-only result without saying which terms were included.

## Convergence and interpretation

Converge the tensor component, temperature dependence, cumulative mean-free-path quantity, or modal decomposition that supports the intended claim. Relevant variables include force-constant range and order, electronic and force accuracy, harmonic and scattering meshes, integration treatment, isotope model, collision solver, iterative tolerance, temperature grid, and any boundary or coherence assumptions. No universal supercell, q mesh, broadening, temperature grid, mean-free-path cutoff, or memory allocation can certify lattice thermal conductivity across materials.

Inspect tensor symmetry, volume or dimensional normalization, mode and branch resolution, mesh trends, RTA-to-LBTE sensitivity, scattering-channel contributions, and sensitivity to the omitted processes most plausible for the system. Preserve force/displacement data or force constants, the primitive and supercell mappings, polar information, all meshes, solver records, temperature points, normalizations, and post-processing scripts. A smooth `κ(T)` curve is not evidence that each of those objects is converged.

An adequately converged result supports a conditional lattice-transport prediction for the declared scattering and transport model. It does not establish experimental thermal conductivity, a device thermal resistance, thermodynamic stability, electron thermal transport, interfacial conductance, or the accuracy of an omitted scattering channel. This topic consumes validated harmonic and anharmonic inputs; it does not validate them retroactively.

## Sources and methods

- [McGaughey, Jain, and Kim, first-principles phonon thermal-transport review](https://doi.org/10.1063/1.5064602)
- [Li et al., ShengBTE and iterative phonon BTE](https://doi.org/10.1103/PhysRevB.86.174307)
- [Chaput, direct solution of the phonon BTE](https://doi.org/10.1103/PhysRevLett.110.265506)
- [Phono3py direct LBTE documentation](https://phonopy.github.io/phono3py/direct-solution.html)
- [Phono3py inter-band transport documentation](https://phonopy.github.io/phono3py/inter-band-transport.html)
- [ShengBTE documentation](https://www.shengbte.org/documentation)
