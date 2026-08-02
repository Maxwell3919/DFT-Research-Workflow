import { getCollection, type CollectionEntry } from 'astro:content';

export const parts = [
  {
    id: 'common-workflow',
    anchor: 'part-i',
    label: 'Part I · Common DFT Workflow',
    range: 'Operations 00–17',
  },
  {
    id: 'property-workflows',
    anchor: 'part-ii',
    label: 'Part II · Property Workflows',
    range: 'Operations 18–33',
  },
  {
    id: 'closing-loop',
    anchor: 'part-iii',
    label: 'Part III · Closing the Loop',
    range: 'Operation 34',
  },
] as const;

export type OperationEntry = CollectionEntry<'operations'>;

export async function getOperations(): Promise<OperationEntry[]> {
  const entries = await getCollection('operations');
  return entries.sort((left, right) => left.data.number - right.data.number);
}
export function formatNumber(number: number): string {
  return String(number).padStart(2, '0');
}

export function getPart(partId: OperationEntry['data']['part']) {
  const part = parts.find((candidate) => candidate.id === partId);
  if (!part) throw new Error(`Unknown operation part: ${partId}`);
  return part;
}
