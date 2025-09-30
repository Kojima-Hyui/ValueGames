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

// ローカルストレージアクセスをシリアル化するためのキュー
let updateQueue: Promise<void> = Promise.resolve();

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


  // ローカルストレージに保存（同期対応）
  const saveFavorites = (updater: FavoriteGame[] | ((prev: FavoriteGame[]) => FavoriteGame[])) => {
    // まず最新のローカルストレージ状態を取得
    const currentStoredData = (() => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    // 最新のローカルストレージデータを基に更新を実行
    const newFavorites = typeof updater === 'function' ? updater(currentStoredData) : updater;
    console.log(`💾 Saving to localStorage: ${newFavorites.length} items`);
    console.log(`💾 Items:`, newFavorites.map(f => f.title));
    
    // ローカルストレージアクセスをキューイング
    updateQueue = updateQueue.then(async () => {
      try {
        // 最新のローカルストレージ内容を確認
        const currentStored = localStorage.getItem(FAVORITES_KEY);
        const currentParsed = currentStored ? JSON.parse(currentStored) : [];
        console.log(`📖 Current localStorage before update: ${currentParsed.length} items`);
        
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        console.log(`✅ Successfully saved to localStorage: ${newFavorites.length} items`);
        
        // 小さな遅延を追加して確実に書き込み完了を待つ
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // 確認のため即座に読み込み
        const verification = localStorage.getItem(FAVORITES_KEY);
        const parsed = verification ? JSON.parse(verification) : [];
        console.log(`🔍 Verification - localStorage contains: ${parsed.length} items`);
        console.log(`🔍 Verification items:`, parsed.map((f: FavoriteGame) => f.title));
        
        // React状態も同期
        setFavorites(parsed);
      } catch (error) {
        console.error("❌ Failed to save favorites:", error);
      }
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

  // お気に入りかどうかチェック（ローカルストレージから直接確認）
  const isFavorite = (gameId: string) => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = Array.isArray(parsed) ? parsed.some((fav: FavoriteGame) => fav.id === gameId) : false;
        console.log(`🔍 isFavorite check for ${gameId}: ${result} (from localStorage)`);
        return result;
      }
    } catch (error) {
      console.error("Failed to check favorite from storage:", error);
    }
    // フォールバック: React状態から確認
    const result = favorites.some(fav => fav.id === gameId);
    console.log(`🔍 isFavorite fallback for ${gameId}: ${result} (from React state)`);
    return result;
  };

  // お気に入りをトグル（最新の状態を参照）
  const toggleFavorite = (game: Omit<FavoriteGame, "addedAt">) => {
    console.log(`🔄 toggleFavorite called for: ${game.title} (${game.id})`);
    
    saveFavorites(prevFavorites => {
      console.log(`📊 Current favorites count: ${prevFavorites.length}`);
      console.log(`📋 Current favorites:`, prevFavorites.map(f => f.title));
      
      const isCurrentlyFavorite = prevFavorites.some(fav => fav.id === game.id);
      console.log(`❓ Is ${game.title} currently favorite? ${isCurrentlyFavorite}`);
      
      if (isCurrentlyFavorite) {
        // 削除
        const newFavorites = prevFavorites.filter(fav => fav.id !== game.id);
        console.log(`➖ Removing ${game.title}. New count: ${newFavorites.length}`);
        return newFavorites;
      } else {
        // 追加
        const newFavorite: FavoriteGame = {
          ...game,
          addedAt: new Date().toISOString(),
        };
        const newFavorites = [...prevFavorites, newFavorite];
        console.log(`➕ Adding ${game.title}. New count: ${newFavorites.length}`);
        return newFavorites;
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