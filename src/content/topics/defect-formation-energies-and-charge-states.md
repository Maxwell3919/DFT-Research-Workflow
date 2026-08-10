---
topic_slug: defect-formation-energies-and-charge-states
status: reviewed
---

## Inspect the host, defect, and electronic state together

Open pristine and defect supercells side by side in VESTA, OVITO, or another atomistic viewer. Locate the removed, added, or substituted atom; check periodic-image separation, local relaxation, coordination changes, and any unintended reconstruction. Then inspect the charge-state ledger and formation-energy lines as a function of Fermi level, including chemical-potential limits and correction terms.

A lower-envelope plot is useful only when every line comes from a compatible, physically identified calculation. Inspect charge or spin localization where the method permits it and compare transition levels with the band edges used in the same convention. Find common viewers under [visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), defect packages under [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and host or experimental context under [literature and learning](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

Use defect formation energies when atoms and electrons are exchanged between a defective supercell and declared reservoirs. Its primary result is therefore a formation energy as a function of atomic and electron chemical potentials, not a single intrinsic “defect energy.” Call it a formation free energy only when the declared thermal and statistical-mechanical contributions are included.

Start with **Build an Auditable Defect Formation-Energy Ledger** to assemble terms and signs. Use **Trace a Charge-State Envelope and Neutrality Root** only after the charge-state lines are trustworthy.

The attached pages contain invented arithmetic, not a defect calculation. For a real study, stop before drawing any line until the relaxed structure, charge or spin localization, band-edge reference, correction diagnostics, and supercell sensitivity are all inspectable for that charge state.

## Prepare the parent calculations

You need an accepted host reference, generated and relaxed defect candidates, compatible total energies, allowed atomic chemical potentials, method-consistent band edges, and a finite-size strategy appropriate to the cell and dimensionality.

## Define the defect identity

Record host phase, crystallographic site or interstitial position, atoms added or removed, final geometry, charge, spin, charge localization, and complex membership. A nominal vacancy or interstitial label does not distinguish inequivalent or reconstructed states.

## Search configurations within each charge

Use several local distortions, occupation patterns, and spin starts where warranted. Preserve every start-to-final mapping and do not overwrite metastable branches. An incomplete structural search can create false charge-state ordering.

## Match the host and defect evaluator

Use the same Hamiltonian, potential or basis, relativistic and Hubbard terms, cell convention, and compatible numerical accuracy. Verify program completion, SCF convergence, relaxation, final charge and spin identity, and localization separately.

## Assemble the formation ledger

With $\Delta n_i>0$ for atoms added and $q>0$ for electrons removed,

$$
E_{\mathrm f}(D^q;E_F,\{\mu_i\})
=
E_{\mathrm{tot}}(D^q)-E_{\mathrm{tot}}(\mathrm{host})
-\sum_i\Delta n_i\mu_i
+q(E_{\mathrm{VBM}}+E_F)
+E_{\mathrm{corr}}^q.
$$

Store every term and sign separately. The result is energy per defect supercell, normally reported per defect rather than per atom.

## Define atomic reservoirs

Write

$$
\mu_i=\mu_i^{\mathrm{ref}}+\Delta\mu_i.
$$

These allowed domains come from phase stability, not from selecting arbitrary “rich” and “poor” numbers. Preserve the competing-phase set, inequalities, temperature and pressure conditions, and reference identities.

## Reference the Fermi coordinate

For an insulating host, measure $E_F$ from a method-consistent VBM and state the allowed band-edge interval. An equilibrium Fermi level must instead satisfy charge neutrality together with all included charged defects, dopants, electrons, and holes.

A metallic host requires a defect and screening model appropriate to the metallic state rather than a fictitious band-gap scan.

## A periodic charged supercell is not an isolated charged defect

Periodic images and the compensating background create electrostatic energy and potential-reference shifts. Finite cells also introduce elastic interactions, defect-band dispersion, overlap, constrained strain, and concentration effects.

## Select one correction scheme

Choose a method whose charge model, dielectric response, cell geometry, dimensionality, localization, and potential data match its assumptions. Preserve raw energy, correction components, scheme total, dielectric input, diagnostics, implementation version, and residual estimate.

An electrostatic correction targets only the terms in its derivation. It cannot repair a delocalized state, wrong structure, inadequate relaxation, or incompatible reference.

## Avoid double-counting alignment

Follow one documented algebra. In extended FNV-style treatments, adding another independent potential-alignment term can double count it. Do not assemble a correction by combining similarly named fields from different methods.

## Converge the supercell observable

Compare several cell sizes and shapes where feasible while preserving the same defect identity, sampling policy, relaxation procedure, and correction model. Track raw and corrected formation energies, transition levels, potential residuals, localization, defect-band dispersion, structure, and spin.

Agreement between two corrected values can arise from compensating errors.

## Verify band edges and localization

Approximate band edges can change the plotted domain, carrier populations, and defect localization. A rigid scissor shift of extended bands does not automatically correct a localized defect state. Document any higher-level alignment and verify where the added or removed carrier resides.

## Build thermodynamic transition levels

Let $A_q$ be the assembled formation energy at $E_F=0$. Then

$$
\varepsilon(q/q')
=
\frac{A_q-A_{q'}}{q'-q}.
$$

Only crossings on the lower envelope delimit thermodynamically stable charge states. Store both configurations and their common energy reference.

## Diagnose a skipped charge state

A skipped state may reflect negative-$U$ behaviour only after structural search, electronic localization, supercell convergence, and correction consistency pass. A failed calculation or missing geometry is not negative-$U$ evidence.

## Separate thermodynamic and optical levels

Thermodynamic transitions compare separately relaxed states. Optical events initially hold nuclei fixed and require excited-state, vibrational, and coupling evidence.

A Kohn–Sham eigenvalue is neither automatically a thermodynamic transition level nor an optical excitation energy.

## Add statistical mechanics only after acceptance

A dilute model may use

$$
c(D^q)=N_{\mathrm{sites}}g_q
\exp\left[-\frac{G_{\mathrm f}(D^q;T,p,E_F,\{\mu_i\})}{k_{\mathrm B}T}\right].
$$

A static $E_{\mathrm f}$ may approximate only one enthalpic part of $G_{\mathrm f}$.

<!-- A static `E_f` may approximate only one enthalpic part of `G_f` -->

State eligible sites, degeneracy, temperature, free-energy terms, and the dilute approximation. Defect interactions, clustering, and substantial site fractions require another model.

## Solve charge neutrality separately

A declared equilibrium model satisfies, schematically,

$$
\sum_{D,q}q\,c(D^q;E_F)+p(E_F)-n(E_F)
+\frac{\rho_{\mathrm{fixed}}}{e}=0.
$$

The solution depends on the complete included defect and dopant inventory, carrier densities of states, multiplicities, reservoirs, and temperature. It is not chosen from the lowest plotted line.

## Model thermal history when it matters

Atomic populations can freeze during cooling while charge states re-equilibrate. Growth, annealing, quenching, illumination, bias, surfaces, and interfaces can produce different populations.

A low equilibrium formation energy does not supply a migration barrier or equilibration time.

## Inspect failure signs

Stop when charge is delocalized, host and defect occupations differ unintentionally, the correction dominates the interpreted separation, no far field exists, geometry or spin changes with cell size, or transition levels move with k mesh and initialization. Check atom signs, VBM gauge, reservoir compatibility, and alignment algebra.

## Preserve every line and its lineage

Store host and defect structures, site mapping, final state, atom changes, reservoirs, raw energies, band edges, correction inputs and diagnostics, supercell convergence, localization, line intercepts and slopes, lower-envelope membership, transition levels, statistical assumptions, and neutrality output. Keep excluded states with reasons.

## Decide the claim and next calculation

Accept a line only after its structure and electronic identity survive the relevant size, sampling, localization, and correction checks. The resulting envelope can support formation-energy ordering and thermodynamic transition levels for tested configurations, reservoirs, correction model, and numerical limits. It does not establish exhaustive search, isolated-defect convergence without size evidence, accurate band edges, populations from static energies alone, optical levels, migration rates, experimental identity, or dopability. Use phase stability for chemical-potential bounds and a separate migration calculation for motion.

## Sources and methods

- [Zhang and Northrup, chemical-potential dependence of defect formation energies](https://doi.org/10.1103/PhysRevLett.67.2339)
- [Van de Walle and Neugebauer, first-principles defects and impurities](https://doi.org/10.1063/1.1682673)
- [Freysoldt, Neugebauer, and Van de Walle, point-defect methods review](https://doi.org/10.1103/RevModPhys.86.253)
- [Freysoldt, Neugebauer, and Van de Walle, finite-size correction](https://doi.org/10.1103/PhysRevLett.102.016402)
- [Kumagai and Oba, anisotropic electrostatic correction](https://doi.org/10.1103/PhysRevB.89.195205)
- [Makov and Payne, periodic charged systems](https://doi.org/10.1103/PhysRevB.51.4014)
- [Lany and Zunger, band-gap and finite-size correction assessment](https://doi.org/10.1103/PhysRevB.78.235104)
- [Mosquera-Lois and co-workers, finite-temperature defect free energies](https://doi.org/10.1039/D3CS00432E)
- [Broberg and co-workers, PyCDT](https://doi.org/10.1016/j.cpc.2018.01.004)
- [doped thermodynamics documentation](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)
