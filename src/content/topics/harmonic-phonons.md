---
topic_slug: harmonic-phonons
status: reviewed
---

Harmonic phonons describe the local curvature of the Born--Oppenheimer potential-energy surface around one declared reference structure. They answer how small collective displacements vibrate in that model; they do not by themselves establish finite-temperature stability, a phase transition, thermal conductivity, electron--phonon coupling, or an experimentally observed spectrum.

## Build the dispersion and watch the modes

Start from an accepted reference state whose forces, stress, electronic convergence, k sampling, and occupations are trustworthy for force response. Choose DFPT when the code provides the required perturbations, or finite displacement when a supercell force route is more appropriate; neither route is intrinsically the universal default. A Gamma calculation yields Gamma modes only. A dispersion requires a converged q mesh or supercell force-constant range, interpolation, and checks away from Gamma.

Open the dispersion and phonon DOS, select important or imaginary points, and animate their eigenvectors in a phonon viewer. Check which atoms move, the direction and phase of the displacement, whether an apparent acoustic problem is translational, and whether a soft mode suggests a plausible lower-symmetry distortion. Visual inspection can expose a wrong cell or mode interpretation, but it does not replace q/supercell, force, electronic, acoustic-sum, or non-analytic-correction tests. Converge the dispersion, DOS, or downstream quantity actually used. The Silicon guide is a real one-Gamma frequency ledger with no dispersion or mode animation. Major DFPT, finite-displacement, and viewer routes are collected under [lattice dynamics](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics).

One documented Phonopy 4.4.0 route is to set `ANIME` to the selected q point and run Phonopy to produce `anime.ascii`.

Open that file for manual mode playback:

```bash
v_sim anime.ascii
```

This opens `anime.ascii` in the `v_sim` executable for manual mode playback. In the `v_sim` GUI, open the **Phonons** tab, select the mode, and press play. For a q point away from $\Gamma$, expand the displayed nodes under **Box and symmetry** so that the longer-period modulation is visible. Record the q point, branch or frequency, expansion, and what moves. This visual inspection complements numerical diagnosis; it does not prove that an imaginary mode is a physical instability.

## From force constants to normal modes

For atoms $\kappa,\kappa'$, Cartesian directions $\alpha,\beta$, and lattice translations $\mathbf R$, the harmonic force constants are

$$
\Phi_{\kappa\alpha,\kappa'\beta}(\mathbf R)
= \frac{\partial^2 E}
{\partial u_{\kappa\alpha}(\mathbf 0)\,
 \partial u_{\kappa'\beta}(\mathbf R)}.
$$

$E$ is the total energy of the declared electronic state and $u$ is a displacement. Fourier transforming mass-weighted force constants gives the dynamical matrix $D(\mathbf q)$ at wavevector $\mathbf q$; its eigenvalues are $\omega^2(\mathbf q\nu)$ and its eigenvectors label branch $\nu$. A phonon dispersion is therefore not raw force output: it is an interpolation or DFPT result whose meaning includes structure, masses, cell, force-constant convention, reciprocal mesh, non-analytic terms, and branch labels.

There are $3N$ branches for a primitive cell with $N$ atoms. Three acoustic branches approach zero frequency at Γ in a translationally invariant three-dimensional crystal. Optical branches are not “more stable” merely because they are finite at Γ; stability is assessed over the relevant reciprocal space, not from one labelled branch or one Γ-point calculation.

## DFPT and finite displacements are alternative constructions

DFPT differentiates the self-consistent electronic state with respect to an infinitesimal displacement and builds the response directly. A finite-displacement calculation estimates derivatives from a set of signed displaced supercells and forces. Either route needs a compatible reference state and observable-specific convergence. Finite displacements require a supercell large enough for the represented force constants, symmetry-aware displacement construction, force accuracy, and a displacement range tested for linearity. DFPT requires convergence of the reference electronic state, reciprocal sampling, response solver, and q mesh.

Do not combine a force-constant set from one Hamiltonian, magnetic state, charge, cell, or pseudopotential with a dynamical-matrix correction from another. A successful SCF or response calculation is evidence that a numerical procedure ended, not that every phonon frequency or downstream observable has converged.

## Long-range electrostatics are part of a polar phonon model

In a polar insulator, the $\mathbf q\to0$ dynamical matrix contains a direction-dependent non-analytic long-range contribution. It uses Born effective charges and an electronic dielectric tensor under compatible conventions, and produces LO--TO splitting. A Γ-point analytic dynamical matrix without this contribution does not contain the corresponding LO--TO splitting. The correction must not be borrowed from a different structural or electronic state, nor should it be applied to a metal as if the same macroscopic-field model held.

The acoustic sum rule, schematically $\sum_{\kappa'\mathbf R}\Phi_{\kappa\alpha,\kappa'\beta}(\mathbf R)=0$, checks translational invariance of the force constants. Enforcing it can remove a small numerical drift, but it cannot repair inadequate supercells, an inconsistent reference, a broken symmetry, or a genuine unstable branch. Preserve whether and how it was imposed.

## Imaginary frequencies need diagnosis, not a one-word verdict

Many plots display an imaginary harmonic mode as a negative real frequency. It means a negative curvature in the harmonic model at that sampled $\mathbf q$ and reference structure. A robust imaginary branch may identify an athermal local instability and motivate following the eigenvector to a lower-symmetry candidate. It is not automatically a synthesis prediction, a finite-temperature phase, or a reason to replace the structure without checking the path and the numerical model.

Conversely, a small isolated imaginary acoustic value near Γ can arise from incomplete acoustic-sum closure, interpolation, finite-size effects, or convergence error. Diagnose its q dependence, magnitude under systematic numerical refinements, eigenvector character, symmetry, reference forces/stress, and the convergence of the target downstream observable. Do not silently take absolute values of imaginary modes in a free-energy calculation and then call the parent structure dynamically stable.

## What must converge and what the result can support

Converge the dispersion, phonon DOS, mode frequencies, or thermodynamic quantity actually needed. Relevant variables include the electronic representation, reciprocal mesh, q mesh or supercell range, force or response accuracy, interpolation, polar correction, smearing where physically applicable, structural state, and all constraints. No single cutoff, mesh, displacement, force threshold, or imaginary-frequency tolerance is a universal prescription.

An adequately converged harmonic spectrum supports a conditional local-curvature statement for the declared athermal model. It does not establish anharmonic renormalization, thermal expansion, finite-temperature stabilization, diffusion, thermal conductivity, superconductivity, linewidths, electron--phonon coupling, or experimental agreement. Retain the reference lineage, force-constant or DFPT inputs, displacements and forces where used, q and k meshes, non-analytic data, sum-rule treatment, eigenvectors, convergence traces, and every transformation used to make a dispersion or DOS.

## Sources and methods

- [Togo and Tanaka, first-principles phonon calculation review](https://doi.org/10.1016/j.scriptamat.2015.07.021)
- [Baroni et al., DFPT review](https://doi.org/10.1103/RevModPhys.73.515)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Quantum ESPRESSO `dynmat.x` input description](https://quantum-espresso.org/Doc/INPUT_DYNMAT.html)
- [Quantum ESPRESSO single-q phonon guide](https://www.quantum-espresso.org/Doc/ph_user_guide/node8.html)
- [Phonopy command and force-constant workflow](https://phonopy.github.io/phonopy/phonopy.html)
- [Phonopy setting tags and acoustic sum-rule note](https://phonopy.github.io/phonopy/setting-tags.html)
