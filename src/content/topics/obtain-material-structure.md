---
topic_slug: obtain-material-structure
status: reviewed
---

A structure file is not yet a computational model. This task produces an unchanged source artifact, a checked working copy, and a short record of what the selected structure does and does not establish.

## Begin with the human source search

Search by material, phase, composition, pressure, temperature, and the actual research question. Read the primary paper or supplementary information when it identifies the sample. Use the [structure-resource catalog](/DFT-Research-Workflow/operations/resource-landscape/#structures-data) to find database records, then open each record in the browser and preserve its stable identifier, citation, conditions, and retrieval date.

## Compare source records

Prefer the source object that matches the intended claim: an experimental deposition for a measured phase, a calculation archive for a computed structure, or an explicitly generated model when no deposited structure answers the question. A **generated or hypothetical structure** is not experimental evidence. The [Crystallography Open Database](https://www.crystallography.net/cod/) provides open experimental CIFs; Materials Project documents both [querying](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data) and the [meaning of its computed structures](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project). Its [FAQ](https://docs.materialsproject.org/frequently-asked-questions) clarifies access and data conventions.

## Manual route: download and inspect the CIF as text

Download with the record's own control. Keep the original unchanged, make a working copy, and confirm that the saved object is a CIF rather than an HTML error page. In a text editor, locate the data block, cell lengths and angles, symmetry tags, atom-site loop, coordinates, occupancies, uncertainties, and bibliographic fields. Fractional occupancy may represent disorder or mixed occupation. A value below one is therefore not a small numerical defect to be rounded away.

The [COD Silicon worked guide](/DFT-Research-Workflow/operations/obtain-material-structure/examples/inspect-cod-silicon-record/) carries one real record through these actions. For crystallographic definitions rather than execution, the [Electronic Structure Atlas crystallography page](/Electronic-Structure-Learning/theory/crystallography/) is optional background, not a prerequisite.

## Manual route: inspect the structure visually

Open the downloaded file in a real viewer. Show the cell and periodic images; inspect composition, coordination, duplicate or overlapping sites, disorder, suspicious distances, and whether the displayed cell matches the record. Use at least two viewing directions for low-dimensional or anisotropic structures. A viewer catches many model mistakes, but a plausible picture is not structural validation. The worked example uses a bounded [Mol* view](https://molstar.org/viewer/?hide-controls=1&url=https%3A%2F%2Fmaxwell3919.github.io%2FDFT-Research-Workflow%2Fexamples%2Fcif%2Fsilicon-cod-9013102-expanded.cif&url-format=cifCore).

## Numerical and symmetry checks

Reopen every converted file and compare formula, cell, site count, coordinates, occupancies, and geometry with the source. Numerically detected symmetry depends on tolerance; record the tolerance, transformation, origin shift, and site mapping. The [spglib API](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html) documents these objects. IUCr [checkCIF](https://checkcif.iucr.org/) can expose syntax, geometry, symmetry, or refinement alerts. They are not a certificate that the structure is suitable for a particular DFT calculation.

Choosing that representation belongs to **Build or Modify a Computational Model**.

## Optional automation: retrieve and preserve the CIF

After the browser route is understood, scripted retrieval may create a source directory, save the exact response, record its URL and checksum, and copy it to a working directory. It should not silently replace partial occupancy, choose a magnetic order, add vacuum, construct a supercell, select a defect configuration, or claim that the source phase is stable.

## Decide whether to continue

Continue only when formula, phase or polymorph, cell, sites, occupancy, source conditions, symmetry, and visible geometry are mutually understandable. Preserve unresolved alternatives instead of silently selecting one.

## The result of this task

Handoff: unchanged source object, stable identifier and citation, retrieval date and checksum, checked working copy, text and visual observations, conversions already applied, and unresolved ambiguities. Then [build or modify the computational model](/DFT-Research-Workflow/operations/build-or-modify-computational-model/).

## Sources and standards

- Hall, Allen, and Brown, [the CIF standard](https://doi.org/10.1107/S010876739101067X).
- International Union of Crystallography, [checkCIF](https://checkcif.iucr.org/).
- Materials Project, [structures and properties](https://docs.materialsproject.org/methodology/materials-methodology/understanding-structures-and-properties-in-the-materials-project), [querying data](https://docs.materialsproject.org/downloading-data/using-the-api/querying-data), and [FAQ](https://docs.materialsproject.org/frequently-asked-questions).
- [Crystallography Open Database](https://www.crystallography.net/cod/) and [spglib Python API](https://spglib.readthedocs.io/en/v2.7.0/api/autodoc/spglib.html).
