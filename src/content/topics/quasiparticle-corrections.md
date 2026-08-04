---
topic_slug: quasiparticle-corrections
status: reviewed
---

Quasiparticle corrections address the energy required to add or remove an electron from a specified interacting electronic system. They are used when Kohn--Sham eigenvalue differences are not an adequate model for electron addition, removal, or a quasiparticle band gap. A GW result is not an automatic optical spectrum or experimental band gap: its observable, screening model, starting state, numerical representation, and comparison target must remain visible.

## From Kohn--Sham levels to a quasiparticle equation

In the GW approximation the electronic self-energy is represented schematically as

```text
Σ(r,r',ω) = i G(r,r',ω) W(r,r',ω),
```

where `G` is a one-particle Green function, `W` is the screened Coulomb interaction, and `ω` is frequency. A quasiparticle energy `E_nk^QP` is commonly obtained by solving

```text
E_nk^QP = ε_nk^KS + ⟨ψ_nk|Σ(E_nk^QP)-v_xc|ψ_nk⟩.
```

`ε_nk^KS`, `ψ_nk`, and `v_xc` are the starting Kohn--Sham eigenvalue, orbital, and exchange--correlation potential. The expectation value is evaluated in a declared starting-state representation. This equation is not a universal shift: the correction may vary by band, momentum, spin, orbital character, structure, and screening environment. A single scissor shift is a stated interpolation model, not evidence that all dispersions or offsets are quasiparticle accurate.

## Screening is a calculated object, not a label

The screened interaction follows from a dielectric response, often expressed as `W=ε⁻¹v`. Its construction requires a polarizability model, reciprocal-space representation, frequency treatment, and a finite response space. Empty states, dielectric-matrix cutoff or basis, k-point integration, Coulomb treatment for reduced dimensionality, frequency grid or contour/deformation choice, and the treatment of the `q→0` limit can all change a reported gap or level. A converged ground-state SCF calculation does not establish convergence of `W` or `Σ`.

For a slab, wire, molecule, interface, or charged finite model, periodic-image screening and vacuum representation are physical parts of the approximation. A bulk dielectric convention cannot simply be reused for an isolated two-dimensional layer. Preserve the Coulomb truncation or other boundary treatment, geometry, dielectric environment, and normalization before comparing quasiparticle shifts across models.

## G₀W₀, eigenvalue updates, and self-consistency answer different questions

`G₀W₀` evaluates `G` and `W` from a declared starting point. Its result can depend materially on the functional, hybrid fraction, Hubbard treatment, spin/SOC state, and starting gap. Eigenvalue-only updates alter energies entering later `G` or `W`; partial or fully self-consistent routes also alter other ingredients. These are not interchangeable levels of accuracy. State exactly what was updated, which orbitals and occupations were retained, and whether the calculation used a plasmon-pole, full-frequency, analytic-continuation, contour, or another declared frequency treatment.

Diagonal matrix-element evaluation assumes that the starting orbitals are an adequate basis for the relevant quasiparticle state. Off-diagonal effects, near-degeneracies, state mixing, metallic screening, satellites, and strong correlation can make that assumption inadequate. A numerical job ending normally cannot decide this physical suitability.

## Interpreting and comparing a corrected spectrum

A quasiparticle gap is the difference between declared electron-addition and electron-removal quasiparticle energies. It is distinct from a Kohn--Sham eigenvalue gap, an optical onset, an exciton energy, a photoemission peak with experimental broadening, a transport gap, and a defect transition level. Electron--hole attraction requires a two-particle response treatment such as the Bethe--Salpeter equation; phonons, temperature, disorder, surfaces, substrates, and finite carrier populations can also shift measured spectra.

Converge the intended observable under justified changes to the starting-state basis, empty-state and dielectric-response representation, k mesh, frequency treatment, self-energy cutoff, and boundary model. Inspect selected band edges and relevant dispersion or state character, not only a final scalar gap. Retain the starting calculation lineage, code and version, pseudopotential/all-electron treatment, response settings, frequency method, raw self-energy data, solution/root convention, and post-processing. A conditional GW correction can support a conditional quasiparticle statement; it cannot alone establish an exciton, experimental agreement, a lifetime, carrier mobility, or device performance.

This topic changes one-particle addition and removal energies. **Independent-Particle Optical Properties** uses uncorrected transition energies; **Time-Dependent Response and Spectroscopy** treats induced response; **Excitons and the Bethe--Salpeter Equation** treats electron--hole interaction. It does not establish a universal “true band gap,” an optical spectrum, exciton binding, or a material conclusion.

## Sources and methods

- [Hedin, equations of motion for the electron gas](https://doi.org/10.1103/PhysRev.139.A796)
- [Hybertsen and Louie, plasmon-pole GW method](https://doi.org/10.1103/PhysRevB.34.5390)
- [Shishkin and Kresse, self-consistent GW](https://doi.org/10.1103/PhysRevB.75.235102)
- [ABINIT GW tutorial 1](https://docs.abinit.org/tutorial/gw1/)
- [ABINIT GW tutorial 2](https://docs.abinit.org/tutorial/gw2/)
- [Yambo GW documentation](https://wiki.yambo-code.eu/wiki/index.php?title=GW)
- [BerkeleyGW tutorial](https://berkeleygw.org/documentation/tutorial/)
