import { NextRequest, NextResponse } from "next/server";
import {
  itadPricesV3,
  itadStoreLowV2,
  itadOverviewV2,
  JP,
  SHOPS_PC,
} from "@/lib/itad";

// map helpers
const ensureRow = (
  map: Map<number, any>,
  shop: { id: number; name: string }
) => {
  const cur = map.get(shop.id);
  if (cur) return cur;
  const row = { storeId: shop.id, storeName: shop.name } as any;
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

    const priceMap = new Map<number, any>();
    const p0 = prices?.[0];
    const bundleInfo = priceOverview?.bundles || [];
    
    // キャッシュからゲーム名を取得（セッションストレージなど）
    // 今回は簡単にoverviewとpricesから推測
    const gameTitle = overview?.[0]?.title || p0?.title || itadId;

    // 現在価格
    (p0?.deals ?? []).forEach((d: any) => {
      const row = ensureRow(priceMap, d.shop);
      const price = d.price?.amountInt ?? d.price?.amount ?? null;
      const regularPrice = d.regular?.amountInt ?? d.regular?.amount ?? null;
      const cut = d.cut ?? 0;
      
      // セール状態を判定
      const isOnSale = cut > 0 && regularPrice && price && price < regularPrice;
      
      // サブスクリプション判定（価格が0円かつ特定ストア）
      let subscriptionInfo = null;
      if (price === 0) {
        switch (d.shop?.id) {
          case 48: // Microsoft Store
            subscriptionInfo = { service: "Xbox Game Pass", type: "subscription" };
            break;
          case 16: // Epic Games Store
            subscriptionInfo = { service: "Epic Games Store", type: "free" };
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
    const sl0 = storeLows?.[0];
    (sl0?.lows ?? []).forEach((low: any) => {
      const row = ensureRow(priceMap, low.shop);
      row.storeLowAll = {
        price: low.price?.amountInt ?? low.price?.amount ?? low.price ?? null,
        date: low.added ?? low.recorded ?? "",
      };
    });

    // 全体の歴代最安とゲーム情報
    const ov0 = overview?.[0];
    console.log(`[Quote API] Overview:`, JSON.stringify(ov0, null, 2));
    console.log(`[Quote API] Game title: ${gameTitle}`);
    
    const summary = ov0?.lowest
      ? {
          allTimeLow: {
            price:
              ov0.lowest.price?.amountInt ??
              ov0.lowest.price?.amount ??
              ov0.lowest.price ??
              null,
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
              priceJPY: store.now.price,
              regularPriceJPY:
                typeof store.now?.regularPrice === "number" ? store.now.regularPrice : null,
              discountPercent: store.now?.cut || 0,
              isOnSale: store.now?.isOnSale || false,
              url: store.now?.url || "",
              availability: store.now?.price ? "available" : "unavailable",
              timestamp: store.now?.ts || new Date().toISOString(),
              subscriptionInfo: store.now?.subscriptionInfo || null,
            })),
          bundleInfo: bundleInfo?.map((bundle: any) => ({
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
  } catch (e: any) {
    console.error("Quote API error:", e?.message ?? e);
    return NextResponse.json({ error: "itad quote failed" }, { status: 500 });
  }
}