// src/lib/itad-client.ts
// Client-side ITAD API functions for static deployment

import { ITADDeal, ITADGame, ITADStoreLow, ITADOverview, ITADBundle } from './types';

const ITAD_BASE = "https://api.isthereanydeal.com";

// 環境変数はビルド時に埋め込まれるため、GitHub Pages上では動作しません
// 代わりにプロキシサーバーを使用するか、パブリックAPIキーを使用する必要があります
// 今回は制限付きでデモ用の実装を提供します
const API_KEY = process.env.NEXT_PUBLIC_ITAD_API_KEY;

// デバッグ用
if (typeof window !== 'undefined') {
  console.log('[ITAD Client] API_KEY status:', API_KEY ? 'set' : 'not set');
}

// PC向けデフォルト
export const JP = "JP";
export const SHOPS_PC = [61, 16, 35, 37, 48, 6, 36]; // Steam, Epic Games Store, GOG, Humble Store, Microsoft Store, Fanatical, GreenManGaming

type FetchOpts = RequestInit & {
  retries?: number;
  retryDelayMs?: number;
  label?: string;
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// クライアントサイド用のfetch関数
export async function itadFetch(url: URL | string, opts: FetchOpts = {}) {
  if (!API_KEY) {
    console.error("[ITAD Client] API key not available in client environment");
    console.error("[ITAD Client] NEXT_PUBLIC_ITAD_API_KEY:", process.env.NEXT_PUBLIC_ITAD_API_KEY);
    throw new Error("API key required for ITAD API access - check environment variables");
  }

  const { retries = 2, retryDelayMs = 600, label = "itad", ...init } = opts;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);

  const urlObj = new URL(typeof url === "string" ? url : url.toString());
  if (!urlObj.searchParams.has("key") && API_KEY) {
    urlObj.searchParams.set("key", API_KEY);
  }
  url = urlObj;

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });

    if (res.ok) return res;

    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      console.warn(
        `[ITAD ${label}] ${res.status} ${res.statusText} -> retrying... (${retries} left)`
      );
      await sleep(retryDelayMs);
      return itadFetch(url, {
        ...init,
        retries: retries - 1,
        retryDelayMs: retryDelayMs * 2,
        label,
      });
    }

    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status}: ${res.statusText} ${
        text ? `| body=${text.slice(0, 256)}` : ""
      }`
    );
  } catch (err: unknown) {
    if (retries > 0) {
      console.warn(
        `[ITAD ${label}] error: ${
          err instanceof Error ? err.message : String(err)
        } -> retrying... (${retries} left)`
      );
      await sleep(retryDelayMs);
      return itadFetch(url, {
        ...init,
        retries: retries - 1,
        retryDelayMs: retryDelayMs * 2,
        label,
      });
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export async function itadSearchByTitle(query: string, results = 20) {
  const url = new URL(`${ITAD_BASE}/games/search/v1`);
  url.searchParams.set("title", query);
  url.searchParams.set("results", String(results));

  const r = await itadFetch(url, {
    method: "GET",
    label: "search",
  });
  const json = await r.json();
  return Array.isArray(json) ? json : [];
}

export async function itadPricesV3(
  ids: string[],
  country = JP,
  shops = SHOPS_PC
) {
  const url = new URL(`${ITAD_BASE}/games/prices/v3`);
  url.searchParams.set("country", country);
  url.searchParams.set("shops", shops.join(","));
  url.searchParams.set("deals", "false");
  url.searchParams.set("ids", ids.join(","));

  const r = await itadFetch(url, {
    method: "GET",
    label: "prices-v3",
  });
  return r.json();
}

export async function itadStoreLowV2(
  ids: string[],
  country = JP,
  shops = SHOPS_PC
) {
  const url = new URL(`${ITAD_BASE}/games/storelow/v2`);
  url.searchParams.set("country", country);
  url.searchParams.set("shops", shops.join(","));
  url.searchParams.set("ids", ids.join(","));

  const r = await itadFetch(url, {
    method: "GET",
    label: "storelow-v2",
  });
  return r.json();
}

export async function itadOverviewV2(ids: string[], country = JP) {
  const url = new URL(`${ITAD_BASE}/games/overview/v2`);
  url.searchParams.set("country", country);
  url.searchParams.set("ids", ids.join(","));

  const r = await itadFetch(url, {
    method: "GET",
    label: "overview-v2",
  });
  return r.json();
}

// クライアントサイドでの価格データ取得
export async function getQuoteData(itadId: string) {
  try {
    const [prices, storeLows, overview, priceOverview] = await Promise.all([
      itadPricesV3([itadId], JP, SHOPS_PC),
      itadStoreLowV2([itadId], JP, SHOPS_PC),
      itadOverviewV2([itadId], JP),
      itadOverviewV2([itadId], JP) // bundles情報も含まれる
    ]);

    // サーバーサイドのロジックと同様の処理
    interface StoreData {
      storeId: number;
      storeName: string;
      now?: {
        price: number | null;
        regularPrice: number | null;
        cut: number;
        isOnSale: boolean;
        subscriptionInfo: { service: string; type: "subscription" | "free" } | null;
        currency: string;
        url: string;
        ts: string;
      };
      storeLowAll?: {
        price: number | null;
        date: string;
      };
    }
    const priceMap = new Map<number, StoreData>();
    const p0 = prices?.[0] as ITADGame;
    const bundleInfo = (priceOverview as { bundles?: ITADBundle[] })?.bundles || [];
    
    const gameTitle: string = overview?.[0]?.title || p0?.title || itadId;

    const ensureRow = (
      map: Map<number, StoreData>,
      shop: { id: number; name: string }
    ): StoreData => {
      const cur = map.get(shop.id);
      if (cur) return cur;
      const row: StoreData = { storeId: shop.id, storeName: shop.name };
      map.set(shop.id, row);
      return row;
    };

    // 現在価格
    (p0?.deals ?? []).forEach((d: ITADDeal) => {
      const row = ensureRow(priceMap, d.shop);
      const price = d.price?.amountInt ?? d.price?.amount ?? null;
      const regularPrice = d.regular?.amountInt ?? d.regular?.amount ?? null;
      const cut = d.cut ?? 0;
      
      const isOnSale = !!(cut > 0 && regularPrice && price && price < regularPrice);
      
      let subscriptionInfo: { service: string; type: "subscription" | "free" } | null = null;
      if (price === 0) {
        switch (d.shop?.id) {
          case 48:
            subscriptionInfo = { service: "Xbox Game Pass", type: "subscription" };
            break;
          case 16:
            subscriptionInfo = { service: "Epic Games Store", type: "free" };
            break;
        }
      }
      
      row.now = {
        price: price,
        regularPrice: regularPrice,
        cut: cut,
        isOnSale: isOnSale,
        subscriptionInfo: subscriptionInfo,
        currency: d.price?.currency ?? "JPY",
        url: d.url ?? "",
        ts: d.timestamp ?? new Date().toISOString(),
      };
    });

    // ストア別最安値
    const sl0 = storeLows?.[0] as { lows?: ITADStoreLow[] };
    (sl0?.lows ?? []).forEach((low: ITADStoreLow) => {
      const row = ensureRow(priceMap, low.shop);
      const lowPrice = typeof low.price === 'number' 
        ? low.price 
        : low.price?.amountInt ?? low.price?.amount ?? null;
      row.storeLowAll = {
        price: lowPrice,
        date: low.added ?? low.recorded ?? "",
      };
    });

    // 概要データ
    const ov0 = overview?.[0] as ITADOverview;
    const overviewPrice = ov0?.lowest?.price;
    const lowestPrice = typeof overviewPrice === 'number' 
      ? overviewPrice 
      : overviewPrice?.amountInt ?? overviewPrice?.amount ?? null;
    
    const summary = ov0?.lowest
      ? {
          allTimeLow: {
            price: lowestPrice,
            store: ov0.lowest.shop?.name ?? "",
            date: ov0.lowest.added ?? "",
          },
        }
      : {};

    const stores = Array.from(priceMap.values()).sort(
      (a, b) => a.storeId - b.storeId
    );

    return {
      data: {
        [itadId]: {
          title: gameTitle,
          list: stores
            .filter((store) => store.now?.price !== undefined && store.now?.price !== null)
            .map((store) => ({
              id: store.storeId.toString(),
              name: store.storeName,
              priceJPY: store.now!.price!,
              regularPriceJPY:
                typeof store.now?.regularPrice === "number" ? store.now.regularPrice : null,
              discountPercent: store.now?.cut || 0,
              isOnSale: store.now?.isOnSale || false,
              url: store.now?.url || "",
              availability: store.now?.price ? "available" : "unavailable",
              timestamp: store.now?.ts || new Date().toISOString(),
              subscriptionInfo: store.now?.subscriptionInfo || null,
            })),
          bundleInfo: bundleInfo?.map((bundle: ITADBundle) => ({
            name: bundle.title || '',
            url: bundle.url || '',
            priceJPY: bundle.tiers?.[0]?.price?.amountInt || 0,
          })) || null,
          storeLowAll: stores
            .filter((store) => store.storeLowAll && typeof store.storeLowAll.price === "number")
            .map((store) => ({
              id: store.storeId.toString(),
              name: store.storeName,
              priceJPY: store.storeLowAll!.price!,
              url: "",
              availability: "historical",
              timestamp: store.storeLowAll?.date || "",
            })),
          summary: {
            allTimeLow: summary.allTimeLow
              ? {
                  priceJPY:
                    typeof summary.allTimeLow.price === "number"
                      ? summary.allTimeLow.price
                      : 0,
                  shopName: summary.allTimeLow.store || "",
                  timestamp: summary.allTimeLow.date || "",
                }
              : null,
          },
        },
      },
    };
  } catch (error) {
    console.error("Quote data fetch error:", error);
    throw error;
  }
}