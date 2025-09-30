"use client";

import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";

interface HeaderProps {
  showBackButton?: boolean;
  showSearchButton?: boolean;
  backUrl?: string;
  className?: string;
  centerLogo?: boolean; // お気に入りページ用
}

export function Header({ 
  showBackButton = false, 
  showSearchButton = false, 
  backUrl = "/",
  className = "",
  centerLogo = false
}: HeaderProps) {
  const router = useRouter();
  const { count } = useFavorites();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 glass animate-fade-in ${className}`}>
      <div className="container mx-auto px-6">
        {centerLogo ? (
          // お気に入りページ用のレイアウト
          <div className="flex items-center justify-between h-20">
            {/* 左側のナビゲーション */}
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={() => router.push(backUrl)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 focus-ring"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">戻る</span>
                </button>
              )}
              {showSearchButton && (
                <button
                  onClick={() => router.push('/search')}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 focus-ring"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium">検索</span>
                </button>
              )}
            </div>

            {/* 中央のロゴ */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => router.push('/')}
                className="group relative text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">PC Price Lowest</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            {/* 右側のお気に入り（空のスペース） */}
            <div className="w-16"></div>
          </div>
        ) : (
          // 通常のレイアウト
          <div className="flex items-center justify-between h-20">
            {/* 左側のナビゲーション */}
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={() => router.push(backUrl)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 focus-ring"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">戻る</span>
                </button>
              )}
              {showSearchButton && (
                <button
                  onClick={() => router.push('/search')}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 focus-ring"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium">検索</span>
                </button>
              )}
            </div>

            {/* 中央のロゴ */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => router.push('/')}
                className="group relative text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">PC Price Lowest</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            {/* 右側のお気に入り */}
            <button
              onClick={() => router.push('/favorites')}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 hover:border-rose-400/50 transition-all duration-200 focus-ring animate-scale-in"
            >
              <div className="w-4 h-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{count}</span>
              {count > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}