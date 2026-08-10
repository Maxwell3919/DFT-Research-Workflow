---
topic_slug: surface-energy-and-work-function
status: reviewed
---

## Look at the slab before reading its scalar result

Open the slab from both the side and the surface normal. Identify the termination, number of layers, fixed atoms, lateral cell, symmetry, dipole orientation, and vacuum direction; measure the vacuum width and check for unintended interaction or reconstruction. A bulk reference, slab series, and converged electrostatic-potential profile are the researcher-visible objects behind surface energy and work function.

Plot surface energy against thickness and vacuum, and plot the planar or macroscopic potential beside the slab orientation. Select a field-free vacuum plateau manually rather than accepting an arbitrary average. Use [visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) for the geometry and [specialist analysis tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools) for planar averages and surface post-processing.

Use a surface-energy calculation to compare the cost of creating declared facets, terminations, or reconstructions. Use a work-function calculation when the question is electron removal from one specified surface to field-free vacuum. Start both from an accepted bulk parent and a fully identified slab; neither quantity belongs to a chemical formula or Miller index alone.

## Prepare and identify the surface state

Preserve the accepted bulk structure, phase, strain state, magnetic state, method, numerical settings, and energy per stated atom or formula unit. A slab subtraction is useful only when this reference is compatible with the bulk-like material represented inside the slab.

A Miller index identifies an orientation, not a unique surface. Also record the termination, reconstruction, stoichiometry, lateral cell, strain, defects or adsorbates, charge and spin, slab thickness, vacuum, fixed layers, and electrostatic boundary model. Preserve the final relaxed state rather than only its starting label.

## Follow the practical sequence

Begin with **Compare Published Si Surface Energies and Work Functions** to inspect the attributed InterMat rows and their limits. Use **Build a Surface-Energy Ledger and Diagnose Bulk Drift** to connect those definitions to the cancellation checks required for a new slab series. **Extract Side-Specific Work Functions from a Potential Profile** is an optional arithmetic exercise only; it contains no real slab or potential output.

## Write the surface-energy ledger

Inspect the periodic cell and decide how many surfaces it contains and whether they are equivalent. Record the one-face area $A$, surface normal, termination on each side, and any passivation. Never infer the divisor from a generic slab label.

For a symmetric stoichiometric slab with two equivalent faces,

$$
\gamma=\frac{E_{\mathrm{slab}}(N)-N e_{\mathrm{bulk}}}{2A}.
$$

The factor two counts the two equivalent surfaces. $N$ must follow the same counting convention used by $e_{\mathrm{bulk}}$. Convert from $\mathrm{eV}\,\text{\AA}^{-2}$ to $\mathrm{J\,m^{-2}}$ only after completing the subtraction.

For a stoichiometric slab whose faces differ,

$$
E_{\mathrm{slab}}-N e_{\mathrm{bulk}}
=A\left(\gamma_{\mathrm{top}}+\gamma_{\mathrm{bottom}}\right).
$$

One equation determines only the sum of the two surface excesses. Dividing by two reports an average, not either side. Separate values require additional slabs, a cleavage construction, a passivation model, or another explicit thermodynamic cycle.

When a termination adds or removes species, the surface free energy becomes a grand-potential excess. Write the represented reservoirs and interfaces explicitly:

$$
\gamma(T,p,\{\mu_i\})
=\frac{G_{\mathrm{slab}}-\sum_i N_i\mu_i}{\sum_j A_j}.
$$

State the allowed chemical-potential range and every finite-temperature contribution. Static DFT energies provide only part of $G_{\mathrm{slab}}$.

## Converge the slab model

Hold orientation, termination, reconstruction, stoichiometry, lateral cell, strain, constraints, method, and electronic branch fixed. For each slab, retain $N$, $A$, total energy, bulk reference, surface count, final structure, and output hash. Inspect the central layers before treating greater thickness as a refinement of the same model.

An incompatible bulk slope leaves a residual that grows with $N$. The derived $\gamma$ then drifts linearly with slab thickness even when each SCF calculation meets its inner stopping criterion. Diagnose the cancellation with

$$
E_{\mathrm{slab}}(N)=N e_{\mathrm{bulk}}^{\mathrm{fit}}+E_{\mathrm{excess}}.
$$

A fitted slope or intercept does not repair a reconstruction, strain, stoichiometry, magnetic-state, or protocol switch.

Generate the termination and reconstruction set needed by the intended comparison, relax each under one policy, relabel final structures, and retain metastable states. A constrained unreconstructed slab answers only for that constrained state; a low energy among an incomplete set does not establish the equilibrium surface.

## Control electrostatics and periodic images

An ideal unreconstructed polar termination can then have a divergent electrostatic energy rather than a neutral-slab limit. Inspect layer charges, charge neutrality, potential behaviour with thickness, and the physical compensation mechanism. A dipole correction removes a chosen periodic-image field but does not provide missing reconstruction, adsorption, defect, or electronic compensation.

