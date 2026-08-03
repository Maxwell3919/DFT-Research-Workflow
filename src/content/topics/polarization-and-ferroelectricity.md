---
topic_slug: polarization-and-ferroelectricity
status: reviewed
---

Polarization and ferroelectricity concern a change of bulk electrical state, not a dipole moment obtained by summing charges inside one arbitrarily chosen periodic cell. In a periodic insulating crystal, the observable quantity is a polarization difference along a continuous insulating path. Ferroelectricity is the stronger claim that two or more polar states are switchable by an electric field through a physically viable path; a non-centrosymmetric relaxed structure or one Berry-phase number does not establish it.

## A bulk polarization is defined modulo a quantum

For a cell of volume `Ω` with lattice vector `R`, the polarization lattice contains branches separated by

```text
Pq = e R / Ω .
```

Here `e` is the elementary charge. The ionic contribution can be represented using ionic positions and valences, while the electronic contribution is obtained from a Berry phase of the occupied Bloch states. Neither part alone is a branch-independent measurable bulk polarization. The meaningful comparison is

```text
ΔP = P(final) - P(reference) + n Pq ,
```

where integer `n` is chosen by following a declared insulating structural path, rather than by selecting the visually smallest difference after the fact. `P(final)` and `P(reference)` must use compatible cells, charge states, Hamiltonians, reciprocal sampling, and polarization convention. If the path becomes metallic, changes electronic state discontinuously, or crosses a different branch without being tracked, its Berry-phase difference no longer supplies the intended adiabatic polarization change.

## Choose the physical comparison before running it

Spontaneous polarization is normally the difference between a polar structure and a justified nonpolar reference structure of the same composition, connected by a continuous insulating distortion. The reference need not be a stable phase at the temperature of interest; it is a symmetry and path reference, not automatically a thermodynamic ground state. A centrosymmetric parent can make the comparison especially clear, but a calculated polar local minimum still needs an actual switching pathway and electrical boundary conditions before it can support a ferroelectric claim.

The calculation must specify whether ions and strain are fixed or relaxed, the electric boundary condition, temperature model, dimensional convention, and domain orientation. A slab supercell has vacuum-dependent three-dimensional polarization density; a reported two-dimensional dipole or polarizability needs its own normalization. Surface screening, electrodes, depolarizing fields, defects, domains, and finite-temperature disorder can alter whether a bulk polar distortion is observable or switchable in a real sample.

## From a structural distortion to a polarization path

Start from compatible reference and polar endpoints, then construct a sequence `λ` of structures between them. At each `λ`, retain the same cell definition and solve the intended insulating electronic state. Plot every reported polarization branch against `λ`; unwrap only by adding whole polarization quanta to make the physically followed path continuous. A useful finite-difference interpretation near a reference is

```text
ΔPα ≈ (e / Ω) Σκβ Z*κ,αβ Δuκβ ,
```

where `Z*κ,αβ` is the Born effective-charge tensor, `Δuκβ` is a sublattice displacement, and `α, β` denote Cartesian components. This is a local linear approximation, not a replacement for a finite Berry-phase path when distortions are large, nonlinear, or branch-changing. It also imports the state, boundary-condition, and convergence limitations of the Born charges.

An energy profile along the same path can reveal a local double well relative to the chosen reference, but a double well is not a coercive field, switching rate, transition temperature, or device hysteresis prediction. Those require a field-coupled free-energy model and evidence for relevant domain, defect, strain, screening, and kinetic processes.

## Convergence and failure modes

Converge the polarization difference and the energy profile for the stated path, not merely the endpoint SCF residual. Reciprocal sampling is especially important because the Berry phase is evaluated on strings in reciprocal space. Verify path continuity, crystal symmetry, insulating character, branch assignment, force and stress conditions, and stability relevant to the claimed endpoint. A fixed-cell result and a strain-relaxed result answer different questions; do not combine their numbers as one polarization.

Common failures are treating a single branch as an absolute charge, comparing endpoints with changed cells or electron counts, using a metallic interpolation, calling a polar space group ferroelectric without a switchable path, and equating a static zero-temperature calculation with a measured remanent polarization. A calculated polarization difference can support a conditional statement about a declared model and path. It cannot by itself establish experimental ferroelectricity, a switching field, finite-temperature phase transition, breakdown resistance, or device performance.

Preserve endpoint structures, the interpolation definition, path-resolved branch values and gaps, cell and unit conventions, ionic/electronic decomposition if used, energy profile, numerical convergence traces, and the reference lineage. The next piezoelectric topic uses derivatives of polarization with strain; it must not reuse a finite polarization difference as though it were a piezoelectric tensor.

## Sources and methods

- [King-Smith and Vanderbilt, theory of crystalline polarization](https://doi.org/10.1103/PhysRevB.47.1651)
- [Resta, geometric-phase review](https://doi.org/10.1103/RevModPhys.66.899)
- [VASP Berry phases and finite electric fields](https://vasp.at/wiki/Berry_phases_and_finite_electric_fields)
- [VASP `LCALCPOL`](https://vasp.at/wiki/LCALCPOL)
- [Quantum ESPRESSO polarization and finite-electric-field guide](https://www.quantum-espresso.org/Doc/pw_user_guide/node10.html)
- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
