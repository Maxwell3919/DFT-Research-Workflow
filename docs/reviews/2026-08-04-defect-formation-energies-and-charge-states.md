# Defect Formation Energies and Charge States — scientific, execution, source, and media review

## Scope

This review covers:

> D1 · Energetics and Stability → Defect Formation Energies and Charge States

and two subordinate pages:

- Build an Auditable Defect Formation-Energy Ledger;
- Trace a Charge-State Envelope and Neutrality Root.

The decision is **reviewed within the declared educational and execution scope**. The batch does not change the A–E or D1–D5 registry and does not promote the retired operation taxonomy into public navigation.

## Scientific review

The overview correctly separates:

- defect species from site, structure, charge, spin, localization, and complex identity;
- raw host/defect total energies from atomic, electron-reservoir, and correction terms;
- elemental reference energies from phase-stability-constrained chemical potentials;
- a conditional Fermi-level coordinate from a self-consistent equilibrium Fermi level;
- nominal charge from verified localized charge and host-band occupations;
- periodic charged-supercell output from an isolated-defect limit;
- electrostatic corrections from elastic, overlap, dispersion, and concentration errors;
- scheme-contained potential alignment from an independently added term;
- pairwise line crossings from lower-envelope thermodynamic transition levels;
- a skipped charge state from verified negative-`U` behaviour;
- thermodynamic transition levels from vertical optical processes and Kohn–Sham eigenvalues;
- static formation energy from finite-temperature free energy and equilibrium concentration;
- equilibrium populations from frozen-in or externally driven defect states.

Every displayed equation defines its signs, symbols, units or normalization, purpose, and assumptions. The article prescribes no universal supercell, k mesh, cutoff, correction magnitude, dielectric value, force threshold, charge-state set, energy-above-hull range, concentration threshold, or experimental acceptability rule.

## Source review

- Zhang and Northrup provide the primary chemical-potential-dependent formation-energy construction.
- Van de Walle and Neugebauer review charge states, transition levels, reservoirs, and semiconductor-defect methodology.
- Freysoldt, Neugebauer, and Van de Walle provide both the broad point-defect review and the original model-charge correction.
- Kumagai and Oba extend electrostatic correction to anisotropic screening and atomic-site potential markers and clarify alignment accounting.
- Makov and Payne establish the periodic charged-system multipole treatment and its assumptions.
- Lany and Zunger assess finite-size and band-gap corrections and the need to distinguish localized and band-like behaviour.
- Mosquera-Lois et al. review vibrational, configurational, electronic, and spin contributions to finite-temperature defect free energies.
- PyCDT is a primary implementation paper for charged-defect setup and post-processing.
- doped provides current official documentation for formation-energy terms, chemical-potential limits, corrections, transition levels, and thermodynamic analysis.

Reviewed source records:

- https://doi.org/10.1103/PhysRevLett.67.2339
- https://doi.org/10.1063/1.1682673
- https://doi.org/10.1103/RevModPhys.86.253
- https://doi.org/10.1103/PhysRevLett.102.016402
- https://doi.org/10.1103/PhysRevB.89.195205
- https://doi.org/10.1103/PhysRevB.51.4014
- https://doi.org/10.1103/PhysRevB.78.235104
- https://doi.org/10.1039/D3CS00432E
- https://doi.org/10.1016/j.cpc.2018.01.004
- https://doped.readthedocs.io/en/stable/doped.thermodynamics.html

Every URL was visited before writing. DOI recognition, documentation reachability, semantic support, fixture execution, and scientific validity remain separate evidence classes.

## Practical execution review

`defect_formation_ledger.py` uses Python 3.12 standard-library arithmetic to assemble four invented charge-state records for an abstract B vacancy. It verifies the declared `Δn` convention, atomic-reservoir shift between two invented limits, component sums, and line slopes equal to charge. Its single correction field is explicitly a scheme-total fixture so no second alignment term is added.

`defect_charge_state_envelope.py` traces four invented lines through an abstract `3 eV` gap. It verifies lower-envelope transitions at fixture values `0.6` and `1.7 eV`, confirms that the `+1` state never enters the envelope, and solves one bracketed charge-neutrality equation using invented dilute Boltzmann populations, band effective densities, fixed donors, and temperature.

The scripts execute no DFT code and ingest no material data. Their energies, band edges, chemical potentials, dielectric/correction values, densities, degeneracies, temperature, and concentrations are invented deterministic fixtures, not recommendations or scientific results.

Execution success is not defect convergence for a real calculation. It verifies sign, component, line, envelope, transition-level, dilute-population, and neutrality arithmetic only. It does not establish a real defect configuration, charge localization, electrostatic correction, isolated-supercell limit, band edge, negative-`U` centre, free energy, concentration, doping limit, optical level, or experimental assignment.

## Media review

Two SVGs are original deterministic diagrams generated by the companion scripts:

- a component ledger for four synthetic charge states at one fixture Fermi level;
- four charge-state lines, the lower envelope, two synthetic transitions, and a separate toy neutrality root.

They are conceptual plots of invented data, not images of a real material run. No publisher figure, manual screenshot, private output, proprietary interface, or licensed asset was copied.

## Validation boundary

Repository validation, source audits, deterministic fixture execution, Astro build, responsive browser checks, no-JavaScript checks, Hosted CI, and exact-SHA Pages smoke can establish the implemented pages and declared arithmetic. They cannot establish any real defect formation energy, charge state, correction accuracy, dilute limit, concentration, dopability, optical response, kinetic behaviour, or scientific conclusion.
