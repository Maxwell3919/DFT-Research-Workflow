import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import tools from '../workflow/tools.json' with { type: 'json' };

const execFileAsync = promisify(execFile);
const urls = [...new Set(tools.tools.flatMap((tool) => [
  tool.homepage,
  tool.documentation,
  tool.source_repository,
  tool.getting_started?.url,
].filter(Boolean)))];
const results = [];
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function checkWithCurl(url, error) {
  try {
    const { stdout } = await execFileAsync('curl', ['-L', '--max-time', '25', '-sS', '-o', '/dev/null', '-w', '%{http_code} %{url_effective}', url], { maxBuffer: 1024 * 1024 });
    const [statusText, ...finalParts] = stdout.trim().split(/\s+/);
    const status = Number(statusText);
    if (Number.isInteger(status) && status >= 200 && status < 400) {
      return { url, status, ok: true, attempt: 3, access_method: 'curl-fallback', final_url: finalParts.join(' ') };
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

async function check(url) {
  let error = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'DFT-Research-Workflow link audit' } });
      if (response.status >= 200 && response.status < 400) return { url, status: response.status, ok: true, attempt, access_method: 'http-fetch' };
      error = `HTTP ${response.status}`;
    } catch (fetchError) {
      error = fetchError.message;
    }
    if (attempt < 2) await delay(1000);
  }
  return checkWithCurl(url, error);
}

for (let index = 0; index < urls.length; index += 6) {
  results.push(...await Promise.all(urls.slice(index, index + 6).map(check)));
}

const artifact = {
  schema_version: 2,
  checked_at: new Date().toISOString(),
  scope: 'workflow/tools.json official resources and curated start URLs',
  results,
};
const directory = process.env.TOOL_LINK_AUDIT_ARTIFACT_DIR;
if (directory) {
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/tool-links.json`, `${JSON.stringify(artifact, null, 2)}\n`);
}
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.status ?? 'ERR'} ${result.access_method ?? 'http-fetch'} ${result.url}${result.final_url && result.final_url !== result.url ? ` -> ${result.final_url}` : ''}${result.error ? ` ${result.error}` : ''}`);
}
const failed = results.filter((result) => !result.ok);
if (failed.length) {
  console.error(`Tool-link audit failed: ${failed.length}/${results.length} deduplicated official/start URLs unavailable.`);
  process.exit(1);
}
console.log(`Tool-link audit passed: ${results.length}/${results.length} deduplicated official/start URLs reachable.`);
