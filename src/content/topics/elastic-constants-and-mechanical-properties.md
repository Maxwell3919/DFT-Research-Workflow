---
topic_slug: elastic-constants-and-mechanical-properties
status: reviewed
---

Elastic constants describe the local, reversible response of a specified crystalline state to an infinitesimal homogeneous strain. They answer how the energy curvature or stress changes near that state; they do not directly answer when a specimen fractures, how a porous polycrystal flows, or whether a phase survives finite temperature and defects. In DFT, the response belongs to the full calculation object: crystal state, charge and magnetic state, exchange--correlation and Hubbard model, pressure or field boundary condition, internal-coordinate freedom, and numerical representation all affect the tensor being compared.

## Run a controlled strain series

Start from an accepted structure with a declared residual stress. Choose stress--strain or energy--strain, the independent signed strain patterns, and whether ions remain clamped or relax internally. Hold the electronic method fixed, calculate every strained state, extract stress and energy into one ledger, fit the tensor, and inspect residuals, symmetry, strain-amplitude dependence, and agreement between compatible routes. Converge the tensor component or derived modulus that supports the claim, not merely the unstrained SCF energy. The subordinate ledger is synthetic-only: it checks fitting arithmetic, not a material calculation.

## The elastic tensor is an energy curvature with declared variables

For a reference cell of volume `V₀`, a small strain `ε` changes the energy density schematically as

$$
\frac{E(\boldsymbol{\epsilon})}{V_0}
= \frac{E_0}{V_0}
+ \sigma_{ij}^{(0)}\epsilon_{ij}
+ \frac{1}{2}C_{ijkl}\epsilon_{ij}\epsilon_{kl}
+ \cdots .
$$

`E(ε)` is the total energy of the strained state, `σ⁽⁰⁾` is the reference stress, and `Cᵢⱼₖₗ` is the second derivative at the declared reference condition. The indices refer to Cartesian components and repeated indices are summed. The linear term matters when the reference state is under nonzero stress; treating an unrelaxed, pressurized cell as if it were a zero-stress equilibrium changes the interpretation of fitted curvature.

In Voigt notation, symmetric strain components are packed into six components and the fourth-rank tensor becomes a `6 × 6` stiffness matrix `Cᵢⱼ`. The exact engineering-shear convention must be retained, because a factor-of-two mismatch between strain labels, stress labels, and fitting equations produces plausible-looking but wrong shear constants. Crystal symmetry can reduce the number of independent entries, but imposed symmetry must match the actual state: a distorted magnetic, defect-containing, strained, or ordered supercell can have lower symmetry than its nominal parent crystal.

## Stress--strain and energy--strain routes are related checks, not interchangeable receipts

One route applies a set of homogeneous strains and fits the calculated stress response,

$$
\Delta \sigma_i = C_{ij}\epsilon_j + \cdots .
$$

where `Δσᵢ` is the stress change relative to the declared reference. Another fits the energy changes with a quadratic form. In the linear elastic regime, compatible implementations should agree within their numerical uncertainty. Their disagreement can reveal incomplete electronic convergence, Pulay stress, an asymmetric strain set, an inconsistent reference stress, a poor fit window, a state switch, or unintended structural relaxation. It is evidence to investigate, not an invitation to select the more favorable tensor.

The strain amplitude is itself a convergence variable. It must be small enough for the selected linear or quadratic model to represent the response, yet large enough for the signal to exceed electronic and stress noise. Test signed strains, multiple amplitudes, and fit stability rather than asserting a universal deformation. Preserve the deformed lattice matrices, internal coordinates, energies, stresses, residuals, and all settings needed to regenerate every row.

## Internal relaxation defines a different physical response

With ions held at their affine strained positions, the calculation yields a clamped-ion response. If internal coordinates are relaxed at every imposed cell strain while the homogeneous strain is held fixed, the result is an ion-relaxed response. These tensors need not be equal, particularly in low-symmetry or polar crystals. Neither is generically “more accurate”: they correspond to different response conditions and must not be mixed entry by entry.

The same distinction applies to external variables. Elastic response at fixed electric field and at fixed electric displacement can differ in a piezoelectric or polar material. Constant-pressure, finite-temperature, and finite-strain moduli are additional thermodynamic derivatives, not a label that can be attached afterward to a static zero-temperature tensor. State the ensemble and constrained variables before comparing a calculated tensor to another calculation or an experiment.

## From a tensor to mechanical descriptors requires another declared model

For a single crystal, directional Young moduli, Poisson ratios, shear moduli, and compressibilities are obtained from the compliance tensor $S=C^{-1}$ when the stiffness matrix is nonsingular in the relevant space. Directional quantities can vary strongly with orientation; one scalar modulus does not characterize every loading direction.

For a polycrystal, Voigt, Reuss, and Hill averages make additional assumptions about grain-scale strain or stress sharing and texture. Report which averaging scheme and symmetry reduction were used. A bulk or shear modulus derived from a single-crystal tensor is not automatically an experimentally measured value for a textured film, porous sample, multiphase material, or finite-temperature specimen.

## Elastic stability is local and conditional

At the stated reference condition, mechanical stability against infinitesimal homogeneous strains requires the appropriate elastic quadratic form to be positive for allowed strains. For a zero-stress crystal this is often expressed through positive-definiteness of the symmetry-appropriate stiffness matrix; under pressure or general stress, the relevant stability matrix must include the correct stress contribution. Published Born criteria are useful only after confirming crystal class, tensor convention, and reference condition.

Positive elastic criteria do not establish dynamical stability: a crystal can resist homogeneous strain while possessing an unstable finite-wavevector phonon. They also do not establish thermodynamic stability against another composition or phase, kinetic persistence, fracture toughness, yield strength, thermal expansion, or experimental synthesizability. Conversely, a negative eigenvalue is a diagnostic of the specified local response model and should trigger checks of state identity, symmetry, stress reference, numerical convergence, and the intended boundary conditions.

## Evidence needed for downstream use

Retain the parent structure and state lineage; reference pressure and field variables; the strain convention and deformation matrices; clamped or relaxed ion choice; stress and energy records; fit form and residuals; symmetry treatment; tensor in both full and reduced form; units; stability test; compliance inversion conditions; and every derived directional or aggregate descriptor. A piezoelectric, phonon, pressure-response, or mechanics calculation can then reuse a tensor without mistaking a fitted scalar for a complete material claim.

This topic establishes a traceable local elastic response for a declared state, representation, and thermodynamic constraint. It does not establish finite-strain strength, fracture, plasticity, phonon stability, finite-temperature mechanical behavior, a complete phase-stability claim, or a comparison to an experimental mechanical measurement without the additional models and evidence those claims require.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Nielsen and Martin, quantum-mechanical stress and force](https://doi.org/10.1103/PhysRevB.32.3780)
- [Mouhat and Coudert, elastic stability conditions](https://doi.org/10.1103/PhysRevB.90.224104)
- [VASP finite-difference phonons and elastic moduli](https://vasp.at/wiki/Phonons_from_finite_differences)
- [VASP `elastic_modulus` data access](https://vasp.at/py4vasp/latest/calculation/elastic_modulus/)
