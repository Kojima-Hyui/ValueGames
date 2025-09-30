"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites, FavoriteGame } from "@/hooks/useFavorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Header } from "@/components/Header";
import Image from "next/image";
import { format } from "date-fns";

interface SearchGame {
  id: string;
  title: string;
  assets?: {
    banner145?: string;
    banner300?: string;
    boxart?: string;
  };
}

// ゲーム画像コンポーネント - 画像エラー時に新しいURLを取得
function GameImage({ game }: { game: FavoriteGame }) {
  const [imageError, setImageError] = useState(false);
  const [refreshedImageUrl, setRefreshedImageUrl] = useState<string | null>(null);

  const handleImageError = async () => {
    console.error('Image load error for game:', game.title, 'URL:', game.assets?.banner145);
    setImageError(true);
    
    // 新しい画像URLを取得を試行
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: game.title, limit: 1 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const foundGame = data.games?.find((g: SearchGame) => g.id === game.id);
        if (foundGame?.assets?.banner145) {
          console.log('Refreshed image URL for:', game.title, foundGame.assets.banner145);
          setRefreshedImageUrl(foundGame.assets.banner145);
          setImageError(false);
        }
      }
    } catch (error) {
      console.error('Failed to refresh image URL:', error);
    }
  };

  const currentImageUrl = refreshedImageUrl || game.assets?.banner145;

  return (
    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20 group-hover:border-indigo-400/40 transition-colors duration-200 relative">
      {currentImageUrl && !imageError ? (
        <Image
          src={currentImageUrl}
          alt={game.title}
          width={80}
          height={80}
          className="w-20 h-20 object-cover rounded-xl"
          onError={handleImageError}
          onLoad={() => console.log('Image loaded successfully for game:', game.title)}
        />
      ) : (
        <div className="text-center">
          <div className="text-2xl text-indigo-400">🎮</div>
        </div>
      )}
    </div>
  );
}

function FavoritesPageContent() {
  const router = useRouter();
  const { favorites, isLoaded } = useFavorites();

  // デバッグ用: お気に入りデータの構造をログ出力
  React.useEffect(() => {
    if (isLoaded && favorites.length > 0) {
      console.log('Favorites data structure:', favorites);
      favorites.forEach(game => {
        console.log(`Game: ${game.title}`, {
          id: game.id,
          hasAssets: !!game.assets,
          banner145: game.assets?.banner145,
          assets: game.assets
        });
      });
    }
  }, [favorites, isLoaded]);

  const handleGameClick = (gameId: string, title: string) => {
    router.push(`/price?id=${gameId}&title=${encodeURIComponent(title)}`);
  };

  const handleNewSearch = () => {
    router.push("/search");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header showBackButton showSearchButton centerLogo />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showBackButton showSearchButton centerLogo />
      
      <div className="pt-24"> {/* ヘッダーの高さ分の余白 */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-8 text-rose-400">
                  <svg className="w-full h-full fill-current animate-pulse" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  お気に入りゲーム
                </h1>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-full">
                <span className="text-rose-300 font-medium">{favorites.length} 件</span>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="glass rounded-2xl p-16 animate-slide-up">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 text-gray-500">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">お気に入りがありません</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">ゲームを検索して、<span className="text-rose-400">❤️</span>ボタンでお気に入りに追加しましょう。</p>
                  <button
                    onClick={handleNewSearch}
                    className="group relative px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus-ring"
                  >
                    <span className="relative z-10">ゲームを検索する</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                  </button>
                </div>
              </div>
            ) : (
            <div className="grid gap-4 animate-slide-up">
              {favorites.map((game, index) => (
                <div 
                  key={game.id} 
                  className="group glass rounded-2xl p-6 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-6">
                    <GameImage game={game} />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-200 truncate group-hover:text-white transition-colors duration-200">
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          追加日: {format(new Date(game.addedAt), "yyyy/MM/dd")}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">ID: {game.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <FavoriteButton 
                        game={{
                          id: game.id,
                          title: game.title,
                          assets: game.assets
                        }}
                        size="md"
                      />
                      <button
                        onClick={() => handleGameClick(game.id, game.title)}
                        className="group relative px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus-ring"
                      >
                        <span className="relative z-10">価格を見る</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <FavoritesPageContent />
    </Suspense>
  );
}