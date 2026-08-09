---
topic_slug: test-numerical-convergence
status: reviewed
---

Numerical convergence asks whether a reported quantity is stable enough with respect to the approximations used to represent and solve the chosen method. It is not a property of an input file in isolation. It is evidence about a named observable, comparison, or decision under a declared computational model and method.

## Begin with the claim and the observable

A convergence study should start from the quantity that will support the scientific argument. Total energy per atom, an energy difference, a force component, stress, a band edge, a phonon frequency, a dielectric tensor element, an electron–phonon coupling parameter, and a transition barrier can respond differently to the same numerical control.

The tolerance therefore belongs to the intended use. A phase ranking requires the uncertainty in the relevant energy difference to be small compared with the separation being interpreted. A structural optimization needs forces and stresses that are reliable enough for the chosen stopping criteria. A Fermi-surface or electron–phonon calculation may require much denser Brillouin-zone sampling than a coarse ground-state energy comparison.

“Converged to a standard setting” is not an observable-specific statement. Record the target quantity, its units, the comparison being made, and the maximum residual numerical uncertainty that the claim can tolerate.

At B, the purpose is to establish a documented baseline for shared structural and reference-state calculations. It is not a certificate for every D-stage observable. A band edge, phonon, response, defect energy, or electron–phonon integral inherits only the controls that were actually tested and needs its own observable-specific convergence evidence.

## Separate completion, solver convergence, and observable convergence

A normal program exit establishes that the executable reached an exit path. An SCF threshold establishes that an internal residual or estimated error fell below a configured criterion. Neither result alone establishes that the target observable is stable with respect to basis size, real-space grids, k points, occupations, supercell size, vacuum, q points, interpolation, or another external control.

Quantum ESPRESSO, for example, distinguishes ionic energy and force stopping criteria from the electronic `conv_thr`, and documents that these thresholds are extensive where applicable. These are solver and optimization controls. Their satisfaction is necessary for many workflows, but a separate parameter study is still required for the observable used in the scientific claim.

The evidence states should remain distinct:

```text
program completed
internal solver criterion satisfied
observable stable against tested numerical controls
result robust to physical-model or method changes
scientific claim supported
```

Only the third line is numerical convergence. The fourth belongs to method and model validation, and the fifth requires the complete evidence chain.

Changing the physical theory, ensemble, Hamiltonian, or boundary model tests physical or theoretical robustness. It must not be folded into a numerical sweep or reported as discretization uncertainty.

## Define tolerances in the units of the decision

A stopping tolerance should be expressed in the units and scale of the quantity that matters. Absolute total energies are often large and extensive, while formation energies, adsorption energies, phase differences, force components, or phonon frequencies are the quantities actually interpreted.

A fixed decimal count is not a scientific tolerance. Neither is a percentage useful when the reference quantity can cross zero. Prefer an absolute tolerance, a relative tolerance with a meaningful nonzero scale, or both. For a vector or tensor, state whether the criterion applies to every component, the maximum norm, an average, or a derived invariant.

The tolerance should also be smaller than the scientific separation being claimed. If two candidates differ by an amount comparable to the residual numerical uncertainty, the convergence study does not support a unique ordering.

## Preserve the same physical state across a sweep

A parameter sweep is interpretable only when the compared calculations represent the same intended state. Increasing a cutoff or changing a k mesh can alter the converged magnetic basin, charge localization, occupation pattern, symmetry, or structural minimum. A discontinuity may therefore be a state change rather than ordinary numerical noise.

Track state identity alongside the target observable. Useful checks include composition, cell and coordinates, spin moment, symmetry, occupation pattern, charge state, number of bands, and any constrained variables. Restarting every point from the previous point can improve continuity but may also preserve metastability; independent starts may reveal competing basins.

Do not average over state switches and call the result converged. Split the series by state, resolve the physical competition, or report that the chosen observable is not numerically interpretable under the tested protocol.

## Converge coupled numerical controls together

Many controls are coupled. In a plane-wave calculation, the wavefunction cutoff and charge-density or augmentation grid are not independent. In local-orbital methods, basis range, number of functions, integration grid, and confinement settings may interact. Exact exchange introduces additional sampling and cutoff controls. Projector, PAW, or pseudopotential choices can change the rate and limit of basis convergence.

One-at-a-time sweeps are useful for diagnosis, but they can miss a coupled error surface. A practical strategy is:

1. identify the controls that share one numerical representation;
2. perform a coarse multidimensional scan;
3. locate a stable region rather than one isolated point;
4. refine the most influential directions;
5. repeat the test for the target observable and representative difficult cases.

