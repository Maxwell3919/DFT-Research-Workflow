---
topic_slug: obtain-material-structure
status: reviewed
---

A structure file is not yet a computational model. This task ends with an unchanged source artifact, a checked working copy, and a record of what the selected structure does and does not establish.

## Begin with the human source search

Start with the material, phase, composition, pressure, temperature, and structural question—not with a downloader or a filename. Read the primary paper and supplementary information when they identify the experimental sample or computational structure. Search and compare records in a browser when phase, polymorph, disorder, cell choice, or provenance is ambiguous.

[Browse structure databases, repositories, and access routes](/DFT-Research-Workflow/operations/resource-landscape/#structures-data). Institutional and subscription databases are valid research routes when access is available; retain the stable identifier and citation without redistributing restricted content.

## Compare source records

Different source classes answer different questions:

| Source object | Use it when | Preserve and distrust |
| --- | --- | --- |
| Primary paper, supplementary file, or deposition | The study-specific sample, phase, or model must be recovered | Preserve the publication/deposition identity and conditions; a paper attachment can still be incomplete or ambiguous |
| Experimental crystallographic database record | A measured crystal structure and refinement record are needed | Inspect phase, temperature, pressure, occupancy, disorder, uncertainty, and original publication |
| Computed database or calculation archive | A computed candidate or previous calculation lineage is needed | Preserve material/task identity, method, source calculation, cell representation, and retrieval date; do not call it experimental |
| Prototype, substitution, or generated structure | No deposited structure exists or a controlled hypothesis is required | Record the generator, parent, substitutions, imposed symmetry, and every construction choice; do not assign an experimental identity |
| Existing project artifact | A previous model may be reused | Require its parent, transformations, software/version, and calculation ancestry; a familiar filename is not provenance |

A **generated or hypothetical structure** is not experimental evidence. Keep its declared origin and construction choices separate from any deposited record identity.

Two useful browser starting points are the [Crystallography Open Database](https://www.crystallography.net/cod/) for openly downloadable experimental CIF records and Materials Project for computed structures tied to calculation provenance: [Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data) and [Understanding Structures and Properties](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project). An experimental deposition and a DFT-relaxed database structure remain different source objects even when they share a formula.

## Manual route: download and inspect the CIF as text

The bounded practical example uses Silicon COD ID `9013102`. The record reports formula Si, $a=b=c=5.4304$ Å, $\alpha=\beta=\gamma=90^\circ$, space group 227 (`F d -3 m`), diffraction temperature `298.15 K`, atomic coordinates, and no reported disorder. These are facts about that deposited record, not a universal Silicon model.

[Inspect the COD Silicon record in a browser and viewer](/DFT-Research-Workflow/operations/obtain-material-structure/examples/inspect-cod-silicon-record/). On another study, apply the same route to the actual selected record rather than copying this Silicon identity or its numbers.

Use the record's download control. Keep the downloaded object unchanged in a source directory, save the record URL or citation beside it, and make a working copy before conversion. Confirm that the browser saved a CIF rather than an HTML error or sign-in page before opening it.

### Read the CIF before asking a converter to interpret it

A CIF is structured text. Locate its data block, cell, symmetry, atom-site loop, occupancy, bibliographic fields, and any warnings or alternate blocks:

```bash
head -n 40 source/9013102.cif
grep -n -E '^data_|^loop_|^_cell_|^_space_group_|^_symmetry_' \
  source/9013102.cif | less
grep -n -E '^_atom_site_(label|type_symbol|fract_[xyz]|occupancy)' \
  source/9013102.cif
wc -l -c source/9013102.cif
```

Fractional coordinates locate a site through

$$
\mathbf{r}=x\mathbf{a}+y\mathbf{b}+z\mathbf{c}.
$$

They are not Cartesian coordinates in ångströms. A CIF may store only asymmetric-unit sites, so atom-site rows need not equal the symmetry-expanded atom count. Occupancy below one can represent vacancies, substitutions, split positions, or an average disordered structure.

A value below one is therefore not a small numerical defect to be rounded away. Choosing that representation belongs to **Build or Modify a Computational Model**.

## Manual route: inspect the structure visually

Open the unchanged CIF in a crystallographic viewer such as VESTA, or in another tool chosen from the [visual and symmetry resource list](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry). Show the unit-cell boundary, rotate along each lattice direction, and inspect composition, periodicity, coordination, implausibly short contacts, duplicated sites, layer or chain continuity, and any vacuum direction. Measure suspicious distances rather than trusting display bonds.

Browser viewers such as the [hosted Mol* example](https://molstar.org/viewer/?hide-controls=1&url=https%3A%2F%2Fmaxwell3919.github.io%2FDFT-Research-Workflow%2Fexamples%2Fcif%2Fsilicon-cod-9013102-expanded.cif&url-format=cifCore) are useful for quick interaction, but confirm which object was loaded. The site example is an expanded teaching representation, not the byte-for-byte COD download. Visual plausibility can reveal a wrong cell, orientation, conversion, or image contact; it cannot establish provenance, convergence, or stability.

If the picture and raw atom-site data disagree, stop. Resolve the selected data block, symmetry expansion, disorder model, parser warning, or conversion before continuing.

## Numerical and symmetry checks

After the text and exact-file visual inspection, parse the same working copy. Record the parser and version, selected data block, warnings, inferred or discarded fields, and source checksum. Check composition reconstructed from sites and occupancies, cell metrics and volume, duplicate or near-duplicate sites, periodic minimum distances, reported and detected symmetry, and site counts before and after expansion or conversion.

For a local ASE route, inspect and convert only the working copy:

```bash
ase info --files working/9013102-as-downloaded.cif
ase gui working/9013102-as-downloaded.cif
ase convert -i cif -o extxyz \
  working/9013102-as-downloaded.cif \
  working/9013102-converted.extxyz
ase info --files working/9013102-converted.extxyz
ase gui \
  working/9013102-as-downloaded.cif \
  working/9013102-converted.extxyz
```

Reopen the written descendant, not only the in-memory object. Compare cell, composition, site count, coordinates, periodicity, occupancy representation, and geometry with the source. Conversion can lose symmetry, uncertainties, labels, magnetic information, and provenance, so a visually similar child is not automatically equivalent.

Numerically detected symmetry is tolerance-dependent. Changing `symprec` can change operations, equivalent-site grouping, or the standardized cell. Preserve the tolerance, transformation, origin shift, equivalent-site mapping, and both input and standardized objects. An intentionally constructed supercell is not automatically replaceable by a smaller cell. The [spglib Python API](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html) documents these returned objects.

IUCr [checkCIF](https://checkcif.iucr.org/) can screen syntax, geometry, symmetry, and refinement issues. Read every alert in the context of the paper and refinement record. They are not a certificate that the structure is suitable for a particular DFT calculation.

## Optional automation: retrieve and preserve the CIF

After the browser route is understood, the same public record can be retrieved into an explicit source/working layout:

```bash
mkdir -p structures/si-cod-9013102/{source,working}
cd structures/si-cod-9013102
COD_BASE=https://www.crystallography.net/cod/
curl -fL \
  -o source/9013102.cif \
  "${COD_BASE}9013102.cif"
sha256sum source/9013102.cif | tee source/SHA256SUMS
cp source/9013102.cif working/9013102-as-downloaded.cif
```

`curl -fL` records a repeatable retrieval and fails on an HTTP error. It does not prove that the response is the intended phase. Reopen `working/9013102-as-downloaded.cif` with the same text and visual checks above; the checksum binds bytes but does not validate crystallography or model suitability.

## Decide whether to continue

Continue only when formula, phase or polymorph, cell, sites, occupancy, symmetry, source conditions, and visible geometry are mutually understandable. If coordinates, composition, or phase cannot be reconciled with the cited source, preserve the artifact and ambiguity but do not promote it to model construction.

## The result of this task

The handoff contains the unchanged source object and stable identifier, retrieval information and checksum, a parsed working representation, text and visual observations, numerical and symmetry checks, every conversion already applied, and unresolved alternatives.

It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable.

When that handoff is ready, [build or modify the computational model](/DFT-Research-Workflow/operations/build-or-modify-computational-model/) that represents the scientific question.

## Sources and standards

- S. R. Hall, F. H. Allen, and I. D. Brown, “[The crystallographic information file (CIF): a new standard archive file for crystallography](https://doi.org/10.1107/S010876739101067X),” *Acta Crystallographica Section A* **47**, 655–685 (1991).
- International Union of Crystallography, “[checkCIF](https://checkcif.iucr.org/).”
- Materials Project, “[Understanding Structures and Properties in the Materials Project](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project).”
- Materials Project, “[Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data)” and “[Frequently Asked Questions](https://docs.materialsproject.org/frequently-asked-questions).”
- Crystallography Open Database, “[database information and access](https://www.crystallography.net/cod/).” The Silicon example uses COD ID `9013102`.
- Mol*, “[hosted viewer used for the interactive CIF example](https://molstar.org/viewer/?hide-controls=1&url=https%3A%2F%2Fmaxwell3919.github.io%2FDFT-Research-Workflow%2Fexamples%2Fcif%2Fsilicon-cod-9013102-expanded.cif&url-format=cifCore).”
- spglib, “[Python API documentation](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html).”
