---
topic_slug: document-and-preserve-study
status: reviewed
---

A completed calculation tree is not yet a preserved study. Scratch directories contain transient files, repeated attempts, machine-specific paths, and outputs whose relationship to a reported number may be known only to the person who ran them. Preservation turns that working history into an identifiable research object: another researcher should be able to discover what was studied, recover the evidence behind a result, reconstruct the transformation from inputs to claims, and understand what cannot be redistributed or reproduced.

The unit of preservation is the study and its lineage, not every byte ever written. A useful package connects source structures and reference data to calculation inputs, software and numerical settings, selected raw outputs, derived tables and figures, validation records, and the conclusions that cite them. It also records failed or excluded branches when their omission would change interpretation. Keeping everything without this graph creates storage, not provenance; keeping only a paper figure removes the evidence needed to audit it.

## Give every preserved state an identity

Freeze a release rather than silently updating a shared directory. Assign the release a version and stable identifier, record its creation time and responsible authors, and cite that identifier from the article or report. A later correction should create a new version with a change record and links to the state it supersedes. A mutable project name cannot distinguish the data used for a published result from later reruns.

A machine-readable manifest should enumerate each retained object with a logical role, relative path or external location, media type or format, byte size, checksum algorithm and digest, and its relationship to other objects. Relative paths make the package relocatable; logical identifiers keep relationships stable when storage paths change. A cryptographic checksum can detect whether bytes have changed since the manifest was made. It does not prove who created the file, whether the file is scientifically correct, or whether the original machine was trustworthy.

Persistent identifiers solve a different problem. A DOI or repository record helps people and machines find and cite a released object even when its storage location changes. The identifier must resolve to metadata that names the version, creators, license or access conditions, related publications, and the object itself. A DOI without usable metadata is citable but difficult to reuse; a checksum without a durable location is verifiable but difficult to find.

## Preserve the path from question to claim

Computational provenance is naturally a directed graph. Data nodes represent structures, parameters, inputs, outputs, and derived products; process nodes represent calculations, conversions, fits, and analysis steps; labelled edges state what each process consumed and produced. This structure distinguishes two files that happen to share a name and exposes when a figure was regenerated from different inputs.

For each calculation branch, retain enough identity to answer:

- which structure, composition, charge, spin state, boundary conditions, and reference states were used;
- which code, version, build features, pseudopotential or basis identities, and relevant libraries defined the model;
- which input file and command produced which output, on what execution environment;
- which convergence and physical-consistency evidence made the output eligible for analysis;
- which versioned script, parameters, units, normalizations, and intermediate values transformed it into a reported observable;
- which table, figure, or claim consumes that observable.

Record identifiers and checksums for pseudopotentials, basis sets, and other external assets even when their contents cannot be redistributed. Licensed potential bodies, credentials, private host details, and access tokens do not belong in a public package. Their absence must be explicit, with an acquisition route and compatibility metadata where redistribution terms permit. Redaction should remove the restricted value without breaking the explanation of its scientific role.

Provenance captured automatically by a workflow system can reduce omissions, but the database itself is not sufficient unless it can be exported, versioned, interpreted independently of a live service, and restored with its file repository. Manual calculations can be preserved rigorously when their graph and identities are recorded. Automation improves capture; it does not decide which evidence supports the scientific claim.

## Select artifacts by reconstruction value

Preserve source data, irreplaceable raw outputs, the inputs and metadata required to interpret them, and compact derived data behind every reported table and figure. Retain analysis code, environment specifications, test fixtures, and instructions that regenerate the public results. If a large raw or restart object is omitted, record why, where it remains, how long it will be retained, and what downstream reconstruction becomes impossible without it.

Restart files deserve a deliberate decision. They can make an expensive continuation possible but may be code-version, architecture, or decomposition dependent and can dominate storage. They are not substitutes for portable inputs and interpretable outputs. Preserve them when their recovery value justifies their size and compatibility risk; otherwise preserve the information needed to rerun the calculation and state that restart-level continuation is unavailable.

Choose formats for both fidelity and future interpretation. Keep the native artifact when it contains information unavailable elsewhere, and add open, documented representations for structures, arrays, tables, and metadata where possible. Store plotting data separately from rendered images. Compression is useful only when the decompression method and integrity of the uncompressed payload remain testable. Proprietary or version-fragile formats require an export or migration plan rather than the assumption that current software will remain available.

## Package meaning as well as files

A human-readable landing document should explain the scientific question, package scope, directory or object model, reproduction entry points, software requirements, expected outputs, known omissions, licenses, citation, and contact or stewardship responsibility. Machine-readable metadata should express the same identities and relationships without depending on prose parsing. Standards such as RO-Crate can describe a research object and its contextual entities in JSON-LD; BagIt defines a transport package with payload and tag manifests. They can be combined, but neither standard supplies the material-specific scientific meaning on its own.

Access and reuse conditions belong at object level when different components have different terms. Code, original data, third-party structures, external databases, and figures may not share one license. FAIR means that objects and metadata are findable, accessible under stated conditions, interoperable, and reusable; it does not require unrestricted public release of every byte. Restricted data can still have discoverable metadata and a defined access procedure.

Repository selection should match object size, retention commitments, versioning, persistent identifiers, access controls, and domain metadata. A source-code host is appropriate for small text, scripts, schemas, and reviewable history, but not automatically for large calculation outputs. An institutional or domain repository may preserve released datasets, while active scratch and workflow databases remain operational systems. The manifest links these locations into one study record without pretending that one service is authoritative for every class of object.

## Test recovery, not just deposit

Preservation is demonstrated by retrieval and reconstruction from the released state. In a clean environment, fetch the identified version, verify every declared checksum, resolve referenced external assets, create the documented software environment, run bounded reconstruction steps, and compare generated tables or figures with declared expected artifacts. Record which steps were executed, which were inspected only, and which expensive calculations were intentionally not rerun.

A successful checksum audit establishes fixity for declared files. A successful restore establishes that the tested package can be retrieved and interpreted under the tested environment. Regenerating a plot establishes a particular analysis path. None of these proves DFT convergence, physical validity, agreement with experiment, or the scientific conclusion; those require the validation evidence preserved alongside the package.

Long-term stewardship repeats fixity audits, monitors identifier and external-link resolution, verifies backups on independent failure domains, and periodically tests restoration. Formats, dependencies, and repositories change, so migrations must preserve original identifiers and checksums, record the transformation, and create a new version when bytes or interpretation change. A backup that has never been restored is an untested recovery hypothesis.

**Analyze and Compare Results** defines the transformations and comparable observables. **Validate Results and Scientific Conclusions** decides which claims survive the relevant challenges. This topic preserves the exact evidence state and the route from calculations to those claims. Documentation increases transparency and reuse, but it cannot repair an invalid model or upgrade incomplete scientific evidence.

## Sources and standards

- [Wilkinson and co-workers, FAIR Guiding Principles](https://doi.org/10.1038/sdata.2016.18)
- [Pizzi and co-workers, provenance graphs for computational science](https://doi.org/10.1016/j.commatsci.2015.09.013)
- [Talirz and co-workers, Materials Cloud provenance and reuse](https://arxiv.org/abs/2003.12510)
- [RO-Crate 1.1 specification](https://www.researchobject.org/ro-crate/specification/1.1/introduction.html)
- [RFC 8493, the BagIt File Packaging Format](https://datatracker.ietf.org/doc/rfc8493/)
- [DataCite Metadata Schema](https://schema.datacite.org/)
