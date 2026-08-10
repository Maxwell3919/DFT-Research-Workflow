import toolsDocument from '../../workflow/tools.json';
import { getWorkflowTopic, getWorkflowTopics } from './workflow';

export type ResourceAccess =
  | 'open'
  | 'registration'
  | 'institutional'
  | 'subscription'
  | 'commercial'
  | 'mixed'
  | 'restricted'
  | 'free-proprietary';

export type ResourceLinkRole =
  | 'homepage'
  | 'docs'
  | 'tutorial'
  | 'source'
  | 'download'
  | 'data'
  | 'manual'
  | 'standard'
  | 'community';

export interface ResourceLink {
  role: ResourceLinkRole;
  label: string;
  url: string;
}

export interface ResourceRecord {
  slug: string;
  name: string;
  aliases: string[];
  one_line: string;
  task_groups: string[];
  kind_tags: string[];
  interface_tags: string[];
  access: ResourceAccess;
  topics: string[];
  links: ResourceLink[];
  detail?: boolean;
  caveat?: string;
  language?: string;
  editorial_state: 'reviewed' | 'catalog' | 'candidate';
}

export interface ResourceTaskGroup {
  id: string;
  title: string;
  intro: string;
}

/** Compatibility type for existing contextual-navigation consumers. */
export type ToolRecord = ResourceRecord;

const resources = toolsDocument.resources as ResourceRecord[];
const taskGroups = toolsDocument.task_groups as ResourceTaskGroup[];
const detailSlugs = new Set(toolsDocument.tools.map((entry) => entry.slug));
const resourceBySlug = new Map(resources.map((resource) => [resource.slug, resource]));
const topicSlugs = new Set(getWorkflowTopics().map((topic) => topic.slug));

export const toolRegistryMetadata = {
  authority: toolsDocument.authority,
  scopeNote: toolsDocument.scope_note,
  verifiedAt: toolsDocument.reviewed_at,
  taskGroups: [...taskGroups],
} as const;

export const getResources = () => [...resources];

export const getResourceTaskGroups = () => [...taskGroups];

export function getResource(slug: string) {
  const resource = resourceBySlug.get(slug);
  if (!resource) throw Error(`Unknown resource: ${slug}`);
  return resource;
}

export function getResourcePath(resource: ResourceRecord) {
  return resource.detail ? `tools/${resource.slug}/` : `tools/#resource-${resource.slug}`;
}

export const getDetailedResources = () => resources.filter((resource) => detailSlugs.has(resource.slug));

/** Compatibility lookup for existing detail-page consumers. */
export const getTools = getDetailedResources;

/** Compatibility lookup for existing detail-page consumers. */
export function getTool(slug: string) {
  const resource = getResource(slug);
  if (!detailSlugs.has(slug)) throw Error(`Resource has no detail page: ${slug}`);
  return resource;
}

export const getResourceTopics = (resource: ResourceRecord) => resource.topics.map(getWorkflowTopic);

/** Compatibility lookup for existing detail-page consumers. */
export const getToolTopics = getResourceTopics;

export function getResourcesForTopic(topicSlug: string) {
  if (!topicSlugs.has(topicSlug)) throw Error(`Unknown workflow topic: ${topicSlug}`);
  return resources.filter((resource) => resource.topics.includes(topicSlug));
}

export function getResourcesForTaskGroup(taskGroupId: string) {
  if (!taskGroups.some((group) => group.id === taskGroupId)) throw Error(`Unknown resource task group: ${taskGroupId}`);
  return resources.filter((resource) => resource.task_groups.includes(taskGroupId));
}
