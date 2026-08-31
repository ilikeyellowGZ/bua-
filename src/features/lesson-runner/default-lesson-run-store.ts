import { getLocalPersistence } from '@/infra/local/persistence-singleton';
import { createLessonRunStore, type LessonRunStore } from '@/features/lesson-runner/lesson-run.store';

let storePromise: Promise<LessonRunStore> | null = null;

export function getLessonRunStore(): Promise<LessonRunStore> {
  if (!storePromise) storePromise = getLocalPersistence().then(createLessonRunStore);
  return storePromise;
}