Increase slab thickness and vacuum independently where possible. Track the target surface energy, work function, central-layer geometry, density spill-out, potential profile, and any surface-state splitting. A visually empty region is not evidence that electrostatic and wavefunction images are decoupled.

Record which layers and cell components move, whether both faces relax symmetrically, and which in-plane strain is imposed. Inspect residual forces and final surface identity. A converged optimizer does not show that another reconstruction or constraint policy is lower in energy.

Test both against slab thickness, vacuum, lateral cell, k sampling, basis or cutoff, electrostatic grids, occupation treatment, and relaxation policy. Surface energy tests cancellation of extensive energies; work function tests a vacuum-to-electronic reference difference, so their convergence decisions can differ.

Here numerical convergence means thickness, vacuum, sampling, and finite lateral-size refinement within a fixed termination, reconstruction, surface stoichiometry, and physical relaxation-constraint policy.

## Extract a defensible work function

Retain the code-specific potential grid, surface normal, potential-component definition, averaging direction, smoothing convention, and $E_F$ from the same energy gauge. Plot the planar or documented macroscopic average before choosing a scalar vacuum level.

The expression is meaningful only when the vacuum reference is flat and charge-free. Record each window, its mean, span or slope, and its distance from charge density and correction discontinuities. Then calculate

$$
\Phi=E_{\mathrm{vac}}-E_F.
$$

A cell-edge value on a sloping profile is not $E_{\mathrm{vac}}$.

For an asymmetric slab, the left and right plateaus may be unequal even though the slab has one equilibrium Fermi level:

$$
\Phi_{\mathrm{left}}=E_{\mathrm{vac,left}}-E_F,
\qquad
\Phi_{\mathrm{right}}=E_{\mathrm{vac,right}}-E_F.
$$

Report the side, termination, surface normal, and plateau window with each value. Do not average physically different surfaces.

Compare corrected and uncorrected profiles, place any discontinuity outside the charge density, and repeat the extraction as vacuum changes. A correction defines the periodic electrostatic boundary; it does not prove adequate vacuum, physical charge compensation, or an isolated-surface result.

An in-gap numerical Fermi level can be convention dependent. State whether the question uses work function, ionization potential $E_{\mathrm{vac}}-E_{\mathrm{VBM}}$, or electron affinity $E_{\mathrm{vac}}-E_{\mathrm{CBM}}$. Doping, surface states, band bending, temperature, and charge conditions remain part of the comparison.

## Match the physical environment and intended claim

Adsorbates, oxidation, defects, solvent, fields, and charge transfer change both surface excess and dipole. Compare a clean-vacuum calculation with experiment only after matching orientation, reconstruction, preparation, temperature, and environment. A vacuum work function alone does not define an electrochemical operating potential.

The Wulff shape is an equilibrium construction. It requires surface free energies for the relevant orientations and states at common thermodynamic conditions. Missing terminations or reconstructions can alter the construction, while growth morphology additionally depends on kinetics, diffusion, supersaturation, strain, and defects.

## Inspect the published Si comparison before drawing a trend

The InterMat example freezes reported Si(111), Si(110), and Si(001) surface energies and work functions, checks the snapshot, and redraws the table values. It is not a rerun of InterMat, a thickness series, or independent validation of its DFT or experimental comparison.

## Decide what may continue

Retain parent bulk and slab files, final structures, area and surface count, all energy and reservoir terms, numerical series, potential profiles, plateau windows, side labels, electrostatic settings, hashes, and stopping decisions. Program termination, SCF convergence, geometry convergence, target convergence, physical plausibility, and claim support remain separate.

The accepted ledger can support a conditional comparison among represented surfaces. It does not establish an exhaustive reconstruction search, experimental surface composition, finite-temperature equilibrium shape, growth morphology, catalytic activity, electrochemical operating potential, or method accuracy.

## Sources and methods

- [Fiorentini and Methfessel, convergent surface energies](https://doi.org/10.1088/0953-8984/8/36/005)
- [Boettger, thin-film surface-energy nonconvergence](https://doi.org/10.1103/PhysRevB.49.16798)
- [Bengtsson, dipole correction for surface supercells](https://doi.org/10.1103/PhysRevB.59.12301)
- [Tasker, stability of ionic crystal surfaces](https://doi.org/10.1088/0022-3719/12/22/036)
- [Herring, surface free energies and equilibrium crystal shape](https://doi.org/10.1103/PhysRev.82.87)
- [Reuter and Scheffler, atomistic thermodynamics of RuO2(110)](https://doi.org/10.1103/PhysRevB.65.035406)
- [Lin and co-workers, work-function review](https://doi.org/10.1103/PhysRevApplied.19.037001)
- [Derry, Kern, and Worth, clean-metal work functions](https://doi.org/10.1116/1.4934685)
- [Choudhary and Garrity, InterMat surface dataset](https://doi.org/10.1039/D4DD00031E)
- [VASP official work-function workflow](https://vasp.at/wiki/Computing_the_work_function)
- [GPAW official dipole-correction tutorial](https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html)
