"use client";

import { useState, useEffect } from "react";

export interface FavoriteGame {
  id: string;
  title: string;
  addedAt: string;
  // 検索結果からの情報を保存
  assets?: {
    banner145?: string;
    banner300?: string;
    boxart?: string;
  };
}

const FAVORITES_KEY = "pc-price-lowest-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ローカルストレージに保存（関数型更新対応）
  const saveFavorites = (updater: FavoriteGame[] | ((prev: FavoriteGame[]) => FavoriteGame[])) => {
    setFavorites(prevFavorites => {
      const newFavorites = typeof updater === 'function' ? updater(prevFavorites) : updater;
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
      return newFavorites;
    });
  };

  // お気に入りに追加
  const addFavorite = (game: Omit<FavoriteGame, "addedAt">) => {
    const newFavorite: FavoriteGame = {
      ...game,
      addedAt: new Date().toISOString(),
    };
    
    saveFavorites(prevFavorites => {
      // 既に存在する場合は追加しない
      if (prevFavorites.some(fav => fav.id === game.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, newFavorite];
    });
  };

  // お気に入りから削除
  const removeFavorite = (gameId: string) => {
    saveFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== gameId));
  };

  // お気に入りかどうかチェック
  const isFavorite = (gameId: string) => {
    return favorites.some(fav => fav.id === gameId);
  };

  // お気に入りをトグル（最新の状態を参照）
  const toggleFavorite = (game: Omit<FavoriteGame, "addedAt">) => {
    saveFavorites(prevFavorites => {
      const isCurrentlyFavorite = prevFavorites.some(fav => fav.id === game.id);
      
      if (isCurrentlyFavorite) {
        // 削除
        return prevFavorites.filter(fav => fav.id !== game.id);
      } else {
        // 追加
        const newFavorite: FavoriteGame = {
          ...game,
          addedAt: new Date().toISOString(),
        };
        return [...prevFavorites, newFavorite];
      }
    });
  };

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
}