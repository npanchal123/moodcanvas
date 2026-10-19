export const SUGGESTED_TAGS = ['work', 'school', 'sleep', 'family', 'friends', 'health', 'exercise', 'money', 'weather'];

export const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 24;

export function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, ' ').slice(0, MAX_TAG_LENGTH);
}
