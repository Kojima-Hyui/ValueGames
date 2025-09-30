"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchResults } from "@/components/SearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { Header } from "@/components/Header";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showBackButton showSearchButton={false} />
      
      <div className="pt-24"> {/* ヘッダーの高さ分の余白 */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                ゲーム検索
              </h1>
              <p className="text-gray-400 text-lg">お探しのゲームタイトルを入力してください</p>
            </div>

            <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ゲームタイトルを入力..."
                  className="w-full px-6 py-4 pl-14 text-lg bg-gray-800/60 border border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-gray-200 placeholder-gray-500 transition-all duration-200 glass group-hover:border-gray-500/70"
                  autoFocus
                />
                <svg 
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-700/50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </div>

          {error && (
            <div className="mb-8 glass border border-red-500/30 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-300 font-medium">
                  検索中にエラーが発生しました。再試行してください。
                </p>
              </div>
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