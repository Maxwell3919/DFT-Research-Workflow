import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const manifestPath = new URL('sources/reviewed-links.json', root);
const manifestOnly = process.argv.includes('--manifest-only');
const artifactDirectory = process.env.LINK_AUDIT_ARTIFACT_DIR;
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];

function extractUrls(source) {
  return new Set(
    (source.match(/https?:\/\/[^\s<>()\]"']+/g) ?? [])
      .map((url) => url.replace(/[.,;:]+$/u, '')),
  );
}

function sameSet(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function setDifference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

const allEntries = [];
const globalUrls = new Set();

if (manifest.schema_version !== 1) errors.push(`unsupported manifest schema_version ${manifest.schema_version}`);
if (!Array.isArray(manifest.topics) || manifest.topics.length === 0) errors.push('manifest must declare reviewed topics');

try {
  await readFile(new URL(manifest.audit_record, root), 'utf8');
} catch {
  errors.push(`missing audit record ${manifest.audit_record}`);
}

for (const topic of manifest.topics ?? []) {
  const expected = new Set(topic.links.map((entry) => entry.url));
  if (expected.size !== topic.links.length) errors.push(`${topic.topic_slug}: duplicate URLs in manifest`);

  for (const entry of topic.links) {
    if (!['page', 'doi'].includes(entry.kind)) errors.push(`${topic.topic_slug}: invalid link kind ${entry.kind}`);
    if (!entry.url.startsWith('https://')) errors.push(`${topic.topic_slug}: source is not HTTPS: ${entry.url}`);
    if (globalUrls.has(entry.url)) errors.push(`duplicate URL across reviewed topics: ${entry.url}`);
    globalUrls.add(entry.url);
    allEntries.push({ ...entry, topic_slug: topic.topic_slug });
  }

  for (const path of [topic.article, topic.review]) {
    let source = '';
    try {
      source = await readFile(new URL(path, root), 'utf8');
    } catch {
      errors.push(`${topic.topic_slug}: missing source file ${path}`);
      continue;
    }
    const actual = extractUrls(source);
    if (!sameSet(actual, expected)) {
      const missing = setDifference(expected, actual);
      const undeclared = setDifference(actual, expected);
      if (missing.length > 0) errors.push(`${path}: missing manifest URLs: ${missing.join(', ')}`);
      if (undeclared.length > 0) errors.push(`${path}: undeclared external URLs: ${undeclared.join(', ')}`);
    }
    if (source.includes('wiki.fysik.dtu.dk/ase/')) errors.push(`${path}: retired ASE documentation host remains`);
  }
}

if (globalUrls.size !== 33) errors.push(`reviewed source manifest must contain 33 unique URLs, found ${globalUrls.size}`);

if (errors.length > 0) {
  console.error(`Reviewed-source manifest validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (manifestOnly) {
  console.log(`Reviewed-source manifest valid: ${manifest.topics.length} reviewed topics, ${globalUrls.size} unique HTTPS sources, exact article/review coverage, and no retired ASE URLs.`);
  process.exit(0);
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 DFT-Research-Workflow-Link-Audit/1.0';

function soft404Title(body) {
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  const heading = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  const marker = `${title} ${heading}`.toLowerCase();
  return /(?:^|\b)404(?:\b|$)|page not found|document not found|requested page could not be found/.test(marker)
    ? { title, heading }
    : null;
}

async function request(entry, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(entry.url, {
      method: 'GET',
      redirect: entry.kind === 'doi' ? 'manual' : 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': userAgent,
        accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.8',
        'cache-control': 'no-cache',
      },
    });

    const location = response.headers.get('location');
    const status = response.status;
    let state = 'failed';
    let detail = '';

    if (entry.kind === 'doi') {
      if (status >= 200 && status < 300) {
        state = 'reachable';
        detail = 'DOI resolver returned a successful response';
      } else if (status >= 300 && status < 400 && location) {
        state = 'reachable';
        detail = 'DOI resolver returned a publisher redirect';
      } else {
        detail = `DOI resolver returned HTTP ${status} without a usable redirect`;
      }
      await response.body?.cancel();
    } else if (status >= 200 && status < 300) {
      const contentType = response.headers.get('content-type') ?? '';
      if (/text\/html|application\/xhtml\+xml/i.test(contentType)) {
        const body = await response.text();
        const soft404 = soft404Title(body);
        if (soft404) {
          detail = `soft-404 marker in title or h1: ${JSON.stringify(soft404)}`;
        } else {
          state = 'reachable';
          detail = 'page returned a successful non-404 document';
        }
      } else {
        await response.body?.cancel();
        state = 'reachable';
        detail = `page returned successful content type ${contentType || 'unknown'}`;
      }
    } else {
      await response.body?.cancel();
      detail = `page returned HTTP ${status}`;
    }

    return {
      topic_slug: entry.topic_slug,
      kind: entry.kind,
      requested_url: entry.url,
      state,
      status,
      final_url: response.url,
      redirect_location: location,
      detail,
      attempt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function auditEntry(entry) {
  let lastResult = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      lastResult = await request(entry, attempt);
      if (lastResult.state === 'reachable') return lastResult;
      if (![429, 500, 502, 503, 504].includes(lastResult.status)) return lastResult;
    } catch (error) {
      lastError = error;
    }
    await delay(1000 * attempt);
  }
  return lastResult ?? {
    topic_slug: entry.topic_slug,
    kind: entry.kind,
    requested_url: entry.url,
    state: 'failed',
    status: null,
    final_url: null,
    redirect_location: null,
    detail: String(lastError ?? 'unknown network failure'),
    attempt: 3,
  };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

const startedAt = new Date().toISOString();
const results = await mapWithConcurrency(allEntries, 4, auditEntry);
const completedAt = new Date().toISOString();
const failures = results.filter((result) => result.state !== 'reachable');
const report = {
  schema_version: 1,
  started_at: startedAt,
  completed_at: completedAt,
  semantics: {
    page: 'A current non-DOI page must return HTTP 2xx after redirects and must not expose a 404/not-found title or h1.',
    doi: 'A DOI link is considered reachable when doi.org returns HTTP 2xx or a valid publisher redirect. Publisher access after the redirect is not asserted.',
    boundary: 'Reachability is time-bound and does not establish scientific correctness, long-term availability, or unrestricted regional access.',
  },
  topic_count: manifest.topics.length,
  unique_url_count: allEntries.length,
  reachable_count: results.length - failures.length,
  failed_count: failures.length,
  results,
};

if (artifactDirectory) {
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(join(artifactDirectory, 'reviewed-link-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
}

for (const result of results) {
  console.log(`${result.state === 'reachable' ? 'PASS' : 'FAIL'} ${result.status ?? 'ERR'} ${result.requested_url}${result.final_url && result.final_url !== result.requested_url ? ` -> ${result.final_url}` : ''}`);
}

if (failures.length > 0) {
  console.error(`Reviewed external-link audit failed: ${failures.length}/${results.length} sources were not reachable under the declared audit semantics.`);
  process.exit(1);
}

console.log(`Reviewed external-link audit passed: ${results.length} unique sources across ${manifest.topics.length} reviewed topics; page destinations returned live non-404 documents and DOI links resolved successfully.`);
