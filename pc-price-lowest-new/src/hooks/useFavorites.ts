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

  // ローカルストレージに保存
  const saveFavorites = (newFavorites: FavoriteGame[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  // お気に入りに追加
  const addFavorite = (game: Omit<FavoriteGame, "addedAt">) => {
    const newFavorite: FavoriteGame = {
      ...game,
      addedAt: new Date().toISOString(),
    };
    
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
  };

  // お気に入りから削除
  const removeFavorite = (gameId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== gameId);
    saveFavorites(newFavorites);
  };

  // お気に入りかどうかチェック
  const isFavorite = (gameId: string) => {
    return favorites.some(fav => fav.id === gameId);
  };

  // お気に入りをトグル
  const toggleFavorite = (game: Omit<FavoriteGame, "addedAt">) => {
    if (isFavorite(game.id)) {
      removeFavorite(game.id);
    } else {
      addFavorite(game);
    }
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