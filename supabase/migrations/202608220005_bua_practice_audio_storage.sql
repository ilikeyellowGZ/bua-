insert into storage.buckets (id, name, public)
values ('practice-audio', 'practice-audio', false)
on conflict (id) do nothing;

create policy practice_audio_insert_own on storage.objects for insert to authenticated
with check (
  bucket_id = 'practice-audio'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy practice_audio_select_own on storage.objects for select to authenticated
using (
  bucket_id = 'practice-audio'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy practice_audio_delete_own on storage.objects for delete to authenticated
using (
  bucket_id = 'practice-audio'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
