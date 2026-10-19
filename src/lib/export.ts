import { toBlob } from 'html-to-image';
import { effectiveIntensity } from './summary';
import type { EmotionEntry } from './types';

export async function nodeToPng(node: HTMLElement): Promise<Blob> {
  const backgroundColor = getComputedStyle(document.body).backgroundColor;
  const blob = await toBlob(node, { pixelRatio: 2, backgroundColor, cacheBust: true });
  if (!blob) throw new Error('Could not render the image');
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Uses the native share sheet where it can share files, otherwise downloads. */
export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title });
    return 'shared';
  }
  downloadBlob(blob, filename);
  return 'downloaded';
}

function csvCell(value: string | number | boolean | undefined, userText = false): string {
  let s = value == null ? '' : String(value);
  // Stop spreadsheet apps from running user-written text as a formula.
  if (userText && /^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function entriesToCsv(entries: EmotionEntry[], includeText: boolean): string {
  const header = [
    'id', 'createdAt', 'primaryEmotion', 'primaryIntensity', 'secondaryEmotion', 'secondaryIntensity',
    'valence', 'confidence', 'userRating', 'userAdjusted', 'tags', 'analyzerVersion',
  ];
  if (includeText) header.push('text');
  const rows = entries.map((e) => {
    const [, secondary] = e.emotions;
    const cells = [
      csvCell(e.id),
      csvCell(e.createdAt),
      csvCell(e.emotions[0]?.label),
      csvCell(effectiveIntensity(e)),
      csvCell(secondary?.label),
      csvCell(secondary?.intensity),
      csvCell(e.valence),
      csvCell(e.confidence),
      csvCell(e.userRating),
      csvCell(e.userAdjusted),
      csvCell(e.tags.join(';'), true),
      csvCell(e.analyzerVersion),
    ];
    if (includeText) cells.push(csvCell(e.text, true));
    return cells.join(',');
  });
  return [header.join(','), ...rows].join('\r\n');
}

export function entriesToJson(entries: EmotionEntry[], includeText: boolean): string {
  const data = entries.map(({ dirty, text, ...rest }) => (includeText ? { ...rest, text } : rest));
  return JSON.stringify(data, null, 2);
}
