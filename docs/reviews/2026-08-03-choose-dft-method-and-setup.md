# Choose the DFT Method and Computational Setup — scientific content review

## Scope

This review covers the public topic:

> B · Calculation Preparation → Choose the DFT Method and Computational Setup

The reviewed narrative is
`src/content/topics/choose-dft-method-and-computational-setup.md`.
It also covers the subordinate implementation guide
`src/content/practical-guides/select-download-and-record-pseudopotentials.md`.
The topic decision remains **reviewed within the declared educational scope**.
The practical-page addendum is **reviewed within the declared educational,
file-identity, and execution scope**.

This status means that the article has a coherent method-selection boundary,
uses suitable official or primary sources, and does not conflict with the current
A–E architecture. It does not validate any particular functional,
pseudopotential, PAW dataset, all-electron basis, Hubbard parameter, smearing,
electrostatic treatment, software implementation, or production DFT setup.

## Migration-source review

The superseded O07 and O08 narrative files were inspected:

- Specify the Physical Theory and Ensemble;
- Specify Numerical Representation and Boundary Treatment.

Both contained only neutral scaffold text. No scientific prose was migrated.
The new article treats physical approximation, electronic degrees of freedom,
core treatment, numerical representation, occupations, long-range interactions,
and electrostatic boundaries as one researcher-scale setup task. It does not
restore O07 and O08 as parallel public operations.

The old O09 and O10 ontology records were also reviewed as migration context.
Protocol design, convergence plans, executable input generation, and preflight
checks remain downstream implementation concerns. They are not promoted into
additional reader-facing method categories.

## Source review

### Code implementation and option compatibility

Quantum ESPRESSO 7.5 official `pw.x` documentation supports the discussion of
exchange–correlation selection, fixed and smeared occupations, tetrahedron
methods, collinear and noncollinear spin, spin–orbit coupling, Hubbard projectors,
dispersion options, isolated-system corrections, effective-screening media,
charged systems, and grand-canonical variants. It also documents restrictions
on particular combinations.

The article uses this documentation as an implementation example rather than a
universal definition of DFT. It does not reproduce code defaults as recommended
scientific settings.

- https://www.quantum-espresso.org/Doc/INPUT_PW.html

### Pseudopotentials, PAW, and data identity

Quantum ESPRESSO's official pseudopotential pages support the statement that the
code accepts norm-conserving, ultrasoft, and PAW data and that feature support can
depend on the chosen class. The UPF specification supports the discussion of
format version, valence charge, exchange–correlation label, relativistic flags,
nonlinear core correction, suggested cutoffs, and PAW or reconstruction data.

The Blöchl paper supports the PAW method's relation to augmented-wave and
pseudopotential approaches. Troullier and Martins support one influential
norm-conserving construction. PseudoDojo supports the need to generate and test
pseudopotential tables systematically.

The article limits these sources correctly: a readable data file, a method
label, or a suggested cutoff is not presented as evidence of transferability or
observable convergence.

- https://pseudopotentials.quantum-espresso.org/
- https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format
- https://doi.org/10.1103/PhysRevB.50.17953
- https://doi.org/10.1103/PhysRevB.43.1993
- https://doi.org/10.1016/j.cpc.2018.01.012

### Exchange–correlation approximations

The PBE, SCAN, and HSE papers support examples of distinct generalized-gradient,
meta-GGA, and screened-hybrid constructions. They do not support a universal
ranking for every material or observable. The article therefore describes their
ingredients and method identities without declaring one generally superior.

- https://doi.org/10.1103/PhysRevLett.77.3865
- https://doi.org/10.1103/PhysRevLett.115.036402
- https://doi.org/10.1063/1.1564060

### Hubbard corrections

Cococcioni and de Gironcoli support the connection between a linear-response
Hubbard parameter and the chosen definition of localized occupation matrices.
The article uses this to justify recording projectors, subspaces, conventions,
and parameter provenance. It does not claim that a single value of U is a
universal material or elemental constant.

- https://doi.org/10.1103/PhysRevB.71.035105

### Dispersion treatment

The original vdW-DF paper supports a nonlocal-correlation approach based on a
density-dependent kernel. Quantum ESPRESSO documentation shows that current
implementations distinguish nonlocal functionals from several atom-based or
many-body dispersion options. The article correctly treats these as different
physical approximations rather than interchangeable corrections.

- https://doi.org/10.1103/PhysRevLett.92.246401
- https://www.quantum-espresso.org/Doc/INPUT_PW.html

### Occupations, smearing, and electronic temperature

Mermin supports finite-temperature density functional theory in the grand
canonical ensemble. Methfessel and Paxton support a Brillouin-zone integration
scheme for metals. Quantum ESPRESSO documentation distinguishes fixed
occupations, tetrahedron methods, and several smearing kernels.

These sources support the article's central boundary: a smearing width used for
numerical integration is not automatically a physical electronic temperature.
The article does not prescribe a universal smearing kernel or width.

- https://doi.org/10.1103/PhysRev.137.A1441
- https://doi.org/10.1103/PhysRevB.40.3616
- https://www.quantum-espresso.org/Doc/INPUT_PW.html

### Electrostatic boundary treatment

Ismail-Beigi supports Coulomb-interaction truncation as a means of removing
selected periodic-image interactions for confined systems. Quantum ESPRESSO
documentation supports the existence and restrictions of isolated-system and
effective-screening boundary options.

