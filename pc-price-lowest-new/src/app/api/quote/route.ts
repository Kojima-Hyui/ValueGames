import { NextRequest, NextResponse } from "next/server";
import {
  itadPricesV3,
  itadStoreLowV2,
  itadOverviewV2,
  JP,
  SHOPS_PC,
} from "@/lib/itad";

interface Shop {
  id: number;
  name: string;
}

interface Price {
  amountInt?: number;
  amount?: number;
  currency?: string;
}

interface Deal {
  shop: Shop;
  price?: Price;
  regular?: Price;
  cut?: number;
  url?: string;
  timestamp?: string;
}

interface StoreLow {
  shop: Shop;
  price?: Price | number;
  added?: string;
  recorded?: string;
}

interface PricesData {
  title?: string;
  deals?: Deal[];
}

interface StoreLowData {
  lows?: StoreLow[];
}

interface OverviewData {
  title?: string;
  lowest?: {
    price?: Price | number;
    shop?: Shop;
    added?: string;
  };
}

interface SubscriptionInfo {
  service: string;
  type: "subscription" | "free";
}

interface StoreRow {
  storeId: number;
  storeName: string;
  now?: {
    price: number | null;
    regularPrice: number | null;
    cut: number;
    isOnSale: boolean;
    subscriptionInfo: SubscriptionInfo | null;
    currency: string;
    url: string;
    ts: string;
  };
  storeLowAll?: {
    price: number | null;
    date: string;
  };
}

// map helpers
const ensureRow = (
  map: Map<number, StoreRow>,
  shop: { id: number; name: string }
): StoreRow => {
  const cur = map.get(shop.id);
  if (cur) return cur;
  const row: StoreRow = { storeId: shop.id, storeName: shop.name };
  map.set(shop.id, row);
  return row;
};

export async function POST(req: NextRequest) {
  const { itadId } = (await req.json()) as {
    itadId: string;
  };
  if (!itadId)
    return NextResponse.json({ error: "itadId required" }, { status: 400 });

  try {
    const [prices, storeLows, overview, priceOverview] = await Promise.all([
      itadPricesV3([itadId], JP, SHOPS_PC),
      itadStoreLowV2([itadId], JP, SHOPS_PC),
      itadOverviewV2([itadId], JP),
      // 価格概要でバンドル情報も取得
      fetch(`https://api.isthereanydeal.com/games/overview/v2?country=${JP}&key=${process.env.ITAD_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([itadId])
      }).then(res => res.json())
    ]);

    const priceMap = new Map<number, StoreRow>();
    const p0 = prices?.[0] as PricesData | undefined;
    const bundleInfo = (priceOverview as { bundles?: Array<{ title?: string; url?: string; tiers?: Array<{ price?: { amountInt?: number } }> }> })?.bundles || [];
    
    // キャッシュからゲーム名を取得（セッションストレージなど）
    // 今回は簡単にoverviewとpricesから推測
    const gameTitle = overview?.[0]?.title || p0?.title || itadId;

    // 現在価格
    (p0?.deals ?? []).forEach((d: Deal) => {
      const row = ensureRow(priceMap, d.shop);
      const price = d.price?.amountInt ?? d.price?.amount ?? null;
      const regularPrice = d.regular?.amountInt ?? d.regular?.amount ?? null;
      const cut = d.cut ?? 0;
      
      // セール状態を判定
      const isOnSale = Boolean(cut > 0 && regularPrice && price && price < regularPrice);
      
      // サブスクリプション判定（価格が0円かつ特定ストア）
      let subscriptionInfo: SubscriptionInfo | null = null;
      if (price === 0) {
        switch (d.shop?.id) {
          case 48: // Microsoft Store
            subscriptionInfo = { service: "Xbox Game Pass", type: "subscription" as const };
            break;
          case 16: // Epic Games Store
            subscriptionInfo = { service: "Epic Games Store", type: "free" as const };
            break;
        }
      }
      
      console.log(`[Quote API] Current price for ${d.shop?.name}: price=${price}, regular=${regularPrice}, cut=${cut}%, onSale=${isOnSale}, subscription=${JSON.stringify(subscriptionInfo)}`);
      
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

    // 全期間の店別最安
    const sl0 = storeLows?.[0] as StoreLowData | undefined;
    (sl0?.lows ?? []).forEach((low: StoreLow) => {
      const row = ensureRow(priceMap, low.shop);
      row.storeLowAll = {
        price: typeof low.price === 'object' && low.price ? 
          (low.price.amountInt ?? low.price.amount ?? null) : 
          (typeof low.price === 'number' ? low.price : null),
        date: low.added ?? low.recorded ?? "",
      };
    });

    // 全体の歴代最安とゲーム情報
    const ov0 = overview?.[0] as OverviewData | undefined;
    console.log(`[Quote API] Overview:`, JSON.stringify(ov0, null, 2));
    console.log(`[Quote API] Game title: ${gameTitle}`);
    
    const summary = ov0?.lowest
      ? {
          allTimeLow: {
            price: typeof ov0.lowest.price === 'object' && ov0.lowest.price ?
              (ov0.lowest.price.amountInt ?? ov0.lowest.price.amount ?? null) :
              (typeof ov0.lowest.price === 'number' ? ov0.lowest.price : null),
            store: ov0.lowest.shop?.name ?? "",
            date: ov0.lowest.added ?? "",
          },
        }
      : {};


    const stores = Array.from(priceMap.values()).sort(
      (a, b) => a.storeId - b.storeId
    );

    // フロントエンドが期待するQuoteResponse形式に変換
    const responseData = {
      data: {
        [itadId]: {
          title: gameTitle, // ゲーム名を追加
          list: stores
            .filter((store) => store.now?.price !== undefined && store.now?.price !== null)
            .map((store) => ({
              id: store.storeId.toString(),
              name: store.storeName,
              priceJPY: store.now!.price,
              regularPriceJPY:
                typeof store.now!.regularPrice === "number" ? store.now!.regularPrice : null,
              discountPercent: store.now!.cut || 0,
              isOnSale: store.now!.isOnSale || false,
              url: store.now!.url || "",
              availability: store.now!.price ? "available" : "unavailable",
              timestamp: store.now!.ts || new Date().toISOString(),
              subscriptionInfo: store.now!.subscriptionInfo || null,
            })),
          bundleInfo: bundleInfo?.map((bundle: { title?: string; url?: string; tiers?: Array<{ price?: { amountInt?: number } }> }) => ({
            name: bundle.title || '',
            url: bundle.url || '',
            priceJPY: bundle.tiers?.[0]?.price?.amountInt || 0,
          })) || null,
          storeLowAll: stores
            .filter((store) => store.storeLowAll)
            .map((store) => ({
              id: store.storeId.toString(),
              name: store.storeName,
              priceJPY:
                typeof store.storeLowAll?.price === "number"
                  ? store.storeLowAll.price
                  : 0,
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

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (e: unknown) {
    console.error("Quote API error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "itad quote failed" }, { status: 500 });
  }
}