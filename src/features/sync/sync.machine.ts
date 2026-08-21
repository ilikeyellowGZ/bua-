import { setup } from 'xstate';

type SyncEvent =
  | { type: 'START' }
  | { type: 'COMPLETE' }
  | { type: 'FAIL' }
  | { type: 'RETRY' }
  | { type: 'CANCEL' };

export const syncMachine = setup({
  types: { events: {} as SyncEvent },
}).createMachine({
  id: 'bua-sync',
  initial: 'idle',
  states: {
    idle: { on: { START: 'reconciling' } },
    reconciling: { on: { COMPLETE: 'idle', FAIL: 'backing_off', CANCEL: 'cancelled' } },
    backing_off: { on: { RETRY: 'reconciling', CANCEL: 'cancelled' } },
    cancelled: { on: { START: 'reconciling' } },
  },
});
