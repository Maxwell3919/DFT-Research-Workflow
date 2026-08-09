---
topic_slug: reaction-paths-and-transition-states
status: reviewed
---

Reaction-path calculations ask for the lowest-energy connected route between two declared states under one potential-energy model. They do not merely compare the endpoints. The output is a path in configuration space and, when it contains an appropriate first-order saddle point, a barrier relative to a stated reactant basin. It is not automatically a finite-temperature rate, a mechanism proved in experiment, or a guarantee that every alternative route has been found.

## Build, run, and verify a path

Start with separately verified endpoint minima under one compatible model. Generate more than one physically plausible interpolation when mechanisms can differ, run the path optimization, and inspect every image's state identity, energy, projected force, spacing, and geometry. Refine the high-energy region and validate a candidate transition state by its local curvature and connectivity to the intended basins. Converge the barrier against path initialization, image resolution, electronic settings, finite-size model, and saddle verification. This overview does not claim an executed NEB path.

## Endpoints define the question before a path can answer it

The initial and final structures must each be relaxed and identified as the intended states under compatible cell, composition, charge, spin, boundary, Hamiltonian, and numerical choices. For an adsorption event, for example, a different site, coverage, surface face, or reference proton/electron state changes the reaction being represented. A path connecting two local minima is conditional on those minima; it cannot decide which reactant population is available or whether a different product is thermodynamically preferred.

Let $\mathbf R(s)$ be a continuous path of atomic coordinates, parametrized by $s$, with endpoints $\mathbf R_A$ and $\mathbf R_B$. Its energy profile is $E[\mathbf R(s)]$. The forward potential-energy barrier is

$$
\Delta E^\ddagger
= E(\mathbf R^\ddagger)-E(\mathbf R_A).
$$

Here $\mathbf R^\ddagger$ is the highest relevant saddle-point configuration on the chosen minimum-energy path and all energies use the same normalization. This subtraction answers a zero-temperature potential-energy question. Vibrational free energies, field work, solvent, electrode potential, entropy, and populations are additional model terms, not implicit properties of a static barrier.

## A nudged elastic band is a path optimization, not an ordinary relaxation

NEB represents the path with intermediate images. Springs maintain their order along the path while the physical force perpendicular to the local tangent relaxes each image toward the minimum-energy path. A naïve interpolation is only an initial guess: atom exchange, a poor collective coordinate, an abrupt bond rearrangement, or an unphysical close contact can place the chain on the wrong basin or cause it to cut a corner.

The number and placement of images control the resolution of the path; the spring treatment, tangent definition, optimizer, and image force criterion control its numerical behavior. There is no generally valid image count, spring constant, or force threshold. Refine where geometry or energy changes rapidly, compare physically distinct initial paths, and check that the final profile is stable to path representation rather than only to electronic SCF tolerance.

## Climbing images refine a candidate saddle, but must still be checked

In climbing-image NEB, a selected high-energy image loses its spring force along the path and reverses the parallel component of the potential force. When neighbouring images give a reliable tangent, this drives that image toward a saddle point. It should normally be enabled only after a non-climbing path has become a reasonable representation; otherwise the selected image can climb an artefact of the initial chain.

A converged CI-NEB image is evidence for a saddle-point candidate, not by itself proof of a transition state. Verify its residual force in the appropriate projected sense and analyse the Hessian or a validated local curvature calculation. A first-order saddle has one unstable mode that connects the intended basins; multiple negative modes, a mode leading elsewhere, or an unconverged orthogonal direction changes the interpretation. The path maximum, the climbing image, and a validated first-order saddle are related but not interchangeable labels.

## From an energy profile to a scientific claim

Report the endpoint identities, each image lineage, coordinate convention, energy reference, path initialization, optimizer and force definitions, image refinement tests, maximum-energy image, saddle validation, and every correction or thermodynamic term. Keep forward and reverse barriers separate when endpoints differ in energy. If a rate is claimed, state the kinetic theory, temperature, prefactor treatment, free-energy surface, recrossing assumptions, and whether nuclear quantum effects or multiple pathways have been considered.

Common failures include moving the wrong atoms during interpolation, inconsistent endpoint electronic states, allowing images to change cell or composition without defining that model, accepting a sparse path maximum as a saddle, and treating a lower barrier from one guessed path as global mechanism discovery. A static DFT NEB can support a conditional pathway and potential-energy barrier within its declared model. It cannot establish an experimental rate, selectivity, catalytic turnover, environmental mechanism, or exhaustive reaction network without further evidence.

## Sources and methods

- [Henkelman, Uberuaga, and Jónsson, climbing-image NEB](https://doi.org/10.1063/1.1329672)
- [Henkelman and Jónsson, improved NEB tangent](https://doi.org/10.1063/1.1323224)
- [Quantum ESPRESSO `neb.x` input description](https://www.quantum-espresso.org/Doc/INPUT_NEB.html)
- [Quantum ESPRESSO PWneb user guide](https://www.quantum-espresso.org/Doc/user_guide_PDF/neb_user_guide.pdf)
- [ASE NEB documentation](https://docs.ase-lib.org/ase/neb.html)
