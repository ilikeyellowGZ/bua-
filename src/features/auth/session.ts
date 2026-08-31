import { authRepository } from '@/features/auth/auth.repository';
import { monitoringService } from '@/features/monitoring/monitoring';

let ownerIdPromise: Promise<string> | null = null;

export function getOwnerId(): Promise<string> {
  if (!ownerIdPromise) {
    ownerIdPromise = (async () => {
      const restored = await authRepository.restoreSession();
      const userId = restored ? restored.userId : (await authRepository.continueAsGuest()).userId;
      monitoringService.setUser(userId);
      return userId;
    })();
  }
  return ownerIdPromise;
}
