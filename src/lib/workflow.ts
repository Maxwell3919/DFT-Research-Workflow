import workflowDocument from '../../workflow/topics.json';

export type WorkflowSectionId = 'A' | 'B' | 'C' | 'D' | 'E';

export interface WorkflowTopic {
  slug: string;
  title: string;
  section: WorkflowSectionId;
  sectionTitle: string;
  group: string;
  groupTitle: string;
  groupSummary: string;
}

export interface WorkflowGroup {
  id: string;
  slug: string;
  title: string;
  summary: string;
  topics: Array<{ slug: string; title: string }>;
}

export interface WorkflowSection {
  id: WorkflowSectionId;
  slug: string;
  title: string;
  role: 'backbone' | 'branching-library';
  summary: string;
  groups: WorkflowGroup[];
}

export interface MigrationSources {
  core_operations?: string[];
  legacy_routes?: string[];
  recipes?: string[];
}

export const workflowSections = workflowDocument.sections as WorkflowSection[];

const workflowTopics: WorkflowTopic[] = workflowSections.flatMap((section) =>
  section.groups.flatMap((group) =>
    group.topics.map((topic) => ({
      ...topic,
      section: section.id,
      sectionTitle: section.title,
      group: group.id,
      groupTitle: group.title,
      groupSummary: group.summary,
    })),
  ),
);

const migrationSources = workflowDocument.migration_sources as Record<string, MigrationSources>;

export function getWorkflowTopics(): WorkflowTopic[] {
  return [...workflowTopics];
}

export function getWorkflowTopic(slug: string): WorkflowTopic {
  const topic = workflowTopics.find((candidate) => candidate.slug === slug);
  if (!topic) throw new Error(`Unknown workflow topic: ${slug}`);
  return topic;
}

export function getMigrationSources(slug: string): MigrationSources {
  return migrationSources[slug] ?? {};
}
