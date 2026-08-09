---
topic_slug: build-or-modify-computational-model
status: reviewed
---

A computational model is the explicit system sent to a calculation: atoms, composition, cell, periodicity, charge, candidate order, constraints, and every deliberate departure from the source structure. The result of this task is often a **model family**, not one privileged file.

## Start from the question and the checked source

Name the comparison or observable first. Then identify the smallest model that can represent it. A primitive bulk cell cannot represent an isolated defect, a surface, a long-period magnetic order, or an interface. A slab built for one coverage is not automatically the model for another.

Before transforming anything, create a model workspace and inventory the checked source object:

```bash
mkdir -p models/{source,candidates,records}
pwd
find models -maxdepth 2 -type f -print
sha256sum structures/si-cod-9013102/working/9013102-as-downloaded.cif \
  > models/records/source.sha256
```

The checksum binds the parent bytes. It does not say that the parent is the correct physical model. Copy or reference the checked working artifact; never overwrite the unchanged database download.

Write one sentence that states what the model approximates: periodic bulk, isolated object, low-dimensional layer, surface, defect, adsorbate, interface, ordered composition, magnetic pattern, or constrained geometry. That sentence determines which periodic images, compositions, length scales, and degrees of freedom must remain visible.

## Record every transformation

For each child model, preserve:

```text
candidate identifier
parent identifier and checksum
tool, version, script, and command
transformation parameters and matrix
site mapping and species changes
parent and child composition
parent and child cell and periodicity
charge, magnetic initialization, and constraints
output filename and checksum
reason this candidate exists
```

After a tool creates a child, inspect and hash it rather than trusting a picture or filename:

```bash
study_root="$(pwd -P)"
candidate_dir="$study_root/models/candidates"
source_ledger="$study_root/models/records/source.sha256"
candidate_ledger="$study_root/models/records/candidate-files.sha256"

test -n "$(find "$candidate_dir" -type f -print -quit)"
(
  cd "$candidate_dir"
  find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum
) > "$candidate_ledger"

if diff -u "$source_ledger" "$candidate_ledger"; then
  printf '%s\n' 'No byte/path-ledger differences detected.'
else
  diff_status=$?
  if [ "$diff_status" -eq 1 ]; then
    printf '%s\n' 'Ledger differences detected; inspect the parsed parent and children.'
  else
    printf 'diff failed with status %s\n' "$diff_status" >&2
    exit "$diff_status"
  fi
fi
```

Run this block from the study directory that contains `models/`. The quoted absolute variables fix that working context, while the subshell records candidate paths relative to `models/candidates/`. `find -type f -print0`, `sort -z`, and `xargs -0` include nested regular files deterministically without breaking on spaces. The non-empty check prevents an empty directory from being mistaken for a completed inventory.

Each digest binds the exact bytes of one preserved artifact at its recorded path. A `diff` status of zero means the two ledgers are textually identical; status one means they differ; any greater status is an execution error and stops the operation. A path-ledger difference does not by itself establish that two structures have different scientific identities, and equal bytes do not establish that a model is suitable. Parse the parent and every child and compare the cell matrix, species and occupancies, coordinates, periodic-boundary flags, atom mapping, and declared transformation before accepting the model.

## Distinguish representation changes from model changes

Wrapping fractional coordinates, shifting an origin, reordering atoms, or changing between exactly equivalent primitive and conventional cells can preserve the ideal periodic structure when the transformation and site mapping are retained. An unchanged integer repeat can also be an equivalent representation of the same perfect crystal.

Strain, substitution, deletion, charge, ordering, a slab cut, vacuum, termination, adsorbate, interface, magnetic pattern, or constraint changes the physical model. The distinction must be recorded because it may not be recoverable from the final coordinate file.

Use the practical guides on this page to execute bounded transformations with ASE or pymatgen. Their generated examples establish software behaviour and object checks only; they do not select a scientifically correct material model.

## Check the child object before calculation

For every candidate, inspect:

