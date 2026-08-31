import { getSupabaseClient } from '@/infra/supabase/client';

export type DeletionStatus = { requestedAt: string | null };

export type AccountRepository = {
  requestDeletion(): Promise<DeletionStatus>;
  cancelDeletionRequest(): Promise<void>;
  getDeletionStatus(): Promise<DeletionStatus>;
};

export function createDemoAccountRepository(): AccountRepository {
  let requestedAt: string | null = null;

  return {
    async requestDeletion() {
      requestedAt = requestedAt ?? new Date().toISOString();
      return { requestedAt };
    },
    async cancelDeletionRequest() {
      requestedAt = null;
    },
    async getDeletionStatus() {
      return { requestedAt };
    },
  };
}

export type SupabaseAccountClient = Pick<ReturnType<typeof getSupabaseClient>, 'from'>;

type SupabaseAccountRepositoryOptions = {
  client?: SupabaseAccountClient;
};

export function createSupabaseAccountRepository({
  client = getSupabaseClient(),
}: SupabaseAccountRepositoryOptions = {}): AccountRepository {
  return {
    async requestDeletion() {
      const requestedAt = new Date().toISOString();
      const { error } = await client
        .from('profiles')
        .update({ deletion_requested_at: requestedAt });
      if (error) throw new Error(error.message);
      return { requestedAt };
    },
    async cancelDeletionRequest() {
      const { error } = await client
        .from('profiles')
        .update({ deletion_requested_at: null });
      if (error) throw new Error(error.message);
    },
    async getDeletionStatus() {
      const { data, error } = await client
        .from('profiles')
        .select('deletion_requested_at')
        .single();
      if (error) throw new Error(error.message);
      return { requestedAt: data?.deletion_requested_at ?? null };
    },
  };
}

export const accountRepository: AccountRepository =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'false'
    ? createSupabaseAccountRepository()
    : createDemoAccountRepository();
