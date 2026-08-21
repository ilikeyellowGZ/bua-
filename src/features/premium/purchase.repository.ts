export type PurchaseInterval = 'month' | 'year';

export type PurchaseProduct = {
  id: string;
  title: string;
  localizedPrice: string;
  interval: PurchaseInterval;
  monthlyEquivalent?: string;
  trialDays: number;
  renewalCopy: string;
};

export type PurchaseTransaction = {
  transactionId: string;
  requestId: string;
  productId: string;
  status: 'verified';
};

export type PremiumEntitlement = {
  id: 'premium';
  active: boolean;
  productId: string;
  source: 'demo' | 'app-store' | 'play-store';
};

export type PurchaseRepository = {
  getProducts(): Promise<readonly PurchaseProduct[]>;
  purchase(productId: string, requestId: string): Promise<PurchaseTransaction>;
  restore(): Promise<readonly PremiumEntitlement[]>;
  getEntitlements(): Promise<readonly PremiumEntitlement[]>;
  observeTransactionUpdates(listener: (transaction: PurchaseTransaction) => void): () => void;
};

export const demoStoreProducts: readonly PurchaseProduct[] = [
  {
    id: 'bua_premium_annual_za',
    title: 'Annual',
    localizedPrice: 'R599.99 / year',
    monthlyEquivalent: 'R49.99 per month',
    interval: 'year',
    trialDays: 7,
    renewalCopy: 'Then R599.99/year after your trial',
  },
  {
    id: 'bua_premium_monthly_za',
    title: 'Monthly',
    localizedPrice: 'R79.99 / month',
    interval: 'month',
    trialDays: 7,
    renewalCopy: 'Then R79.99/month after your trial',
  },
];

class DemoPurchaseRepository implements PurchaseRepository {
  private readonly requests = new Map<string, PurchaseTransaction>();
  private readonly listeners = new Set<(transaction: PurchaseTransaction) => void>();
  private entitlement: PremiumEntitlement | undefined;

  async getProducts() {
    return demoStoreProducts;
  }

  async purchase(productId: string, requestId: string) {
    const replay = this.requests.get(requestId);
    if (replay) return replay;
    if (!demoStoreProducts.some((product) => product.id === productId)) {
      throw new Error('The selected product is unavailable.');
    }
    const transaction: PurchaseTransaction = {
      transactionId: `demo-${requestId}`,
      requestId,
      productId,
      status: 'verified',
    };
    this.requests.set(requestId, transaction);
    this.entitlement = { id: 'premium', active: true, productId, source: 'demo' };
    this.listeners.forEach((listener) => listener(transaction));
    return transaction;
  }

  async restore() {
    return this.entitlement ? [this.entitlement] : [];
  }

  async getEntitlements() {
    return this.entitlement ? [this.entitlement] : [];
  }

  observeTransactionUpdates(listener: (transaction: PurchaseTransaction) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export function createDemoPurchaseRepository(): PurchaseRepository {
  return new DemoPurchaseRepository();
}

export const purchaseRepository = createDemoPurchaseRepository();
