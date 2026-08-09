import navigationDocument from '../../workflow/contextual-navigation.json';
import { getTools } from './tools';
import { getWorkflowTopics } from './workflow';

export type ContextualRelation = 'Next' | 'Related check' | 'If this fails' | 'Use another code';

export type ContextualSource =
  | { kind: 'topic'; slug: string }
  | { kind: 'practical'; guide_slug: string }
  | { kind: 'tool'; slug: string };

type ContextualTarget =
  | { kind: 'topic'; slug: string }
  | { kind: 'support'; route: 'troubleshooting' | 'software-bridge'; anchor?: string };

interface ContextualLinkDefinition {
  relation: ContextualRelation;
  title: string;
  target: ContextualTarget;
  note: string;
}

interface ContextualPageDefinition {
  source: ContextualSource;
  links: ContextualLinkDefinition[];
}

interface ContextualNavigationDefinition {
  schema_version: number;
  role: string;
  boundary: string;
  pages: ContextualPageDefinition[];
}

export interface ResolvedContextualLink {
  relation: ContextualRelation;
  title: string;
  path: string;
  note: string;
}

export interface ResolvedContextualNavigation {
  sourceKey: string;
  links: ResolvedContextualLink[];
}

const definition = navigationDocument as unknown as ContextualNavigationDefinition;
const allowedRelations = new Set<ContextualRelation>(['Next', 'Related check', 'If this fails', 'Use another code']);
const topicSlugs = new Set(getWorkflowTopics().map((topic) => topic.slug));
const toolSlugs = new Set(getTools().map((tool) => tool.slug));
const supportRoutes = {
  troubleshooting: 'operations/troubleshooting/',
  'software-bridge': 'operations/software-bridge/',
} as const;

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function contextualSourceKey(source: ContextualSource): string {
  if (source.kind === 'practical') return `practical:${source.guide_slug}`;
  return `${source.kind}:${source.slug}`;
}

function contextualTargetKey(target: ContextualTarget): string {
  if (target.kind === 'topic') return `topic:${target.slug}`;
  return `support:${target.route}${target.anchor ? `#${target.anchor}` : ''}`;
}

function resolveTarget(target: ContextualTarget): string {
  if (target.kind === 'topic') return `operations/${target.slug}/`;
  const route = supportRoutes[target.route];
  return target.anchor ? `${route}#${target.anchor}` : route;
}

function validateDefinition(): void {
  if (definition.schema_version !== 1 || definition.role !== 'build-time-contextual-cross-index') {
    throw new Error('Contextual navigation: unsupported schema or role');
  }
  if (!nonempty(definition.boundary) || !Array.isArray(definition.pages)) {
    throw new Error('Contextual navigation: boundary and pages are required');
  }

  const seenSources = new Set<string>();
  for (const page of definition.pages) {
    const sourceKey = contextualSourceKey(page.source);
    if (seenSources.has(sourceKey)) throw new Error(`Contextual navigation: duplicate source ${sourceKey}`);
    seenSources.add(sourceKey);

    if (page.source.kind === 'topic' && !topicSlugs.has(page.source.slug)) {
      throw new Error(`Contextual navigation: unknown topic source ${page.source.slug}`);
    }
    if (page.source.kind === 'tool' && !toolSlugs.has(page.source.slug)) {
      throw new Error(`Contextual navigation: unknown tool source ${page.source.slug}`);
    }
    if (page.source.kind === 'practical' && !nonempty(page.source.guide_slug)) {
      throw new Error('Contextual navigation: practical source requires guide_slug');
    }
    if (!Array.isArray(page.links) || page.links.length < 1 || page.links.length > 3) {
      throw new Error(`Contextual navigation: ${sourceKey} must contain one to three links`);
    }

    const seenTargets = new Set<string>();
    for (const link of page.links) {
      if (!allowedRelations.has(link.relation) || !nonempty(link.title) || !nonempty(link.note)) {
        throw new Error(`Contextual navigation: ${sourceKey} has an incomplete link`);
      }
      if (link.target.kind === 'topic' && !topicSlugs.has(link.target.slug)) {
        throw new Error(`Contextual navigation: unknown topic target ${link.target.slug}`);
      }
      if (link.target.kind === 'support') {
        if (!(link.target.route in supportRoutes)) {
          throw new Error(`Contextual navigation: unknown support target ${link.target.route}`);
        }
        if (link.target.anchor && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(link.target.anchor)) {
          throw new Error(`Contextual navigation: invalid support anchor ${link.target.anchor}`);
        }
      }
      const targetKey = contextualTargetKey(link.target);
      if (targetKey === sourceKey) throw new Error(`Contextual navigation: ${sourceKey} links to itself`);
      if (seenTargets.has(targetKey)) throw new Error(`Contextual navigation: ${sourceKey} repeats ${targetKey}`);
      seenTargets.add(targetKey);
    }
  }
}

validateDefinition();

const pageBySource = new Map(definition.pages.map((page) => [contextualSourceKey(page.source), page]));

export function getContextualNavigation(source: ContextualSource): ResolvedContextualNavigation | undefined {
  const sourceKey = contextualSourceKey(source);
  const page = pageBySource.get(sourceKey);
  if (!page) return undefined;
  return {
    sourceKey,
    links: page.links.map((link) => ({
      relation: link.relation,
      title: link.title,
      path: resolveTarget(link.target),
      note: link.note,
    })),
  };
}
