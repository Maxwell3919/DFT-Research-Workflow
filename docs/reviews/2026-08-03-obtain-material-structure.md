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
the introductory explanation of CIF as a structured crystallographic exchange
format and the later discussion of atom-site data, including occupancy. They
support the distinction between lattice parameters, fractional atom-site data,
symmetry-generated sites, and a simplified coordinate export.

- https://doi.org/10.1107/S010876739101067X

### Crystallographic validation

IUCr checkCIF supports the statement that automated checks can cover syntax,
cell and geometry details, space-group symmetry, displacement parameters, and
structure factors when supplied. The article explicitly limits this evidence:
checkCIF is not presented as a DFT-readiness certificate.

- https://checkcif.iucr.org/

### Computational-database provenance and representation

Materials Project documentation supports the discussion of material identifiers,
database versions, task origins, calculation methods, non-unique unit-cell
representations, and data retrieval.

- https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project
- https://docs.materialsproject.org/downloading-data/using-the-api/querying-data
- https://docs.materialsproject.org/frequently-asked-questions

### Open crystallographic data and the silicon teaching example

The Crystallography Open Database supports the example of an openly accessible
crystallographic collection whose data are provided under CC0 while original
structure authors should still be acknowledged. The article uses COD ID
`9013102` as a bounded record-reading example. The record identifies silicon,
reports a cubic cell with `a = b = c = 5.4304 Å`, space group 227
(`F d -3 m`), an ambient diffraction temperature of 298.15 K, coordinates
present, and no reported disorder.

The interactive figure does not claim to reproduce the deposited CIF byte for
byte. The site stores a separate teaching snapshot that keeps the reported cell
and diamond-cubic silicon geometry while explicitly expanding the conventional
cell into eight fully occupied sites and declaring `P 1`. That transformation is
stated in both the file and the figure caption. The deposited COD record remains
the source record; the local snapshot is only a stable visualization artifact.

- https://www.crystallography.net/cod/

### Interactive visualization

The page delegates only the interactive rendering surface to the hosted Mol*
viewer. The generic URL loader is configured with Mol*'s registered `cifCore`
trajectory format so that the site-local crystallographic CIF is parsed into a
structure before the default representation is rendered. This dependency does
not become a crystallographic source or a DFT validation method.

- https://molstar.org/viewer/?hide-controls=1&url=https%3A%2F%2Fmaxwell3919.github.io%2FDFT-Research-Workflow%2Fexamples%2Fcif%2Fsilicon-cod-9013102-expanded.cif&url-format=cifCore

### Numerical symmetry detection

spglib documentation supports the description of `symprec` as a length tolerance
in symmetry search and the distinction between ordinary and magnetic symmetry
information. The article does not prescribe one universal tolerance.

- https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html

## Scientific review findings

The article correctly keeps the following distinctions visible:

- CIF is introduced as a crystallographic data representation, not as a synonym
  for a DFT-ready geometry;
- lattice parameters, atom-site fractional coordinates, symmetry, occupancy, and
  provenance are related but distinct parts of the record;
- fractional coordinates are interpreted through the lattice vectors rather
  than as Cartesian ångström coordinates;
- a visualizer may expand asymmetric-unit sites using symmetry, so the visible
  atom count need not equal the number of atom-site rows stored in the source CIF;
- the interactive silicon view is a derived teaching representation, not the
  original COD artifact, an accepted computational model, or a validation benchmark;
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
- obtaining or visualizing a structure does not establish phase stability,
  synthesizability, or validity of a later DFT conclusion.

## Editorial review

The article begins with the practical sequence a new researcher needs: what a CIF
is, where a structure can be obtained, and how to inspect one real database
record. The interactive view is placed directly beside that record rather than
made into a separate tool catalogue or a second workflow stage.

The later sequence remains topic-specific: source meaning, preservation,
crystallographic semantics, identity, conversion, symmetry, geometry inspection,
comparison, and handoff. The page contains no universal cutoff, symmetry
tolerance, bond-distance threshold, or database ranking.

## Visualization implementation boundary

The page remains static-first. Its scientific text, links, and CIF teaching
snapshot are available without site-side client hydration. The interactive
region is a direct external iframe to the hosted Mol* viewer, whose generic URL
loader receives the absolute URL of the deployed site-local teaching CIF and the
registered `cifCore` format key. Failure of that external viewer does not remove
the source discussion or the local CIF artifact.

The visualization establishes only that the declared teaching representation can
be parsed and rendered interactively. It does not independently validate the
deposited COD record, the transformation to the teaching snapshot, or suitability
for a DFT calculation.

## Deliberate limitations

The silicon section is a **record-reading and visualization example**, not a
worked DFT calculation. This batch still does not include:

- an executable parser comparison;
- a complete catalogue or ranking of crystallographic and computational databases;
- a byte-for-byte reproduction of the external CIF;
- detailed magnetic-CIF, modulated-structure, twinning, or powder-refinement tutorials;
- quantitative geometry thresholds that could be misused as universal rules;
- construction of ordered disorder models, slabs, monolayers, defects, surfaces,
  or heterostructures;
- validation of a specific external structure for a particular DFT study.

Those limits keep the article at the intended source-acquisition boundary. The
next content topic is **Build or Modify a Computational Model**.

## External-link verification

The hosted Mol* viewer URL is an explicit reviewed external dependency, so it is
declared together with the scientific-source URLs in
`sources/reviewed-links.json`. The local teaching CIF remains an internal
artifact and is checked separately by the exact-SHA browser smoke.

Deterministic validation requires exact agreement between the article, this
review, and that manifest. A separate network CI job requests every declared
destination under the rules documented in
`docs/reviews/2026-08-03-reviewed-source-link-audit.md`.

## Evidence boundary

The semantic source review establishes that the article represents the cited
sources within its declared scope. The dedicated external-link audit establishes
HTTP reachability only at its recorded run time. Browser smoke must establish
three separate facts for this example: the deployed teaching CIF returns
successfully, Mol* creates an actual structure containing at least the eight
explicit teaching-snapshot sites, and a rendered representation exists. A canvas
or successful CIF HTTP request alone is insufficient. None of these checks
establishes that an arbitrary structure file is correct, complete, stable, or
suitable for a particular DFT calculation.
