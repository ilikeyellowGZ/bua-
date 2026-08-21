insert into public.courses (id, language_code, language_name, title, published, content_version)
values ('course-isi-zulu', 'zu', 'isiZulu', 'Everyday isiZulu', true, 1)
on conflict (id) do update set
  language_code = excluded.language_code,
  language_name = excluded.language_name,
  title = excluded.title,
  published = excluded.published,
  content_version = excluded.content_version;

insert into public.units (id, course_id, title, sort_order, published)
values ('unit-greetings', 'course-isi-zulu', 'Greetings', 1, true)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  sort_order = excluded.sort_order,
  published = excluded.published;

insert into public.lessons (id, unit_id, title, duration_minutes, level, sort_order, published)
values ('lesson-introduce-yourself', 'unit-greetings', 'Introduce yourself', 12, 'Beginner', 1, true)
on conflict (id) do update set
  unit_id = excluded.unit_id,
  title = excluded.title,
  duration_minutes = excluded.duration_minutes,
  level = excluded.level,
  sort_order = excluded.sort_order,
  published = excluded.published;

insert into public.activities (id, lesson_id, kind, sort_order, required, content, published)
values
  ('activity-introduce-listen', 'lesson-introduce-yourself', 'listen', 1, true,
    '{"prompt":"Sawubona! Igama lami nguNeo.","translation":"Hello! My name is Neo."}', true),
  ('activity-introduce-phrase-builder', 'lesson-introduce-yourself', 'phrase-builder', 2, true,
    '{"prompt":"Hello, my name is Neo.","answer":"Sawubona. Igama lami nguNeo."}', true),
  ('activity-introduce-picture-match', 'lesson-introduce-yourself', 'picture-match', 3, true,
    '{"prompt":"Choose the greeting.","answer":"Sawubona"}', true),
  ('activity-introduce-conversation', 'lesson-introduce-yourself', 'conversation', 4, true,
    '{"prompt":"Sawubona! Unjani namhlanje?"}', true),
  ('activity-introduce-comprehension', 'lesson-introduce-yourself', 'comprehension', 5, true,
    '{"prompt":"What did Lerato say?","answer":"I’m Lerato."}', true),
  ('activity-introduce-dictation', 'lesson-introduce-yourself', 'dictation', 6, true,
    '{"prompt":"Listen and type what you hear.","answer":"Sawubona. Igama lami nguNeo."}', true),
  ('activity-introduce-pronunciation', 'lesson-introduce-yourself', 'pronunciation', 7, true,
    '{"prompt":"Tap each part to practise.","answer":"Sawubona. Igama lami nguNeo."}', true),
  ('activity-introduce-speak', 'lesson-introduce-yourself', 'speak', 8, true,
    '{"prompt":"Say the phrase","answer":"Sawubona. Igama lami nguNeo."}', true)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  required = excluded.required,
  content = excluded.content,
  published = excluded.published;
