import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Shuffle,
  ListOrdered,
  Moon,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { getStoryById, FairyTale, fairyTales } from '@/mocks/fairyTales';
import { useFavorites } from '@/contexts/FavoritesContext';

type AutoPlayMode = 'off' | 'continuous' | 'shuffle';

const SLEEP_TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

export default function StoryScreen() {
  const { id, autoStart, sleepRemaining, autoPlayMode: passedAutoPlayMode } = useLocalSearchParams<{ 
    id: string; 
    autoStart?: string;
    sleepRemaining?: string;
    autoPlayMode?: AutoPlayMode;
  }>();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [story, setStory] = useState<FairyTale | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [readingMode, setReadingMode] = useState<'listen' | 'read'>('listen');
  const [autoPlayMode, setAutoPlayMode] = useState<AutoPlayMode>(passedAutoPlayMode || 'off');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(
    sleepRemaining ? parseInt(sleepRemaining, 10) : 0
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSentenceIndex = useRef(0);
  const sentences = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const sleepTimeRemainingRef = useRef(sleepRemaining ? parseInt(sleepRemaining, 10) : 0);

  useEffect(() => {
    if (id) {
      const foundStory = getStoryById(id);
      setStory(foundStory || null);
      if (foundStory) {
        // Split content into sentences for pause/resume support
        sentences.current = foundStory.content
          .split(/(?<=[.!?])\s+/)
          .filter(s => s.trim().length > 0);
        currentSentenceIndex.current = 0;
      }
      console.log('Story loaded:', foundStory?.title);
    }
  }, [id]);

  const getNextStory = useCallback(() => {
    if (!story) return null;
    const currentIndex = fairyTales.findIndex((t) => t.id === story.id);
    
    if (autoPlayMode === 'continuous') {
      const nextIndex = (currentIndex + 1) % fairyTales.length;
      return fairyTales[nextIndex];
    } else if (autoPlayMode === 'shuffle') {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * fairyTales.length);
      } while (randomIndex === currentIndex && fairyTales.length > 1);
      return fairyTales[randomIndex];
    }
    return null;
  }, [story, autoPlayMode]);

  // Auto-start playback when coming from auto-play
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (autoStart === 'true' && story && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      console.log('Auto-starting playback for:', story.title);
      setIsPlaying(true);
      // Small delay to ensure state is ready
      setTimeout(() => {
        isSpeakingRef.current = true;
        currentSentenceIndex.current = 0;
        
        const speakNextSentenceLocal = () => {
          if (!isSpeakingRef.current || currentSentenceIndex.current >= sentences.current.length) {
            isSpeakingRef.current = false;
            setIsPlaying(false);
            return;
          }
          
          const sentence = sentences.current[currentSentenceIndex.current];
          Speech.speak(sentence, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.85,
            onDone: () => {
              if (isSpeakingRef.current) {
                currentSentenceIndex.current += 1;
                if (currentSentenceIndex.current >= sentences.current.length) {
                  isSpeakingRef.current = false;
                  setIsPlaying(false);
                  // Trigger next story after current finishes
                  if (autoPlayMode !== 'off') {
                    currentSentenceIndex.current = 0;
                    const nextStory = getNextStory();
                    if (nextStory) {
                      router.replace({
                        pathname: '/story/[id]',
                        params: { 
                          id: nextStory.id,
                          autoStart: 'true',
                          sleepRemaining: sleepTimeRemainingRef.current.toString(),
                          autoPlayMode: autoPlayMode,
                        },
                      });
                    }
                  }
                } else {
                  speakNextSentenceLocal();
                }
              }
            },
            onStopped: () => {
              console.log(`Paused at sentence ${currentSentenceIndex.current + 1}`);
            },
            onError: () => {
              isSpeakingRef.current = false;
              setIsPlaying(false);
            },
          });
        };
        
        speakNextSentenceLocal();
      }, 100);
    }
  }, [autoStart, story, autoPlayMode, getNextStory, router, sleepTimeRemaining]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  useEffect(() => {
    return () => {
      isSpeakingRef.current = false;
      Speech.stop();
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    sleepTimeRemainingRef.current = sleepTimeRemaining;
  }, [sleepTimeRemaining]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimeRemaining > 0 && isPlaying) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining((prev) => {
          const newValue = prev - 1;
          sleepTimeRemainingRef.current = newValue;
          if (newValue <= 0) {
            Speech.stop();
            setIsPlaying(false);
            console.log('Sleep timer ended - stopping playback');
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimeRemaining, isPlaying]);

  const startSleepTimer = useCallback((minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepTimeRemaining(minutes * 60);
    console.log(`Sleep timer set for ${minutes} minutes`);
  }, []);

  const playNextStory = useCallback(() => {
    const nextStory = getNextStory();
    if (nextStory) {
      console.log(`Auto-playing next story: ${nextStory.title}, sleep remaining: ${sleepTimeRemainingRef.current}`);
      // Pass autoStart param and preserve sleep timer state
      router.replace({
        pathname: '/story/[id]',
        params: { 
          id: nextStory.id,
          autoStart: 'true',
          sleepRemaining: sleepTimeRemainingRef.current.toString(),
          autoPlayMode: autoPlayMode,
        },
      });
    }
  }, [getNextStory, autoPlayMode, router]);

  const formatTimeRemaining = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const speakFromIndex = useCallback((startIndex: number) => {
    if (!story || sentences.current.length === 0) return;
    
    isSpeakingRef.current = true;
    currentSentenceIndex.current = startIndex;
    
    const speakNextSentence = () => {
      if (!isSpeakingRef.current || currentSentenceIndex.current >= sentences.current.length) {
        isSpeakingRef.current = false;
        setIsPlaying(false);
        if (currentSentenceIndex.current >= sentences.current.length && autoPlayMode !== 'off') {
          currentSentenceIndex.current = 0;
          playNextStory();
        }
        return;
      }
      
      const sentence = sentences.current[currentSentenceIndex.current];
      console.log(`Speaking sentence ${currentSentenceIndex.current + 1}/${sentences.current.length}`);
      
      Speech.speak(sentence, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => {
          if (isSpeakingRef.current) {
            currentSentenceIndex.current += 1;
            speakNextSentence();
          }
        },
        onStopped: () => {
          // Keep current index when stopped (paused)
          console.log(`Paused at sentence ${currentSentenceIndex.current + 1}`);
        },
        onError: () => {
          isSpeakingRef.current = false;
          setIsPlaying(false);
        },
      });
    };
    
    speakNextSentence();
  }, [story, autoPlayMode, playNextStory]);

  const handlePlay = useCallback(async () => {
    if (!story) return;

    if (isPlaying) {
      // Pause - stop speaking but keep position
      isSpeakingRef.current = false;
      await Speech.stop();
      setIsPlaying(false);
      console.log(`Paused at sentence index: ${currentSentenceIndex.current}`);
    } else {
      // Resume from current position
      setIsPlaying(true);
      speakFromIndex(currentSentenceIndex.current);
    }
  }, [story, isPlaying, speakFromIndex]);

  const handleRestart = useCallback(async () => {
    if (!story) return;
    isSpeakingRef.current = false;
    await Speech.stop();
    currentSentenceIndex.current = 0;
    setIsPlaying(true);
    speakFromIndex(0);
  }, [story, speakFromIndex]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (!isMuted && isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    }
  }, [isMuted, isPlaying]);

  if (!story) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  const favorite = isFavorite(story.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image source={{ uri: story.coverImage }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', Colors.background]}
            style={styles.heroGradient}
          />
          
          <SafeAreaView edges={['top']} style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(story.id)}
            >
              <Heart
                size={24}
                color={favorite ? Colors.error : '#fff'}
                fill={favorite ? Colors.error : 'transparent'}
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{story.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{story.title}</Text>
            <Text style={styles.heroAuthor}>by {story.author}</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                readingMode === 'listen' && styles.modeButtonActive,
              ]}
              onPress={() => setReadingMode('listen')}
            >
              <Volume2
                size={18}
                color={readingMode === 'listen' ? '#fff' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  readingMode === 'listen' && styles.modeButtonTextActive,
                ]}
              >
                Listen
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                readingMode === 'read' && styles.modeButtonActive,
              ]}
              onPress={() => setReadingMode('read')}
            >
              <BookOpen
                size={18}
                color={readingMode === 'read' ? '#fff' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  readingMode === 'read' && styles.modeButtonTextActive,
                ]}
              >
                Read
              </Text>
            </TouchableOpacity>
          </View>

          {readingMode === 'listen' && (
            <View style={styles.playerSection}>
              <View style={styles.playerControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleRestart}
                >
                  <RotateCcw size={24} color={Colors.primary} />
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      isPlaying && styles.playButtonActive,
                    ]}
                    onPress={handlePlay}
                    disabled={isMuted}
                  >
                    {isPlaying ? (
                      <Pause size={32} color="#fff" />
                    ) : (
                      <Play size={32} color="#fff" style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleToggleMute}
                >
                  {isMuted ? (
                    <VolumeX size={24} color={Colors.textSecondary} />
                  ) : (
                    <Volume2 size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.playerHint}>
                {isPlaying
                  ? 'Listening to the story...'
                  : 'Tap play to hear the story'}
              </Text>

              {/* Auto-play & Timer Controls */}
              <View style={styles.autoPlaySection}>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => setShowSettingsModal(true)}
                >
                  <Settings size={18} color={Colors.primary} />
                  <Text style={styles.settingsButtonText}>Playback Settings</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Status indicators */}
                <View style={styles.statusRow}>
                  {autoPlayMode !== 'off' && (
                    <View style={styles.statusBadge}>
                      {autoPlayMode === 'shuffle' ? (
                        <Shuffle size={12} color="#fff" />
                      ) : (
                        <ListOrdered size={12} color="#fff" />
                      )}
                      <Text style={styles.statusBadgeText}>
                        {autoPlayMode === 'shuffle' ? 'Shuffle' : 'Continuous'}
                      </Text>
                    </View>
                  )}
                  {sleepTimeRemaining > 0 && (
                    <View style={[styles.statusBadge, styles.timerBadge]}>
                      <Moon size={12} color="#fff" />
                      <Text style={styles.statusBadgeText}>
                        {formatTimeRemaining(sleepTimeRemaining)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Summary</Text>
            <Text style={styles.summaryText}>{story.summary}</Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.sectionLabel}>The Story</Text>
            <Text style={styles.storyText}>{story.content}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Playback Settings</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSettingsModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Auto-play Mode */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Auto-Play Mode</Text>
              <Text style={styles.settingDescription}>
                Automatically play the next story when current one ends
              </Text>
              <View style={styles.autoPlayOptions}>
                <TouchableOpacity
                  style={[
                    styles.autoPlayOption,
                    autoPlayMode === 'off' && styles.autoPlayOptionActive,
                  ]}
                  onPress={() => setAutoPlayMode('off')}
                >
                  <Text
                    style={[
                      styles.autoPlayOptionText,
                      autoPlayMode === 'off' && styles.autoPlayOptionTextActive,
                    ]}
                  >
                    Off
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.autoPlayOption,
                    autoPlayMode === 'continuous' && styles.autoPlayOptionActive,
                  ]}
                  onPress={() => setAutoPlayMode('continuous')}
                >
                  <ListOrdered
                    size={16}
                    color={autoPlayMode === 'continuous' ? '#fff' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.autoPlayOptionText,
                      autoPlayMode === 'continuous' && styles.autoPlayOptionTextActive,
                    ]}
                  >
                    Continuous
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.autoPlayOption,
                    autoPlayMode === 'shuffle' && styles.autoPlayOptionActive,
                  ]}
                  onPress={() => setAutoPlayMode('shuffle')}
                >
                  <Shuffle
                    size={16}
                    color={autoPlayMode === 'shuffle' ? '#fff' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.autoPlayOptionText,
                      autoPlayMode === 'shuffle' && styles.autoPlayOptionTextActive,
                    ]}
                  >
                    Shuffle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sleep Timer */}
            <View style={styles.settingSection}>
              <View style={styles.settingLabelRow}>
                <Moon size={20} color={Colors.primary} />
                <Text style={styles.settingLabel}>Sleep Timer</Text>
              </View>
              <Text style={styles.settingDescription}>
                Automatically stop playback after set time
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timerOptions}
                contentContainerStyle={styles.timerOptionsContent}
              >
                {SLEEP_TIMER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timerOption,
                      sleepTimerMinutes === option.value && styles.timerOptionActive,
                    ]}
                    onPress={() => startSleepTimer(option.value)}
                  >
                    <Text
                      style={[
                        styles.timerOptionText,
                        sleepTimerMinutes === option.value && styles.timerOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {sleepTimeRemaining > 0 && (
                <View style={styles.timerActiveIndicator}>
                  <Moon size={16} color={Colors.accent} />
                  <Text style={styles.timerActiveText}>
                    Sleep in {formatTimeRemaining(sleepTimeRemaining)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroAuthor: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  contentSection: {
    padding: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  playerSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonActive: {
    backgroundColor: Colors.secondary,
  },
  playerHint: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  autoPlaySection: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  timerBadge: {
    backgroundColor: Colors.accent,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  storySection: {
    paddingBottom: 40,
  },
  storyText: {
    fontSize: 18,
    color: Colors.text,
    lineHeight: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  autoPlayOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  autoPlayOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  autoPlayOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  autoPlayOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  autoPlayOptionTextActive: {
    color: '#fff',
  },
  timerOptions: {
    marginTop: 4,
  },
  timerOptionsContent: {
    gap: 8,
    paddingVertical: 4,
  },
  timerOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerOptionActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  timerOptionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  timerOptionTextActive: {
    color: '#fff',
  },
  timerActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: Colors.accent + '15',
    borderRadius: 8,
  },
  timerActiveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  modalDoneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
