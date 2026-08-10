---
topic_slug: test-numerical-convergence
status: reviewed
---

Numerical convergence is an operation: declare a target, run a controlled series, extract the same quantity from every run, and decide against a tolerance written before inspecting the result. It is not a property of an input file in isolation.

## Start with the human decision

Before generating a sweep, inspect the [method and input resources](/DFT-Research-Workflow/operations/resource-landscape/#method-inputs), the chosen code's version-specific manual, and recent Methods or Supporting Information for a comparable material and observable. Identify the actual control names, units, coupled settings, printed diagnostics, and output artifact that must be compared. A value reported in the literature is a starting hypothesis, not a transferable convergence result.

Use the interface natural to the task. A researcher may edit inputs in a text editor or GUI, submit them through an HPC scheduler, collect results in a spreadsheet or notebook, and inspect plots manually. Complete and inspect at least one row end to end before automating the series. Automation should reproduce a understood comparison, not hide the model, state, or acceptance rule. Relevant code families and learning routes are indexed under [electronic-structure codes](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) and [manuals, workshops, and courses](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

Prepare this worksheet first:

~~~text
target observable and units:
scientific comparison or decision:
predeclared tolerance:
varied controls and planned values:
fixed model, method, geometry, state, and solver controls:
state-identity checks:
output file and extraction rule:
stopping rule and stricter confirmation:
known exclusions:
~~~

For each run, retain a row such as:

~~~text
run_id | varied values | fixed-settings hash | completion | solver | state | observable | delta | cost
~~~

Use one reference point only as a comparison device. For an observable $O$ and declared tolerance $\tau_O$, report

$$
\delta O_i = |O_i - O_{\mathrm{ref}}|
$$

and accept a setting only when the stable region and at least one stricter confirmation satisfy $\delta O_i \le \tau_O$ without a state change.

## Begin with the claim and the observable

Name the quantity that will be reported: an energy difference, maximum force, stress component, band edge, DOS feature, phonon frequency, dielectric tensor element, electron–phonon coupling parameter, or barrier. Record its units, comparison, extraction rule, and maximum residual uncertainty.

At B, the purpose is to establish a documented baseline for shared model and reference-state calculations. That baseline is not a certificate for every D-stage quantity; each target inherits only the controls actually tested.

The boundaries are direct:

- Energy convergence does not establish force convergence.
- Force convergence does not establish DOS convergence.
- DOS convergence does not establish phonon convergence.
- Phonon convergence does not establish EPC convergence.

## Separate completion, solver convergence, and observable convergence

Check each layer separately:

~~~text
program completed
internal solver criterion satisfied
observable stable against tested numerical controls
result robust to physical-model or method changes
scientific claim supported
~~~

A normal exit checks the executable path. An SCF or response residual checks one internal solver condition. Neither result alone establishes that the target observable is stable against basis, grid, k-point, smearing, cell-size, q-mesh, interpolation, or integration refinements. Only the third line is numerical convergence.

## Define tolerances in the units of the decision

A fixed decimal count is not a scientific tolerance. Use an absolute tolerance, a relative tolerance with a meaningful nonzero scale, or both. For vectors and tensors, state whether the rule applies to every component, the maximum component, a norm, or a derived invariant.

The tolerance must be smaller than the scientific separation being interpreted. If a candidate difference is comparable to the residual numerical uncertainty, the series does not support a unique ranking.

## Preserve the same physical state across a sweep

Hold the model, method identity, geometry or declared relaxation protocol, charge, spin constraints, occupation interpretation, and reference cycle fixed. Track composition, coordinates, symmetry, moments, charge localization, occupation pattern, and band count.

A discontinuity can be a basin change rather than numerical noise. Do not average over state switches and call the result converged. Split the series, resolve the competing states, or report that the protocol did not yield a comparable convergence sequence.

## Converge coupled numerical controls together

Write down which controls interact: wavefunction and charge-density cutoffs, basis and integration grid, k mesh and smearing, supercell and vacuum, coarse q mesh and fine integration grid. Begin with a small matrix, locate a stable region, then refine the influential directions while holding the remaining fields fixed.

A recommended library cutoff is useful prior evidence, not a substitute for the present model and observable. It determines where to start, not where to stop.

## Test differences and derivatives directly

Extract the final reported expression, not only its components. Error cancellation may help an energy difference but fail across structures, compositions, cells, spin states, or references. A converged total energy does not establish converged forces or stress; a converged force does not establish a second derivative.

For a difference $\Delta O = O_B - O_A$, apply the same method and compatible references at every numerical point, then test $\Delta O$ itself. Retain component values so a change can be diagnosed.

## Treat k-point sampling and occupations as one problem

Record reciprocal cell, mesh, offsets, symmetry reduction, irreducible count, occupation method, smearing kernel, width and units, number of bands, and the energy expression being compared. Integer mesh labels are not transferable between different cells.

For a metal, run a mesh-by-smearing matrix and inspect a two-dimensional stable region. A smearing width used as an integration device is not automatically a physical electronic temperature. A cancellation along one diagonal is not convergence.

## Test finite-size behaviour within a declared boundary model

State the limit: isolated object, dilute defect, declared adsorbate coverage, semi-infinite surface, isolated layer, or another defined target. For a fixed-concentration or fixed-coverage study, preserve that quantity while varying independent size controls. For a dilute or isolated-limit study, concentration, coverage, or image separation is intentionally varied toward the declared limit. In both routes, preserve the chemical and structural identity, normalization convention, state, and method branch; do not disguise an unintended identity change as finite-size convergence.

Changing Coulomb truncation, dipole correction, neutralization, dielectric model, or constraint defines a method branch. At fixed boundary treatment, test independent size directions and require a stricter neighbour in each unresolved direction.

## Converge response grids and interpolation separately

Separate four layers:

~~~text
reference electronic state and k mesh
response solver at each q point or perturbation
coarse response grid used to construct the interpolant
fine integration or interpolation grid used for the reported quantity
~~~

An apparently smooth interpolated curve is not evidence that the underlying coarse grid is sufficient. Compare selected direct and interpolated points, inspect sum rules and symmetry diagnostics, and converge the final observable over both coarse and fine grids.

## Expect non-monotonic and anisotropic behaviour

Open the complete table and plot the target observable against every varied control. Look for plateaus, oscillation, odd-even or offset effects, discontinuities, anisotropy, excluded points, and changes in state identity. A human-readable table and figure are part of the decision record; visual inspection complements the declared numerical tolerance and never replaces it.

Shell filling, FFT changes, Fermi-surface crossings, state switching, interpolation error, and commensurability can create oscillations or false plateaus. Test several points in the apparent tail and more than one refinement path.

A single small difference between the final two settings is therefore weak evidence. Report non-monotonicity; do not smooth it away unless the fit follows a defensible residual-error model.

## Estimate residual numerical uncertainty

Attach uncertainty to the observable and protocol. Conservative estimates include the maximum deviation across the accepted tail, spread between independent refinement paths, or change under a stricter coupled setting.

Do not combine numerical uncertainty with functional error, pseudopotential transferability, model uncertainty, statistical sampling, or experimental uncertainty without an explicit model.

## Choose a stopping point, not a universal maximum

The most expensive tested setting is not automatically the correct production setting. Select the least costly point inside the predeclared tolerance only after a stricter point remains inside the same tolerance and state.

If no affordable point passes, narrow the claim or report the unresolved numerical sensitivity. Do not replace the failed decision with a customary parameter.

## Limit the reuse of convergence evidence

Reuse requires a declared family of models, methods, states, and observables. Composition, volume, dimensionality, charge, magnetism, pseudopotential, functional, relativity, software version, or target quantity can invalidate it.

Every later calculation record should identify the B-stage baseline it inherits or name an explicit method or model branch. Unrelated target branches need not share one site-wide method identity, but every convergence series and every comparison or reference cycle must remain internally compatible unless a declared robustness test is comparing branches.

Geometry is not passive. If relaxation changes volume, symmetry, metallicity, or state beyond the tested family, repeat the relevant B baseline on the accepted geometry. Baseline numerical convergence does not establish observable-specific convergence.

## Preserve a convergence evidence package

The durable output of this task is not one parameter list. Preserve the worksheet, all inputs and outputs, exact software and data identities, varied and fixed controls, extraction command or script, raw table, state diagnostics, plot, accepted region, stricter confirmation, residual uncertainty, failed points, and reuse boundary.

A hand-edited figure without the parameter-to-output mapping is not convergence evidence.

## What this task does not establish

Numerical convergence does not establish that the physical model is appropriate, that the method is accurate, that a pseudopotential is transferable, that the selected state is the ground state, or that experiment must agree. Numerical convergence does not establish model correctness.

The supported statement is bounded:

> Under the declared model, method, implementation, and tested controls, the named observable is stable within the reported residual numerical uncertainty.

Later tasks still establish the accepted reference state, observable-specific convergence, physical plausibility, method robustness, and claim boundary.

## Sources and methods

- [Quantum ESPRESSO 7.5 <code>pw.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO 7.5 <code>ph.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
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
