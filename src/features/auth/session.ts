import { authRepository } from '@/features/auth/auth.repository';

let ownerIdPromise: Promise<string> | null = null;

export function getOwnerId(): Promise<string> {
  if (!ownerIdPromise) {
    ownerIdPromise = (async () => {
      const restored = await authRepository.restoreSession();
      if (restored) return restored.userId;
      const guest = await authRepository.continueAsGuest();
      return guest.userId;
    })();
  }
  return ownerIdPromise;
}
