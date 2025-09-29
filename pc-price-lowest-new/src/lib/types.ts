import { subMonths, subYears } from 'date-fns';

export type PeriodPreset = "all" | "3y" | "1y" | "6m" | "3m" | "1m";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  all: "すべての期間",
  "3y": "3年間",
  "1y": "1年間", 
  "6m": "6ヶ月間",
  "3m": "3ヶ月間",
  "1m": "1ヶ月間"
};

export function periodToSinceDate(period: PeriodPreset): Date | null {
  const now = new Date();
  
  switch (period) {
    case "all":
      return null;
    case "3y":
      return subYears(now, 3);
    case "1y":
      return subYears(now, 1);
    case "6m":
      return subMonths(now, 6);
    case "3m":
      return subMonths(now, 3);
    case "1m":
      return subMonths(now, 1);
    default:
      return null;
  }
}

export interface SubscriptionInfo {
  service: string;
  type: "subscription" | "free";
}

export interface StoreRow {
  id: string;
  name: string;
  priceJPY: number;
  regularPriceJPY?: number | null;
  discountPercent?: number;
  isOnSale?: boolean;
  url: string;
  availability: string;
  timestamp: string;
  subscriptionInfo?: SubscriptionInfo | null;
}

export interface BundleInfo {
  name: string;
  url?: string;
  priceJPY?: number;
}

export interface ITADDeal {
  shop: { id: number; name: string };
  price?: { amountInt?: number; amount?: number; currency?: string };
  regular?: { amountInt?: number; amount?: number };
  cut?: number;
  url?: string;
  timestamp?: string;
}

export interface ITADGame {
  deals?: ITADDeal[];
  title?: string;
}

export interface ITADStoreLow {
  shop: { id: number; name: string };
  price?: { amountInt?: number; amount?: number } | number;
  added?: string;
  recorded?: string;
}

export interface ITADOverview {
  title?: string;
  lowest?: {
    price?: { amountInt?: number; amount?: number } | number;
    shop?: { name?: string };
    added?: string;
  };
}

export interface ITADBundle {
  title?: string;
  url?: string;
  tiers?: Array<{ price?: { amountInt?: number } }>;
}

export interface QuoteResponse {
  data: {
    [gameId: string]: {
      title?: string;
      list: StoreRow[];
      storeLowAll?: StoreRow[];
      storeLowPeriod?: StoreRow[];
      bundleInfo?: BundleInfo[] | null;
      summary?: {
        allTimeLow?: {
          priceJPY: number;
          shopName: string;
          timestamp: string;
        } | null;
      };
    };
  };
}