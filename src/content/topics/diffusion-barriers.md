---
topic_slug: diffusion-barriers
status: reviewed
---

A diffusion-barrier calculation asks how a specified mobile object moves between specified sites in a declared host and what energy or free-energy cost it encounters along that elementary hop. A vacancy hop, adatom hop, interstitial jump, ionic migration event, and collective exchange are different physical pathways even when their endpoint displacement is similar. The result is conditional on the defect charge, concentration model, host state, cell, composition, magnetic state, boundary conditions, and Hamiltonian; it is not a universal material diffusivity.

## A hop is defined by sites, state, and multiplicity

Start from relaxed initial and final site states under one compatible model. Record which atom or defect moves, its periodic image, the site labels after relaxation, and the degeneracy of symmetry-equivalent hops. A path calculation then gives a forward static barrier

```text
E_m = E(R‡) − E(R_i),
```

where `R_i` is the initial local minimum and `R‡` is the validated saddle point on the stated hop path. `E_m` is a migration energy in the energy unit used for both calculations. If the final site has a different energy, the reverse barrier is different. A formation energy is not a migration barrier: equilibrium diffusion often combines a defect population term with a hop term, whereas a pre-existing tracer defect consumes only the latter model component.

## Path resolution is separate from the diffusion interpretation

NEB or a related path method relaxes intermediate images toward a minimum-energy path. The endpoints must remain identifiable; periodic boundary crossings need a consistent minimum-image convention; and images must not silently change charge, composition, spin branch, or cell model. Multiple geometrically plausible routes should be initialized and compared because a one-dimensional hop coordinate can conceal concerted motion, site exchange, host relaxation, or a lower indirect route.

The image spacing, path tangent, initial interpolation, spring representation, electronic convergence, cell size, defect-image interaction, and saddle validation all affect `E_m`. No fixed image count, supercell size, force threshold, or k mesh is transferable across hosts and defects. A path whose images have converged numerically still does not establish that the enumerated hop set is complete.

## Static barriers, migration free energies, and jump rates answer different questions

At finite temperature, a transition-state-theory description uses a rate such as

```text
Γ(T) = ν(T) exp[−ΔG‡(T)/(k_B T)].
```

`Γ` is a jump rate, `ν` a model-dependent prefactor, `ΔG‡` the migration free energy, `k_B` Boltzmann’s constant, and `T` the absolute temperature. In a harmonic approximation, vibrational modes at the minimum and the saddle enter the prefactor and free-energy difference; the unstable saddle mode is excluded from the stable-mode product. Replacing `ΔG‡` by a static `E_m` and assigning an arbitrary prefactor is an approximation that must be labelled, not a first-principles diffusion coefficient.

For an uncorrelated network of equivalent jumps, a tracer-scale expression can take the form `D = f z ℓ² Γ/(2d)`, where `f` is a correlation factor, `z` the number of allowed jumps, `ℓ` the jump length, and `d` the dimensionality. Each term depends on a defined lattice and event network. Correlations, site blocking, defect formation and association, charge-state populations, disorder, surfaces, fields, and multiple barriers can invalidate the simple mapping.

## Evidence needed for a transport claim

Preserve endpoint and saddle structures, image trajectories, force and electronic records, energy reference, path candidates, site/multiplicity definition, finite-size and model sensitivity, and any vibrational or kinetic-network inputs. Verify a first-order saddle and the basin connectivity before assigning a transition state. Converge the observable actually claimed: a static barrier, a free-energy barrier, a prefactor, a hop rate, or a diffusion tensor each needs different evidence.

An NEB maximum alone does not prove a migration mechanism. A low static barrier does not prove rapid bulk diffusion, a high ionic conductivity, a room-temperature diffusion coefficient, experimental agreement, or rate control when defect availability and competing paths are unknown. A calculation can support a conditional elementary-hop model only within its stated host, defect, thermodynamic state, and kinetic approximation.

## Sources and methods

- [Vineyard, harmonic frequency factors for solid-state rate processes](https://doi.org/10.1016%2F0022-3697%2857%2990059-8)
- [Henkelman, Uberuaga, and Jónsson, climbing-image NEB](https://doi.org/10.1063/1.1329672)
- [Quantum ESPRESSO `neb.x` input description](https://www.quantum-espresso.org/Doc/INPUT_NEB.html)
- [Quantum ESPRESSO PWneb user guide](https://www.quantum-espresso.org/Doc/user_guide_PDF/neb_user_guide.pdf)
- [ASE NEB documentation](https://docs.ase-lib.org/ase/neb.html)
- [ASE Al(110) diffusion tutorial](https://ase.gitlab.io/ase/examples_generated/03-tutorials/neb_selfdiffusion.html)
