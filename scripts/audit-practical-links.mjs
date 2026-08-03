import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('sources/practical-guide-links.json', root), 'utf8'));
const artifactDirectory = process.env.PRACTICAL_LINK_AUDIT_ARTIFACT_DIR;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userAgent = 'Mozilla/5.0 DFT-Research-Workflow-Practical-Link-Audit/1.0';

function soft404(body) {
  const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  const heading = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  return /(?:^|\b)404(?:\b|$)|page not found|document not found|requested page could not be found/i.test(`${title} ${heading}`)
    ? { title, heading }
    : null;
}

async function request(source, attempt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(source.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': userAgent,
        accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'cache-control': 'no-cache',
      },
    });
    const status = response.status;
    let state = 'failed';
    let detail = `HTTP ${status}`;
    if (status >= 200 && status < 300) {
      const contentType = response.headers.get('content-type') ?? '';
      if (/text\/html|application\/xhtml\+xml/i.test(contentType)) {
        const body = await response.text();
        const marker = soft404(body);
        if (marker) detail = `soft-404 marker: ${JSON.stringify(marker)}`;
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
      requested_url: source.url,
      final_url: response.url,
      status,
      state,
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
    requested_url: source.url,
    final_url: null,
    status: null,
    state: 'failed',
    detail: String(lastError ?? 'unknown network failure'),
    attempt: 3,
  };
}

const startedAt = new Date().toISOString();
const results = [];
for (const source of manifest.sources) results.push(await audit(source));
const completedAt = new Date().toISOString();
const failures = results.filter((result) => result.state !== 'reachable');
const report = {
  schema_version: 1,
  started_at: startedAt,
  completed_at: completedAt,
  semantics: 'Each official practical-guide page must return a live HTTP 2xx non-soft-404 document after redirects.',
  boundary: 'Reachability is time-bound and does not establish semantic accuracy, software execution, or scientific validity.',
  source_count: results.length,
  reachable_count: results.length - failures.length,
  failed_count: failures.length,
  results,
};

if (artifactDirectory) {
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(join(artifactDirectory, 'practical-link-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
}
for (const result of results) console.log(`${result.state === 'reachable' ? 'PASS' : 'FAIL'} ${result.status ?? 'ERR'} ${result.source_id} ${result.requested_url}`);
if (failures.length > 0) {
  console.error(`Practical-guide source audit failed: ${failures.length}/${results.length} destinations unavailable.`);
  process.exit(1);
}
console.log(`Practical-guide source audit passed: ${results.length}/${results.length} official destinations returned live non-404 documents.`);
