---
topic_slug: test-numerical-convergence
status: reviewed
---

Numerical convergence is a statement about one named observable under a declared model, method, implementation, and set of controls. It is not a property of an input file in isolation. This task produces tested settings, a convergence table or plot, and a bounded residual-uncertainty statement.

## Begin with the claim and the observable

Name the quantity that will support the decision—energy difference, force component, stress, band edge, DOS feature, phonon frequency, response, or another target—and define a tolerance in its natural units. A fixed decimal count is not a scientific tolerance.

## Separate completion, solver convergence, and observable convergence

Check three lines separately: the executable finished; each inner solver satisfied its declared criterion; the target observable is stable across systematically improved controls. Only the third line is numerical convergence. Neither result alone establishes that the target observable is stable.

## Define tolerances in the units of the decision

Choose a tolerance small enough not to change the intended comparison or conclusion, report normalization per atom/cell/area as appropriate, and preserve the unrounded values used to decide.

## Preserve the same physical state across a sweep

Keep structure, method, datasets, charge, spin branch, occupations, constraints, and boundary model fixed unless their coupling is the subject of the test. Track state diagnostics at every point. Do not average over state switches and call the result converged.

## Converge coupled numerical controls together

Test controls that share an error source jointly: wavefunction cutoff with charge-density/FFT grid; k mesh with smearing; supercell with image correction; q mesh with electronic sampling. A recommended library cutoff is useful prior evidence, not a substitute for the present model and observable.

## Test differences and derivatives directly

If the claim uses energy differences, forces, stress, curvatures, or response, converge that object directly rather than assuming convergence of total energy transfers.

## Treat k-point sampling and occupations as one problem

Insulators may permit a direct mesh series; metals require a k-mesh × smearing check and state/occupation inspection. Slabs do not sample the vacuum direction like periodic bulk. For execution use [Converge k-points and smearing](/DFT-Research-Workflow/operations/test-numerical-convergence/guides/converge-k-points-and-smearing/). A smearing width used as an integration device is not automatically a physical electronic temperature. Optional theory: [Atlas Brillouin-zone sampling](/Electronic-Structure-Learning/theory/brillouin-zone-sampling/).

## Test finite-size behaviour within a declared boundary model

Vary supercell, vacuum, slab thickness, image treatment, or interface dimensions that control the target quantity. Do not infer isolation from empty space alone; use [Converge finite size, vacuum, and images](/DFT-Research-Workflow/operations/test-numerical-convergence/guides/converge-finite-size-vacuum-and-images/).

## Converge response grids and interpolation separately

Phonons and response calculations can require distinct electronic, perturbation, q-grid, and interpolation tests. An apparently smooth interpolated curve is not evidence that the underlying coarse grid is sufficient. Use [Converge q meshes and response grids](/DFT-Research-Workflow/operations/test-numerical-convergence/guides/converge-q-meshes-and-response-grids/).

## Expect non-monotonic and anisotropic behaviour

Use actual tested points and inspect failures before extraction. A single small difference between the final two settings is therefore weak evidence. Add points or vary directions when oscillation, symmetry changes, or anisotropy matters.

## Estimate residual numerical uncertainty

Build a table containing setting, run status, solver status, state identity, target value, reference difference, units, and exclusions. Plot the tested values against a declared reference. State how the remaining uncertainty was estimated.

## Choose a stopping point, not a universal maximum

Select the least costly setting that satisfies the declared observable tolerance with a margin and without state changes. The most expensive tested setting is not automatically the correct production setting.

## Limit the reuse of convergence evidence

At B, the purpose is to establish a documented baseline. Recheck convergence when geometry, composition, volume, state, dataset, method, boundary, or target observable changes materially. Geometry is not passive.

## Preserve a convergence evidence package

Keep exact inputs, outputs, dataset hashes, software/environment identity, extraction commands, complete table, plot, exclusions, selected setting, and residual uncertainty. The durable output of this task is not one parameter list.

## What this task does not establish

Numerical convergence does not establish that the physical model is appropriate, the method accurate, a pseudopotential transferable, the selected state the ground state, or experiment reproduced. The supported statement is: **Under the declared model, method, implementation, and tested controls, the named observable is stable within the reported residual numerical uncertainty.**

For a manual cutoff workflow use [Converge basis cutoffs and grids](/DFT-Research-Workflow/operations/test-numerical-convergence/guides/converge-basis-cutoffs-and-grids/). Optional theory on the underlying representation is in [Atlas Plane-Wave and Real-Space Methods](/Electronic-Structure-Learning/theory/plane-wave-and-real-space-methods/). Continue with the calculation that supplies the accepted reference state, and repeat observable-specific tests later.

## Sources and methods

- Quantum ESPRESSO [`pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html) and [`ph.x`](https://www.quantum-espresso.org/Doc/INPUT_PH.html).
- [Monkhorst–Pack](https://doi.org/10.1103/PhysRevB.13.5188), [Methfessel–Paxton](https://doi.org/10.1103/PhysRevB.40.3616), and [improved tetrahedra](https://doi.org/10.1103/PhysRevB.49.16223).
- [Solid-state DFT reproducibility](https://doi.org/10.1126/science.aad3000), [SSSP metrics](https://doi.org/10.1038/s41524-018-0127-2), [SSSP archive](https://archive.materialscloud.org/record/2021.76), and [PseudoDojo](https://doi.org/10.1016/j.cpc.2018.01.012).
- [Coulomb truncation](https://doi.org/10.1103/PhysRevB.73.233103), [point-defect finite-size methods](https://doi.org/10.1103/RevModPhys.86.253), and [DFPT](https://doi.org/10.1103/RevModPhys.73.515).
