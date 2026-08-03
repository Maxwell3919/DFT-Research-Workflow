import type { CollectionEntry } from 'astro:content';

export type PracticalGuideKind = CollectionEntry<'practicalGuides'>['data']['kind'];

export const practicalRouteSegment: Record<PracticalGuideKind, 'guides' | 'examples' | 'notes'> = {
  implementation: 'guides',
  'worked-example': 'examples',
  'visual-note': 'notes',
};

export const practicalKindLabel: Record<PracticalGuideKind, string> = {
  implementation: 'Practical Guide',
  'worked-example': 'Worked Example',
  'visual-note': 'Visual Note',
};

export const practicalSectionLabel: Record<PracticalGuideKind, string> = {
  implementation: 'Practical Guides',
  'worked-example': 'Worked Examples',
  'visual-note': 'Visual Notes',
};

export function practicalGuidePath(entry: CollectionEntry<'practicalGuides'>): string {
  return `operations/${entry.data.topic_slug}/${practicalRouteSegment[entry.data.kind]}/${entry.data.guide_slug}/`;
}
