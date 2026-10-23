import { useState } from 'react';
import { useI18n } from '../i18n';
import { BREAKER_TEXT, toSavedScript, type FeelingId } from '../lib/breaker';
import { savePractice } from '../lib/breaker/store';
import type { GoalId, SceneId } from '../lib/compose';
import type { VisualizeRequest } from '../lib/types';
import type { Playable } from '../practices';
import { btnSecondary } from './ui';

/** What the Library keeps about a composed practice besides its words, for filtering. */
export interface LibraryDetails {
  scene: SceneId | null;
  goal: GoalId;
  feeling?: FeelingId;
  action?: string;
  /** What it was made from, so it can be made again with changes. */
  request?: VisualizeRequest;
}

/** Saves a composed visualization to the Library. It says it's saved only once it has been. */
export function SaveToLibrary({ practice, minutes, details }: { practice: Playable; minutes: number; details: LibraryDetails }) {
  const { locale } = useI18n();
  const text = BREAKER_TEXT[locale].library;
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  async function save() {
    if (state === 'saving' || state === 'saved') return;
    setState('saving');
    try {
      await savePractice({ script: toSavedScript(practice), minutes, ...details });
      setState('saved');
    } catch {
      setState('failed');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {state !== 'saved' && (
        <button type="button" disabled={state === 'saving'} onClick={() => void save()} className={btnSecondary}>
          <span aria-hidden="true">☆</span>
          {text.save}
        </button>
      )}
      <p role="status" className={state === 'failed' ? 'font-medium text-(--danger)' : 'font-medium'}>
        {state === 'saved' ? `✓ ${text.saved}` : state === 'failed' ? text.saveFailed : ''}
      </p>
    </div>
  );
}
