// services/sarvamTTS.ts

export interface SarvamTTSRequest {
  inputs: string[];
  target_language_code: string;
  speaker: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  speech_sample_rate?: number;
  enable_preprocessing?: boolean;
  model?: string;
}

export interface SarvamTTSConfig {
  apiKey: string;
  baseUrl?: string;
}

class SarvamTTSService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SarvamTTSConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.sarvam.ai';
  }

  // Available Indian language codes
  static readonly LANGUAGES = {
    HINDI: 'hi-IN',
    BENGALI: 'bn-IN',
    GUJARATI: 'gu-IN',
    KANNADA: 'kn-IN',
    MALAYALAM: 'ml-IN',
    MARATHI: 'mr-IN',
    ODIA: 'or-IN',
    PUNJABI: 'pa-IN',
    TAMIL: 'ta-IN',
    TELUGU: 'te-IN',
    URDU: 'ur-IN',
    ENGLISH: 'en-IN'
  } as const;

  // Available voice speakers
  static readonly SPEAKERS = {
    // Hindi speakers
    MEERA: 'meera', // Female Hindi
    ARJUN: 'arjun', // Male Hindi
    
    // Add more speakers as they become available
    // You can check Sarvam API documentation for latest speakers
  } as const;

  /**
   * Clean text for better TTS output
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/[-•]\s/g, '') // Remove bullet points
      .replace(/\d+\.\s/g, '') // Remove numbered lists
      .replace(/\[.*?\]/g, '') // Remove square brackets
      .replace(/\(.*?\)/g, '') // Remove parentheses content (optional)
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Generate speech from text using Sarvam API
   */
  async generateSpeech(
    text: string, 
    options: Partial<SarvamTTSRequest> = {}
  ): Promise<Blob> {
    try {
      // Clean the text
      const cleanedText = this.cleanTextForTTS(text);

      // Default request parameters
      const requestBody: SarvamTTSRequest = {
        inputs: [cleanedText],
        target_language_code: options.target_language_code || SarvamTTSService.LANGUAGES.HINDI,
        speaker: options.speaker || SarvamTTSService.SPEAKERS.MEERA,
        pitch: options.pitch || 0,
        pace: options.pace || 1.0,
        loudness: options.loudness || 1.0,
        speech_sample_rate: options.speech_sample_rate || 8000,
        enable_preprocessing: options.enable_preprocessing !== false,
        model: options.model || 'bulbul:v1',
        ...options
      };

      console.log('Generating TTS for text length:', cleanedText.length);
      console.log('TTS Request:', requestBody);

      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Subscription-Key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Sarvam API error (${response.status}): ${errorData}`);
      }

      const audioBlob = await response.blob();
      console.log('TTS generated successfully, blob size:', audioBlob.size);
      
      return audioBlob;

    } catch (error) {
      console.error('Sarvam TTS Error:', error);
      throw error;
    }
  }

  /**
   * Generate speech and return audio URI for React Native
   */
  async generateSpeechUri(
    text: string, 
    options: Partial<SarvamTTSRequest> = {}
  ): Promise<string> {
    try {
      const audioBlob = await this.generateSpeech(text, options);
      
      // Create object URL for the blob
      const audioUri = URL.createObjectURL(audioBlob);
      return audioUri;

    } catch (error) {
      console.error('Error generating speech URI:', error);
      throw error;
    }
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.generateSpeech('Test', {
        target_language_code: SarvamTTSService.LANGUAGES.ENGLISH
      });
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get estimated audio duration (rough calculation)
   */
  static estimateAudioDuration(text: string, wordsPerMinute: number = 150): number {
    const wordCount = text.split(' ').length;
    const minutes = wordCount / wordsPerMinute;
    return Math.ceil(minutes * 60 * 1000); // Return in milliseconds
  }

  /**
   * Split long text into chunks for better TTS processing
   */
  static splitTextIntoChunks(text: string, maxChunkLength: number = 1000): string[] {
    if (text.length <= maxChunkLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkLength) {
        currentChunk += sentence + '. ';
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence + '. ';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}

export default SarvamTTSService;