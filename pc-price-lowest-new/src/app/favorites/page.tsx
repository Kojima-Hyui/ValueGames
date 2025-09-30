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
    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-300 relative">
      {currentImageUrl && !imageError ? (
        <Image
          src={currentImageUrl}
          alt={game.title}
          width={64}
          height={64}
          className="w-16 h-16 object-cover rounded-lg"
          onError={handleImageError}
          onLoad={() => console.log('Image loaded successfully for game:', game.title)}
        />
      ) : (
        <div className="text-center">
          <div className="text-2xl mb-1">🎮</div>
          <div className="text-xs text-gray-500 font-medium">No Image</div>
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
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-6 h-6 text-red-500">
                  <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">お気に入りゲーム ({favorites.length})</h1>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">お気に入りがありません</h3>
                  <p className="text-gray-500 mb-6">ゲームを検索して、❤️ボタンでお気に入りに追加しましょう。</p>
                  <button
                    onClick={handleNewSearch}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ゲームを検索する
                  </button>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {favorites.map((game) => (
                  <div key={game.id} className="p-4 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <GameImage game={game} />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{game.title}</h3>
                        <p className="text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 mr-2">
                            お気に入り追加日: {format(new Date(game.addedAt), "yyyy/MM/dd")}
                          </span>
                          ID: {game.id}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <FavoriteButton 
                          game={{
                            id: game.id,
                            title: game.title,
                            assets: game.assets
                          }}
                          size="sm"
                        />
                        <button
                          onClick={() => handleGameClick(game.id, game.title)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          価格を見る
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
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