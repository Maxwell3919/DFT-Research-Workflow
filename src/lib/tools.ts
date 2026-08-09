import toolsDocument from '../../workflow/tools.json';
import { getWorkflowTopic } from './workflow';

export interface ToolGettingStarted {
  label: string;
  url: string;
}

export interface ToolRecord {
  slug: string;
  name: string;
  aliases: string[];
  category: string;
  interfaces: string[];
  access: 'open-source' | 'restricted-license' | 'registration-required' | 'free-proprietary';
  access_note?: string;
  verified_version?: string;
  role: string;
  use_when: string;
  first_action: string;
  input_objects: string[];
  output_objects: string[];
  verify: string;
  primary_topic: string;
  homepage: string;
  documentation: string;
  getting_started: ToolGettingStarted;
  source_repository: string | null;
  topics: string[];
}

const tools = toolsDocument.tools as ToolRecord[];

export const toolRegistryMetadata = {
  authority: toolsDocument.authority,
  scopeNote: toolsDocument.scope_note,
  verifiedAt: toolsDocument.verified_at,
} as const;

export const getTools = () => [...tools];

export function getTool(slug: string) {
  const tool = tools.find((entry) => entry.slug === slug);
  if (!tool) throw Error(`Unknown tool: ${slug}`);
  return tool;
}

export const getToolTopics = (tool: ToolRecord) => tool.topics.map(getWorkflowTopic);
