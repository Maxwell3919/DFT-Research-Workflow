---
topic_slug: quasiparticle-corrections
status: reviewed
---

Quasiparticle calculations address the energy required to add or remove an electron from a specified interacting electronic system. They are used when Kohn--Sham eigenvalue differences are not an adequate model for electron addition, removal, or a quasiparticle band gap.

A GW result is not automatically an optical spectrum or an experimental band gap. It is a one-particle excitation result whose meaning depends on the starting state, screening model, self-energy approximation, numerical representation, boundary conditions, and comparison target.

## The quasiparticle problem replaces a static potential with a self-energy

In the GW approximation, the electronic self-energy is written schematically as

```text
Σ(r,r',ω) = i G(r,r',ω) W(r,r',ω),
```

where `G` is a one-particle Green function and `W` is the screened Coulomb interaction. A quasiparticle energy is often obtained from

```text
E_nk^QP = ε_nk^KS
          + ⟨ψ_nk | Σ(E_nk^QP) - v_xc | ψ_nk⟩ .
```

`ε_nk^KS`, `ψ_nk`, and `v_xc` belong to the declared starting Kohn--Sham calculation. The correction is generally band-, momentum-, spin-, orbital-, and environment-dependent. It is not a universal scissor shift.

A scissor operator can be a useful reduced model when the relevant corrections have been shown to behave approximately rigidly over the bands and k region of interest. It must be labelled as that approximation rather than presented as a direct GW result for the entire spectrum.

## Screening is a calculated object

The screened interaction is commonly represented as `W = ε⁻¹v`. Constructing it requires a polarizability model, reciprocal-space basis, response space, frequency treatment, and boundary convention.

Important numerical axes include:

- empty-state count or an alternative completeness treatment;
- dielectric-matrix cutoff or basis size;
- k-point integration and treatment of `q → 0`;
- frequency grid, contour, analytic continuation, or plasmon-pole model;
- self-energy cutoff and solution convention;
- Coulomb truncation or image treatment in reduced dimensions.

A converged ground-state SCF calculation establishes none of these response-space limits. Converge the quasiparticle observable directly.

For slabs, wires, molecules, and interfaces, periodic-image screening and the dielectric environment are part of the physical model. A bulk screening convention cannot be transferred silently to an isolated two-dimensional layer.

## Starting point and self-consistency define different approximations

`G₀W₀` evaluates `G` and `W` from a declared starting state. Its result can depend on the exchange--correlation functional, hybrid fraction, Hubbard treatment, spin and SOC state, and the starting gap.

Eigenvalue-only updates change selected energies entering later evaluations of `G` or `W`. Partial and fully self-consistent routes update additional quantities. These methods are not interchangeable rungs of a guaranteed accuracy ladder. State exactly which objects were updated, which orbitals and occupations were retained, and which frequency model was used.

The common diagonal approximation assumes that the starting orbitals adequately represent the quasiparticle states. Near-degeneracies, strong state mixing, off-diagonal self-energy terms, metallic screening, satellites, or strong correlation can challenge that assumption. Normal program termination cannot establish its physical adequacy.

## Interpret the corrected spectrum as a one-particle result

A quasiparticle gap is the difference between specified electron-addition and electron-removal quasiparticle energies. It is distinct from:

- a Kohn--Sham eigenvalue gap;
- an optical excitation or absorption onset;
- an exciton energy;
- a transport gap;
- a defect transition level;
- a broadened photoemission peak.

Electron--hole attraction requires a two-particle treatment such as the Bethe--Salpeter equation. Temperature, phonons, disorder, surfaces, substrates, and carrier populations can also shift measured spectra.

Compare like with like. A single corrected scalar gap is insufficient when the scientific claim concerns dispersion, valley ordering, band offsets, effective masses, or state character. Inspect the relevant bands and momenta and preserve how the quasiparticle root was selected.

## Converge the intended observable

Test the quasiparticle energy, gap, ordering, or dispersion against the starting-state representation, empty-state and dielectric-response completeness, k mesh, frequency treatment, self-energy cutoff, Coulomb boundary model, and numerical solution strategy.

Retain the parent ground-state lineage, code and version, core treatment, response settings, raw or reconstructable self-energy data, frequency method, solution convention, and convergence series. A conditional GW result can support a conditional statement about one-particle addition and removal energies. It cannot alone establish an optical spectrum, exciton binding energy, lifetime, mobility, experimental agreement, or device performance.

**Independent-Particle Optical Properties** uses transitions between one-particle states without an electron--hole kernel. **Time-Dependent Response and Spectroscopy** treats induced response. **Excitons and the Bethe--Salpeter Equation** constructs neutral electron--hole excitations from a compatible quasiparticle and screening description.

## Sources and methods

- [Hedin, equations of motion for the electron gas](https://doi.org/10.1103/PhysRev.139.A796)
- [Hybertsen and Louie, plasmon-pole GW method](https://doi.org/10.1103/PhysRevB.34.5390)
- [Shishkin and Kresse, self-consistent GW](https://doi.org/10.1103/PhysRevB.75.235102)
- [ABINIT GW tutorial 1](https://docs.abinit.org/tutorial/gw1/)
- [ABINIT GW tutorial 2](https://docs.abinit.org/tutorial/gw2/)
- [Yambo GW documentation](https://wiki.yambo-code.eu/wiki/index.php?title=GW)
- [BerkeleyGW tutorial](https://berkeleygw.org/documentation/tutorial/)
