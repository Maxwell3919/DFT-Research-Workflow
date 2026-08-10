import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const practicalEvidenceDocument = JSON.parse(await readFile(new URL('workflow/practical-evidence.json', root), 'utf8'));
const practicalEvidenceByGuide = new Map((practicalEvidenceDocument.guides ?? []).map((entry) => [entry.guide_slug, entry]));
const errors = [];
const workflow = JSON.parse(await readFile(new URL('workflow/topics.json', root), 'utf8'));
const sourceManifest = JSON.parse(await readFile(new URL('sources/practical-guide-links.json', root), 'utf8'));
const mediaManifest = JSON.parse(await readFile(new URL('workflow/practical-guide-media.json', root), 'utf8'));
const topicSlugs = new Set(
  workflow.sections.flatMap((section) =>
    section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
  ),
);
const sourceById = new Map(sourceManifest.sources.map((source) => [source.id, source]));
const sourcesByGuide = new Map(sourceManifest.guides.map((guide) => [guide.guide_slug, guide.source_ids]));
const mediaById = new Map(mediaManifest.assets.map((asset) => [asset.id, asset]));

const requiredGuideSlugs = new Set([
  'ase-build-repeat-cells',
  'ase-surfaces-vacuum-adsorbates',
  'pymatgen-structure-transformations',
  'two-dimensional-monolayer-model',
  'converge-basis-cutoffs-and-grids',
  'converge-k-points-and-smearing',
  'converge-finite-size-vacuum-and-images',
  'converge-q-meshes-and-response-grids',
  'choose-relaxed-degrees-and-constraints',
  'diagnose-forces-stress-and-state',
  'restart-and-verify-optimization',
  'compare-multiple-starts-and-minima',
  'prepare-fixed-geometry-reference-calculation',
  'compare-fresh-and-restarted-electronic-states',
  'compare-charge-spin-and-magnetic-candidates',
  'package-reusable-reference-state-lineage',
  'build-comparable-energy-ledger',
  'balance-reference-reactions-and-normalization',
  'design-traceable-energy-volume-series',
  'fit-and-challenge-equation-of-state',
  'compare-phase-enthalpies-common-pressure',
  'rebuild-oqmd-li-p-convex-hull',
  'stress-test-hull-phase-set',
  'build-defect-formation-ledger',
  'trace-charge-state-envelope',
  'build-surface-energy-ledger',
  'extract-work-function-potential',
  'compare-intermat-si-surfaces',
  'build-adsorption-energy-ledger',
  'compare-adsorption-sites-and-coverage',
  'replot-cmr-co-adsorption',
  'inspect-qe-hpc-calculations-from-the-terminal',
  'audit-a-qe-calculation',
]);
const requiredParentMinimum = new Map([
  ['build-or-modify-computational-model', 4],
  ['test-numerical-convergence', 4],
  ['optimize-structure', 4],
  ['calculate-reference-ground-state', 4],
  ['relative-and-formation-energies', 2],
  ['equation-of-state-and-structural-phase-stability', 3],
  ['compositional-phase-stability-and-convex-hulls', 2],
  ['defect-formation-energies-and-charge-states', 2],
  ['surface-energy-and-work-function', 3],
  ['adsorption-energies', 3],
  ['validate-results-and-scientific-conclusions', 2],
]);
const reviewRequirements = new Map([
  ['docs/reviews/2026-08-10-cod-silicon-interface-walkthrough.md', [
    'reviewed within the declared browser and GUI teaching scope',
    'The COD and Mol* screenshots show actual public interfaces and actual declared objects',
    'No VESTA screenshot or local VESTA execution is claimed',
    'The Mol* view uses the repository expanded teaching snapshot rather than the byte-for-byte COD download',
    'Interface rendering and visual inspection do not establish structure validity, numerical convergence, or a scientific conclusion',
    'No terminal execution script is required because this page makes no terminal execution claim',
  ]],
  ['docs/reviews/2026-08-09-qe-terminal-inspection-and-audit.md', [
    'Internal manifest codes are not taught as a reader-facing taxonomy.',
    'They do not write files, call QE or Slurm, submit or cancel work, or access a private host.',
    'It does not establish a current scheduler state, rerun QE',
    'No media are added.',
    'Source reachability, companion execution, content validation, build, and browser behavior remain separate checks',
  ]],
  ['docs/reviews/2026-08-05-structure-candidate-construction.md', [
    'reviewed within this construction-only boundary',
    'No electronic-structure solver, geometry optimizer',
    'Execution success is not defect convergence',
    'It must not be cited for vacancy formation energy',
  ]],
  ['docs/reviews/2026-08-03-practical-guides-model-building-pilot.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy',
    'Execution success is not numerical convergence',
    'None of those checks establishes numerical convergence',
  ]],
  ['docs/reviews/2026-08-03-test-numerical-convergence.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy',
    'Execution success is not numerical convergence',
    'None of those checks establishes numerical convergence for a real calculation',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
  ['docs/reviews/2026-08-03-optimize-structure.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy with a DFT code',
    'Execution success is not structural convergence for a real calculation',
    'None of those checks establishes a local or global minimum for a real calculation',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
  ['docs/reviews/2026-08-03-calculate-reference-ground-state.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts calculate no electronic energy with a DFT code',
    'Execution success is not reference-ground-state verification for a real calculation',
    'None of those checks establishes global ground-state identity for a real calculation',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
  ['docs/reviews/2026-08-03-relative-and-formation-energies.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts use Python 3.12 standard-library arithmetic.',
    'Execution success is not energy convergence for a real calculation.',
    'It does not establish a real formation energy',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
  ['docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md', [
    'reviewed within the declared educational and execution scope',
    'They execute no DFT code and ingest no material data.',
    'Execution success is not EOS convergence for a real calculation.',
    'It does not establish a real equilibrium volume',
    'They are conceptual diagrams, not plots of calculated data.',
  ]],
  ['docs/reviews/2026-08-04-compositional-phase-stability-and-convex-hulls.md', [
    'reviewed within the declared educational and execution scope',
    'The repository does not claim to have rerun the underlying OQMD calculations.',
    'Execution success is not DFT convergence for a real calculation.',
    'It does not independently establish OQMD accuracy',
    'They are plots of a real public DFT database snapshot',
  ]],
  ['docs/reviews/2026-08-04-defect-formation-energies-and-charge-states.md', [
    'reviewed within the declared educational and execution scope',
    'The scripts execute no DFT code and ingest no material data.',
    'Execution success is not defect convergence for a real calculation.',
    'It does not establish a real defect configuration',
    'They are conceptual plots of invented data',
  ]],
  ['docs/reviews/2026-08-04-surface-energy-and-work-function.md', [
    'reviewed within the declared educational and execution scope',
    'The first two scripts execute no DFT code and ingest no material data.',
    'The repository does not claim to have rerun the underlying InterMat calculations.',
    'Execution success is not surface or work-function convergence for a real calculation.',
    'It does not establish a real surface energy',
    'The first two are conceptual plots of invented data.',
  ]],
  ['docs/reviews/2026-08-04-adsorption-energies.md', [
    'reviewed within the declared educational and execution scope',
    'The first two scripts execute no DFT code and ingest no material data.',
    'The repository does not claim to have rerun the underlying CMR calculations.',
    'Execution success is not adsorption-energy convergence for a real calculation.',
    'It does not establish a real adsorption configuration',
    'The first two media assets are conceptual plots of invented data.',
  ]],
  ['docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md', [
    'reviewed within the declared educational and execution scope',
    'The two ledger and lattice-match scripts use invented teaching values.',
    'The repository does not claim to have rerun the underlying calculations.',
    'Execution success is not interface-energy convergence',
    'The original SVG is a derived-public-data redraw',
  ]],
  ['docs/reviews/2026-08-04-band-structure.md', [
    'reviewed within the declared educational and execution scope',
    'bounded real Silicon execution',
    'COD 9013102 → spglib/SeeK-path → QE 7.5 SCF and band path → `bands.x` output',
    'separate real QE 7.5 SCF → `bands` → `bands.x` 8×8×8 teaching mesh',
    'two limited samplings cannot be silently equated',
    'not numerical convergence',
  ]],
  ['docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md', [
    'reviewed within the declared educational and execution scope',
    'hash-bound total-DOS output from a bounded Silicon QE 7.5 SCF',
    'Execution success is not DOS convergence',
    'original plots reconstructed from the project\'s actual `dos.x` output.',
  ]],
  ['docs/reviews/2026-08-04-fermi-surface-and-full-brillouin-zone-analysis.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses an invented two-dimensional reciprocal-space energy field.',
    'Execution success is not Fermi-surface convergence',
    'The media are original conceptual diagrams of invented data.',
  ]],
  ['docs/reviews/2026-08-04-charge-density-and-charge-redistribution.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented compatible grids.',
    'Execution success is not DFT convergence',
    'The media are original conceptual diagrams of invented data.',
  ]],
  ['docs/reviews/2026-08-04-electrostatic-potential-and-band-alignment.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented bulk-reference and interface-step values.',
    'Execution success is not potential convergence',
    'The media are original conceptual diagrams of invented data.',
  ]],
  ['docs/reviews/2026-08-04-chemical-bonding-analysis.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented energy-resolved pair contributions.',
    'Execution success is not a projection-quality result',
    'The media are original conceptual diagrams of invented data.',
  ]],
  ['docs/reviews/2026-08-04-magnetic-configuration-and-ground-state-comparison.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented compatible candidate energies and final moment labels.',
    'Execution success is not magnetic convergence',
    'The media are original conceptual diagrams of invented data.',
  ]],
  ['docs/reviews/2026-08-04-magnetic-anisotropy-and-exchange-interactions.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented compatible energies',
    'Execution success is not magnetic convergence',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-elastic-constants-and-mechanical-properties.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented signed strain--stress rows',
    'Execution success is not stress convergence',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-dielectric-response-and-born-effective-charges.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented tensor entries',
    'Execution success is not dielectric-response convergence',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-polarization-and-ferroelectricity.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented polarization representatives',
    'Execution success is not Berry-phase convergence',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-piezoelectric-response.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented clamped-ion terms',
    'Execution success is not piezoelectric-response convergence',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-harmonic-phonons.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented dynamical-matrix eigenvalues',
    'Execution success is not a force calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-anharmonic-phonons.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented interaction and phase-space weights',
    'Execution success is not a force calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-lattice-thermal-transport.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented modal factors',
    'Execution success is not a phonon calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-electron-phonon-coupling.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented channel strengths and weights',
    'Execution success is not an EPC calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-conventional-superconductivity.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented weighted spectral terms',
    'Execution success is not an alpha-squared-F calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-reaction-paths-and-transition-states.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented image energies',
    'Execution success is not an NEB calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-diffusion-barriers.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented hop-network values',
    'Execution success is not an NEB calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-ab-initio-molecular-dynamics.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented trajectory-segment labels',
    'Execution success is not an AIMD calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-finite-temperature-structural-sampling.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented window supports',
    'Execution success is not a molecular-dynamics calculation',
    'The media are an original diagram generated from invented values',
  ]],
  ['docs/reviews/2026-08-04-independent-particle-optical-properties.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script checks invented spectral metadata only',
    'Execution success is not an electronic-structure calculation',
    'The media are an original diagram generated from invented labels',
  ]],
  ['docs/reviews/2026-08-04-time-dependent-response-and-spectroscopy.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented response metadata',
    'Execution success is not a TDDFT calculation',
    'The media are an original diagram generated from invented labels',
  ]],
  ['docs/reviews/2026-08-04-quasiparticle-corrections.md', [
    'reviewed within the declared educational and execution scope',
    'The companion script uses invented quasiparticle metadata',
    'Execution success is not a GW calculation',
    'The media are an original diagram generated from invented labels',
  ]],
  ['docs/reviews/2026-08-04-electronic-transport.md', [
    'reviewed within the declared educational and execution scope',
    'The repository does not claim to have rerun the underlying WIEN2k or BoltzTraP calculations',
    'Execution success is not transport convergence for a real calculation',
    'The media asset is an original derived-public-data redraw',
  ]],
]);

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, body: source };
  const data = {};
  let activeArray = null;
  for (const rawLine of match[1].split('\n')) {
    const arrayItem = rawLine.match(/^\s+-\s+(.+)$/);
    if (arrayItem && activeArray) {
      data[activeArray].push(arrayItem[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const scalar = rawLine.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (!scalar) continue;
    const [, key, rawValue = ''] = scalar;
    if (rawValue.trim() === '') {
      data[key] = [];
      activeArray = key;
    } else if (rawValue.trim() === '[]') {
      data[key] = [];
      activeArray = null;
    } else {
      data[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
      activeArray = null;
    }
  }
  return { data, body: source.slice(match[0].length) };
}

function extractUrls(source) {
  return new Set(
    (source.match(/https?:\/\/[^\s<>()\]"']+/g) ?? [])
      .map((url) => url.replace(/[.,;:]+$/u, '')),
  );
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

const directory = new URL('src/content/practical-guides/', root);
const files = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort();
const guides = [];
const guideSlugs = new Set();
const guideCountsByParent = new Map();
const usedMediaIds = new Set();
const allowedKinds = new Set(['implementation', 'worked-example', 'visual-note']);

for (const file of files) {
  const path = `src/content/practical-guides/${file}`;
  const source = await readFile(new URL(path, root), 'utf8');
  const { data, body } = parseFrontmatter(source);
  guides.push({ file, path, data, body });

  if (!topicSlugs.has(data.topic_slug)) errors.push(`${file}: unknown parent topic ${data.topic_slug}`);
  if (!data.guide_slug) errors.push(`${file}: missing guide_slug`);
  if (guideSlugs.has(data.guide_slug)) errors.push(`${file}: duplicate guide_slug ${data.guide_slug}`);
  guideSlugs.add(data.guide_slug);
  guideCountsByParent.set(data.topic_slug, (guideCountsByParent.get(data.topic_slug) ?? 0) + 1);
  if (!allowedKinds.has(data.kind)) errors.push(`${file}: invalid kind ${data.kind}`);
  if (data.status !== 'reviewed') errors.push(`${file}: practical page must be reviewed`);
  if (!Array.isArray(data.tools) || data.tools.length === 0) errors.push(`${file}: missing tools`);
  if (data.interfaces !== undefined && !Array.isArray(data.interfaces)) errors.push(`${file}: interfaces must be an array`);
  if (!data.execution_script) {
    const evidence = practicalEvidenceByGuide.get(data.guide_slug);
    if (evidence?.evidence_class !== 'real-interface-walkthrough' || evidence?.interface !== true || evidence?.execution_script !== null) {
      errors.push(`${file}: execution-script exception requires declared real-interface-walkthrough evidence`);
    }
    if (!Array.isArray(data.interfaces) || data.interfaces.length === 0) errors.push(`${file}: interface walkthrough missing interfaces`);
    if ((data.interfaces ?? []).some((entry) => /\b(?:CLI|terminal|shell|command line|HPC|scheduler|API|Python)\b/i.test(entry))) {
      errors.push(`${file}: interface-only walkthrough declares a command-oriented interface`);
    }
    if (/```/.test(body)) errors.push(`${file}: interface-only walkthrough contains a fenced executable claim`);
  }
  if (!Array.isArray(data.tested_versions) || data.tested_versions.length === 0) errors.push(`${file}: missing tested_versions`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewed_at ?? '')) errors.push(`${file}: invalid reviewed_at`);
  if (!data.summary || data.summary.length < 20) errors.push(`${file}: summary is too short`);

  if (data.kind === 'implementation') {
    if (!/^## (?:Purpose|What this guide verifies)$/m.test(body)) errors.push(`${file}: missing Purpose or What this guide verifies`);
    if (!body.includes('Official sources')) errors.push(`${file}: missing Official sources`);
  }
  if (data.kind === 'worked-example' && !/What this example does not establish|claim boundary/i.test(body)) {
    errors.push(`${file}: worked example is missing its claim boundary`);
  }
  if (/^## (?:Inputs|Outputs|Requirement|Repeatability|Dependencies|Alternatives|Exclusions)$/m.test(body)) {
    errors.push(`${file}: restores a fixed article contract`);
  }
  if (/universal recommended|universally sufficient/i.test(body)) errors.push(`${file}: suggests a universal parameter rule`);

  if (data.execution_script) {
    try {
      await access(new URL(data.execution_script, root));
    } catch {
      errors.push(`${file}: missing execution script ${data.execution_script}`);
    }
  }
  try {
    await access(new URL(data.review, root));
  } catch {
    errors.push(`${file}: missing review record ${data.review}`);
  }

  const manifestSourceIds = sourcesByGuide.get(data.guide_slug) ?? [];
  if (JSON.stringify(data.source_ids) !== JSON.stringify(manifestSourceIds)) {
    errors.push(`${file}: source_ids do not match sources/practical-guide-links.json`);
  }
  const expectedUrls = new Set(data.source_ids.map((id) => sourceById.get(id)?.url).filter(Boolean));
  if (expectedUrls.size !== data.source_ids.length) errors.push(`${file}: unresolved source_id`);
  const actualUrls = extractUrls(body);
  const missingUrls = difference(expectedUrls, actualUrls);
  const undeclaredUrls = difference(actualUrls, expectedUrls);
  if (missingUrls.length) errors.push(`${file}: missing declared source URLs: ${missingUrls.join(', ')}`);
  if (undeclaredUrls.length) errors.push(`${file}: undeclared external URLs: ${undeclaredUrls.join(', ')}`);

  if (!Array.isArray(data.media_ids)) errors.push(`${file}: missing media_ids`);
  for (const mediaId of data.media_ids ?? []) {
    if (usedMediaIds.has(mediaId)) errors.push(`${mediaId}: media asset is reused by more than one page`);
    usedMediaIds.add(mediaId);
    const asset = mediaById.get(mediaId);
    if (!asset) {
      errors.push(`${file}: unresolved media_id ${mediaId}`);
      continue;
    }
    if (asset.guide_slug !== data.guide_slug) errors.push(`${file}: media ${mediaId} belongs to ${asset.guide_slug}`);
    if (!asset.alt || !asset.caption || !asset.reuse_basis || !asset.created_at) errors.push(`${mediaId}: incomplete media provenance`);
    if (asset.provenance_type !== 'original' && (!asset.source_url || !asset.accessed_at)) {
      errors.push(`${mediaId}: external media lacks source or access date`);
    }
    try {
      await access(new URL(`public/${asset.path}`, root));
    } catch {
      errors.push(`${mediaId}: missing media file public/${asset.path}`);
    }
  }
}

for (const slug of requiredGuideSlugs) if (!guideSlugs.has(slug)) errors.push(`missing required reviewed practical page ${slug}`);
for (const [parent, minimum] of requiredParentMinimum) {
  const count = guideCountsByParent.get(parent) ?? 0;
  if (count < minimum) errors.push(`${parent}: expected at least ${minimum} practical pages, found ${count}`);
}

for (const source of sourceManifest.sources) {
  if (!['page', 'doi'].includes(source.kind)) errors.push(`${source.id}: invalid practical source kind ${source.kind}`);
  if (!source.url.startsWith('https://')) errors.push(`${source.id}: practical source is not HTTPS`);
}
if (sourceById.size !== sourceManifest.sources.length) errors.push('duplicate practical source IDs');
if (mediaById.size !== mediaManifest.assets.length) errors.push('duplicate practical media IDs');
if (sourceManifest.guides.length !== guides.length) errors.push('practical source manifest guide count mismatch');
for (const manifestGuide of sourceManifest.guides) {
  if (!guideSlugs.has(manifestGuide.guide_slug)) errors.push(`source manifest contains unknown guide ${manifestGuide.guide_slug}`);
}
for (const asset of mediaManifest.assets) {
  if (!guideSlugs.has(asset.guide_slug)) errors.push(`${asset.id}: media manifest references unknown guide ${asset.guide_slug}`);
  if (!usedMediaIds.has(asset.id)) errors.push(`${asset.id}: orphaned media manifest entry`);
}

const reviewPaths = new Set(guides.map((guide) => guide.data.review));
for (const reviewPath of reviewPaths) {
  const review = await readFile(new URL(reviewPath, root), 'utf8');
  const normalizedReview = review.replace(/\s+/g, ' ').toLowerCase();
  const requirements = reviewRequirements.get(reviewPath);
  if (!requirements) {
    errors.push(`${reviewPath}: no practical review requirements declared`);
    continue;
  }
  for (const statement of requirements) {
    if (!normalizedReview.includes(statement.toLowerCase())) errors.push(`${reviewPath}: missing review boundary ${JSON.stringify(statement)}`);
  }
}

if (errors.length > 0) {
  console.error(`Practical-guide validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Practical guides valid: ${guides.length} reviewed pages across ${guideCountsByParent.size} parent topics with execution scripts where executable claims are made, exact official or primary sources, original-media provenance, and review-specific claim boundaries.`);
