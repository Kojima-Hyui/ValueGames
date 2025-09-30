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
    <div className="space-y-8 animate-fade-in">
      {allTimeLow && (
        <div className="glass rounded-2xl p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-emerald-300">史上最安値</h3>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
              {formatJPY(allTimeLow.priceJPY)}
            </span>
            <div className="text-gray-300">
              <span className="font-medium text-emerald-400">{allTimeLow.shopName}</span>
              <span className="text-gray-400 ml-2">で{formatDate(allTimeLow.timestamp)}に記録</span>
            </div>
          </div>
        </div>
      )}

{(() => {
        // 現在アクティブなバンドル（価格が設定されており、URLもある）のみをフィルタリング
        const activeBundles = bundleInfo?.filter(bundle => 
          bundle.priceJPY && bundle.priceJPY > 0 && bundle.url
        ) || [];
        
        return activeBundles.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-violet-500/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-purple-300">現在利用可能なバンドル</h3>
          </div>
          <div className="space-y-4">
            {activeBundles.map((bundle, index) => (
              <div key={index} className="group glass rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-200 group-hover:text-white transition-colors duration-200">{bundle.name}</div>
                    <div className="text-purple-300 mt-1">
                      バンドル価格: <span className="font-bold text-purple-200">{formatJPY(bundle.priceJPY!)}</span>
                    </div>
                  </div>
                  <a
                    href={bundle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 transform hover:scale-105 focus-ring"
                  >
                    <span className="relative z-10">バンドルを見る</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-700 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })()}

      <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800/60 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-200 border-b border-gray-600/50">ストア</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-200 border-b border-gray-600/50">現在価格</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-200 border-b border-gray-600/50">セール状況</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-200 border-b border-gray-600/50">史上最安</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {currentPrices.map((store) => {
                const allTimeLowStore = storeLowAllMap.get(store.id);
                const allTimeDiscount = allTimeLowStore ? calculateDiscount(allTimeLowStore.priceJPY, store.priceJPY) : 0;

                return (
                  <tr key={store.id} className="group hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400/40 transition-colors duration-200">
                          <span className="text-sm font-bold text-indigo-400">
                            {store.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-200 group-hover:text-white transition-colors duration-200">{store.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {store.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        {store.subscriptionInfo ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                              {store.subscriptionInfo.type === "subscription" ? "📺" : "🎁"} {store.subscriptionInfo.service}
                            </span>
                            <span className="text-sm text-emerald-400">
                              {store.subscriptionInfo.type === "subscription" ? "サブスク対象" : "無料配布"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xl text-gray-200 group-hover:text-white transition-colors duration-200">{formatJPY(store.priceJPY)}</span>
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