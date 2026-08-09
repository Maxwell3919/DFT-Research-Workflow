import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const fail = (message) => {
  console.error(`topic-authority validation failed: ${message}`);
  process.exit(1);
};

const topicsDocument = readJson('workflow/topics.json');
const reviewedDocument = readJson('sources/reviewed-links.json');
const authorityDocument = readJson('sources/topic-authority.json');
const topicSlugs = topicsDocument.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.topics.map((topic) => topic.slug)),
);
const reviewedByTopic = new Map(reviewedDocument.topics.map((record) => [record.topic_slug, record]));
const entries = authorityDocument.entries;

if (topicSlugs.length !== 46) fail(`expected the frozen 46-topic registry, found ${topicSlugs.length}`);
if (!Array.isArray(entries) || entries.length !== 46) fail(`expected exactly 46 authority entries, found ${entries?.length ?? 0}`);
const entrySlugs = entries.map((entry) => entry.topic_slug);
if (new Set(entrySlugs).size !== entrySlugs.length) fail('topic_slug values must be unique');
if (entrySlugs.some((slug, index) => slug !== topicSlugs[index])) fail('authority entries must cover the exact topic registry in registry order');

const expectedTextbookKeys = ['martin', 'sholl-steckel', 'giustino'];
const textbookKeys = Object.keys(authorityDocument.textbooks ?? {});
if (textbookKeys.length !== expectedTextbookKeys.length || expectedTextbookKeys.some((key) => !textbookKeys.includes(key))) {
  fail(`textbooks must be exactly: ${expectedTextbookKeys.join(', ')}`);
}
const textbookRoles = new Set();
for (const key of expectedTextbookKeys) {
  const textbook = authorityDocument.textbooks[key];
  for (const field of ['citation', 'role', 'do_not_copy']) {
    if (typeof textbook?.[field] !== 'string' || textbook[field].trim() === '') fail(`textbook ${key} needs a non-empty ${field}`);
  }
  if (textbookRoles.has(textbook.role)) fail(`textbook role is duplicated for ${key}`);
  textbookRoles.add(textbook.role);
  for (const forbiddenField of ['url', 'publisher_url', 'quote', 'excerpt']) {
    if (forbiddenField in textbook) fail(`textbook ${key} must not declare ${forbiddenField}`);
  }
}

const allowedTextbooks = new Set([...expectedTextbookKeys, 'none']);
for (const entry of entries) {
  const reviewed = reviewedByTopic.get(entry.topic_slug);
  if (!reviewed) fail(`${entry.topic_slug} has no reviewed-link record`);
  if (!allowedTextbooks.has(entry.textbook_key)) fail(`${entry.topic_slug} has an unsupported textbook key`);
  if (entry.textbook_key === 'none') {
    if (entry.topic_slug !== 'document-and-preserve-study') fail(`${entry.topic_slug} may not omit the textbook role`);
    if (typeof entry.textbook_reason !== 'string' || entry.textbook_reason.trim() === '') {
      fail('document-and-preserve-study needs an explicit reason for omitting a textbook');
    }
  } else if (entry.textbook_reason !== null) {
    fail(`${entry.topic_slug} must use null textbook_reason when a textbook is selected`);
  }

  if (!Array.isArray(entry.references) || entry.references.length < 1 || entry.references.length > 2) {
    fail(`${entry.topic_slug} must have one official reference and at most one specialist reference`);
  }
  const roles = entry.references.map((reference) => reference.role);
  if (new Set(roles).size !== roles.length) fail(`${entry.topic_slug} repeats a reference role`);
  if (roles.filter((role) => role === 'official').length !== 1) fail(`${entry.topic_slug} must have exactly one official reference`);
  if (roles.filter((role) => role === 'specialist').length > 1) fail(`${entry.topic_slug} has more than one specialist reference`);
  if (roles.some((role) => role !== 'official' && role !== 'specialist')) fail(`${entry.topic_slug} has an unsupported reference role`);

  const reviewedUrls = new Set((reviewed.links ?? []).map((link) => link.url));
  const urls = new Set();
  for (const reference of entry.references) {
    if (typeof reference.label !== 'string' || reference.label.trim() === '') fail(`${entry.topic_slug} has an empty reference label`);
    try {
      const parsed = new URL(reference.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol');
    } catch {
      fail(`${entry.topic_slug} has an invalid reference URL: ${reference.url}`);
    }
    if (!reviewedUrls.has(reference.url)) fail(`${entry.topic_slug} reference is not declared in its reviewed-link record: ${reference.url}`);
    if (urls.has(reference.url)) fail(`${entry.topic_slug} repeats a reference URL`);
    urls.add(reference.url);
  }
}

console.log('topic-authority validation passed: 46 topics, exact reviewed-link membership, bounded reference roles');
