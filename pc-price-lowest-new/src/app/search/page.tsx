"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchResults } from "@/components/SearchResults";
import { useDebounce } from "@/hooks/useDebounce";

async function searchGames(query: string) {
  if (!query.trim()) return { data: [] };
  
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query.trim())}`);
    if (!response.ok) {
      throw new Error("検索に失敗しました");
    }
    return response.json();
  } catch {
    throw new Error("検索に失敗しました");
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("query") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  // URL同期
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) {
      params.set("query", debouncedQuery.trim());
    }
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    window.history.replaceState({}, "", newUrl);
  }, [debouncedQuery]);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchGames(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← ホームに戻る
            </button>
            <h1 className="text-2xl font-bold">ゲーム検索</h1>
          </div>

          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ゲームを検索..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">
                検索中にエラーが発生しました。再試行してください。
              </p>
            </div>
          )}

          <SearchResults
            games={searchResults?.data || []}
            isLoading={isLoading}
            query={debouncedQuery}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  );
}