The Standard Solid-State Pseudopotentials work illustrates why several observables are tested separately: equation-of-state precision, cohesive energy, pressure, phonons, and band properties do not share one universal convergence rate. A recommended library cutoff is useful prior evidence, not a substitute for the present model and observable.

## Test differences and derivatives directly

Error cancellation can make a difference converge faster than its component total energies, but cancellation can also fail when structures, compositions, cell shapes, spin states, or reference calculations differ. The convergence of each component does not automatically establish the convergence of their difference, and the reverse is also true.

For relative energies, use method-compatible references and test the complete expression. For forces and stress, test the quantities that drive optimization rather than only total energy. For second derivatives, phonons, dielectric response, and elastic constants, small inconsistencies in the reference state or grids can be amplified.

A convergence study should therefore evaluate the final derived quantity whenever possible, while retaining component diagnostics that can reveal why it changes.

## Treat k-point sampling and occupations as one problem

Monkhorst–Pack meshes provide systematic special-point grids for Brillouin-zone integration, but mesh size, offset, symmetry reduction, dimensionality, and cell choice all affect the actual sampling. A nominal `N × N × N` label is not transferable between cells with different reciprocal dimensions.

Metals add a coupled occupation problem. Smearing can stabilize integration, but the smearing method and width affect energies, forces, Fermi levels, and Fermi-surface-sensitive quantities. Methfessel–Paxton and tetrahedron methods have different mathematical properties and are not interchangeable merely because both integrate over the Brillouin zone. Quantum ESPRESSO explicitly notes that its tetrahedron option is well suited to density-of-states calculations and less suited to force, optimization, and dynamics calculations.

Test k-point density and smearing width together for metallic systems. Inspect the target observable over a matrix of meshes and widths, not only along one diagonal. A narrow smearing on an insufficient mesh and a broad smearing on a dense mesh can produce similar energies for different reasons. A smearing width used as an integration device is not automatically a physical electronic temperature.

## Test finite-size behaviour within a declared boundary model

Cell-size and vacuum refinements constrain numerical finite-size error only when composition, coverage, ordering, relaxation constraints, and electrostatic formulation are fixed or follow a declared asymptotic scaling protocol. Alternative Coulomb-truncation, dipole-correction, effective-screening, or constraint models are robustness branches, not discretization points.

Supercell and slab calculations introduce interactions between periodic images, finite defect concentrations, constrained wavelengths, limited relaxation volumes, and boundary-dependent electrostatics. Increasing one cell length may reduce one error while leaving another unchanged.

For isolated, one-dimensional, and two-dimensional systems, vacuum thickness is only one part of the boundary treatment. Long-range Coulomb interactions can remain significant even when the charge density appears separated. Coulomb truncation, dipole corrections, effective screening models, or finite-size corrections may change the asymptotic behaviour and must be included consistently in the convergence protocol.

For defects, surfaces, adsorbates, and interfaces, test the quantity actually reported against relevant cell dimensions, defect separation, slab thickness, lateral area, vacuum, and relaxation region. Do not assume a smooth polynomial extrapolation unless the physical form of the residual interaction supports it. The point-defect literature documents both correction strategies and the limits of naive finite-size scaling.

## Converge response grids and interpolation separately

Response calculations introduce further layers of sampling. A phonon or perturbation solver can converge at each individual q point while the q mesh remains too coarse for a Fourier interpolation, density of states, thermal property, or electron–phonon integral.

Quantum ESPRESSO documents separate electronic k meshes and phonon q meshes, and permits electron–phonon calculations to use a different k mesh from the one used for the reference density. Density-functional perturbation theory likewise separates the solution of each perturbation from the reconstruction or integration of the response over reciprocal space.

Test at least three distinct questions where relevant:

- convergence of the response solution at fixed k and q;
- convergence of the coarse response grid used to construct an interpolant;
- convergence of the final fine-grid integral or derived observable.

An apparently smooth interpolated curve is not evidence that the underlying coarse grid is sufficient. Compare selected directly calculated points with interpolated values, inspect sum rules or symmetry constraints, and test the final observable against both coarse and fine grids.

## Expect non-monotonic and anisotropic behaviour

Plane-wave total energies often approach a variational limit in a recognizable direction, but many practical observables are not monotonic. Brillouin-zone aliasing, shell filling, Fermi-surface crossings, FFT-grid changes, state switching, interpolation error, and supercell commensurability can create oscillations or local plateaus.

A single small difference between the final two settings is therefore weak evidence. Use several points in the apparent tail, inspect trends from more than one refinement path, and include anisotropic refinements when the cell or physics is anisotropic. For layered materials, increasing only the out-of-plane vacuum does not test in-plane k sampling or lateral finite-size effects. For elongated cells, equal integer mesh counts do not imply equal reciprocal resolution.

