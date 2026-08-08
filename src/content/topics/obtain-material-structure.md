---
topic_slug: obtain-material-structure
status: reviewed
---

Most crystalline-material workflows begin with a structure file. Before deciding whether a structure is suitable for DFT, it helps to understand what that file is actually describing. For crystals, the most common exchange format you will encounter is the **CIF**.

## First: what is a CIF?

**CIF** originally stands for **Crystallographic Information File** and is part of the broader Crystallographic Information Framework maintained by the crystallographic community. It is a structured text format for storing crystallographic information rather than simply a list of Cartesian atom positions.

The central idea is the same one used to describe a periodic crystal in solid-state physics:

\[
\text{crystal structure} = \text{lattice} + \text{atomic basis}.
\]

A CIF can encode both parts. Cell lengths and angles define the periodic lattice; atom-site records define which atoms occupy positions inside that lattice. A typical CIF can also contain space-group information, symmetry operations, occupancies, displacement parameters, experimental conditions, refinement information, and bibliographic provenance.

Three pieces of CIF syntax are enough to start reading most ordinary files:

```text
data_<block_name>

_cell_length_a     ...
_cell_length_b     ...
_cell_length_c     ...
_cell_angle_alpha  ...
_cell_angle_beta   ...
_cell_angle_gamma  ...

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
...
```

A line such as `_cell_length_a 5.43` is a named data item. `loop_` introduces a table in which every following row supplies values for the listed fields. When the coordinates are fractional, a site at \((x,y,z)\) represents

\[
\mathbf r=x\mathbf a+y\mathbf b+z\mathbf c,
\]

not the Cartesian point \((x,y,z)\) in ångströms. Periodicity also means that fractional coordinates differing by an integer lattice translation describe equivalent positions. A visualizer may therefore show a perfectly ordinary atom even when one of the stored fractional coordinates is slightly below zero or above one.

A second important point is that the sites written in the file are not always the complete list of atoms displayed by a viewer. A crystallographic record may store only the asymmetric-unit sites and use symmetry operations to generate the rest of the unit cell. Reading the CIF therefore means reading the lattice, atom-site table, occupancies, and symmetry together.

## Where can a structure be obtained?

There is no single best structure database for every problem. The important distinction is whether the record is experimental, computational, or generated, and whether its provenance is sufficient for the study.

Two useful starting points are:

