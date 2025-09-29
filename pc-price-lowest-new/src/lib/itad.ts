// src/lib/itad.ts
// Server-only ITAD client (Next.js App Router)
import "server-only";

const ITAD_BASE = "https://api.isthereanydeal.com";
const API_KEY = process.env.ITAD_API_KEY?.trim();

if (!API_KEY) {
  // 立ち上げ時に気づけるように
  console.error("[ITAD] ITAD_API_KEY is not set");
}

// 追加：明示ガード（開発でも本番でも）
function assertApiKey() {
  if (!API_KEY) {
    throw new Error(
      "[ITAD] ITAD_API_KEY is not set (check .env.local and process.env scope)"
    );
  }
}

// PC向けデフォルト
export const JP = "JP";
// より多くのPC向けストアを含める（Steam, Epic, GOG, Microsoft Store, Humble Store, etc）
export const SHOPS_PC = [61, 16, 35, 37, 48, 6, 36]; // Steam, Epic Games Store, GOG, Humble Store, Microsoft Store, Fanatical, GreenManGaming

type FetchOpts = RequestInit & {
  retries?: number;
  retryDelayMs?: number;
  label?: string;
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// すべてのITAD呼び出しが通る共通fetch（タイムアウト・指数バックオフ・4xx/5xx処理）
export async function itadFetch(url: URL | string, opts: FetchOpts = {}) {
  assertApiKey();

  const { retries = 2, retryDelayMs = 600, label = "itad", ...init } = opts;

  // NOTE: Next.jsのfetchキャッシュ制御。POSTはno-store、GETはデフォルトでOK（呼び出し側で指定可能）
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);

  // ITAD API uses query parameter auth, not headers
  // Add API key to URL if not already present
  const urlObj = new URL(typeof url === "string" ? url : url.toString());
  if (!urlObj.searchParams.has("key") && API_KEY) {
    urlObj.searchParams.set("key", API_KEY);
  }
  url = urlObj;

  // デバッグしやすいログ
  const urlStr = typeof url === "string" ? url : url.toString();

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });

    if (res.ok) return res;

    // 429/5xx はリトライ、それ以外は即エラー
    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      console.warn(
        `[ITAD ${label}] ${res.status} ${res.statusText} -> retrying... (${retries} left) ${urlStr}`
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
          err instanceof Error ? err.message : err
        } -> retrying... (${retries} left) ${urlStr}`
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

/** 検索用：曖昧検索で候補を取得（GET /games/search/v1） */
export async function itadSearchByTitle(query: string, results = 20) {
  const url = new URL(`${ITAD_BASE}/games/search/v1`);
  url.searchParams.set("title", query);
  url.searchParams.set("results", String(results));
  // Note: API key will be added automatically by itadFetch

  const r = await itadFetch(url, {
    method: "GET",
    label: "search",
    cache: "no-store",
  });
  const json = await r.json();
  // 期待形: [{ id, title, slug?, type, assets? }, ...]
  return Array.isArray(json) ? json : [];
}

/** 現在価格一覧（POST /games/prices/v3） */
export async function itadPricesV3(
  ids: string[],
  country = JP,
  shops = SHOPS_PC
) {
  const url = new URL(`${ITAD_BASE}/games/prices/v3`);
  url.searchParams.set("country", country);
  url.searchParams.set("shops", shops.join(","));
  url.searchParams.set("deals", "false");
  // Note: API key will be added automatically by itadFetch

  const r = await itadFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
    label: "prices-v3",
  });
  return r.json();
}

/** ストア別の全期間最安（POST /games/storelow/v2） */
export async function itadStoreLowV2(
  ids: string[],
  country = JP,
  shops = SHOPS_PC
) {
  const url = new URL(`${ITAD_BASE}/games/storelow/v2`);
  url.searchParams.set("country", country);
  url.searchParams.set("shops", shops.join(","));
  // Note: API key will be added automatically by itadFetch

  const r = await itadFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
    label: "storelow-v2",
  });
  return r.json();
}

/** 全体の最安要約（POST /games/overview/v2） */
export async function itadOverviewV2(ids: string[], country = JP) {
  const url = new URL(`${ITAD_BASE}/games/overview/v2`);
  url.searchParams.set("country", country);
  // Note: API key will be added automatically by itadFetch

  const r = await itadFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
    label: "overview-v2",
  });
  return r.json();
}

// Backward compatibility: 既存の itadLookupByTitle を新しい search API にルーティング
export async function itadLookupByTitle(title: string) {
  const results = await itadSearchByTitle(title, 10);
  return { data: results };
}