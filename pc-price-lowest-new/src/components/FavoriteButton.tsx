"use client";

import { useState } from "react";
import { useFavorites, FavoriteGame } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  game: Omit<FavoriteGame, "addedAt">;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({ 
  game, 
  size = "md", 
  showText = false,
  className = ""
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isLoaded) {
    return null; // ローディング中は非表示
  }

  const isLiked = isFavorite(game.id);
  
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base", 
    lg: "w-10 h-10 text-lg"
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    
    // 連続クリック防止
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    try {
      toggleFavorite(game);
      // 短時間の遅延で連続クリックを防ぐ
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        inline-flex items-center gap-1 
        ${sizeClasses[size]} 
        transition-all duration-200 
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        ${isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-400'
        }
        ${className}
      `}
      title={isProcessing ? "処理中..." : (isLiked ? "お気に入りから削除" : "お気に入りに追加")}
    >
      <svg 
        className={`${sizeClasses[size]} ${isLiked ? 'fill-current' : 'fill-none'}`}
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {showText && !isLiked && (
        <span className="text-sm font-medium">
          お気に入り
        </span>
      )}
    </button>
  );
}