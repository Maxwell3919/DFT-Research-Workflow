---
topic_slug: obtain-material-structure
status: reviewed
---

A structure file is not yet a computational model. This task is to identify the exact structure record, understand what it encodes, and preserve enough provenance to decide whether it can be used as the starting point for a calculation.

## First: what is a CIF?

A **CIF (Crystallographic Information File)** is a structured text format for crystallographic data. For DFT work, the most important fields are the unit cell, atomic sites, symmetry, occupancy, and source information.

A typical CIF contains entries such as:

```text
_cell_length_a      ...
_cell_length_b      ...
_cell_length_c      ...
_cell_angle_alpha   ...
_cell_angle_beta    ...
_cell_angle_gamma   ...

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
...
```

The six cell parameters define the lattice. Fractional coordinates `(x, y, z)` locate a site through

```text
r = x a + y b + z c
```

where `a`, `b`, and `c` are the lattice vectors. Fractional coordinates are not Cartesian coordinates in ångströms. Coordinates differing by an integer lattice translation are periodically equivalent.

A CIF may store only asymmetric-unit sites; symmetry operations can generate the complete unit cell. The number of atom-site rows in the file therefore need not equal the number of atoms shown by a visualizer.

## Where can a structure be obtained?

Two useful starting points are:

- **Crystallography Open Database (COD)** — experimental crystallographic records and downloadable CIF files: [COD](https://www.crystallography.net/cod/).
- **Materials Project** — computed structures and properties linked to calculation provenance: [Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data) and [Understanding Structures and Properties](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project).

Do not treat an experimental deposition and a DFT-relaxed database structure as interchangeable merely because they have the same formula.

## Read one real database record first

For a simple reference, search COD for **silicon, COD ID `9013102`**. The record reports:

- formula: `Si`;
- `a = b = c = 5.4304 Å`;
- `α = β = γ = 90°`;
- space group 227, `F d -3 m`;
- diffraction temperature: `298.15 K`;
- atomic coordinates present;
- no reported disorder.

After downloading the CIF, locate the cell parameters, symmetry information, atom-site loop, occupancy, and bibliographic fields. These values describe the database record; they do not establish that this representation is the correct starting model for every silicon calculation.

<figure class="cif-viewer" style="margin: 1.5rem 0 2.2rem;">
  <iframe src="../../embeds/silicon-cif-viewer.html" title="Interactive silicon crystal structure derived from COD 9013102" loading="lazy" allow="fullscreen" style="display: block; width: 100%; height: clamp(22rem, 60vw, 30rem); border: 1px solid #dcdcdc; background: #fafafa;"></iframe>
  <figcaption style="margin-top: 0.65rem; color: #666666; font-size: 0.9rem; line-height: 1.5;">
    Interactive Mol* view of a <a href="../../examples/cif/silicon-cod-9013102-expanded.cif">fixed teaching CIF</a> stored with this site. The snapshot uses the COD 9013102 cell and silicon diamond geometry but is symmetry-expanded to <code>P 1</code> for stable display; it is not the byte-for-byte COD download.
  </figcaption>
</figure>

## Start with the origin of the structure

The source class determines what the coordinates mean.

- **Experimental crystallography:** retain the database/deposition ID, publication, temperature, pressure, composition, occupancy/disorder model, and reported symmetry.
- **Computational database:** retain the material/task ID and, when available, the method, functional, magnetic state, pressure, and calculation that produced the structure.
- **Publication or supporting information:** retain the DOI and exact supplementary artifact.
- **Previous calculation:** retain the originating input/output, code version, method, constraints, and evidence that the saved geometry is the intended final structure.
- **Generated structure:** retain the generator, prototype or parent structure, substitutions, imposed symmetry, and other construction choices. A **generated or hypothetical structure** is not experimental evidence.

## Preserve the source before transforming it

Keep the downloaded source artifact unchanged. Record its stable identifier, source URL or query, retrieval date, and checksum; preserve licence or redistribution restrictions when relevant.

A checksum establishes artifact identity, not scientific correctness. Parsing, standardization, coordinate wrapping, and format conversion should create derived files rather than overwrite the source.

## Read the crystallographic representation, not just the picture

Before using the structure, inspect:

- cell lengths and angles;
- fractional or Cartesian coordinate convention;
- space-group information and explicit symmetry operations;
- composition reconstructed from the atom sites;
- occupancies and mixed or split sites;
- uncertainties or experimental conditions that affect interpretation.

The atom-site occupancy is the fraction of the stated atom type present at a crystallographic site. A value below one is therefore not a small numerical defect to be rounded away. Partial occupancy may represent vacancies, substitutions, split positions, or an average disordered structure.

Most periodic DFT calculations require an explicit atomic configuration. Choosing that representation belongs to **Build or Modify a Computational Model**. Do not silently turn a partially occupied crystallographic site into a fully occupied atom.

## Experimental and calculated structures answer different questions

Experimental structures describe a measured sample under stated conditions. A computed structure describes the result of a particular computational model and relaxation protocol.

Use the representation appropriate to the scientific comparison. If both an experimental and a relaxed structure are used, keep their roles separate. Materials Project also notes that equivalent crystals can be stored in different valid cell representations, so a database cell should not be assumed to be the unique primitive or conventional choice.

## Establish chemical and crystallographic identity

Before modifying the structure, check that the following descriptions are mutually understandable:

- reported formula versus composition reconstructed from sites and occupancies;
- material/deposition ID and polymorph or phase;
- cell parameters and number of sites;
- reported space group;
- temperature, pressure, composition, charge state, or magnetic description when relevant.

If the coordinates, composition, or phase cannot be reconciled with the cited source, stop and resolve the identity before calculation.

## Treat format conversion as a scientific transformation

Converting CIF to POSCAR, XYZ, or a code-specific object can discard symmetry, occupancy, uncertainties, labels, magnetic information, and provenance.

Record the parser and version, source checksum, selected CIF data block, coordinate convention, warnings, and any information that was changed, inferred, or dropped. Never overwrite the original CIF with a normalized or converted copy.

## Symmetry is tolerance-dependent

Distinguish reported crystallographic symmetry from symmetry detected numerically from coordinates. Numerical tools such as spglib require tolerances; changing `symprec` can change the detected operations, equivalent-site grouping, or standardized cell.

If a cell is standardized or reduced, preserve the transformation and site mapping. Primitive and conventional cells can be equivalent representations; an intentionally constructed supercell is not automatically replaceable by a smaller cell.

## Inspect geometry before trusting automated checks

IUCr [checkCIF](https://checkcif.iucr.org/) can identify crystallographic syntax, geometry, symmetry, and refinement issues. They are not a certificate that the structure is suitable for a particular DFT calculation.

For DFT, also check:

- positive and physically plausible cell volume;
- minimum interatomic distances including periodic images;
- duplicate or near-duplicate sites;
- element labels and reconstructed composition;
- occupancy and disorder;
- expected dimensionality and connectivity;
- composition before and after symmetry expansion or conversion.

Do not repair an unusual distance automatically: it may be an error, a high-pressure structure, a bond, or mutually exclusive split sites.

For low-dimensional systems, vacuum, layer extraction, stacking, dipole treatment, and related boundary choices are computational-model decisions, not properties already contained in a bulk source CIF.

## Compare sources when the decision matters

If the structural choice can change the scientific conclusion, compare independent experimental records or relevant computed polymorphs. Compare composition, cell metrics, occupancy, coordination, symmetry, and source conditions. Keep unresolved alternatives as explicit candidates rather than hiding the disagreement.

## The result of this task

A usable handoff contains:

- the unchanged source artifact and stable source identifier;
- checksum and retrieval information;
- a parsed working representation;
- composition, cell, symmetry, occupancy, and geometry checks;
- all transformations already applied;
- unresolved structural ambiguities.

It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable. Those choices belong to later modelling and calculation stages.

## Sources and standards

- S. R. Hall, F. H. Allen, and I. D. Brown, “[The crystallographic information file (CIF): a new standard archive file for crystallography](https://doi.org/10.1107/S010876739101067X),” *Acta Crystallographica Section A* **47**, 655–685 (1991).
- International Union of Crystallography, “[checkCIF](https://checkcif.iucr.org/).”
- Materials Project, “[Understanding Structures and Properties in the Materials Project](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project).”
- Materials Project, “[Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data)” and “[Frequently Asked Questions](https://docs.materialsproject.org/frequently-asked-questions).”
- Crystallography Open Database, “[database information and access](https://www.crystallography.net/cod/).” The silicon example uses COD ID `9013102`.
- spglib, “[Python API documentation](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html).”
