// Supabase Edge Function: generate-lesson
//
// Generates a personalized isiZulu review lesson from a learner's own
// spaced-repetition due items, using an OpenAI chat model. The OPENAI_API_KEY
// never reaches the client bundle. Deploy with:
//   supabase functions deploy generate-lesson
//   supabase secrets set OPENAI_API_KEY=sk-...  (same secret already used by transcribe-audio)
//
// Called by the client via supabase.functions.invoke('generate-lesson', ...),
// which forwards the caller's auth token — verify_jwt stays on (the default)
// so only authenticated users can reach this function.
//
// The client re-validates the response against `lessonSchema` before using it
// and falls back to the deterministic generator on any failure — this
// function's output is never trusted blindly, since an LLM can produce
// isiZulu with subtle grammar mistakes.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

type ReviewWord = { zulu: string; english: string };

type GenerateLessonRequest = {
  words: ReviewWord[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
};

const LESSON_JSON_SCHEMA = {
  name: 'bua_review_lesson',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'activities'],
    properties: {
      title: { type: 'string' },
      activities: {
        type: 'array',
        minItems: 8,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'prompt', 'translation', 'answer', 'choices'],
          properties: {
            kind: {
              type: 'string',
              enum: [
                'listen',
                'phrase-builder',
                'picture-match',
                'conversation',
                'comprehension',
                'dictation',
                'pronunciation',
                'speak',
              ],
            },
            prompt: { type: 'string' },
            translation: { type: ['string', 'null'] },
            answer: { type: ['string', 'null'] },
            choices: {
              type: ['array', 'null'],
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['label', 'correct'],
                properties: {
                  label: { type: 'string' },
                  correct: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

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

  const { words, level }: GenerateLessonRequest = await request.json();
  if (!Array.isArray(words) || words.length === 0) {
    return Response.json({ error: 'At least one review word is required.' }, { status: 400 });
  }

  const wordList = words.map((word) => `${word.zulu} = ${word.english}`).join('\n');
  const systemPrompt = [
    'You are an isiZulu curriculum writer for a language-learning app called Bua.',
    'Write a short review lesson that reinforces ONLY the isiZulu words/phrases the',
    'learner already knows (given below) — do not introduce new vocabulary.',
    `Target level: ${level}. Grammar must be correct standard isiZulu.`,
    'Return exactly 8 activities, one of each kind, in this order: listen,',
    'phrase-builder, picture-match, conversation, comprehension, dictation,',
    'pronunciation, speak. For "listen": prompt is isiZulu, translation is English.',
    'For "phrase-builder": prompt is the English sentence, answer is the isiZulu',
    'sentence to build. For "picture-match": prompt is an instruction, answer is the',
    'isiZulu target word, choices are 3-4 English glosses with exactly one correct.',
    'For "conversation": prompt is isiZulu, translation is English, choices are 3',
    'isiZulu replies with exactly one correct. For "comprehension": prompt is a',
    'question, answer is the correct English meaning, choices are 3 English options',
    'with exactly one correct. For "dictation", "pronunciation", "speak": answer is',
    'the isiZulu sentence to practise, choices should be null.',
  ].join(' ');

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Words to review:\n${wordList}` },
      ],
      response_format: { type: 'json_schema', json_schema: LESSON_JSON_SCHEMA },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return Response.json({ error: `AI provider error: ${detail}` }, { status: 502 });
  }

  const completion = await response.json();
  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return Response.json({ error: 'AI provider returned no content.' }, { status: 502 });
  }

  return new Response(content, { headers: { 'Content-Type': 'application/json' } });
});