The article does not claim that one correction is valid for every molecule,
slab, charged cell, gated layer, response calculation, or code. It keeps cell
size, residual image effects, and observable convergence for later testing.

- https://doi.org/10.1103/PhysRevB.73.233103
- https://www.quantum-espresso.org/Doc/INPUT_PW.html

## Scientific review findings

The article correctly preserves the following distinctions:

- the computational model defines the represented system, while the method setup
  defines the approximate electronic problem solved for that model;
- physical approximations and numerical discretizations are related but are not
  the same source of error;
- changing theory, Hamiltonian, ensemble, or boundary model tests physical or
  theoretical robustness, whereas refinement at fixed method tests numerical error;
- increasing a cutoff or grid cannot repair an inappropriate physical
  approximation;
- exchange–correlation families are not a universal accuracy ladder;
- a complete functional identity can require exchange, correlation, exact
  exchange, screening, range, or library-version information;
- all-electron, norm-conserving, ultrasoft, and PAW treatments use different core
  and valence representations;
- pseudopotential or PAW identity, valence partition, relativistic generation,
  and checksums are part of the method identity;
- a suggested cutoff is not a convergence result;
- basis-family choice is distinct from proving a sufficient basis size;
- non-spin-polarized, collinear, noncollinear, and spin–orbit-coupled
  calculations represent different electronic constraints;
- initial magnetic moments are starting hypotheses rather than ground-state
  evidence;
- DFT+U depends on subspace, projector, functional, convention, and parameter
  provenance;
- U is not treated as a universal elemental constant or an adjustable gap target;
- dispersion methods are distinct physical approximations with possible
  compatibility and double-counting issues;
- electron number, charge, occupations, smearing, electronic temperature, and
  chemical potential are not collapsed into one numerical choice;
- a numerical smearing is not automatically a Mermin finite-temperature
  ensemble;
- electrostatic boundary treatment must match dimensionality, charge, dipole,
  field, and environment;
- vacuum alone does not guarantee removal of long-range periodic interactions;
- total-energy references require compatible method identities;
- an accepted input and successful program exit do not establish methodological
  suitability or numerical convergence;
- the completed task produces a versioned method specification, not a converged
  production protocol.

## Editorial review

The article follows the natural logic of calculation preparation:

1. start from the scientific comparison;
2. separate the physical approximation from its discretization;
3. choose exchange–correlation treatment;
4. define core and valence treatment;
5. select a numerical representation;
6. decide spin and relativistic degrees of freedom;
7. define Hubbard corrections when needed;
8. include dispersion and long-range interactions deliberately;
9. distinguish charge, occupations, smearing, and temperature;
10. match electrostatic boundaries to the model;
11. keep reference calculations compatible;
12. check implementation restrictions;
13. record a versioned method identity;
14. hand numerical controls to the convergence task.

This organization is specific to the subject. It does not restore the former
Inputs/Outputs-style contract, and it does not turn each method decision into a
separate top-level operation.

## Deliberate limitations

This batch does not provide:

- a universal preferred functional, code, pseudopotential library, PAW dataset,
  all-electron method, or basis family;
- a recommended cutoff, FFT grid, k-point mesh, number of bands, smearing width,
  electronic temperature, vacuum size, or convergence threshold;
- a universal Hubbard U or J value;
- a universal dispersion or electrostatic correction;
- a production input file or licensed potential data;
- a material-specific benchmark;
- a complete treatment of GW, BSE, DMFT, quantum Monte Carlo, TDDFT, or other
  advanced methods that have their own target-calculation pages or future
  workflows;
- evidence that any selected method is accurate for a particular material;
- numerical convergence, physical validation, or support for a scientific claim.

These omissions keep the article at the method-selection boundary. The next
content topic is **Test Numerical Convergence**.

## External-link verification

The original review confirmed source relevance and rendered-link presence but did
not request the external destinations. All external sources in this article and
review are now declared in `sources/reviewed-links.json`. Deterministic
validation requires exact agreement between the article, this review, and that
manifest. A separate network CI job requests every declared destination under
the rules documented in
`docs/reviews/2026-08-03-reviewed-source-link-audit.md`.

## Evidence boundary

The semantic source review establishes that the article represents the cited
methods and official documentation within its declared educational scope. The
dedicated external-link audit establishes HTTP reachability only at its recorded
run time. Browser smoke establishes rendered-link presence and page behaviour;
it does not establish external destination availability. None of these checks
validates a real computational setup, a production calculation, a numerical
result, or a scientific conclusion.

## Pseudopotential practical-depth addendum (2026-08-11)

The new subordinate guide records a trusted library, exact file, XC treatment,
valence, relativity, provider starting cutoffs, source, release, licence, and
SHA-256 identity. The manual browser and shell route is complete before the
optional companion is introduced.

`examples/practical-guides/pseudopotential_receipt.py` reads a user-written
receipt and optionally one local file. It checks required field shape, date and
URL syntax, SHA-256 syntax, and optional local filename/hash identity. It does
not download a pseudopotential or establish provider authenticity,
transferability, numerical convergence, or scientific validity.

Pseudopotential generation remains an advanced branch requiring preserved
generator identity and inputs, atomic tests, transferability tests, solid-state
tests, and a justified reference comparison. Normal generator termination does
not accept a new dataset.

Quantum ESPRESSO is a reference implementation, not the definition of DFT.
Alternative software objects and access restrictions remain governed by their
current official manuals and licences. No pseudopotential payload or licensed
dataset is added to the repository by this guide.
