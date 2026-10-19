// Supabase Edge Function (Deno). Deploy with: supabase functions deploy delete-account
//
// Deleting a user needs the service-role key, which must never reach the browser,
// so the app calls this function instead. It only ever deletes the caller's own
// account: the user id comes from their verified access token, never from the request body.
// Their entries go with it (entries.user_id references auth.users ON DELETE CASCADE).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'not_signed_in' });

  // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to every Edge Function automatically.
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json(401, { error: 'not_signed_in' });

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error('delete-account failed:', deleteError.message);
    return json(500, { error: 'delete_failed' });
  }
  return json(200, { deleted: true });
});
