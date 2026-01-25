import React, { useState, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, BookOpen, Sparkles } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { fairyTales, getCategories, FairyTale } from '@/mocks/fairyTales';

export default function StoriesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...getCategories()];

  const filteredStories = selectedCategory === 'All'
    ? fairyTales
    : fairyTales.filter(story => story.category === selectedCategory);

  const featuredStory = fairyTales[0];

  const handleStoryPress = useCallback((storyId: string) => {
    router.push(`/story/${storyId}` as any);
  }, [router]);

  const renderCategoryChip = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory]);

  const renderStoryCard = useCallback(({ item }: { item: FairyTale }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => handleStoryPress(item.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.coverImage }} style={styles.storyImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.storyGradient}
      />
      <View style={styles.storyInfo}>
        <Text style={styles.storyCategory}>{item.category}</Text>
        <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.storyMeta}>
          <Clock size={12} color={Colors.textLight} />
          <Text style={styles.storyDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleStoryPress]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bedtime Stories</Text>
            <Text style={styles.subtitle}>100 magical tales await</Text>
          </View>
          <View style={styles.sparkleContainer}>
            <Sparkles size={28} color={Colors.accent} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => handleStoryPress(featuredStory.id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: featuredStory.coverImage }}
            style={styles.featuredImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(107,78,158,0.95)']}
            style={styles.featuredGradient}
          />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <BookOpen size={14} color="#fff" />
              <Text style={styles.featuredBadgeText}>Featured Story</Text>
            </View>
            <Text style={styles.featuredTitle}>{featuredStory.title}</Text>
            <Text style={styles.featuredAuthor}>by {featuredStory.author}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <FlatList
          data={filteredStories}
          renderItem={renderStoryCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.storyRow}
          contentContainerStyle={styles.storiesList}
          showsVerticalScrollIndicator={false}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sparkleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
  },
  featuredAuthor: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storyRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storyCard: {
    width: '48%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storyGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  storyInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  storyCategory: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 6,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
