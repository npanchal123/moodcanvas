import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null when this copy of the app isn't connected to a Supabase project; sync is then hidden. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Mobile-number sign-in needs an SMS service connected to the Supabase project (each text costs money), so it's opt-in. */
export const phoneSignIn = import.meta.env.VITE_PHONE_SIGN_IN === 'on';
