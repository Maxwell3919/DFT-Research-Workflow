---
topic_slug: validate-results-and-scientific-conclusions
status: reviewed
---

Validation asks whether an analyzed result is credible for the scientific use assigned to it and whether the proposed conclusion is no stronger than the evidence. It is not a final checkbox performed after plotting. It is a structured attempt to make the result fail through independent numerical, physical, methodological, and external challenges.

The first distinction is between verifying a computation and validating its use as a model of the physical world. Verification asks whether equations and analysis were solved and implemented as intended. Validation asks whether the chosen model represents the relevant physics adequately for a stated purpose. A reproducible calculation can reproduce the same bug or omission, while agreement with one experiment can arise from compensating errors.

## Build a claim–evidence map

State each candidate conclusion as a bounded proposition. Identify the observable, material state, thermodynamic conditions, model class, uncertainty, and domain to which it applies. Then list the evidence required for that proposition and the alternatives that could produce the same observation.

A calculated negative formation energy supports stability only relative to the declared references; it does not establish convex-hull stability. A real phonon spectrum on the sampled q mesh supports harmonic stability only within that model and sampling; it does not establish finite-temperature survival. A band gap supports an electronic excitation statement only within its method and momentum coverage; it does not prove optical onset or device performance. The wording of the claim must preserve these boundaries.

## Verify identity, execution, and analysis first

Before interpreting physics, establish that the intended inputs produced the inspected outputs. Check hashes and lineage, program termination, parsed units and normalization, spin and symmetry conventions, reference states, and the exact analysis transformation. Recompute a small number of derived quantities independently from the raw output when practical.

These checks can establish artifact integrity and software behaviour. They do not establish convergence or scientific accuracy. Likewise, SCF convergence, force convergence, `JOB DONE`, a validator pass, and successful rendering are different evidence classes; none substitutes for the target observable’s acceptance test.

## Challenge numerical completion at the observable level

Numerical verification varies representation and discretization while holding the physical problem fixed. Repeat the derived observable over the relevant basis, real-space grid, k or q sampling, supercell, vacuum, smearing or integration, band count, interpolation, time step, trajectory length, and solver controls. Which variables matter depends on the observable; a universal parameter threshold is not defensible.

For a sequence `y(h)` controlled by a resolution measure `h`, examine changes in the target quantity rather than assuming a monotonic trend:

```text
Delta_h = y(h_finer) - y(h_coarser).
```

`Delta_h` is a sensitivity over the tested interval, not automatically an error estimate. Extrapolation requires an identified asymptotic regime and a justified convergence model. If state character, phase, magnetic order, occupation, or geometry changes along the sequence, the test no longer isolates discretization error and must be interpreted as a state-change diagnostic.

## Test physical consistency and limiting behaviour

Apply constraints that follow from the model: conservation of charge or current, acoustic sum rules, tensor symmetry, Hermiticity, positive or bounded quantities where required, thermodynamic cycles, degeneracies protected by symmetry, and correct zero-field, zero-temperature, long-wavelength, or non-interacting limits. Violating such a constraint can falsify the result. Satisfying it is necessary in its domain but rarely sufficient for accuracy.

Cross-check related observables derived through independent routes. Forces can be compared with finite differences of energy, polarization changes with integrated current where defined, dielectric response with sum rules, and a transport current with both terminal fluxes. Independence matters: two plots generated from the same erroneous intermediate are not independent confirmation.

## Probe model-form and methodological sensitivity

Change assumptions that could alter the conclusion: exchange–correlation approximation, core treatment, relativistic terms, magnetic and charge candidates, finite-size correction, structural ensemble, quasiparticle or excitonic treatment, scattering channels, or environmental model. Use controlled comparisons so that a method change is not silently mixed with a different structure or reference.

Robustness means the claim survives plausible alternatives relevant to its intended scope. It does not require every method to produce the same number. If the sign, ordering, phase assignment, or mechanism changes under a defensible alternative, report the conclusion as method-dependent and identify the unresolved decision. Agreement among implementations that share the same approximation tests reproducibility more directly than physical accuracy.

## Compare with external evidence without tuning after the fact

Align the modeled and measured quantities before comparing them. Experimental temperature, pressure, composition, defects, surfaces, domains, resolution, and sample history may differ from the idealized calculation. Instrument response and data reduction can transform the measured observable just as numerical broadening transforms a calculated spectrum.

Use experimental evidence that was not used to select or tune the model when possible. If a parameter was fitted to one datum, agreement with that datum is calibration, not validation. Predictions for withheld conditions, independent observables, or new systems provide stronger tests. A discrepancy should be decomposed into numerical uncertainty, model discrepancy, experimental uncertainty, and mismatch of physical object rather than assigned automatically to DFT or experiment.

## Decide what the evidence can support

Summarize each challenge with its scope, outcome, and consequence for the claim. A useful decision table distinguishes:

- supported within the tested model and domain;
- sensitive but qualitatively unchanged;
- unresolved because relevant evidence is missing;
- contradicted by a reliable check; or
- outside the method’s capability.

Absence of a detected failure is not proof that none exists. State which alternatives were tested, which were not, and what new evidence would change the conclusion. Negative and null results belong in the record because removing them creates a misleading evidence base.

Validation concludes with a claim whose language matches the weakest essential link. **Analyze and Compare Results** constructs compatible observables and uncertainty statements. **Document and Preserve the Study** makes the evidence and its limits recoverable. Neither computational reproducibility nor archival completeness alone proves that the physical conclusion is correct.

## Sources and methods

- [Oberkampf and Trucano, verification and validation in computational science](https://doi.org/10.1016/S0376-0421%2802%2900005-2)
- [NISTIR 8298, verification, validation, and uncertainty procedures](https://doi.org/10.6028/NIST.IR.8298)
- [National Academies, reproducibility and replicability in science](https://www.nationalacademies.org/read/25303/chapter/3)
- [Lejaeghere and co-workers, controlled cross-code DFT comparison](https://doi.org/10.1126/science.aad3000)
- [Perdew and Schmidt, hierarchy of density-functional approximations](https://doi.org/10.1063/1.1390175)
