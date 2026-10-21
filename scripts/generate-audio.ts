/**
 * Turns the practice scripts into natural-voice MP3s with ElevenLabs.
 *
 *   npm run audio -- --voices              list the voices on your ElevenLabs account
 *   npm run audio -- --dry-run             show what would be generated, and how many characters it uses
 *   npm run audio                          generate everything that's missing (both languages)
 *   npm run audio -- --locale en           only one language
 *
 * Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env (see .env.example). Files go to public/audio/, named
 * after a hash of their words, so editing a step regenerates just that step. Files no script uses any more
 * are deleted. public/audio/manifest.json tells the app which recordings exist.
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioFile, audioKey } from '../src/lib/session.ts';
import { en } from '../src/practices/en.ts';
import { es } from '../src/practices/es.ts';
import type { PracticeContent } from '../src/practices/types.ts';

const CONTENT: Record<string, PracticeContent> = { en, es };
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
const API = 'https://api.elevenlabs.io/v1';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
const modelId = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';

interface Job {
  key: string;
  file: string;
  text: string;
  previous?: string;
  next?: string;
}

function jobs(locales: string[]): Job[] {
  return locales.flatMap((locale) =>
    Object.entries(CONTENT[locale].practices).flatMap(([practiceId, script]) =>
      script.segments.map((segment, i) => ({
        key: audioKey(locale, practiceId, segment.id),
        file: audioFile(locale, practiceId, segment),
        text: segment.text,
        previous: script.segments[i - 1]?.text,
        next: script.segments[i + 1]?.text,
      })),
    ),
  );
}

async function listVoices() {
  const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': apiKey! } });
  if (!res.ok) throw new Error(`Listing voices failed: ${res.status} ${await res.text()}`);
  const { voices } = (await res.json()) as {
    voices: { voice_id: string; name: string; labels?: Record<string, string> }[];
  };
  for (const v of voices) console.log(`${v.voice_id}  ${v.name}  ${Object.values(v.labels ?? {}).join(', ')}`);
  console.log('\nPut the id of a calm, warm voice in .env as ELEVENLABS_VOICE_ID.');
}

async function speak(job: Job, attempt = 1): Promise<Uint8Array> {
  const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: job.text,
      model_id: modelId,
      // Steady, unhurried delivery suits guided practice.
      voice_settings: { stability: 0.7, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.9 },
      previous_text: job.previous,
      next_text: job.next,
    }),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    await new Promise((r) => setTimeout(r, 2000 * attempt));
    return speak(job, attempt + 1);
  }
  if (!res.ok) throw new Error(`${job.key}: ${res.status} ${await res.text()}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function listFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.mp3')).map((e) => join(e.parentPath, e.name));
}

async function main() {
  if (!apiKey && !flag('--dry-run')) throw new Error('Set ELEVENLABS_API_KEY in .env first (see .env.example).');
  if (flag('--voices')) return listVoices();
  if (!voiceId && !flag('--dry-run')) throw new Error('Set ELEVENLABS_VOICE_ID in .env. Run with --voices to see your voices.');

  const locale = option('--locale');
  const locales = locale ? [locale] : Object.keys(CONTENT);
  if (locales.some((l) => !CONTENT[l])) throw new Error(`Unknown locale. Use one of: ${Object.keys(CONTENT).join(', ')}`);

  const all = jobs(Object.keys(CONTENT));
  const missing = jobs(locales).filter((job) => !existsSync(join(ROOT, job.file)));
  const characters = missing.reduce((n, job) => n + job.text.length, 0);
  console.log(`${missing.length} of ${jobs(locales).length} steps need audio (${characters.toLocaleString()} characters).`);
  if (flag('--dry-run')) return;

  for (const [i, job] of missing.entries()) {
    const path = join(ROOT, job.file);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, await speak(job));
    console.log(`[${i + 1}/${missing.length}] ${job.file}`);
  }

  // Remove recordings of words that have since changed, then list what's there for the app.
  const wanted = new Set(all.map((job) => join(ROOT, job.file)));
  for (const file of await listFiles(ROOT)) {
    if (!wanted.has(file)) {
      await rm(file);
      console.log(`removed stale ${relative(ROOT, file)}`);
    }
  }
  const manifest = Object.fromEntries(all.filter((job) => existsSync(join(ROOT, job.file))).map((job) => [job.key, job.file]));
  await writeFile(join(ROOT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest.json lists ${Object.keys(manifest).length} recordings.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
