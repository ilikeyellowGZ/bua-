// Supabase Edge Function: transcribe-audio
//
// Proxies a recorded practice-audio file to a real speech-to-text provider so
// the OPENAI_API_KEY never reaches the client bundle. Deploy with:
//   supabase functions deploy transcribe-audio
//   supabase secrets set OPENAI_API_KEY=sk-...
//
// Called by the client via supabase.functions.invoke('transcribe-audio', ...),
// which automatically forwards the caller's auth token — verify_jwt stays on
// (the default) so only authenticated users can reach this function.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_MODEL = 'whisper-1';

type TranscribeRequest = {
  /** Path within the private "practice-audio" bucket, e.g. "<userId>/<recordingId>.m4a". */
  storagePath: string;
  /** BCP-47/ISO-639-1 language hint, e.g. "zu" for isiZulu. */
  language?: string;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured for this Supabase project.' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { storagePath, language }: TranscribeRequest = await request.json();
  if (!storagePath.startsWith(`${user.id}/`)) {
    return Response.json({ error: 'You may only transcribe your own recordings.' }, { status: 403 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: audioFile, error: downloadError } = await adminClient.storage
    .from('practice-audio')
    .download(storagePath);
  if (downloadError || !audioFile) {
    return Response.json(
      { error: `Could not read the recording: ${downloadError?.message ?? 'not found'}` },
      { status: 404 },
    );
  }

  const form = new FormData();
  form.append('file', audioFile, storagePath.split('/').pop() ?? 'recording.m4a');
  form.append('model', OPENAI_MODEL);
  if (language) form.append('language', language);

  const transcriptionResponse = await fetch(OPENAI_TRANSCRIPTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${openAiApiKey}` },
    body: form,
  });

  if (!transcriptionResponse.ok) {
    const detail = await transcriptionResponse.text();
    return Response.json(
      { error: `Speech-to-text provider error: ${detail}` },
      { status: 502 },
    );
  }

  const { text } = (await transcriptionResponse.json()) as { text: string };
  return Response.json({ transcript: text });
});
