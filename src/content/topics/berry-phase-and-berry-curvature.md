---
topic_slug: berry-phase-and-berry-curvature
status: reviewed
---

Berry phase and Berry curvature describe the geometry of a chosen electronic-state bundle over a parameter space, most often the Brillouin zone. They connect compatible wave functions to polarization changes, orbital and Hall responses, and later topological tests. They do not follow from eigenvalues alone: a band plot can be smooth while the wave-function gauge, band subspace, or Brillouin-zone sampling needed for a geometric quantity is wrong.

## Inspect the reciprocal-space object with its domain visible

Start from an identified occupied or target subspace and specify the reciprocal basis, loop or integration domain, orientation, occupations, SOC/magnetic state, operator, and gauge-compatible representation. Plot Wilson-loop or hybrid-centre phases against the loop parameter, or plot Berry curvature with the sampled Brillouin-zone plane and sign scale visible. Inspect continuity, partner switching, sharp hot spots, near-degeneracies, clipping, and whether the plotted domain actually covers the integral used in the claim.

Calculate overlaps or matrix elements and converge the phase, curvature integral, or response against mesh, windows, smearing, and model choices. A smooth WCC flow still needs subspace and mesh checks; a line or plane colour map is not a full-zone result. Wannier, Berry, browser, and topology tools are indexed under [electronic properties](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools). This overview does not claim an executed Berry calculation.

When a validated [Wannier90](/DFT-Research-Workflow/tools/wannier90/) representation is used, keep the parent `.win`, interface files, `.wout`, checkpoint, real-space Hamiltonian, `postw90` input, stdout/stderr, and the raw loop or curvature table before plotting. Run `postw90.x seed` only after the interpolation and relevant operator matrix elements have been checked against the parent calculation. Plot the sampled reciprocal domain and orientation alongside the values, and retain unclipped signed data. If the occupied/target subspace changes, a near-degeneracy makes a single-band value ill-conditioned, an apparent integer drifts with mesh, or hot spots sit between sampled points, refine the subspace and integration rather than rounding or smoothing the result.

## A phase around a closed loop

For an isolated cell-periodic Bloch state $\lvert u_{n\mathbf{k}}\rangle$, the Berry connection is

$$
\mathbf A_n(\mathbf k)
= i\langle u_{n\mathbf k}|
\nabla_{\mathbf k}u_{n\mathbf k}\rangle .
$$

and its line integral around a closed loop $C$ gives $\gamma_n(C)=\oint_C\mathbf A_n(\mathbf k)\cdot d\mathbf k$, defined modulo $2\pi$. Here $\mathbf k$ is crystal momentum and $n$ is a band label. Changing the phase of every $|u_{n\mathbf k}\rangle$ changes the local connection but changes a closed-loop phase only by an integer multiple of $2\pi$. A reported phase therefore needs the loop, reciprocal-cell convention, selected subspace, occupation, and branch convention; an isolated number without those objects cannot be compared.

At a degeneracy, or whenever several states must be treated as one occupied or target subspace, individual band phases are generally not gauge-safe. The object is then an overlap or Wilson-loop matrix transported around the loop. Its eigenphases can be meaningful after the subspace and loop have been declared. Sorting bands by energy point-by-point through a crossing is not a replacement for parallel transport of the appropriate subspace.

## Curvature is a local geometric field, not a map of band energies

The Berry curvature is the curl of the connection,

$$
\boldsymbol{\Omega}_n(\mathbf k)
= \nabla_{\mathbf k}\times\mathbf A_n(\mathbf k).
$$

It is a vector in three-dimensional $\mathbf k$ space (or an antisymmetric tensor in general coordinates). In a non-degenerate representation it can also be written with velocity matrix elements and energy denominators. This makes a practical warning explicit: small gaps, avoided crossings, spin--orbit splittings, and the selected Hamiltonian can create sharply structured curvature even when a plotted dispersion looks innocuous. Near exact degeneracy, the single-band expression is ill-conditioned and a multiband treatment is required.

Curvature has units set by the reciprocal-coordinate convention, usually length squared for Cartesian $\mathbf k$; it is not a density of states, magnetic field in real space, orbital moment, Chern number, or conductivity. A colour scale hides sign, coordinate, energy reference, spin channel, and clipping choices unless they are recorded. A high-curvature spot on a path or plane is evidence about that sampled representation only, not a full-zone integral or a material response.

## From wave-function overlaps to a measurable difference

In a periodic insulator, the modern theory of polarization uses occupied-band Berry phases. Absolute bulk polarization is multivalued: changing the real-space cell or phase branch shifts it by a polarization quantum. The physically comparable quantity is normally a polarization *difference* along a specified insulating adiabatic path, with the same charge convention, cell, occupied subspace, and branch unwrapping. A difference between unrelated endpoints, a metallic path, or inconsistent cells does not acquire a unique spontaneous polarization merely because a code prints two Berry phases.

For a two-dimensional gapped subspace, a Brillouin-zone integral can form a Chern number,

$$
C
= \frac{1}{2\pi}\sum_n
\int_{\mathrm{BZ}}
\Omega_n(\mathbf k)\,d^2k .
$$

The sum runs over the declared occupied or target bands. $C$ is dimensionless only after the full periodic zone, orientation, gauge-compatible subspace, and gap condition have been specified. The same curvature, weighted by occupations and other factors, can enter intrinsic anomalous or spin Hall calculations. Those observables additionally require a chemical potential, temperature, spin/operator definition, symmetry and magnetic state, and convergence of the full-zone integral. They are not determined by $C$, and an intrinsic clean-crystal term does not include every disorder or experimental contribution to a Hall measurement.

## Numerical evidence follows the observable

The calculation consumes a state-identical parent Hamiltonian or a separately validated reduced representation, wave-function overlaps or matrix elements, reciprocal lattice and neighbour connectivity, a declared subspace, and occupations. Gauge smoothing can improve numerical transport but must not silently swap the physical subspace. When Wannier interpolation is used, validate its parent-band agreement and operator matrix elements before trusting a dense curvature mesh; an interpolated grid cannot restore missing parent information.

Converge the target phase, curvature integral, or response against the mesh and integration method relevant to its sharp features. Repeat with sensible changes in subspace/windows, SOC and magnetic conventions, symmetry treatment, and smearing or chemical potential where applicable. SCF convergence, a smooth plot, an integer-looking value on one mesh, or cancellation under an imposed symmetry is not sufficient evidence that the intended geometric observable is converged.

Preserve the structure, parent-state and representation hashes; code versions; basis or potential identity; reciprocal basis; k mesh and links; selected bands and occupations; gauge or Wilson-loop construction; branch and orientation convention; operator definition; convergence series; and raw values before plotting. **Wannier Function Construction** can provide a representation but not the geometric result itself. **Topological Invariants and Boundary States** tests global topology and bulk--boundary correspondence, while **Electronic Transport** requires a distinct transport model. This topic does not establish a topological phase, protected boundary state, quantized transport, ferroelectric switching, or a material conclusion.

## Sources and methods

- [Berry, quantum phase factors accompanying adiabatic changes](https://doi.org/10.1098/rspa.1984.0023)
- [King-Smith and Vanderbilt, Berry-phase polarization](https://doi.org/10.1103/PhysRevB.47.1651)
- [Xiao, Chang, and Niu, Berry-phase effects on electronic properties](https://doi.org/10.1103/RevModPhys.82.1959)
- [Wannier90 Berry module](https://wannier90.readthedocs.io/en/latest/user_guide/postw90/berry/)
- [Wannier90 iron Berry-curvature tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_18/)