Report non-monotonicity rather than hiding it with a fitted smooth curve. A fit is justified only when its functional form follows from a defensible residual-error model.

## Estimate residual numerical uncertainty

Numerical convergence is better represented by an uncertainty statement than by a binary badge. Useful conservative estimates include the maximum deviation across a stable tail, the spread among independent refinement paths, the difference between two integration schemes, or the change under a stricter coupled setting.

The estimate should be attached to the observable and protocol:

```text
observable: relative energy of phase B minus phase A
accepted setting: declared basis, grids, k mesh, smearing, cell, and solver thresholds
residual numerical uncertainty: estimated from the tested stable region
known exclusions: method error, model error, finite-temperature physics, experimental uncertainty
```

Do not combine unrelated error sources into one number without explaining the model. Numerical uncertainty, pseudopotential or basis transferability, exchange–correlation error, structural uncertainty, and statistical sampling error are different contributions.

## Choose a stopping point, not a universal maximum

The most expensive tested setting is not automatically the correct production setting. A stopping point balances the declared tolerance, observed convergence behaviour, cost, and reuse plan. It should lie inside a stable region, not at the first accidental crossing of a threshold.

A useful stopping decision asks:

- Is the target observable stable under at least one stricter setting?
- Are coupled controls simultaneously adequate?
- Is the same physical state preserved?
- Is the residual uncertainty small enough for the intended comparison?
- Does the evidence cover the most difficult representative systems?
- Would a change of model, method, pseudopotential, code version, or observable invalidate reuse?

The answer may be that no affordable setting reaches the desired tolerance. That is a valid scientific result and should narrow the claim rather than be concealed by a conventional parameter choice.

## Limit the reuse of convergence evidence

Convergence evidence can often be reused within a well-defined family, but the boundary must be explicit. Changes in composition, volume, dimensionality, vacuum, supercell, magnetic state, charge state, pseudopotential, basis, exchange–correlation method, relativistic treatment, code version, response formalism, or target observable can alter convergence.

A protocol derived for a primitive semiconductor total energy may not cover a metallic defect supercell, a hybrid-functional band edge, a polar slab, a soft phonon, or an electron–phonon integral. Reuse should be justified by representative worst cases and periodically rechecked as the study expands.

Geometry is not passive. If relaxation changes volume, symmetry, dimensional scale, metallicity, or electronic state beyond the tested family, recheck the B baseline on the accepted geometry. If stricter force or stress settings materially change that geometry, re-optimize and repeat the affected convergence tests. This feedback is evidence-driven, not a prescribed single pass.

## Preserve a convergence evidence package

The durable output of this task is not one parameter list. It is a traceable evidence package containing:

- the model and method identity;
- software, potential, basis, and version identities;
- the observable and tolerance;
- all varied and fixed controls;
- raw series and derived differences;
- state-identity diagnostics;
- plots or tables showing the tested region;
- the accepted setting and residual uncertainty;
- failed, non-monotonic, or state-switching cases;
- the declared reuse boundary.

Keep the exact calculation outputs or provenance links needed to reconstruct every plotted point. A hand-edited graph without the underlying parameter-to-result mapping is not sufficient evidence.

## What this task does not establish

Numerical convergence does not establish that the physical model is appropriate, that the exchange–correlation approximation is accurate, that a pseudopotential is transferable, that the calculated state is the ground state, or that a scientific conclusion is correct. Cross-code precision benchmarks such as the work of Lejaeghere and co-workers test a different question from convergence within one calculation protocol.

A successful convergence study supports a bounded statement:

> Under the declared model, method, implementation, and tested controls, the named observable is stable within the reported residual numerical uncertainty.

Later tasks must still optimize or establish the reference state, test physical consistency and method robustness, compare with appropriate references, and assess whether the complete evidence supports the claim.

## Sources and methods

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO 7.5 `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Monkhorst and Pack, special points for Brillouin-zone integrations](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton, high-precision sampling for metals](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron method](https://doi.org/10.1103/PhysRevB.49.16223)
- [Lejaeghere et al., reproducibility in solid-state DFT](https://doi.org/10.1126/science.aad3000)
- [Prandini et al., precision and efficiency in pseudopotential calculations](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP archive and provenance record](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo training and grading paper](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Ismail-Beigi, truncation of periodic image interactions](https://doi.org/10.1103/PhysRevB.73.233103)
- [Freysoldt et al., first-principles point-defect calculations](https://doi.org/10.1103/RevModPhys.86.253)
- [Baroni et al., density-functional perturbation theory](https://doi.org/10.1103/RevModPhys.73.515)
