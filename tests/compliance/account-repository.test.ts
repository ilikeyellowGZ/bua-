import {
  createDemoAccountRepository,
  createSupabaseAccountRepository,
  type SupabaseAccountClient,
} from '@/features/compliance/account.repository';

describe('demo account repository', () => {
  it('has no pending deletion request by default', async () => {
    const repository = createDemoAccountRepository();
    expect(await repository.getDeletionStatus()).toEqual({ requestedAt: null });
  });

  it('records a deletion request and reports it back', async () => {
    const repository = createDemoAccountRepository();
    const { requestedAt } = await repository.requestDeletion();
    expect(requestedAt).toEqual(expect.any(String));
    expect(await repository.getDeletionStatus()).toEqual({ requestedAt });
  });

  it('keeps the original request timestamp across repeated requests', async () => {
    const repository = createDemoAccountRepository();
    const first = await repository.requestDeletion();
    const second = await repository.requestDeletion();
    expect(second).toEqual(first);
  });

  it('lets the user cancel a pending deletion request', async () => {
    const repository = createDemoAccountRepository();
    await repository.requestDeletion();
    await repository.cancelDeletionRequest();
    expect(await repository.getDeletionStatus()).toEqual({ requestedAt: null });
  });
});

describe('Supabase account repository', () => {
  it('updates the caller-scoped profile row when requesting deletion', async () => {
    const update = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ update });
    const client = { from } as unknown as SupabaseAccountClient;
    const repository = createSupabaseAccountRepository({ client });

    const { requestedAt } = await repository.requestDeletion();

    expect(from).toHaveBeenCalledWith('profiles');
    expect(update).toHaveBeenCalledWith({ deletion_requested_at: requestedAt });
  });

  it('clears the deletion timestamp when cancelling', async () => {
    const update = jest.fn().mockResolvedValue({ error: null });
    const client = {
      from: jest.fn().mockReturnValue({ update }),
    } as unknown as SupabaseAccountClient;
    const repository = createSupabaseAccountRepository({ client });

    await repository.cancelDeletionRequest();

    expect(update).toHaveBeenCalledWith({ deletion_requested_at: null });
  });

  it('reads the current deletion status for the caller', async () => {
    const single = jest
      .fn()
      .mockResolvedValue({ data: { deletion_requested_at: '2026-08-31T00:00:00.000Z' }, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const client = {
      from: jest.fn().mockReturnValue({ select }),
    } as unknown as SupabaseAccountClient;
    const repository = createSupabaseAccountRepository({ client });

    expect(await repository.getDeletionStatus()).toEqual({
      requestedAt: '2026-08-31T00:00:00.000Z',
    });
  });

  it('surfaces a Supabase error instead of silently succeeding', async () => {
    const update = jest.fn().mockResolvedValue({ error: { message: 'not authenticated' } });
    const client = {
      from: jest.fn().mockReturnValue({ update }),
    } as unknown as SupabaseAccountClient;
    const repository = createSupabaseAccountRepository({ client });

    await expect(repository.requestDeletion()).rejects.toThrow('not authenticated');
  });
});
