"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PriceTable } from "@/components/PriceTable";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Header } from "@/components/Header";
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
  const searchParams = useSearchParams();
  const itadId = searchParams.get("id");
  const titleFromUrl = searchParams.get("title");

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

  if (!itadId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header showBackButton showSearchButton />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">ゲームIDが指定されていません。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showBackButton showSearchButton />
      
      <div className="pt-24"> {/* ヘッダーの高さ分の余白 */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 relative animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                価格比較: {titleFromUrl || gameData?.title || itadId}
              </h1>
              <div className="absolute top-0 right-0">
                <FavoriteButton 
                  game={{
                    id: itadId,
                    title: titleFromUrl || gameData?.title || itadId
                  }}
                  size="lg"
                  className="whitespace-nowrap"
                />
              </div>
            </div>

            {error && (
              <div className="glass rounded-2xl p-8 mb-8 border border-red-500/30 animate-slide-up">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-300 mb-6 font-medium">
                    価格データの読み込みに失敗しました。再試行してください。
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 focus-ring"
                  >
                    <span className="relative z-10">再試行</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                  </button>
                </div>
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