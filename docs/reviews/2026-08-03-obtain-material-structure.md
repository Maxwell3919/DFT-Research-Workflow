# Obtain a Material Structure — scientific content review

## Scope

This review covers only the public topic:

> A · Structures → Obtain a Material Structure

The reviewed narrative is `src/content/topics/obtain-material-structure.md`.
The decision is **reviewed within the declared educational scope**.

This status means the article has a coherent scientific boundary, appropriate
primary or official sources, and no known contradiction with the current A–E
architecture. It does not validate any real material structure or certify that a
particular downloaded file is suitable for calculation.

## Migration-source review

The superseded O01–O04 narrative files were inspected:

- Acquire Source Objects;
- Parse and Normalize Artifacts;
- Verify Identity and Integrity;
- Canonicalize Crystallographic Representation.

All four contained only neutral scaffold text. No scientific prose was migrated
from them. The new article was written directly at researcher-task granularity
and does not preserve the former four-page split.

## Source review

The article uses the following source classes.

### Crystallographic Information Framework

IUCr documentation, the original CIF paper, and the core CIF dictionary support
the discussion of CIF as a structured crystallographic exchange format and the
meaning of atom-site data, including occupancy. They support the distinction
between the crystallographic record and a simplified coordinate export.

- https://doi.org/10.1107/S010876739101067X
- https://www.iucr.org/resources/cif/documentation
- https://www.iucr.org/resources/cif/dictionaries/browse/cif_core1

### Crystallographic validation

IUCr checkCIF supports the statement that automated checks can cover syntax,
cell and geometry details, space-group symmetry, displacement parameters, and
structure factors when supplied. The article explicitly limits this evidence:
checkCIF is not presented as a DFT-readiness certificate.

- https://checkcif.iucr.org/

### Computational-database provenance and representation

Materials Project documentation supports the discussion of material identifiers,
database versions, task origins, calculation methods, and non-unique unit-cell
representations. It also supports the warning that automatic symmetry reduction
can occasionally produce an inappropriate representation.

- https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project
- https://docs.materialsproject.org/downloading-data/using-the-api/querying-data
- https://docs.materialsproject.org/frequently-asked-questions

### Open crystallographic data and reuse boundaries

The Crystallography Open Database supports the example of an openly accessible
crystallographic collection whose data are provided under CC0 while original
structure authors should still be acknowledged. The article does not generalize
this licence to other databases.

- https://www.crystallography.net/cod/

### Numerical symmetry detection

spglib documentation supports the description of `symprec` as a length tolerance
in symmetry search and the distinction between ordinary and magnetic symmetry
information. The article does not prescribe one universal tolerance.

- https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html

## Scientific review findings

The article correctly keeps the following distinctions visible:

- experimental, computed, inherited, and hypothetical structures carry different
  evidence and provenance;
- the original artifact is preserved separately from parsed, normalized, or
  converted representations;
- a checksum establishes artifact identity, not scientific correctness;
- partial occupancy is preserved as unresolved structural information rather
  than rounded into an explicit atom;
- selecting an ordered or approximate disorder representation belongs to model
  construction, not source acquisition;
- experimental and DFT-relaxed structures are not interchangeable without an
  explicit role in the study;
- unit-cell standardization and primitive-cell reduction are representation
  changes only when physical content and site mappings are preserved;
- detected symmetry depends on software, supplied information, and tolerances;
- automated validation identifies issues for review but does not replace
  chemical or DFT-specific judgement;
- extracting a monolayer, adding vacuum, choosing magnetic order, constructing a
  supercell, or selecting a defect configuration belongs to the next task;
- obtaining a structure does not establish phase stability, synthesizability, or
  validity of a later DFT conclusion.

## Editorial review

The article uses a topic-specific explanatory sequence rather than the former
Inputs/Outputs-style contract. Its organization follows the scientific problem:
source meaning, preservation, crystallographic semantics, identity, conversion,
symmetry, geometry inspection, comparison, and handoff.

The source list is separated from the explanatory text, and code-specific details
are examples rather than definitions of the task. The page contains no universal
cutoff, symmetry tolerance, bond-distance threshold, or database ranking.

## Deliberate limitations

This batch does not include:

- a worked material example;
- an executable parser comparison;
- a complete catalogue of crystallographic databases;
- detailed magnetic-CIF, modulated-structure, twinning, or powder-refinement
  tutorials;
- quantitative geometry thresholds that could be misused as universal rules;
- construction of ordered disorder models, slabs, monolayers, defects, surfaces,
  or heterostructures;
- validation of a specific external structure.

Those omissions keep the article at the intended source-acquisition boundary.
The next content topic is **Build or Modify a Computational Model**.

## Evidence boundary

The scientific review establishes that the article accurately represents the
cited sources within its declared scope. Repository, type, build, link, and
browser checks establish software behaviour only. Neither review establishes
that an arbitrary structure file is correct, complete, stable, or suitable for a
particular DFT calculation.
