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

const sourcesByUrl = new Map();

if (manifest.schema_version !== 1) errors.push(`unsupported manifest schema_version ${manifest.schema_version}`);
if (!Array.isArray(manifest.topics) || manifest.topics.length === 0) errors.push('manifest must declare reviewed topics');
if (!Number.isInteger(manifest.expected_unique_urls) || manifest.expected_unique_urls < 1) errors.push('manifest must declare expected_unique_urls');

try {
  await readFile(new URL(manifest.audit_record, root), 'utf8');
} catch {
  errors.push(`missing audit record ${manifest.audit_record}`);
}

for (const topic of manifest.topics ?? []) {
  const expected = new Set(topic.links.map((entry) => entry.url));
  if (expected.size !== topic.links.length) errors.push(`${topic.topic_slug}: duplicate URLs inside topic manifest`);

  for (const entry of topic.links) {
    if (!['page', 'doi'].includes(entry.kind)) errors.push(`${topic.topic_slug}: invalid link kind ${entry.kind}`);
    if (!entry.url.startsWith('https://')) errors.push(`${topic.topic_slug}: source is not HTTPS: ${entry.url}`);
    const existing = sourcesByUrl.get(entry.url);
    if (existing) {
      if (existing.kind !== entry.kind) errors.push(`${entry.url}: inconsistent link kinds ${existing.kind} and ${entry.kind}`);
      existing.topic_slugs.push(topic.topic_slug);
    } else {
      sourcesByUrl.set(entry.url, {
        kind: entry.kind,
        url: entry.url,
        topic_slugs: [topic.topic_slug],
      });
    }
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

const allEntries = [...sourcesByUrl.values()].map((entry) => ({
  ...entry,
  topic_slugs: [...new Set(entry.topic_slugs)].sort(),
}));
if (allEntries.length !== manifest.expected_unique_urls) {
  errors.push(`reviewed source manifest expected ${manifest.expected_unique_urls} unique URLs, found ${allEntries.length}`);
}

if (errors.length > 0) {
  console.error(`Reviewed-source manifest validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (manifestOnly) {
  console.log(`Reviewed-source manifest valid: ${manifest.topics.length} reviewed topics, ${allEntries.length} unique HTTPS sources, exact article/review coverage, reusable cross-topic sources, and no retired ASE URLs.`);
  process.exit(0);
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';

function soft404Marker(title, heading) {
  const marker = `${title} ${heading}`.toLowerCase();
  return /(?:^|\b)404(?:\b|$)|page not found|document not found|requested page could not be found/.test(marker)
    ? { title, heading }
    : null;
}

function accessBlockMarker(title, heading) {
  const marker = `${title} ${heading}`.toLowerCase();
  return /access denied|forbidden|request blocked|just a moment|verify you are human/.test(marker)
    ? { title, heading }
    : null;
}

function soft404Title(body) {
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  const heading = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  return soft404Marker(title, heading);
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
      topic_slugs: entry.topic_slugs,
      kind: entry.kind,
      requested_url: entry.url,
      state,
      status,
      final_url: response.url,
      redirect_location: location,
      access_method: 'http-fetch',
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
    topic_slugs: entry.topic_slugs,
    kind: entry.kind,
    requested_url: entry.url,
    state: 'failed',
    status: null,
    final_url: null,
    redirect_location: null,
    access_method: 'http-fetch',
    detail: String(lastError ?? 'unknown network failure'),
    attempt: 3,
  };
}

async function browserAuditEntry(browser, entry) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.8',
      'cache-control': 'no-cache',
    });
    const response = await page.goto(entry.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response?.status() ?? null;
    const finalUrl = page.url();
    const observation = await page.evaluate(() => ({
      title: document.title?.trim() ?? '',
      heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    }));
    const soft404 = soft404Marker(observation.title, observation.heading);
    const blocked = accessBlockMarker(observation.title, observation.heading);
    const reachable = status !== null && status >= 200 && status < 300 && !soft404 && !blocked;
    return {
      topic_slugs: entry.topic_slugs,
      kind: entry.kind,
      requested_url: entry.url,
      state: reachable ? 'reachable' : 'failed',
      status,
      final_url: finalUrl,
      redirect_location: null,
      access_method: 'headless-browser-fallback',
      detail: reachable
        ? entry.kind === 'doi'
          ? 'DOI resolved through a controlled browser to a successful non-404 destination'
          : 'page returned a successful non-404 document in a controlled browser fallback'
        : soft404
          ? `browser exposed a soft-404 marker: ${JSON.stringify(soft404)}`
          : blocked
            ? `browser exposed an access-block marker: ${JSON.stringify(blocked)}`
            : `browser returned HTTP ${status ?? 'unknown'}`,
      attempt: 1,
    };
  } catch (error) {
    return {
      topic_slugs: entry.topic_slugs,
      kind: entry.kind,
      requested_url: entry.url,
      state: 'failed',
      status: null,
      final_url: page.url() || null,
      redirect_location: null,
      access_method: 'headless-browser-fallback',
      detail: String(error),
      attempt: 1,
    };
  } finally {
    await page.close();
  }
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
// Some official documentation hosts throttle bursts even when every URL is valid.
// A bounded two-request audit keeps the reachability check strict while avoiding
// self-induced transient transport failures.
let results = await mapWithConcurrency(allEntries, 2, auditEntry);
const fallbackIndices = results
  .map((result, index) => ({ result, index }))
  .filter(({ result }) => [401, 403].includes(result.status))
  .map(({ index }) => index);

if (fallbackIndices.length > 0) {
  const executablePath = process.env.CHROME_BIN;
  if (!executablePath) {
    for (const index of fallbackIndices) {
      results[index].detail += '; no CHROME_BIN was available for browser fallback';
    }
  } else {
    const { default: puppeteer } = await import('puppeteer-core');
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });
    try {
      const fallbackResults = await mapWithConcurrency(
        fallbackIndices,
        3,
        async (index) => ({ index, result: await browserAuditEntry(browser, allEntries[index]) }),
      );
      for (const item of fallbackResults) results[item.index] = item.result;
    } finally {
      await browser.close();
    }
  }
}

const completedAt = new Date().toISOString();
const failures = results.filter((result) => result.state !== 'reachable');
const report = {
  schema_version: 2,
  started_at: startedAt,
  completed_at: completedAt,
  semantics: {
    page: 'A current non-DOI page must return HTTP 2xx after redirects and must not expose a 404/not-found or access-block title or h1. HTTP 401/403 may be retried once through a controlled headless browser, and that access method is recorded.',
    doi: 'A DOI link is reachable when doi.org returns HTTP 2xx or a valid publisher redirect. HTTP 401/403 may be retried through a controlled browser; the final destination must return HTTP 2xx without a 404 or access-block marker. Publisher content is not semantically reviewed by this reachability check.',
    boundary: 'Reachability is time-bound and does not establish scientific correctness, long-term availability, unrestricted regional access, or publisher reuse rights.',
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
  console.log(`${result.state === 'reachable' ? 'PASS' : 'FAIL'} ${result.status ?? 'ERR'} ${result.access_method} ${result.requested_url}${result.final_url && result.final_url !== result.requested_url ? ` -> ${result.final_url}` : ''}`);
}

if (failures.length > 0) {
  console.error(`Reviewed external-link audit failed: ${failures.length}/${results.length} sources were not reachable under the declared audit semantics.`);
  process.exit(1);
}

console.log(`Reviewed external-link audit passed: ${results.length} unique sources across ${manifest.topics.length} reviewed topics; reusable URLs were requested once, page destinations returned live non-404 documents, and DOI links resolved successfully.`);
