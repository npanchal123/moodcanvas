import { useState, type FormEvent } from 'react';
import { tagLabel, useI18n } from '../i18n';
import { MAX_TAGS, SUGGESTED_TAGS, normalizeTag } from '../lib/tags';
import { btnSecondary, toggle } from './ui';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagEditor({ tags, onChange }: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const full = tags.length >= MAX_TAGS;
  const custom = tags.filter((tag) => !SUGGESTED_TAGS.includes(tag));

  function toggleTag(tag: string) {
    if (tags.includes(tag)) onChange(tags.filter((x) => x !== tag));
    else if (!full) onChange([...tags, tag]);
  }

  function addDraft(e: FormEvent) {
    e.preventDefault();
    const tag = normalizeTag(draft);
    // Typing a suggested tag's translated name stores the shared id, so filters match across languages.
    const id = SUGGESTED_TAGS.find((s) => tagLabel(t, s) === tag) ?? tag;
    if (id && !tags.includes(id) && !full) onChange([...tags, id]);
    setDraft('');
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-medium">{t.tags.legend}</legend>
      <p id="tag-hint" className="-mt-2 text-sm text-(--muted)">
        {t.tags.hint(MAX_TAGS)}
      </p>
      <div className="flex flex-wrap gap-2">
        {[...SUGGESTED_TAGS, ...custom].map((tag) => {
          const pressed = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={pressed}
              disabled={!pressed && full}
              onClick={() => toggleTag(tag)}
              className={`${toggle(pressed)} min-h-10 px-3 text-sm`}
            >
              {pressed && <span aria-hidden="true">✓</span>}
              {tagLabel(t, tag)}
            </button>
          );
        })}
      </div>
      <form onSubmit={addDraft} className="flex gap-2">
        <label htmlFor="custom-tag" className="sr-only">
          {t.tags.addLabel}
        </label>
        <input
          id="custom-tag"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={24}
          placeholder={t.tags.addPlaceholder}
          aria-describedby="tag-hint"
          disabled={full}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 placeholder:text-(--muted)"
        />
        <button type="submit" disabled={full || !normalizeTag(draft)} className={btnSecondary}>
          {t.tags.add}
        </button>
      </form>
    </fieldset>
  );
}
