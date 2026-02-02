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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
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
  Mic,
  MicOff,
  Trash2,
  User,
  Bot,
  Check,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { getStoryById, FairyTale, fairyTales } from '@/mocks/fairyTales';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useVoiceRecordings } from '@/contexts/VoiceRecordingsContext';

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
  const { 
    voicePreference, 
    setVoicePreference, 
    aiVoiceGender,
    setAIVoiceGender,
    hasRecording, 
    getRecording, 
    saveRecording,
    deleteRecording,
  } = useVoiceRecordings();
  
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordPulseAnim = useRef(new Animated.Value(1)).current;
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSentenceIndex = useRef(0);
  const sentences = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const sleepTimeRemainingRef = useRef(sleepRemaining ? parseInt(sleepRemaining, 10) : 0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const customAudioPositionRef = useRef(0);

  useEffect(() => {
    if (id) {
      const foundStory = getStoryById(id);
      setStory(foundStory || null);
      if (foundStory) {
        sentences.current = foundStory.content
          .split(/(?<=[.!?])\s+/)
          .filter(s => s.trim().length > 0);
        currentSentenceIndex.current = 0;
      }
      console.log('Story loaded:', foundStory?.title);
    }
  }, [id]);

  const storyHasRecording = story ? hasRecording(story.id) : false;
  const shouldUseCustomVoice = voicePreference === 'custom' && storyHasRecording;

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

  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (autoStart === 'true' && story && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      console.log('Auto-starting playback for:', story.title);
      setIsPlaying(true);
      setTimeout(() => {
        if (shouldUseCustomVoice) {
          playCustomRecording();
        } else {
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
              pitch: aiVoiceGender === 'male' ? 0.25 : 1.15,
              rate: 0.85,
              onDone: () => {
                if (isSpeakingRef.current) {
                  currentSentenceIndex.current += 1;
                  if (currentSentenceIndex.current >= sentences.current.length) {
                    isSpeakingRef.current = false;
                    setIsPlaying(false);
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
        }
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, story, autoPlayMode, getNextStory, router, sleepTimeRemaining, shouldUseCustomVoice]);

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
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordPulseAnim.setValue(1);
    }
  }, [isRecording, recordPulseAnim]);

  useEffect(() => {
    return () => {
      isSpeakingRef.current = false;
      Speech.stop();
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    sleepTimeRemainingRef.current = sleepTimeRemaining;
  }, [sleepTimeRemaining]);

  useEffect(() => {
    if (sleepTimeRemaining > 0 && isPlaying) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining((prev) => {
          const newValue = prev - 1;
          sleepTimeRemainingRef.current = newValue;
          if (newValue <= 0) {
            Speech.stop();
            if (soundRef.current) {
              soundRef.current.stopAsync();
            }
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

  const formatRecordingDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const playCustomRecording = useCallback(async () => {
    if (!story) return;
    
    const recording = getRecording(story.id);
    if (!recording) {
      console.log('No custom recording found');
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { shouldPlay: true, positionMillis: customAudioPositionRef.current }
      );
      
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            customAudioPositionRef.current = 0;
            if (autoPlayMode !== 'off') {
              playNextStory();
            }
          } else if (status.positionMillis) {
            customAudioPositionRef.current = status.positionMillis;
          }
        }
      });

      console.log('Playing custom recording from:', recording.uri);
    } catch (error) {
      console.log('Error playing custom recording:', error);
      setIsPlaying(false);
    }
  }, [story, getRecording, autoPlayMode, playNextStory]);

  const pauseCustomRecording = useCallback(async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        customAudioPositionRef.current = status.positionMillis;
        await soundRef.current.pauseAsync();
      }
    }
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
        pitch: aiVoiceGender === 'male' ? 0.25 : 1.15,
        rate: 0.85,
        onDone: () => {
          if (isSpeakingRef.current) {
            currentSentenceIndex.current += 1;
            speakNextSentence();
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
    
    speakNextSentence();
  }, [story, autoPlayMode, playNextStory, aiVoiceGender]);

  const handlePlay = useCallback(async () => {
    if (!story) return;

    if (isPlaying) {
      if (shouldUseCustomVoice) {
        await pauseCustomRecording();
      } else {
        isSpeakingRef.current = false;
        await Speech.stop();
      }
      setIsPlaying(false);
      console.log(`Paused at sentence index: ${currentSentenceIndex.current}`);
    } else {
      setIsPlaying(true);
      if (shouldUseCustomVoice) {
        await playCustomRecording();
      } else {
        speakFromIndex(currentSentenceIndex.current);
      }
    }
  }, [story, isPlaying, speakFromIndex, shouldUseCustomVoice, playCustomRecording, pauseCustomRecording]);

  const handleRestart = useCallback(async () => {
    if (!story) return;
    
    if (shouldUseCustomVoice) {
      customAudioPositionRef.current = 0;
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } else {
        await playCustomRecording();
      }
    } else {
      isSpeakingRef.current = false;
      await Speech.stop();
      currentSentenceIndex.current = 0;
      speakFromIndex(0);
    }
    setIsPlaying(true);
  }, [story, speakFromIndex, shouldUseCustomVoice, playCustomRecording]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (!isMuted && isPlaying) {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.stopAsync();
      }
      setIsPlaying(false);
    }
  }, [isMuted, isPlaying]);

  const startRecording = useCallback(async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        const result = await requestPermission();
        if (result.status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow microphone access to record your voice.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }, [permissionResponse, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current || !story) return;

    try {
      console.log('Stopping recording..');
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      console.log('Recording stopped and stored at', uri);

      if (uri) {
        await saveRecording(story.id, uri, recordingDuration);
        Alert.alert('Recording Saved', 'Your voice recording has been saved for this story.');
      }

      recordingRef.current = null;
      setIsRecording(false);
      setShowRecordingModal(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  }, [story, recordingDuration, saveRecording]);

  const cancelRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.log('Error stopping recording:', e);
      }
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingRef.current = null;
    setIsRecording(false);
    setRecordingDuration(0);
    setShowRecordingModal(false);
  }, []);

  const handleDeleteRecording = useCallback(() => {
    if (!story) return;
    
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete your voice recording for this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecording(story.id);
            if (soundRef.current) {
              await soundRef.current.unloadAsync();
              soundRef.current = null;
            }
            customAudioPositionRef.current = 0;
          },
        },
      ]
    );
  }, [story, deleteRecording]);

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
                  ? shouldUseCustomVoice 
                    ? 'Playing your recording...'
                    : 'Listening to the story...'
                  : shouldUseCustomVoice
                    ? 'Tap play to hear your recording'
                    : 'Tap play to hear the story'}
              </Text>

              {shouldUseCustomVoice && (
                <View style={styles.voiceIndicator}>
                  <User size={14} color={Colors.accent} />
                  <Text style={styles.voiceIndicatorText}>Using your voice</Text>
                </View>
              )}

              <View style={styles.recordSection}>
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    storyHasRecording && styles.recordButtonHasRecording,
                  ]}
                  onPress={() => setShowRecordingModal(true)}
                >
                  <Mic size={18} color={storyHasRecording ? Colors.accent : Colors.primary} />
                  <Text style={[
                    styles.recordButtonText,
                    storyHasRecording && styles.recordButtonTextHasRecording,
                  ]}>
                    {storyHasRecording ? 'Recording Saved' : 'Record Your Voice'}
                  </Text>
                </TouchableOpacity>

                {storyHasRecording && (
                  <TouchableOpacity
                    style={styles.deleteRecordingButton}
                    onPress={handleDeleteRecording}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.autoPlaySection}>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => setShowSettingsModal(true)}
                >
                  <Settings size={18} color={Colors.primary} />
                  <Text style={styles.settingsButtonText}>Playback Settings</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

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

            <View style={styles.settingSection}>
              <View style={styles.settingLabelRow}>
                <Volume2 size={20} color={Colors.primary} />
                <Text style={styles.settingLabel}>Voice Selection</Text>
              </View>
              <Text style={styles.settingDescription}>
                Choose which voice to use for all stories
              </Text>
              <View style={styles.voiceOptions}>
                <TouchableOpacity
                  style={[
                    styles.voiceOption,
                    voicePreference === 'ai' && styles.voiceOptionActive,
                  ]}
                  onPress={() => setVoicePreference('ai')}
                >
                  <Bot size={20} color={voicePreference === 'ai' ? '#fff' : Colors.textSecondary} />
                  <Text style={[
                    styles.voiceOptionText,
                    voicePreference === 'ai' && styles.voiceOptionTextActive,
                  ]}>
                    AI Voice
                  </Text>
                  {voicePreference === 'ai' && (
                    <Check size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.voiceOption,
                    voicePreference === 'custom' && styles.voiceOptionActive,
                  ]}
                  onPress={() => setVoicePreference('custom')}
                >
                  <User size={20} color={voicePreference === 'custom' ? '#fff' : Colors.textSecondary} />
                  <Text style={[
                    styles.voiceOptionText,
                    voicePreference === 'custom' && styles.voiceOptionTextActive,
                  ]}>
                    Your Voice
                  </Text>
                  {voicePreference === 'custom' && (
                    <Check size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              {voicePreference === 'custom' && (
                <Text style={styles.voiceNote}>
                  Uses your recorded voice when available, AI voice otherwise
                </Text>
              )}
              {voicePreference === 'ai' && (
                <View style={styles.genderSection}>
                  <Text style={styles.genderLabel}>AI Voice Gender</Text>
                  <View style={styles.genderOptions}>
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        aiVoiceGender === 'female' && styles.genderOptionActive,
                      ]}
                      onPress={() => setAIVoiceGender('female')}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        aiVoiceGender === 'female' && styles.genderOptionTextActive,
                      ]}>
                        Female
                      </Text>
                      {aiVoiceGender === 'female' && (
                        <Check size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        aiVoiceGender === 'male' && styles.genderOptionActive,
                      ]}
                      onPress={() => setAIVoiceGender('male')}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        aiVoiceGender === 'male' && styles.genderOptionTextActive,
                      ]}>
                        Male
                      </Text>
                      {aiVoiceGender === 'male' && (
                        <Check size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

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

      <Modal
        visible={showRecordingModal}
        transparent={false}
        animationType="slide"
        onRequestClose={cancelRecording}
      >
        <SafeAreaView style={styles.recordingModalContainer} edges={['top', 'bottom']}>
          <View style={styles.recordingHeader}>
            <TouchableOpacity
              style={styles.recordingCloseButton}
              onPress={cancelRecording}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.recordingHeaderTitle}>Record Your Voice</Text>
            <View style={styles.recordingHeaderSpacer} />
          </View>

          <View style={styles.recordingControlsBar}>
            <Animated.View style={[
              styles.recordingIndicator,
              isRecording && { transform: [{ scale: recordPulseAnim }] },
            ]}>
              {isRecording ? (
                <MicOff size={20} color="#fff" />
              ) : (
                <Mic size={20} color="#fff" />
              )}
            </Animated.View>
            
            <Text style={styles.recordingTimerText}>
              {formatRecordingDuration(recordingDuration)}
            </Text>

            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordControlButton}
                onPress={startRecording}
              >
                <Mic size={18} color="#fff" />
                <Text style={styles.recordControlButtonText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.recordControlButton, styles.stopControlButton]}
                onPress={stopRecording}
              >
                <MicOff size={18} color="#fff" />
                <Text style={styles.recordControlButtonText}>Stop & Save</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.storyReadAlongHeader}>
            <BookOpen size={16} color={Colors.primary} />
            <Text style={styles.storyReadAlongTitle}>Read along as you record</Text>
          </View>

          <ScrollView 
            style={styles.recordingStoryScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.recordingStoryContent}
          >
            <Text style={styles.recordingStoryTitle}>{story.title}</Text>
            <Text style={styles.recordingStoryText}>{story.content}</Text>
          </ScrollView>

          {isRecording && (
            <View style={styles.recordingActiveBar}>
              <View style={styles.recordingPulse} />
              <Text style={styles.recordingActiveText}>Recording in progress...</Text>
            </View>
          )}
        </SafeAreaView>
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
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.accent + '20',
    borderRadius: 12,
  },
  voiceIndicatorText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  recordSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  recordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  recordButtonHasRecording: {
    backgroundColor: Colors.accent + '15',
    borderColor: Colors.accent + '30',
  },
  recordButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  recordButtonTextHasRecording: {
    color: Colors.accent,
  },
  deleteRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
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
  recordingModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  recordingModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recordingCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingHeaderTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  recordingHeaderSpacer: {
    width: 40,
  },
  recordingControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recordingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingTimerText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    minWidth: 70,
  },
  recordControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  stopControlButton: {
    backgroundColor: Colors.primary,
  },
  recordControlButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  storyReadAlongHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
  },
  storyReadAlongTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  recordingStoryScroll: {
    flex: 1,
  },
  recordingStoryContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recordingStoryTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  recordingStoryText: {
    fontSize: 20,
    color: Colors.text,
    lineHeight: 34,
  },
  recordingActiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.error,
  },
  recordingPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  recordingActiveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
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
  voiceOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  voiceOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  voiceOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  voiceOptionTextActive: {
    color: '#fff',
  },
  voiceNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  genderSection: {
    marginTop: 16,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderOptionActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  genderOptionTextActive: {
    color: '#fff',
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
  recordingInstructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  recordingVisual: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingDuration: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  recordingStatus: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  recordingActions: {
    marginBottom: 20,
  },
  startRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startRecordButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  stopRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  stopRecordButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  recordingTip: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