- **Crystallography Open Database (COD)** — an open crystallographic database with downloadable CIF records and links to the original structure literature. Start from the [COD database interface](https://www.crystallography.net/cod/).
- **Materials Project** — a computational materials database whose structures are connected to calculation tasks and methods. The official [Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data) documentation explains how to retrieve records, while [Understanding Structures and Properties](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project) explains important representation and provenance details.

These are entry points, not interchangeable sources. An experimental CIF from COD and a relaxed structure from Materials Project may describe the same nominal compound while representing different temperatures, methods, cells, or physical idealizations. Record the database identifier and source before comparing or transforming them.

## Read one real database record first

A simple example is **silicon, COD ID 9013102**. The current COD information card identifies it as an experimental silicon structure from an X-ray study at 25 °C and reports:

- formula: `Si`;
- \(a=b=c=5.4304\ \text{Å}\);
- \(\alpha=\beta=\gamma=90^\circ\);
- space-group number 227, `F d -3 m`;
- ambient diffraction temperature 298.15 K;
- atomic coordinates present;
- no reported disorder.

To inspect it yourself, open the COD database interface above, search for `9013102`, open the information card, and download the coordinate CIF. The first useful exercise is not to convert it to another format. Instead, identify in the downloaded file:

1. the data block and database identifier;
2. the six cell parameters;
3. the reported space group or symmetry operations;
4. the atom-site loop and its coordinate convention;
5. occupancy and any uncertainty or experimental-condition fields;
6. the publication or provenance fields that explain where the structure came from.

This example is deliberately modest. The values above describe what the COD record reports; they do not by themselves establish that this particular representation is the correct starting model for every silicon calculation.

A structure file is not yet a computational model. It is a record of what a source claims about a material, expressed through a particular representation and often under particular experimental or computational conditions. The first research task is not to make the file convenient for a code. It is to establish what the structure is, where it came from, what information it actually contains, and which ambiguities must remain visible before any modelling decision is made.

## Start with the origin of the structure

A usable source structure may come from several places, and the source class changes what the coordinates mean.

An **experimental crystallographic record** may describe a structure refined from single-crystal or powder diffraction. Its cell parameters, atomic positions, occupancies, displacement parameters, uncertainties, and reported symmetry belong to an experiment performed at a stated temperature, pressure, composition, and sample condition. The coordinates may describe an average periodic structure rather than one fully ordered microscopic arrangement.

A **computational database structure** is usually the result of one or more calculations. It may have been relaxed with a specific exchange–correlation treatment, magnetic state, charge state, pressure, convergence protocol, and cell representation. A database entry can combine information from several calculation tasks, so the visible “structure” should be traced to the calculation that produced it rather than treated as an unqualified geometry. Materials Project, for example, exposes provenance fields that connect a reported structure or property to the originating task and calculation type.

A **publication or supporting-information structure** must be tied to the exact article, dataset, correction state, and supplementary file from which it was taken. A structure reproduced in a figure, table, or third-party repository may have lost details that remain present in the deposited crystallographic record.

A **previous calculation** is a valid source only when its lineage is known. “The relaxed POSCAR from an old folder” does not identify the code version, method, constraints, electronic state, completion status, or whether the saved geometry belongs to the final accepted step.

A **generated or hypothetical structure** is not experimental evidence. Its generator, parent prototype, substitution rule, symmetry constraint, random seed where relevant, and intended composition should be preserved. A plausible geometry can be a useful research starting point without being evidence that the material exists or is stable.

These sources may lead to similar coordinate files, but they do not carry the same scientific meaning.

## Preserve the source before transforming it

The original downloaded or received artifact should remain unchanged. Parsing, format conversion, cell reduction, coordinate wrapping, and site editing should produce derived copies with explicit lineage back to that original.

For a database record, preserve the stable database identifier, database or release version when available, retrieval date, source URL or API query, cited publication or external database identifiers, licence boundary, and the exact downloaded artifact. For a publication, preserve the DOI, supplementary-file identity, version or correction status, and the relation between the file and the published claim. For a previous calculation, preserve the originating run, input and output identities, code and version, method, and evidence that the geometry was actually produced by the stated calculation.

A checksum is useful because filenames are weak identifiers. Two files named `structure.cif` may differ, while the same file may be renamed many times. The checksum does not prove scientific correctness; it proves that a later artifact is byte-for-byte the same object that was recorded.

Source preservation is also a licensing issue. Some databases are open, some require acknowledgement, and some restrict redistribution. The Crystallography Open Database makes its database content available under CC0 while asking users to acknowledge the original structure authors. Other crystallographic collections may permit research access without allowing the underlying records to be republished. A workflow should record what may be used, cited, transformed, and redistributed rather than assuming that downloadable means unrestricted.

## Read the crystallographic representation, not just the picture

The Crystallographic Information Framework was designed to exchange structured crystallographic data between laboratories, journals, and databases. A CIF can carry much more than element symbols and Cartesian positions: cell parameters, fractional coordinates, symmetry information, occupancies, displacement parameters, experimental conditions, refinement information, and bibliographic provenance may all be present.

This distinction matters because a visualizer commonly shows only one expanded arrangement. The displayed atoms may have been generated from asymmetric-unit sites and symmetry operations. Labels are not always element symbols. Coordinates may be fractional or Cartesian. Equivalent coordinates can lie outside the interval from zero to one. Different but equivalent choices of origin, basis vectors, or unit cell can describe the same periodic crystal.

The atom-site occupancy field is especially important. In the IUCr core dictionary, occupancy is the fraction of an atom type present at a site. A value below one is therefore not a small numerical defect to be rounded away. It may represent substitutional disorder, vacancies, split positions, or an average over configurations. Several species may share coordinates with occupancies that collectively describe the site.

Most ordinary periodic DFT calculations require an explicit atomic configuration. A partially occupied crystallographic site cannot simply be copied as a fractional atom. It must later be represented by an ordered configuration, a set of configurations, a sufficiently large disordered model, a virtual-crystal or coherent-potential treatment, or another declared approximation appropriate to the research question. Choosing that representation belongs to **Build or Modify a Computational Model**. At this stage, the correct action is to preserve and describe the unresolved occupancy.

Displacement parameters and reported uncertainties should not be silently interpreted as extra atoms or deterministic distortions. They describe aspects of the crystallographic model and measurement, not a ready-made zero-temperature DFT geometry. Likewise, missing hydrogen positions, unresolved light atoms, twinning, modulation, or magnetic ordering may require information beyond a basic core CIF.

## Experimental and calculated structures answer different questions

Experimental lattice parameters reflect the measured sample and conditions. Temperature, pressure, composition, defects, zero-point motion, thermal expansion, and the experimental refinement model can all affect the reported structure. A DFT relaxation usually represents a different idealization: a selected electronic method, an explicit composition and periodic ordering, and often a nominal zero-temperature state.

Consequently, an experimental structure and a relaxed database structure should not be treated as interchangeable versions of one file. The experimental structure may be the correct starting point for comparison with a measured phase. The relaxed structure may be the correct reference for a calculation that requires internal consistency with a particular method. In some studies both are needed, with their roles kept separate.

Computational databases also make representation choices. Materials Project notes that a crystal can have many valid unit-cell representations and that its stored structure is not necessarily the conventional or primitive cell expected from a textbook. It also warns that automatic numerical symmetry detection can occasionally produce an incorrect reduction. Database identifiers therefore identify records or material groupings, not a guarantee that the returned cell is the only or best representation for a new calculation.

The method that generated a computed structure matters. A cell relaxed with PBE, PBE+U, r²SCAN, a dispersion correction, or a particular magnetic order is a result of that model. When a database provides an `origins` or task reference, retain it. Exporting only the final coordinates erases information needed to understand why the geometry has its present volume, symmetry, and internal coordinates.

## Establish chemical and crystallographic identity

Before modifying the structure, compare several descriptions of its identity:

- the reported chemical formula and the composition reconstructed from occupied sites;
- the database identifier, polymorph or prototype label, and cited publication;
- the cell parameters, number of sites, and reported space group;
- the experimental temperature, pressure, composition, and phase conditions where available;
- the charge, oxidation-state assumptions, or magnetic description if the source supplies them.

Disagreement does not always mean the file is wrong. A CIF formula may refer to a conventional cell, formula unit, disordered composition, solvent-containing crystal, or refined sample composition. A database may group several calculations under one material identifier while distinguishing polymorphs with separate IDs. The purpose of the check is to expose the relation between these descriptions, not to force them to match by editing the file until warnings disappear.

A structure should be rejected or held for clarification when its identity cannot be established. Examples include coordinates that do not correspond to the cited phase, a file whose composition differs without explanation, an undocumented mixture of experimental and relaxed lattice parameters, or a structure copied from a figure without machine-readable provenance.

## Treat format conversion as a scientific transformation

Converting CIF to POSCAR, XYZ, an internal Python object, or another code-specific format is not merely changing the filename. The target representation may not retain every field in the source. Symmetry operators, occupancies, uncertainties, bibliographic data, oxidation states, magnetic moments, site labels, and experimental conditions can be lost or simplified.

A conversion should therefore produce two outputs in practice: the converted structure and a record of what was read, changed, dropped, or inferred. At minimum, record the parser and version, source artifact checksum, selected data block when a file contains several blocks, coordinate and unit conventions, and any warnings. When two independent parsers disagree on site count, composition, symmetry expansion, or cell parameters, the disagreement is evidence that the source or parser assumptions require inspection.

Do not overwrite the original with the “cleaned” file. A normalized representation is useful for downstream automation, but it should remain possible to reconstruct how it was obtained and to revisit a decision when a later calculation reveals a problem.

## Symmetry is tolerance-dependent

Reported crystallographic symmetry, numerically detected symmetry, and the symmetry of a later computational model are related but distinct.

A CIF may provide a space-group symbol and explicit symmetry operations. A symmetry library can independently infer operations from lattice vectors, coordinates, and species. Numerical inference requires tolerances. In spglib, `symprec` is a length tolerance used during the symmetry search; changing it can change the detected symmetry, equivalent-site grouping, or standardized cell. Magnetic symmetry requires additional magnetic information and tolerances.

For that reason, “the structure has space group X” should be qualified by its source and, for numerically detected symmetry, by the software version and tolerance. A stable result across a sensible tolerance range is stronger evidence than one symbol returned at one undocumented threshold. The reported space group should not be discarded merely because a numerical tool finds a subgroup or supergroup; first determine whether the difference arises from coordinate precision, thermal distortion, disorder, magnetic information, or an actual inconsistency.

Primitive and conventional cells are representations, not automatically different physical structures. Reducing a cell can improve efficiency, but it may also remove an intentionally chosen supercell, obscure a defect or ordering pattern, change the orientation needed for a surface, or lose a mapping to experimental axes. Cell standardization should therefore preserve an explicit transformation matrix and site mapping. It is a reversible representation step only when no physical content has been changed.

## Inspect geometry before trusting automated checks

Automated validation is necessary but incomplete. IUCr checkCIF can test CIF syntax and construction, cell and geometry details, space-group symmetry, displacement parameters, and—when supplied—structure factors. Its alerts are valuable evidence about a crystallographic record. They are not a certificate that the structure is suitable for a particular DFT calculation.

A DFT-oriented inspection should also look for:

- non-positive or implausible cell volume;
- unphysically short interatomic distances, including across periodic boundaries;
- exact or near-duplicate sites;
- incorrect element assignment inferred from labels;
- missing, zero, negative, or inconsistent occupancies;
- unexplained mixed sites or split positions;
- isolated fragments or unexpected bonds produced by an incorrect periodic image;
- a mismatch between the expected dimensionality and the periodic cell;
- missing atoms that are chemically necessary but experimentally unresolved;
- a suspicious change of composition after symmetry expansion or conversion.

Distance checks require chemical judgement. A short distance may indicate an error, a high-pressure phase, a molecular bond, a split site, or two mutually exclusive partially occupied positions. A long distance may be normal for an ionic, layered, porous, or molecular crystal. Automated thresholds should identify cases for review rather than silently repair them.

For low-dimensional materials, distinguish the source structure from the later simulation cell. An experimental bulk parent structure does not already contain the vacuum, isolated layer, dipole treatment, Coulomb truncation, or stacking decision needed for a monolayer calculation. Extracting a layer and adding vacuum changes the model and therefore belongs to the next task.

## Compare sources when the decision matters

When a structural choice can affect the scientific conclusion, compare independent records rather than accepting the first downloadable file. Multiple experimental determinations may differ in temperature, pressure, composition, disorder model, or refinement quality. A computed database may contain several calculations derived from different initial structures or methods. Two database entries with the same reduced formula may be different polymorphs rather than duplicates.

Useful comparisons include cell metrics after accounting for equivalent settings, composition and occupancy, coordination environment, symmetry under declared tolerances, and the original publication conditions. A disagreement should be carried forward as an explicit branch when it cannot be resolved. Selecting one source without recording the rejected alternatives can make later results appear more certain than the structural evidence allows.

## The result of this task

This task is complete when the researcher has a traceable source structure and an explicit account of its unresolved issues—not when a file merely opens in a viewer.

The retained record should make it possible to answer:

- Which exact artifact and source record were acquired?
- Is the structure experimental, computed, generated, or inherited from a previous calculation?
- Under which conditions or computational method was it obtained?
- What composition, occupancy, disorder, symmetry, and cell representation does it encode?
- Which transformations and parser decisions produced the working representation?
- Which ambiguities remain for model construction?
- Is the artifact legally and technically reusable in the intended workflow?

The handoff to **Build or Modify a Computational Model** should preserve the original artifact, a validated working representation, provenance and checksums, parser and transformation records, inspection findings, and unresolved decisions. It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable. Those are later modelling and calculation questions.

## Sources and standards

- S. R. Hall, F. H. Allen, and I. D. Brown, “[The crystallographic information file (CIF): a new standard archive file for crystallography](https://doi.org/10.1107/S010876739101067X),” *Acta Crystallographica Section A* **47**, 655–685 (1991).
- International Union of Crystallography, “[checkCIF](https://checkcif.iucr.org/).”
- Materials Project, “[Understanding Structures and Properties in the Materials Project](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project).”
- Materials Project, “[Querying Data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data)” and “[Frequently Asked Questions](https://docs.materialsproject.org/frequently-asked-questions).”
- Crystallography Open Database, “[database information and access](https://www.crystallography.net/cod/).” The silicon example uses COD ID `9013102`.
- spglib, “[Python API documentation](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html).”
