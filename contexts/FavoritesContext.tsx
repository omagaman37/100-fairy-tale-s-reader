import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const FAVORITES_KEY = 'fairy_tale_favorites';

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (storyId: string) => {
    const newFavorites = favorites.includes(storyId)
      ? favorites.filter(id => id !== storyId)
      : [...favorites, storyId];
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (storyId: string) => favorites.includes(storyId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
});
