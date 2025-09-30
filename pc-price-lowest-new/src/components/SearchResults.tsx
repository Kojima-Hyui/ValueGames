"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FavoriteButton } from "./FavoriteButton";

interface Game {
  id: string;
  title: string;
  slug?: string;
  type?: string;
  assets?: {
    banner145?: string;
    banner300?: string;
    boxart?: string;
  };
}

interface SearchResultsProps {
  games: Game[];
  isLoading: boolean;
  query: string;
}

export function SearchResults({ games, isLoading, query }: SearchResultsProps) {
  const router = useRouter();

  const handleGameClick = (game: Game) => {
    const title = encodeURIComponent(game.title);
    router.push(`/price?id=${game.id}&title=${title}`);
  };

  if (!query) return null;

  if (isLoading) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">検索中...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりません</h3>
          <p className="text-gray-500">「{query}」に一致するゲームが見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        検索結果: 「{query}」({games.length}件)
      </h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                  {game.assets?.banner145 ? (
                    <Image
                      src={game.assets.banner145}
                      alt={game.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-lg font-semibold text-blue-600">🎮</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-blue-600">🎮</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{game.title}</h3>
                  <p className="text-sm text-gray-500">
                    {game.type && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 mr-2">
                        {game.type}
                      </span>
                    )}
                    ID: {game.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FavoriteButton 
                    game={{
                      id: game.id,
                      title: game.title,
                      assets: game.assets
                    }}
                    size="sm"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}