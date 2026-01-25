import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Clock, BookHeart } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { fairyTales, FairyTale } from '@/mocks/fairyTales';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteStories = useMemo(() => {
    return fairyTales.filter(story => favorites.includes(story.id));
  }, [favorites]);

  const handleStoryPress = useCallback((storyId: string) => {
    router.push(`/story/${storyId}` as any);
  }, [router]);

  const renderStoryItem = useCallback(({ item }: { item: FairyTale }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => handleStoryPress(item.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.coverImage }} style={styles.storyImage} />
      <View style={styles.storyContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.storyAuthor} numberOfLines={1}>by {item.author}</Text>
        <View style={styles.storyFooter}>
          <View style={styles.durationContainer}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Heart size={20} color={Colors.error} fill={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleStoryPress, toggleFavorite]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favoriteStories.length} saved {favoriteStories.length === 1 ? 'story' : 'stories'}
          </Text>
        </View>

        {favoriteStories.length > 0 ? (
          <FlatList
            data={favoriteStories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storiesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BookHeart size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any story to save it here for easy access
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  storyImage: {
    width: 120,
    height: 140,
  },
  storyContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 8,
  },
  storyAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  heartButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
