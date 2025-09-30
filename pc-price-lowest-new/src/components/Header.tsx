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
    <div className={`fixed top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      <div className="container mx-auto px-4">
        {centerLogo ? (
          // お気に入りページ用のレイアウト
          <div className="flex items-center justify-between h-16">
            {/* 左側のナビゲーション */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={() => router.push(backUrl)}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">戻る</span>
                </button>
              )}
              {showSearchButton && (
                <button
                  onClick={() => router.push('/search')}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                PC Price Lowest
              </button>
            </div>

            {/* 右側のお気に入り（空のスペース） */}
            <div className="w-16"></div>
          </div>
        ) : (
          // 通常のレイアウト
          <div className="flex items-center justify-between h-16">
            {/* 左側のナビゲーション */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={() => router.push(backUrl)}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">戻る</span>
                </button>
              )}
              {showSearchButton && (
                <button
                  onClick={() => router.push('/search')}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium">検索</span>
                </button>
              )}
            </div>

            {/* 中央のロゴ */}
            <button
              onClick={() => router.push('/')}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              PC Price Lowest
            </button>

            {/* 右側のお気に入り */}
            <button
              onClick={() => router.push('/favorites')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-all duration-200"
            >
              <div className="w-4 h-4 text-red-500">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{count}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}