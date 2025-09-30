import { StoreRow } from "@/lib/types";
import { format } from "date-fns";
import { formatJPY, calculateDiscount } from "@/lib/utils";
import { DiscountBadge } from "./DiscountBadge";

interface PriceTableProps {
  currentPrices: StoreRow[];
  storeLowAll: StoreRow[];
  allTimeLow?: {
    priceJPY: number;
    shopName: string;
    timestamp: string;
  } | null;
  bundleInfo?: Array<{
    name: string;
    url?: string;
    priceJPY?: number;
  }> | null;
  isLoading?: boolean;
}

function formatDate(timestamp: string): string {
  try {
    return format(new Date(timestamp), "MMM d, yyyy");
  } catch {
    return "不明";
  }
}

export function PriceTable({
  currentPrices,
  storeLowAll,
  allTimeLow,
  bundleInfo,
  isLoading,
}: PriceTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">価格データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // Create a map for easy lookup
  const storeLowAllMap = new Map(storeLowAll.map(item => [item.id, item]));

  return (
    <div className="space-y-6">
      {allTimeLow && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-800">史上最安値</h3>
          </div>
          <p className="text-green-700 text-lg">
            <span className="font-bold text-2xl">{formatJPY(allTimeLow.priceJPY)}</span>
            <span className="ml-3 text-sm">
              {allTimeLow.shopName}で{formatDate(allTimeLow.timestamp)}に記録
            </span>
          </p>
        </div>
      )}

{(() => {
        // 現在アクティブなバンドル（価格が設定されており、URLもある）のみをフィルタリング
        const activeBundles = bundleInfo?.filter(bundle => 
          bundle.priceJPY && bundle.priceJPY > 0 && bundle.url
        ) || [];
        
        return activeBundles.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="font-semibold text-purple-800">現在利用可能なバンドル</h3>
          </div>
          <div className="space-y-3">
            {activeBundles.map((bundle, index) => (
              <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <div className="flex-1">
                  <div className="font-medium text-purple-900">{bundle.name}</div>
                  <div className="text-sm text-purple-700">
                    バンドル価格: {formatJPY(bundle.priceJPY!)}
                  </div>
                </div>
                  <a
                    href={bundle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 bg-white rounded-md hover:bg-purple-50 transition-colors"
                  >
                    バンドルを見る
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
              </div>
            ))}
          </div>
        </div>
        );
      })()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">ストア</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">現在価格</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">セール状況</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">史上最安</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentPrices.map((store) => {
                const allTimeLowStore = storeLowAllMap.get(store.id);
                const allTimeDiscount = allTimeLowStore ? calculateDiscount(allTimeLowStore.priceJPY, store.priceJPY) : 0;

                return (
                  <tr key={store.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {store.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{store.name}</div>
                          <div className="text-xs text-gray-500">ID: {store.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {store.subscriptionInfo ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                              {store.subscriptionInfo.type === "subscription" ? "📺" : "🎁"} {store.subscriptionInfo.service}
                            </span>
                            <span className="text-sm text-green-700">
                              {store.subscriptionInfo.type === "subscription" ? "サブスク対象" : "無料配布"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg text-gray-900">{formatJPY(store.priceJPY)}</span>
                            {store.isOnSale && store.discountPercent && (
                              <DiscountBadge discount={store.discountPercent} />
                            )}
                          </div>
                        )}
                        {!store.subscriptionInfo && store.isOnSale && store.regularPriceJPY && (
                          <div className="text-xs text-gray-500 line-through">
                            通常価格: {formatJPY(store.regularPriceJPY)}
                          </div>
                        )}
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          ストアを見る
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {store.subscriptionInfo ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                            {store.subscriptionInfo.type === "subscription" ? "📺 サブスク" : "🎁 無料"}
                          </span>
                        </div>
                      ) : store.isOnSale ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 font-medium">
                            🔥 セール中
                          </span>
                          <span className="text-sm text-gray-600">
                            {store.discountPercent}% OFF
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                            通常価格
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {allTimeLowStore ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{formatJPY(allTimeLowStore.priceJPY)}</span>
                            <DiscountBadge discount={allTimeDiscount} />
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(allTimeLowStore.timestamp)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">データなし</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            データなし
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {currentPrices.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">価格データがありません</h3>
            <p className="text-gray-500">このゲームは選択したストアまたは地域で利用できない可能性があります。</p>
          </div>
        </div>
      )}
    </div>
  );
}