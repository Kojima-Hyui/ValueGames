"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { count } = useFavorites();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <h1 className="text-4xl font-bold">PC Price Lowest</h1>
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
          <p className="text-lg text-gray-600 mb-12">
            複数のストアからPCゲームの最安値を見つけよう
          </p>
          
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ゲームを検索..."
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              検索
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Enterキーを押すか検索ボタンをクリックしてゲームを探す
          </div>
        </div>
      </div>
    </div>
  );
}
