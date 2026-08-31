export type ConnectivityListener = (online: boolean) => void;

export type ConnectivityMonitor = {
  isOnline(): Promise<boolean>;
  /** Returns an unsubscribe function. */
  subscribe(listener: ConnectivityListener): () => void;
};

/**
 * Reports online unconditionally. A real network-state provider (e.g.
 * @react-native-community/netinfo) can satisfy the same interface to make
 * the sync orchestrator reactive to actual connectivity changes.
 */
export function createAlwaysOnlineMonitor(): ConnectivityMonitor {
  return {
    async isOnline() {
      return true;
    },
    subscribe() {
      return () => {};
    },
  };
}
