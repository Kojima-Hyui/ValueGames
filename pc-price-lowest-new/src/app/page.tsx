"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";

export default function HomePage() {
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-background to-purple-900/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      
      {/* Fixed favorite button */}
      <div className="fixed top-6 right-6 z-20">
        <button
          onClick={() => router.push('/favorites')}
          className="group relative flex items-center gap-3 px-6 py-3 glass border border-gray-600/30 rounded-2xl hover:bg-gray-800/40 hover:border-gray-500/50 transition-all duration-200 transform hover:scale-105"
        >
          <div className="w-5 h-5 text-rose-400 animate-pulse">
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">
            お気に入り ({count})
          </span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                <span className="text-3xl">🎮</span>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                PC Price Lowest
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
              複数のストアからPCゲームの最安値を見つけて、お得にゲームを楽しもう
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 mb-12 border border-gray-600/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ゲームタイトルを入力..."
                  className="w-full px-6 py-4 pl-14 text-lg bg-gray-800/60 border border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-gray-200 placeholder-gray-500 transition-all duration-200 group-hover:border-gray-500/70"
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
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus-ring"
              >
                <span className="relative z-10">検索</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">Enterキーを押すか検索ボタンをクリック</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="glass rounded-2xl p-6 border border-gray-600/30 hover:bg-gray-800/30 hover:border-gray-500/50 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">価格比較</h3>
              <p className="text-gray-400 text-sm">複数のストアから最安値を検索</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-gray-600/30 hover:bg-gray-800/30 hover:border-gray-500/50 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 border border-rose-500/30">
                <svg className="w-6 h-6 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">お気に入り</h3>
              <p className="text-gray-400 text-sm">気になるゲームを保存して管理</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-gray-600/30 hover:bg-gray-800/30 hover:border-gray-500/50 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">価格履歴</h3>
              <p className="text-gray-400 text-sm">史上最安値とセール情報を確認</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
