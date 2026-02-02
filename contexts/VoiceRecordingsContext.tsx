import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

const RECORDINGS_KEY = 'story_voice_recordings';
const VOICE_PREFERENCE_KEY = 'voice_preference';

export type VoicePreference = 'ai' | 'custom';

interface RecordingData {
  storyId: string;
  uri: string;
  duration: number;
  createdAt: number;
}

interface RecordingsState {
  [storyId: string]: RecordingData;
}

export const [VoiceRecordingsProvider, useVoiceRecordings] = createContextHook(() => {
  const [recordings, setRecordings] = useState<RecordingsState>({});
  const [voicePreference, setVoicePreferenceState] = useState<VoicePreference>('ai');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedRecordings, storedPreference] = await Promise.all([
        AsyncStorage.getItem(RECORDINGS_KEY),
        AsyncStorage.getItem(VOICE_PREFERENCE_KEY),
      ]);
      
      if (storedRecordings) {
        const parsed = JSON.parse(storedRecordings);
        setRecordings(parsed);
        console.log('Loaded recordings:', Object.keys(parsed).length);
      }
      
      if (storedPreference) {
        setVoicePreferenceState(storedPreference as VoicePreference);
        console.log('Loaded voice preference:', storedPreference);
      }
    } catch (error) {
      console.log('Error loading voice data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecordings = async (newRecordings: RecordingsState) => {
    try {
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(newRecordings));
    } catch (error) {
      console.log('Error saving recordings:', error);
    }
  };

  const setVoicePreference = useCallback(async (preference: VoicePreference) => {
    setVoicePreferenceState(preference);
    try {
      await AsyncStorage.setItem(VOICE_PREFERENCE_KEY, preference);
      console.log('Voice preference saved:', preference);
    } catch (error) {
      console.log('Error saving voice preference:', error);
    }
  }, []);

  const saveRecording = useCallback(async (storyId: string, tempUri: string, duration: number) => {
    try {
      let permanentUri = tempUri;
      
      if (Platform.OS !== 'web') {
        const fileName = `recording_${storyId}_${Date.now()}.m4a`;
        const recordingsDir = new Directory(Paths.document, 'recordings');
        
        if (!recordingsDir.exists) {
          recordingsDir.create({ intermediates: true });
        }
        
        const tempFile = new File(tempUri);
        const permanentFile = new File(recordingsDir, fileName);
        
        tempFile.copy(permanentFile);
        permanentUri = permanentFile.uri;
        console.log('Recording saved to:', permanentUri);
      }

      const recordingData: RecordingData = {
        storyId,
        uri: permanentUri,
        duration,
        createdAt: Date.now(),
      };

      const newRecordings = { ...recordings, [storyId]: recordingData };
      setRecordings(newRecordings);
      await saveRecordings(newRecordings);
      
      return permanentUri;
    } catch (error) {
      console.log('Error saving recording:', error);
      throw error;
    }
  }, [recordings]);

  const deleteRecording = useCallback(async (storyId: string) => {
    try {
      const recording = recordings[storyId];
      if (recording && Platform.OS !== 'web') {
        const file = new File(recording.uri);
        if (file.exists) {
          file.delete();
        }
      }

      const newRecordings = { ...recordings };
      delete newRecordings[storyId];
      setRecordings(newRecordings);
      await saveRecordings(newRecordings);
      
      console.log('Recording deleted for story:', storyId);
    } catch (error) {
      console.log('Error deleting recording:', error);
    }
  }, [recordings]);

  const getRecording = useCallback((storyId: string): RecordingData | null => {
    return recordings[storyId] || null;
  }, [recordings]);

  const hasRecording = useCallback((storyId: string): boolean => {
    return !!recordings[storyId];
  }, [recordings]);

  return {
    recordings,
    voicePreference,
    isLoading,
    setVoicePreference,
    saveRecording,
    deleteRecording,
    getRecording,
    hasRecording,
  };
});
