"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PriceTable } from "@/components/PriceTable";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { QuoteResponse } from "@/lib/types";

async function fetchQuote(itadId: string): Promise<QuoteResponse> {
  try {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itadId }),
    });
    
    if (!response.ok) {
      throw new Error("価格データの取得に失敗しました");
    }
    
    return response.json();
  } catch {
    throw new Error("価格データの取得に失敗しました");
  }
}

function PricePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itadId = searchParams.get("id");
  const titleFromUrl = searchParams.get("title");
  const { count } = useFavorites();

  const {
    data: quoteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quote", itadId],
    queryFn: () => fetchQuote(itadId!),
    enabled: !!itadId,
  });

  const gameData = quoteData?.data?.[itadId!];

  const handleBackToSearch = () => {
    router.back();
  };

  const handleNewSearch = () => {
    router.push("/");
  };

  if (!itadId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">ゲームIDが指定されていません。</p>
          <button
            onClick={handleNewSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToSearch}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← 戻る
              </button>
              <button
                onClick={handleNewSearch}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                新しく検索
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">
                  価格比較: {titleFromUrl || gameData?.title || itadId}
                </h1>
                <FavoriteButton 
                  game={{
                    id: itadId,
                    title: titleFromUrl || gameData?.title || itadId
                  }}
                  size="lg"
                  showText
                />
              </div>
            </div>
            <button
              onClick={() => router.push('/favorites')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="w-5 h-5 text-red-500">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">お気に入り ({count})</span>
            </button>
          </div>

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                価格データの読み込みに失敗しました。再試行してください。
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                再試行
              </button>
            </div>
          )}

          {!error && (
            <PriceTable
              currentPrices={gameData?.list || []}
              storeLowAll={gameData?.storeLowAll || []}
              allTimeLow={gameData?.summary?.allTimeLow}
              bundleInfo={gameData?.bundleInfo}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PricePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <PricePageContent />
    </Suspense>
  );
}