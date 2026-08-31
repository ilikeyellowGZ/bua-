import { openBuaDatabase, type LocalPersistence } from '@/infra/local/database';

let persistencePromise: Promise<LocalPersistence> | null = null;

export function getLocalPersistence(): Promise<LocalPersistence> {
  if (!persistencePromise) persistencePromise = openBuaDatabase();
  return persistencePromise;
}
