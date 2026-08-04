import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('sources/practical-guide-links.json', root), 'utf8'));
const artifactDirectory = process.env.PRACTICAL_LINK_AUDIT_ARTIFACT_DIR;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';

function marker(title, heading, pattern) {
  return pattern.test(`${title} ${heading}`.toLowerCase()) ? { title, heading } : null;
}

function soft404Marker(title, heading) {
  return marker(title, heading, /(?:^|\b)404(?:\b|$)|page not found|document not found|requested page could not be found/);
}

function accessBlockMarker(title, heading) {
  return marker(title, heading, /access denied|forbidden|request blocked|just a moment|verify you are human/);
}

function parseDocumentMarkers(body) {
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  const heading = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  return {
    soft404: soft404Marker(title, heading),
    blocked: accessBlockMarker(title, heading),
  };
}

async function request(source, attempt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(source.url, {
      method: 'GET',
      redirect: source.kind === 'doi' ? 'manual' : 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': userAgent,
        accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.8',
        'cache-control': 'no-cache',
      },
    });
    const status = response.status;
    const location = response.headers.get('location');
    let state = 'failed';
    let detail = `HTTP ${status}`;

    if (source.kind === 'doi') {
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
        const { soft404, blocked } = parseDocumentMarkers(body);
        if (soft404) detail = `soft-404 marker: ${JSON.stringify(soft404)}`;
        else if (blocked) detail = `access-block marker: ${JSON.stringify(blocked)}`;
        else {
          state = 'reachable';
          detail = 'successful non-404 document';
        }
      } else {
        await response.body?.cancel();
        state = 'reachable';
        detail = `successful content type ${contentType || 'unknown'}`;
      }
    } else {
      await response.body?.cancel();
    }

    return {
      source_id: source.id,
      kind: source.kind,
      requested_url: source.url,
      final_url: response.url,
      redirect_location: location,
      status,
      state,
      access_method: 'http-fetch',
      detail,
      attempt,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function audit(source) {
  let result = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      result = await request(source, attempt);
      if (result.state === 'reachable') return result;
      if (![429, 500, 502, 503, 504].includes(result.status)) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(1000 * attempt);
  }
  return result ?? {
    source_id: source.id,
    kind: source.kind,
    requested_url: source.url,
    final_url: null,
    redirect_location: null,
    status: null,
    state: 'failed',
    access_method: 'http-fetch',
    detail: String(lastError ?? 'unknown network failure'),
    attempt: 3,
  };
}

async function browserAudit(browser, source) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.8',
      'cache-control': 'no-cache',
    });
    const response = await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
      source_id: source.id,
      kind: source.kind,
      requested_url: source.url,
      final_url: finalUrl,
      redirect_location: null,
      status,
      state: reachable ? 'reachable' : 'failed',
      access_method: 'headless-browser-fallback',
      detail: reachable
        ? source.kind === 'doi'
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
      source_id: source.id,
      kind: source.kind,
      requested_url: source.url,
      final_url: page.url() || null,
      redirect_location: null,
      status: null,
      state: 'failed',
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
// Keep requests deliberately modest for documentation hosts that reject bursts.
let results = await mapWithConcurrency(manifest.sources, 2, audit);
const fallbackIndices = results
  .map((result, index) => ({ result, index }))
  .filter(({ result }) => result.state !== 'reachable' && (result.status === null || [401, 403].includes(result.status)))
  .map(({ index }) => index);

if (fallbackIndices.length > 0) {
  const executablePath = process.env.CHROME_BIN;
  if (!executablePath) {
    for (const index of fallbackIndices) results[index].detail += '; no CHROME_BIN was available for browser fallback';
  } else {
    const { default: puppeteer } = await import('puppeteer-core');
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
    });
    try {
      const fallbackResults = await mapWithConcurrency(
        fallbackIndices,
        3,
        async (index) => ({ index, result: await browserAudit(browser, manifest.sources[index]) }),
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
  schema_version: 3,
  started_at: startedAt,
  completed_at: completedAt,
  semantics: {
    page: 'A practical-guide page must return HTTP 2xx after redirects and must not expose a 404/not-found or access-block title or h1. HTTP 401/403 may use a controlled browser fallback.',
    doi: 'A DOI is reachable when doi.org returns HTTP 2xx or a valid publisher redirect. HTTP 401/403 may use a controlled browser fallback whose final destination must return HTTP 2xx without a 404 or access-block marker.',
    boundary: 'Reachability is time-bound and does not establish semantic accuracy, software execution, numerical convergence, physical validity, publisher reuse rights, or unrestricted regional access.',
  },
  source_count: results.length,
  reachable_count: results.length - failures.length,
  failed_count: failures.length,
  results,
};

if (artifactDirectory) {
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(join(artifactDirectory, 'practical-link-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
}
for (const result of results) {
  console.log(`${result.state === 'reachable' ? 'PASS' : 'FAIL'} ${result.status ?? 'ERR'} ${result.access_method} ${result.kind} ${result.requested_url}${result.final_url && result.final_url !== result.requested_url ? ` -> ${result.final_url}` : ''}`);
}
if (failures.length > 0) {
  console.error(`Practical-guide source audit failed: ${failures.length}/${results.length} destinations unavailable.`);
  process.exit(1);
}
console.log(`Practical-guide source audit passed: ${results.length}/${results.length} official pages or primary DOI resolvers satisfied the declared access semantics.`);
