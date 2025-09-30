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
      <div className="mt-8 glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="mt-4 text-gray-300 font-medium">検索中...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="mt-8 glass rounded-2xl p-12 animate-slide-up">
        <div className="text-center">
          <div className="text-6xl mb-6 opacity-60">🔍</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-3">検索結果が見つかりません</h3>
          <p className="text-gray-400">「<span className="text-indigo-400 font-medium">{query}</span>」に一致するゲームが見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-200">
          検索結果
        </h2>
        <div className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full">
          <span className="text-indigo-300 text-sm font-medium">「{query}」{games.length}件</span>
        </div>
      </div>
      
      <div className="grid gap-4">
        {games.map((game, index) => (
          <div
            key={game.id}
            onClick={() => handleGameClick(game)}
            className="group glass rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:bg-gray-800/40 hover:border-gray-600/50 hover:scale-[1.02] animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 relative border border-indigo-500/20 group-hover:border-indigo-400/40 transition-colors duration-200">
                {game.assets?.banner145 ? (
                  <Image
                    src={game.assets.banner145}
                    alt={game.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-2xl text-indigo-400">🎮</span>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-2xl text-indigo-400">🎮</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-200 truncate group-hover:text-white transition-colors duration-200">{game.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  {game.type && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-700/60 text-gray-300 border border-gray-600/30">
                      {game.type}
                    </span>
                  )}
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
                <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}