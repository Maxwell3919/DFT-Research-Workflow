---
topic_slug: choose-dft-method-and-computational-setup
status: reviewed
---

This task establishes a versioned method identity and a defensible starting setup. Its inputs are the checked model, target observable, comparison set, required precision, and relevant physical effects. Its output is not a universal recipe: it is one traceable baseline for the calculations that must remain comparable.

## Choose a route a researcher can actually use

Start from the research question, then choose an implementation that supports the required forces, stress, response, spin, relativity, boundary treatment, and post-processing. Use the [code catalog](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) and current official manuals. DFT is not synonymous with one code.

## Select core-valence data before handling the file

Choose an all-electron, pseudopotential, or PAW route compatible with the functional, elements, relativistic treatment, and observable. For a concrete selection/download workflow, use [Select, Download, and Record Pseudopotentials](/DFT-Research-Workflow/operations/choose-dft-method-and-computational-setup/guides/select-download-and-record-pseudopotentials/). The [Quantum ESPRESSO pseudopotential portal](https://pseudopotentials.quantum-espresso.org/) and [UPF specification](https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format) are implementation resources; the [Electronic Structure Atlas core-treatment page](/Electronic-Structure-Learning/theory/pseudopotentials-paw-and-core-valence-treatments/) is optional theory background.

## Record the decision

Record code and version, functional and correction variants, dataset family/version/filename/hash, valence and relativistic treatment, basis representation, boundary model, charge, spin/SOC, occupations, and candidate numerical controls.

## Run one bounded implementation preflight

Run the smallest representative input, inspect warnings and produced artifacts, and verify that required features are compatible. A successful exit establishes neither methodological suitability nor numerical convergence.

## Make the scientific comparison explicit

Calculations combined in an energy difference, reference cycle, or ranking require compatible method identities unless method sensitivity is itself the test. There is no universal best functional, pseudopotential library, all-electron method, code, basis, cutoff, k-point mesh, smearing width, Hubbard parameter, or boundary correction.

## Separate the physical approximation from its discretization

The functional, core treatment, and model define physical approximations; basis cutoffs, grids, meshes, and solver thresholds define numerical controls. Increasing these controls should approach a method-specific limit; it does not repair an inappropriate physical approximation.

## Choose exchange–correlation treatment by the physics and error

Choose XC treatment against the bonding, localization, spin state, dimensionality, target observable, and benchmark evidence. A formally higher rung is not automatically better for every observable or material.

## Define the core and valence treatment

Inspect element coverage, valence configuration, semicore choices, functional compatibility, scalar/full relativity, recommended starting cutoffs, generation lineage, tests, and license. A pseudopotential file being readable does not establish its accuracy or transferability.

## Choose a numerical representation that can express the method

Confirm that the basis and grids can represent the selected datasets and intended response. Recommended cutoffs are starting evidence; system- and observable-specific convergence follows on the next topic.

## Decide which spin and relativistic degrees of freedom are active

Declare nonmagnetic, collinear, noncollinear, scalar-relativistic, or SOC treatment and plausible competing starts. Initial magnetic moments and spin directions help select a starting basin, but they are not evidence that the final state is the magnetic ground state.

## Treat DFT+U as a defined extension, not a generic repair

Record correlated subspaces, projectors, convention, parameter source, and double counting. DFT+U is not a universal elemental constant and not a knob to force a preferred gap or magnetic state.

## Include dispersion and other long-range interactions deliberately

Select any nonlocal correlation or dispersion correction by system and observable, record its exact variant, and maintain reference compatibility. Different corrections alter different objects. They are not interchangeable switches.

## Distinguish electron number, occupations, smearing, and temperature

Declare charge, occupation rule, smearing form/width, and any intended electronic temperature separately. A smearing width used to stabilize metallic integration is not automatically a physical electronic temperature.

## Match electrostatic boundary treatment to the model

Bulk, isolated, slab, interface, and charged models may need different Coulomb, dipole, vacuum, or correction treatments. A large empty cell alone does not prove image interactions negligible.

## Keep reference calculations method-compatible

Preserve compatible Hamiltonian, datasets, basis, spin, occupations, boundaries, and normalization across quantities that will be subtracted or compared.

## Respect implementation and feature compatibility

Check the current manual for syntax, supported combinations, defaults, restart rules, and output markers. For Quantum ESPRESSO, begin with the current [`pw.x` input reference](https://www.quantum-espresso.org/Doc/INPUT_PW.html); use equally current official documentation for other codes.

## Record the setup as a versioned method identity

Freeze the baseline and branch explicitly when a later calculation changes it. This task establishes a versioned method identity and a defensible starting setup.

## The result of this task

Handoff the method record, exact data files/hashes, preflight output, known incompatibilities, and planned convergence controls to [Test Numerical Convergence](/DFT-Research-Workflow/operations/test-numerical-convergence/).

## Sources and methods

- [Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html), [pseudopotential portal](https://pseudopotentials.quantum-espresso.org/), and [UPF](https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format).
- XC: [PBE](https://doi.org/10.1103/PhysRevLett.77.3865), [SCAN](https://doi.org/10.1103/PhysRevLett.115.036402), and [HSE](https://doi.org/10.1063/1.1564060).
- Core treatment: [PAW](https://doi.org/10.1103/PhysRevB.50.17953), [Troullier–Martins](https://doi.org/10.1103/PhysRevB.43.1993), and [PseudoDojo](https://doi.org/10.1016/j.cpc.2018.01.012).
- Extensions and integration: [DFT+U](https://doi.org/10.1103/PhysRevB.71.035105), [vdW-DF](https://doi.org/10.1103/PhysRevLett.92.246401), [finite-temperature DFT](https://doi.org/10.1103/PhysRev.137.A1441), and [Methfessel–Paxton](https://doi.org/10.1103/PhysRevB.40.3616).
- Boundaries: [Coulomb truncation](https://doi.org/10.1103/PhysRevB.73.233103).
