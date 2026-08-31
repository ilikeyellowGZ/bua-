import { getLocalPersistence } from '@/infra/local/persistence-singleton';
import { createProgressTracker, type ProgressTracker } from '@/features/progress/progress-tracker';

let trackerPromise: Promise<ProgressTracker> | null = null;

export function getProgressTracker(): Promise<ProgressTracker> {
  if (!trackerPromise) trackerPromise = getLocalPersistence().then(createProgressTracker);
  return trackerPromise;
}