- composition, atom count, atom order, and site mapping;
- cell vectors, volume, periodic directions, and shortest relevant image separations;
- duplicate atoms, collisions, coordination, and dimensionality;
- imposed strain, supercell matrix, vacuum, orientation, and termination;
- defect site, concentration, adsorbate count, coverage, and registry where relevant;
- charge, initial magnetic pattern, active constraints, and symmetry treatment;
- relation to alternative candidates that remain untested.

A generated child is a starting hypothesis. A generated candidate is not a predicted ground state. A surface builder does not prove a termination stable; one named adsorption site does not establish a preferred geometry; deleting one atom does not define a charged defect; assigning a common interface cell does not predict zero lattice mismatch. Choosing a charge state changes the model even before an electronic-structure method is selected. No universal lattice-mismatch threshold decides whether an interface is acceptable.

## Match the model family to the unresolved alternatives

Create separate candidates when the question admits different polymorphs, defect sites, reconstructions, terminations, adsorbate orientations, interface registries, magnetic patterns, or ordered approximations to disorder. Reduce the family only with explicit rules such as exact duplication, symmetry equivalence, impossible stoichiometry, severe overlap, or incompatible boundary conditions.

One ordered cell is not a random alloy. Preserve the original composition and occupancy information, the approximation used to replace disorder, and the alternative configurations that remain outside the selected model.

Cheap energies, geometric scores, electrostatic ranks, or machine-learned estimates can prioritize candidates. Preserve them as screening evidence. They neither establish a DFT ground state nor disprove a rejected candidate.

Periodic size is part of the model. A supercell is a modelling choice, not merely a larger file. A supercell fixes defect concentration and allowed wavelengths; a lateral slab cell fixes coverage; a low-dimensional cell fixes the image geometry. Vacuum is part of the boundary model, not empty experimental material. There is no universal supercell, vacuum, layer-count, or lattice-mismatch threshold. Those controls require convergence against the target observable.

Constraints are assumptions written into the model. Fixed layers, selected coordinates, cell restrictions, imposed symmetry, and magnetic patterns must identify affected atoms or components and their physical justification. A constrained stationary point is not an unconstrained minimum.

## Decide which candidates continue

Promote a candidate only when its source lineage, transformation, composition, geometry, periodicity, charge, constraints, and unresolved alternatives are explicit. Keep rejected candidates with the rule that rejected them. If an output cannot be reconstructed from its parent and recorded command, repair the lineage before choosing a DFT method.

## The result of this task

This stage does not establish that a model is stable, experimentally realized, numerically converged, or the ground state. It ends with one or more explicit, reconstructable model objects tied to the scientific question.

Next, choose the exchange–correlation treatment, electron–ion data, spin and relativistic degrees of freedom, boundary treatment, numerical representation, software version, and compatible reference scheme. Then test the numerical controls against the quantity that will be used.

## Sources and methods

- [ASE: Building things](https://docs.ase-lib.org/ase/build/build.html)
- [ASE: Surfaces, vacuum, and adsorbates](https://docs.ase-lib.org/ase/build/surface.html)
- [ASE: The Atoms object and periodic boundary conditions](https://docs.ase-lib.org/ase/atoms.html)
- [ASE: Constraints](https://docs.ase-lib.org/ase/constraints.html)
- [pymatgen transformations](https://pymatgen.org/pymatgen.transformations.html)
- [pymatgen interface construction](https://pymatgen.org/pymatgen.analysis.interfaces.html)
- [pymatgen magnetic-structure analysis and enumeration](https://pymatgen.org/pymatgen.analysis.magnetism.html)
- [Zur and McGill, “Lattice match: An application to heteroepitaxy”](https://doi.org/10.1063/1.333084)
- [Zunger et al., “Special quasirandom structures”](https://doi.org/10.1103/PhysRevLett.65.353)
- [Freysoldt et al., “First-principles calculations for point defects in solids”](https://doi.org/10.1103/RevModPhys.86.253)
