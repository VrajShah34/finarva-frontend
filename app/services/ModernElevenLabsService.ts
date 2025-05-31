// ModernElevenLabsService.ts
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

interface ElevenLabsTTSRequest {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
}

interface PlaybackStatus {
  isLoaded?: boolean;
  isPlaying?: boolean;
  didJustFinish?: boolean;
  error?: boolean;
  sound?: Audio.Sound;
  positionMillis?: number;
  durationMillis?: number;
}

const VOICE_IDS = {
  kavita_insurance: 'NaKPQmdr7mMxXuXrNeFC',
  hindi_teacher: 'pNInz6obpgDQGcFmaJgB',
  friendly_assistant: 'ErXwobaYiN019PkySvjV',
  sales_agent: 'VR6AewLTigWG4xSOukaG',
  comedian: 'onwK4e9ZLuTAKqWW03F9',
};

export class ModernElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private currentSound: Audio.Sound | null = null;
  private voiceMap = VOICE_IDS;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log('🔧 ModernElevenLabsService initialized');
    console.log('🔑 API Key provided:', apiKey ? 'Yes' : 'No');
    console.log('🔑 API Key length:', apiKey?.length || 0);
    console.log('🔑 API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
  }

  async generateSpeech(
    text: string, 
    roleName: string = 'kavita_insurance',
    onPlaybackUpdate?: (status: PlaybackStatus) => void
  ): Promise<void> {
    try {
      console.log('🎵 === STARTING TTS GENERATION ===');
      console.log('📝 Text to convert:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      console.log('🎭 Role name:', roleName);
      console.log('🔑 Using API key:', this.apiKey ? 'Yes' : 'No');
      
      // Validate API key
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key is missing');
      }

      // Get voice ID
      const voiceId = this.voiceMap[roleName as keyof typeof this.voiceMap] || this.voiceMap.kavita_insurance;
      console.log('🎤 Voice ID selected:', voiceId);

      // Prepare voice settings
      const voiceSettings: ElevenLabsVoiceSettings = {
        stability: Number(process.env.EXPO_PUBLIC_TTS_STABILITY) || 0.5,
        similarity_boost: Number(process.env.EXPO_PUBLIC_TTS_SIMILARITY_BOOST) || 0.75,
        style: Number(process.env.EXPO_PUBLIC_TTS_STYLE) || 0.0,
        use_speaker_boost: process.env.EXPO_PUBLIC_TTS_USE_SPEAKER_BOOST === 'true',
      };

      console.log('⚙️ Voice settings:', voiceSettings);

      // Prepare request body
      const requestBody: ElevenLabsTTSRequest = {
        text: text,
        model_id: process.env.EXPO_PUBLIC_TTS_MODEL_ID || 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      };

      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      // Make API request
      const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
      console.log('🌐 Making request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Get audio as array buffer (better for React Native)
      const audioArrayBuffer = await response.arrayBuffer();
      console.log(`✅ Audio generated successfully (${audioArrayBuffer.byteLength} bytes)`);

      // Convert to base64 for React Native
      const audioBase64 = this.arrayBufferToBase64(audioArrayBuffer);
      console.log('🔄 Converted to base64, length:', audioBase64.length);

      // Play the audio
      await this.playAudioBase64(audioBase64, onPlaybackUpdate);

    } catch (error) {
      console.error('❌ ElevenLabs TTS Error:', error);
      if (onPlaybackUpdate) {
        onPlaybackUpdate({ 
          isLoaded: false, 
          isPlaying: false, 
          error: true 
        });
      }
      throw error;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    try {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('❌ Error converting ArrayBuffer to base64:', error);
      throw error;
    }
  }

  private async playAudioBase64(
    audioBase64: string, 
    onPlaybackUpdate?: (status: PlaybackStatus) => void
  ): Promise<void> {
    try {
      console.log('🔊 === STARTING AUDIO PLAYBACK ===');
      
      // Stop any currently playing audio
      await this.stopAudio();

      // Create temporary file
      const audioUri = FileSystem.documentDirectory + 'temp_audio.mp3';
      console.log('💾 Writing audio to:', audioUri);

      // Write base64 to file
      await FileSystem.writeAsStringAsync(audioUri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('✅ Audio file written successfully');

      // Update callback - loading
      if (onPlaybackUpdate) {
        onPlaybackUpdate({ 
          isLoaded: false, 
          isPlaying: false 
        });
      }

      // Load and play audio
      console.log('🎵 Loading audio...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }, // Don't auto-play, we'll control it
        (status) => {
          console.log('🎵 Audio status update:', status);
          if (onPlaybackUpdate && status.isLoaded) {
            onPlaybackUpdate({
              isLoaded: status.isLoaded,
              isPlaying: status.isPlaying || false,
              positionMillis: status.positionMillis || 0,
              durationMillis: status.durationMillis || 0,
              sound: sound,
              didJustFinish: status.didJustFinish || false,
            });
          }
        }
      );

      this.currentSound = sound;
      console.log('✅ Audio loaded successfully');

      // Update callback - loaded
      if (onPlaybackUpdate) {
        onPlaybackUpdate({ 
          isLoaded: true, 
          isPlaying: false,
          sound: sound 
        });
      }

      // Start playback
      console.log('▶️ Starting playback...');
      await sound.playAsync();

      // Update callback - playing
      if (onPlaybackUpdate) {
        onPlaybackUpdate({ 
          isLoaded: true, 
          isPlaying: true,
          sound: sound 
        });
      }

      console.log('✅ Audio playback started successfully');

    } catch (error) {
      console.error('❌ Error playing audio:', error);
      if (onPlaybackUpdate) {
        onPlaybackUpdate({ 
          isLoaded: false, 
          isPlaying: false, 
          error: true 
        });
      }
      throw error;
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.currentSound) {
        console.log('🛑 Stopping current audio...');
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        console.log('✅ Audio stopped and unloaded');
      }
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
    }
  }

  isPlaying(): boolean {
    return this.currentSound !== null;
  }

  // Get available voices for a role
  static getVoicesForRole(roleName: string): string[] {
    const roleVoices: { [key: string]: string[] } = {
      'kavita_insurance': ['NaKPQmdr7mMxXuXrNeFC'], // Warm female
      'hindi_teacher': ['pNInz6obpgDQGcFmaJgB'], // Clear female
      'friendly_assistant': ['ErXwobaYiN019PkySvjV'], // Friendly female
      'sales_agent': ['VR6AewLTigWG4xSOukaG'], // Confident male
      'comedian': ['onwK4e9ZLuTAKqWW03F9'], // Energetic male
    };

    return roleVoices[roleName] || roleVoices['kavita_insurance'];
  }

  // Voice settings presets
  static getVoiceSettings(preset: 'natural' | 'expressive' | 'stable' = 'natural'): ElevenLabsVoiceSettings {
    const presets = {
      natural: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
      expressive: {
        stability: 0.3,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
      stable: {
        stability: 0.8,
        similarity_boost: 0.7,
        style: 0.0,
        use_speaker_boost: false,
      },
    };

    return presets[preset];
  }
}

export default ModernElevenLabsService;