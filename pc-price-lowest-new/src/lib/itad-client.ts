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

// モックデータ生成関数
function generateMockGameData(itadId: string) {
  const gameNames: Record<string, string> = {
    '018d937f-2a29-7310-9c92-389377742acf': '7 Days to Die',
    'default': 'Sample Game'
  };
  
  const gameName = gameNames[itadId] || gameNames.default;
  const basePrice = Math.floor(Math.random() * 5000) + 1000; // 1000-6000円
  
  return {
    data: {
      [itadId]: {
        title: gameName,
        list: [
          {
            id: "61",
            name: "Steam", 
            priceJPY: basePrice,
            availability: "available",
            discountPercent: Math.floor(Math.random() * 50),
            regularPriceJPY: Math.floor(basePrice * 1.2),
            url: `https://store.steampowered.com/app/${Math.floor(Math.random() * 100000)}/`,
            timestamp: new Date().toISOString(),
            isOnSale: Math.random() > 0.5
          },
          {
            id: "16",
            name: "Epic Games Store",
            priceJPY: Math.floor(basePrice * 1.1),
            availability: "available",
            discountPercent: Math.floor(Math.random() * 30),
            regularPriceJPY: Math.floor(basePrice * 1.3),
            url: `https://www.epicgames.com/store/p/${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            isOnSale: Math.random() > 0.5
          },
          {
            id: "35",
            name: "GOG",
            priceJPY: Math.floor(basePrice * 0.95),
            availability: "available",
            discountPercent: Math.floor(Math.random() * 40),
            regularPriceJPY: Math.floor(basePrice * 1.15),
            url: `https://www.gog.com/game/${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            isOnSale: Math.random() > 0.5
          }
        ],
        summary: {
          allTimeLow: {
            priceJPY: Math.floor(basePrice * 0.5),
            shopName: "Steam",
            timestamp: "2023-12-25T00:00:00Z"
          }
        }
      }
    }
  };
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
    // CORS制限のため、デモ用のモックデータを返します
    console.warn('[ITAD Client] Using mock data due to CORS restrictions in browser environment');
    
    // デモ用のモックデータ
    const mockGameData = generateMockGameData(itadId);
    return mockGameData;
    
  } catch (error) {
    console.error('[ITAD Client] Mock data generation failed:', error);
    throw error;
  }
}
