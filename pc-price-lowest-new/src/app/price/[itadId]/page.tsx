"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PriceTable } from "@/components/PriceTable";
import { QuoteResponse } from "@/lib/types";

async function fetchQuote(itadId: string): Promise<QuoteResponse> {
  const response = await fetch("/api/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itadId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quote");
  }

  return response.json();
}

export default function PricePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itadId = params.itadId as string;
  const titleFromUrl = searchParams.get("title");

  const {
    data: quoteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quote", itadId],
    queryFn: () => fetchQuote(itadId),
    enabled: !!itadId,
  });

  const gameData = quoteData?.data?.[itadId];

  const handleBackToSearch = () => {
    router.back();
  };

  const handleNewSearch = () => {
    router.push("/");
  };

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
              <h1 className="text-2xl font-bold">
                価格比較: {titleFromUrl || gameData?.title || itadId}
              </h1>
            </div>
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