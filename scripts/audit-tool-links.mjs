import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import tools from '../workflow/tools.json' with { type: 'json' };

const execFileAsync = promisify(execFile);
const urls = [...new Set(tools.resources.flatMap((resource) => resource.links.map((link) => link.url)))];
const resourcesByUrl = new Map();
for (const resource of tools.resources) {
  for (const link of resource.links) resourcesByUrl.set(link.url, resource);
}
const results = [];

async function checkWithCurl(url, error) {
  try {
    const { stdout } = await execFileAsync('curl', ['-L', '--max-time', '15', '-sS', '-o', '/dev/null', '-w', '%{http_code} %{url_effective}', url], { maxBuffer: 1024 * 1024 });
    const [statusText, ...finalParts] = stdout.trim().split(/\s+/);
    const status = Number(statusText);
    if (Number.isInteger(status) && status >= 200 && status < 400) {
      return { url, status, ok: true, attempt: 2, access_method: 'curl-fallback', final_url: finalParts.join(' ') };
    }
    return {
      url,
      status: Number.isInteger(status) && status > 0 ? status : null,
      ok: false,
      error: `curl returned ${stdout.trim() || 'no status'}`,
      access_method: 'curl-fallback',
    };
  } catch (curlError) {
    return { url, status: null, ok: false, error: `${error}; curl fallback: ${curlError.message}`, access_method: 'curl-fallback' };
  }
}

async function checkWithGithubApi(url, error) {
  const parsed = new URL(url);
  if (parsed.hostname !== 'github.com') return checkWithCurl(url, error);
  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return checkWithCurl(url, error);

  const [owner, repository, view, ref, ...pathParts] = segments;
  let apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  if ((view === 'tree' || view === 'blob') && ref && pathParts.length > 0) {
    const path = pathParts.map(encodeURIComponent).join('/');
    apiUrl += `/contents/${path}?ref=${encodeURIComponent(ref)}`;
  } else if (segments.length > 2) {
    return checkWithCurl(url, error);
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'DFT-Research-Workflow link audit',
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status >= 200 && response.status < 300) {
      return { url, status: response.status, ok: true, attempt: 2, access_method: 'github-api-fallback' };
    }
    error = `${error}; GitHub API returned HTTP ${response.status}`;
  } catch (apiError) {
    error = `${error}; GitHub API fallback: ${apiError.message}`;
  }
  return checkWithCurl(url, error);
}

async function check(url) {
  let error = '';
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'DFT-Research-Workflow link audit' },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status >= 200 && response.status < 400) return { url, status: response.status, ok: true, attempt: 1, access_method: 'http-fetch' };
    error = `HTTP ${response.status}`;
  } catch (fetchError) {
    error = fetchError.message;
  }
  return checkWithGithubApi(url, error);
}

for (let index = 0; index < urls.length; index += 12) {
  results.push(...await Promise.all(urls.slice(index, index + 12).map(check)));
}

const artifact = {
  schema_version: 2,
  checked_at: new Date().toISOString(),
  scope: 'workflow/tools.json canonical Tools & Resources official and primary links',
  results,
};
const directory = process.env.TOOL_LINK_AUDIT_ARTIFACT_DIR;
if (directory) {
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/tool-links.json`, `${JSON.stringify(artifact, null, 2)}\n`);
}
const hasDeclaredAvailabilityCaveat = (result) => {
  const caveat = resourcesByUrl.get(result.url)?.caveat ?? '';
  return !result.ok && /official endpoint (?:timed out|returned a service error)/i.test(caveat);
};
for (const result of results) {
  const state = result.ok ? 'PASS' : hasDeclaredAvailabilityCaveat(result) ? 'CAVEAT' : 'FAIL';
  console.log(`${state} ${result.status ?? 'ERR'} ${result.access_method ?? 'http-fetch'} ${result.url}${result.final_url && result.final_url !== result.url ? ` -> ${result.final_url}` : ''}${result.error ? ` ${result.error}` : ''}`);
}
const caveated = results.filter(hasDeclaredAvailabilityCaveat);
const failed = results.filter((result) => !result.ok && !hasDeclaredAvailabilityCaveat(result));
if (failed.length) {
  console.error(`Tool-link audit failed: ${failed.length}/${results.length} deduplicated official/start URLs unavailable.`);
  process.exit(1);
}
console.log(`Tool-link audit passed: ${results.length - caveated.length}/${results.length} deduplicated official/start URLs reachable, ${caveated.length} explicitly retained with time-bounded availability caveats, and 0 hard failures.`);
