import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { fairyTales, getCategories, FairyTale } from '@/mocks/fairyTales';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = getCategories();

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return fairyTales.filter(
      story =>
        story.title.toLowerCase().includes(query) ||
        story.author.toLowerCase().includes(query) ||
        story.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleStoryPress = useCallback((storyId: string) => {
    router.push(`/story/${storyId}` as any);
  }, [router]);

  const handleCategoryPress = useCallback((category: string) => {
    setSearchQuery(category);
  }, []);

  const renderStoryItem = useCallback(({ item }: { item: FairyTale }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.coverImage }} style={styles.storyImage} />
      <View style={styles.storyDetails}>
        <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.storyAuthor} numberOfLines={1}>by {item.author}</Text>
        <View style={styles.storyMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          <View style={styles.durationContainer}>
            <Clock size={12} color={Colors.textLight} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleStoryPress]);

  const renderCategoryCard = useCallback(({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: Colors.categoryColors[index % Colors.categoryColors.length] + '30' }
      ]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.categoryCardText,
        { color: Colors.categoryColors[index % Colors.categoryColors.length] }
      ]}>
        {item}
      </Text>
      <Text style={styles.categoryCount}>
        {fairyTales.filter(s => s.category === item).length} stories
      </Text>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Find your next adventure</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories, authors, categories..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.trim() ? (
          <FlatList
            data={filteredStories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No stories found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item}
              numColumns={2}
              columnWrapperStyle={styles.categoryRow}
              contentContainerStyle={styles.categoriesGrid}
              showsVerticalScrollIndicator={false}
            />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  storyItem: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  storyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  storyDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoriesSection: {
    flex: 1,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  categoryCardText: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
