import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';
import { apiService, ModuleDetailsResponse } from '../services/api';
import * as FileSystem from 'expo-file-system';
import ModernElevenLabsService from '../services/ModernElevenLabsService'; // Adjust path as needed

interface ContentSection {
  title: string;
  content: string;
  icon: string;
  estimatedTime: number;
}

interface StructuredContent {
  introduction: ContentSection;
  keyConcepts: ContentSection;
  practicalExamples: ContentSection;
  risksAndProcess: ContentSection;
}

interface AudioState {
  [key: string]: {
    sound: Audio.Sound | null;
    isLoading: boolean;
    isPlaying: boolean;
    duration: number;
    position: number;
  };
}

const ContentViewerScreen: React.FC = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [moduleData, setModuleData] = useState<ModuleDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [audioState, setAudioState] = useState<AudioState>({});
  const totalSections = 4;

  // Initialize ElevenLabs service
  const elevenLabsService = new ModernElevenLabsService(
  process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || ''
  );

  console.log("🔧 ElevenLabs Service Debug Info:");
  console.log("API Key from env:", process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ? "Present" : "Missing");
  console.log("API Key length:", process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY?.length || 0);


  useEffect(() => {
  return () => {
    console.log('🧹 Cleaning up audio resources...');
    Object.values(audioState).forEach(async (audio) => {
      if (audio?.sound) {
        try {
          await audio.sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading audio:', error);
        }
      }
    });
    elevenLabsService.stopAudio();
  };
}, []);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getModuleDetails(String(moduleId));

        console.log('=== DEBUG: Full API Response ===');
        console.log('Response success:', response.success);

        if (response.success && response.data) {
          setModuleData(response.data);
        } else {
          setError(response.error || 'Failed to load module');
        }
      } catch (err) {
        console.error('Module fetch error:', err);
        setError('Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  const cleanTextForTTS = (text: string): string => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/[-•]\s/g, '')
      .replace(/\d+\.\s/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

const generateAudio = async (text: string, sectionKey: string) => {
  try {
    console.log(`🎵 === STARTING AUDIO GENERATION ===`);
    console.log(`📝 Section: ${sectionKey}`);
    console.log(`📝 Text length: ${text.length}`);
    console.log(`📝 Text preview: ${text.substring(0, 100)}...`);

    // Update state to show loading
    setAudioState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        isLoading: true,
        sound: null,
        isPlaying: false,
        duration: 0,
        position: 0,
      },
    }));

    const cleanText = cleanTextForTTS(text);
    console.log(`🧹 Clean text length: ${cleanText.length}`);
    console.log(`🧹 Clean text preview: ${cleanText.substring(0, 100)}...`);

    const maxLength = 5000;
    const textToUse = cleanText.length > maxLength ? cleanText.substring(0, maxLength) : cleanText;
    console.log(`✂️ Final text length: ${textToUse.length}`);

    // Generate and play audio
    await elevenLabsService.generateSpeech(
      textToUse,
      'kavita_insurance',
      (status) => {
        console.log(`🔊 Audio status update for ${sectionKey}:`, status);
        
        setAudioState((prev) => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            isLoading: !status.isLoaded,
            isPlaying: status.isPlaying || false,
            position: status.positionMillis || prev[sectionKey]?.position || 0,
            duration: status.durationMillis || prev[sectionKey]?.duration || 0,
            sound: status.sound || prev[sectionKey]?.sound || null,
          },
        }));

        if (status.didJustFinish) {
          console.log(`✅ Audio finished for ${sectionKey}`);
          setAudioState((prev) => ({
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              isPlaying: false,
              position: 0,
            },
          }));
        }

        if (status.error) {
          console.error(`❌ Audio error for ${sectionKey}`);
          throw new Error('Audio playback error');
        }
      }
    );

    console.log(`✅ TTS generation completed for section: ${sectionKey}`);
  } catch (error) {
    console.error('❌ === TTS ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', (error as Error)?.stack);

    let errorMessage = 'Failed to generate audio. ';
    if (error instanceof Error) {
      console.log('Error message:', error.message);
      if (error.message.includes('401')) {
        errorMessage += 'Invalid API key. Please check your ElevenLabs API key.';
      } else if (error.message.includes('403')) {
        errorMessage += 'API access forbidden. Please check your ElevenLabs subscription.';
      } else if (error.message.includes('429')) {
        errorMessage += 'Rate limit exceeded. Please check your ElevenLabs subscription.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
    } else {
      errorMessage += 'Unknown error occurred.';
    }

    Alert.alert('Audio Error', errorMessage);

    // Reset loading state
    setAudioState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        isLoading: false,
        sound: null,
        isPlaying: false,
        duration: 0,
        position: 0,
      },
    }));
  }
};

  const toggleAudio = async (sectionKey: string, content: string) => {
  try {
    console.log(`🎵 === TOGGLE AUDIO ===`);
    console.log(`📝 Section: ${sectionKey}`);
    
    const currentAudio = audioState[sectionKey];
    console.log('Current audio state:', currentAudio);

    // If no sound exists, generate new audio
    if (!currentAudio?.sound) {
      console.log('🆕 No existing sound, generating new audio...');
      await generateAudio(content, sectionKey);
      return;
    }

    // If currently playing, pause it
    if (currentAudio.isPlaying) {
      console.log('⏸️ Pausing audio...');
      await currentAudio.sound.pauseAsync();
      setAudioState((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          isPlaying: false,
        },
      }));
    } else {
      console.log('▶️ Resuming audio...');
      
      // Pause all other audio first
      for (const [key, audio] of Object.entries(audioState)) {
        if (key !== sectionKey && audio?.isPlaying && audio.sound) {
          console.log(`⏸️ Pausing other audio: ${key}`);
          await audio.sound.pauseAsync();
          setAudioState((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              isPlaying: false,
            },
          }));
        }
      }

      // Play the current audio
      await currentAudio.sound.playAsync();
      setAudioState((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          isPlaying: true,
        },
      }));
    }
  } catch (error) {
    console.error('❌ Audio playback error:', error);
    Alert.alert('Playback Error', 'Failed to play audio. Please try again.');
  }
};
  const isStructuredContent = (content: any): content is StructuredContent => {
    return (
      content &&
      typeof content === 'object' &&
      content.introduction &&
      content.keyConcepts &&
      content.practicalExamples &&
      content.risksAndProcess
    );
  };

  const convertLegacyContent = (content: string, title: string): StructuredContent => {
    if (!content || typeof content !== 'string') {
      return createFallbackContent(title);
    }

    const sections = content.split(/\*\*\d+\.\s*/).filter((section) => section.trim());
    const contentSections = sections.length > 1 ? sections : content.split('\n\n').filter((section) => section.trim());

    return {
      introduction: {
        title: 'Introduction & Overview',
        content: contentSections[0] || `${title}\n\nWelcome to this comprehensive learning module.`,
        icon: 'book-outline',
        estimatedTime: 5,
      },
      keyConcepts: {
        title: 'Key Concepts',
        content: contentSections[1] || 'Key concepts will be covered here.',
        icon: 'lightbulb-outline',
        estimatedTime: 7,
      },
      practicalExamples: {
        title: 'Practical Applications',
        content: contentSections[2] || 'Practical examples will be shown here.',
        icon: 'chart-line',
        estimatedTime: 5,
      },
      risksAndProcess: {
        title: 'Implementation & Risk Management',
        content: contentSections[3] || 'Implementation details will be provided here.',
        icon: 'shield-outline',
        estimatedTime: 3,
      },
    };
  };

  const createFallbackContent = (title: string): StructuredContent => {
    return {
      introduction: {
        title: 'Introduction & Overview',
        content: `${title}\n\nContent will be available here.`,
        icon: 'book-outline',
        estimatedTime: 5,
      },
      keyConcepts: {
        title: 'Key Concepts',
        content: 'Content will be available here.',
        icon: 'lightbulb-outline',
        estimatedTime: 7,
      },
      practicalExamples: {
        title: 'Practical Applications',
        content: 'Content will be available here.',
        icon: 'chart-line',
        estimatedTime: 5,
      },
      risksAndProcess: {
        title: 'Implementation & Risk Management',
        content: 'Content will be available here.',
        icon: 'shield-outline',
        estimatedTime: 3,
      },
    };
  };

  const getStructuredContent = (): StructuredContent => {
    const moduleContent = moduleData?.module?.content;
    const moduleTitle = moduleData?.module?.title || 'Learning Module';

    console.log('=== Processing Content ===');
    console.log('Module content type:', typeof moduleContent);

    if (isStructuredContent(moduleContent)) {
      console.log('Using structured content from backend');
      return {
        introduction: {
          title: moduleContent.introduction.title || 'Introduction & Overview',
          content: moduleContent.introduction.content || 'Content will be available here.',
          icon: moduleContent.introduction.icon || 'book-outline',
          estimatedTime: moduleContent.introduction.estimatedTime || 5,
        },
        keyConcepts: {
          title: moduleContent.keyConcepts.title || 'Key Concepts',
          content: moduleContent.keyConcepts.content || 'Content will be available here.',
          icon: moduleContent.keyConcepts.icon || 'lightbulb-outline',
          estimatedTime: moduleContent.keyConcepts.estimatedTime || 7,
        },
        practicalExamples: {
          title: moduleContent.practicalExamples.title || 'Practical Applications',
          content: moduleContent.practicalExamples.content || 'Content will be available here.',
          icon: moduleContent.practicalExamples.icon || 'chart-line',
          estimatedTime: moduleContent.practicalExamples.estimatedTime || 5,
        },
        risksAndProcess: {
          title: moduleContent.risksAndProcess.title || 'Implementation & Risk Management',
          content: moduleContent.risksAndProcess.content || 'Content will be available here.',
          icon: moduleContent.risksAndProcess.icon || 'shield-outline',
          estimatedTime: moduleContent.risksAndProcess.estimatedTime || 3,
        },
      };
    }

    if (typeof moduleContent === 'string' && moduleContent.trim()) {
      console.log('Processing string content from backend');
      return convertLegacyContent(moduleContent, moduleTitle);
    }

    console.log('Using fallback content');
    return createFallbackContent(moduleTitle);
  };

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    } else {
      router.push({
        pathname: '/(module)/video-player',
        params: { moduleId, contentType: 'video_watched' },
      });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderFormattedContent = (content: string, colorScheme?: any) => {
    if (!content) {
      return <Text className="text-gray-700 text-base leading-6">Content will be available here.</Text>;
    }

    const lines = content.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return <View key={index} className="h-3" />;
      }

      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        return (
          <Text key={index} className="text-gray-800 text-base leading-7 mb-3">
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <Text key={partIndex} className="font-bold text-gray-900">
                  {part}
                </Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              )
            )}
          </Text>
        );
      }

      if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split('*');
        return (
          <Text key={index} className="text-gray-800 text-base leading-7 mb-3">
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <Text key={partIndex} className="italic text-gray-900">
                  {part}
                </Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              )
            )}
          </Text>
        );
      }

      if (trimmedLine.startsWith('# ')) {
        return (
          <Text key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-2 leading-8">
            {trimmedLine.replace('# ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('## ')) {
        return (
          <Text key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-4 leading-7">
            {trimmedLine.replace('## ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('### ')) {
        return (
          <Text key={index} className="text-lg font-medium text-gray-800 mb-2 mt-3 leading-6">
            {trimmedLine.replace('### ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('*   ')) {
        const bulletText = trimmedLine.replace(/^[-•]\s*/, '').replace(/^\*\s*/, '');
        return (
          <View key={index} className="flex-row mb-3 ml-2">
            <View
              className="w-5 h-5 rounded-full items-center justify-center mr-3 mt-1"
              style={{
                backgroundColor: colorScheme?.iconColor || '#1E40AF',
                opacity: 0.8,
              }}
            >
              <Text className="text-white text-xs font-bold">•</Text>
            </View>
            <Text className="text-gray-800 flex-1 leading-6">{bulletText}</Text>
          </View>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <View key={index} className="flex-row mb-3 ml-2">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{
                  backgroundColor: colorScheme?.iconColor || '#1E40AF',
                  opacity: 0.9,
                }}
              >
                <Text className="text-white text-xs font-bold">{match[1]}</Text>
              </View>
              <Text className="text-gray-800 flex-1 leading-6">{match[2]}</Text>
            </View>
          );
        }
      } else {
        return (
          <Text key={index} className="text-gray-800 text-base leading-7"></Text>
         );
       }
       return null;
     }).filter(Boolean);
   };
 
   const renderContentSection = (section: ContentSection, index: number) => {
     if (!section) return null;
 
     const sectionColors = [
       {
         contentBg: '#F0F4FF',
         headerBg: '#E1E8FF',
         iconBg: '#D1DCFF',
         iconColor: '#1E40AF',
         borderColor: '#C7D2FE',
       },
       {
         contentBg: '#F0FDF4',
         headerBg: '#DCFCE7',
         iconBg: '#BBF7D0',
         iconColor: '#059669',
         borderColor: '#A7F3D0',
       },
       {
         contentBg: '#FAF5FF',
         headerBg: '#F3E8FF',
         iconBg: '#E9D5FF',
         iconColor: '#7C3AED',
         borderColor: '#DDD6FE',
       },
       {
         contentBg: '#FFFBEB',
         headerBg: '#FEF3C7',
         iconBg: '#FDE68A',
         iconColor: '#D97706',
         borderColor: '#F9E8A0',
       },
     ];
 
     const colorScheme = sectionColors[index] || sectionColors[0];
     const sectionKey = ['introduction', 'keyConcepts', 'practicalExamples', 'risksAndProcess'][index];
     const currentAudio = audioState[sectionKey];
 
     const getAudioButtonState = () => {
       if (currentAudio?.isLoading) return 'loading';
       if (currentAudio?.isPlaying) return 'playing';
       if (currentAudio?.sound) return 'paused';
       return 'stopped';
     };
 
     const audioButtonState = getAudioButtonState();
 
     return (
       <View
         key={index}
         className="mb-6 rounded-xl border overflow-hidden"
         style={{
           backgroundColor: colorScheme.headerBg,
           borderColor: colorScheme.borderColor,
           borderWidth: 1,
         }}
       >
         <View
           className="px-4 py-4 border-b"
           style={{
             backgroundColor: colorScheme.headerBg,
             borderBottomColor: colorScheme.borderColor,
           }}
         >
           <View className="flex-row items-center justify-between">
             <View className="flex-row items-center flex-1">
               <View
                 className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                 style={{ backgroundColor: colorScheme.iconBg }}
               >
                 <Icon name={section.icon || 'book-outline'} size={20} color={colorScheme.iconColor} />
               </View>
               <View className="flex-1">
                 <Text className="text-xl font-semibold text-gray-900">
                   {section.title || `Section ${index + 1}`}
                 </Text>
                 <Text className="text-sm text-gray-700">{section.estimatedTime || 5} min read</Text>
               </View>
             </View>
 
             <TouchableOpacity
               className="ml-3 p-2 rounded-full"
               style={{
                 backgroundColor: colorScheme.iconColor,
                 opacity: audioButtonState === 'loading' ? 0.6 : 1,
               }}
               onPress={() => toggleAudio(sectionKey, section.content)}
               disabled={audioButtonState === 'loading'}
             >
               {audioButtonState === 'loading' && <Icon name="loading" size={20} color="white" />}
               {audioButtonState === 'playing' && <Icon name="pause" size={20} color="white" />}
               {(audioButtonState === 'paused' || audioButtonState === 'stopped') && (
                 <Icon name="volume-high" size={20} color="white" />
               )}
             </TouchableOpacity>
           </View>
 
           {currentAudio?.sound && (
             <View className="mt-3">
               <View className="flex-row items-center justify-between mb-1">
                 <Text className="text-xs text-gray-600">{formatTime(currentAudio.position)}</Text>
                 <Text className="text-xs text-gray-600">{formatTime(currentAudio.duration)}</Text>
               </View>
               <View className="h-1 rounded-full" style={{ backgroundColor: colorScheme.borderColor }}>
                 <View
                   className="h-1 rounded-full"
                   style={{
                     backgroundColor: colorScheme.iconColor,
                     width: currentAudio.duration > 0
                       ? `${(currentAudio.position / currentAudio.duration) * 100}%`
                       : '0%',
                   }}
                 />
               </View>
             </View>
           )}
         </View>
 
         <View className="px-5 py-5" style={{ backgroundColor: colorScheme.contentBg }}>
           {renderFormattedContent(section.content || 'Content will be available here.', colorScheme)}
         </View>
       </View>
     );
   };
 
   const formatTime = (milliseconds: number): string => {
     const totalSeconds = Math.floor(milliseconds / 1000);
     const minutes = Math.floor(totalSeconds / 60);
     const seconds = totalSeconds % 60;
     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
   };
 
   if (loading) {
     return (
       <SafeAreaView className="flex-1 bg-white justify-center items-center">
         <View className="items-center">
           <Icon name="loading" size={40} color="#1E40AF" />
           <Text className="mt-4 text-gray-600 text-lg">Loading content...</Text>
         </View>
       </SafeAreaView>
     );
   }
 
   if (error || !moduleData) {
     return (
       <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
         <Icon name="alert-circle-outline" size={50} color="#EF4444" />
         <Text className="mt-4 text-gray-800 text-lg text-center font-medium">
           {error || 'Failed to load content'}
         </Text>
         <TouchableOpacity className="mt-6 bg-blue-600 px-6 py-3 rounded-lg" onPress={() => router.back()}>
           <Text className="text-white font-medium">Go Back</Text>
         </TouchableOpacity>
       </SafeAreaView>
     );
   }
 
   const structuredContent = getStructuredContent();
   const contentSections = [
     structuredContent.introduction,
     structuredContent.keyConcepts,
     structuredContent.practicalExamples,
     structuredContent.risksAndProcess,
   ];
 
   return (
     <SafeAreaView className="flex-1 bg-white">
       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
       <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
         <View className="flex-row items-center">
           <TouchableOpacity className="mr-3 p-1" onPress={() => router.back()}>
             <Icon name="arrow-left" size={24} color="#1E40AF" />
           </TouchableOpacity>
           <Text className="text-blue-700 text-xl font-bold">
             Gromo<Text className="text-green-600">+</Text>
           </Text>
         </View>
         <View className="flex-row items-center">
           <TouchableOpacity className="mr-4">
             <Icon name="bookmark-outline" size={24} color="#6B7280" />
           </TouchableOpacity>
           <TouchableOpacity>
             <Image
               source={require('../../assets/images/react-logo.png')}
               className="w-9 h-9 rounded-full border border-gray-300"
             />
           </TouchableOpacity>
         </View>
       </View>
       <View className="px-4 py-4 border-b border-gray-200">
         <Text className="text-blue-900 text-xl font-bold">{moduleData?.module?.title || 'Loading...'}</Text>
         <View className="flex-row items-center mt-2">
           <Icon name="clock-outline" size={16} color="#6B7280" />
           <Text className="text-gray-600 ml-1 mr-4">{moduleData?.module?.estimated_time_min || 20} min</Text>
           <Icon name="signal" size={16} color="#6B7280" />
           <Text className="text-gray-600 ml-1 mr-4">Beginner</Text>
           <Icon name="tag-outline" size={16} color="#6B7280" />
           <Text className="text-gray-600 ml-1">Learning</Text>
         </View>
       </View>
       <View className="flex-row border-b border-gray-200">
         <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-blue-600">
           <Text className="text-blue-700 font-medium">Content</Text>
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 py-3 items-center">
           <Text className="text-gray-500 font-medium">Videos</Text>
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 py-3 items-center">
           <Text className="text-gray-500 font-medium">Resources</Text>
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 py-3 items-center">
           <Text className="text-gray-500 font-medium">Assessment</Text>
         </TouchableOpacity>
       </View>
       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
         <View className="px-4 py-6">
           {contentSections.map((section, index) => renderContentSection(section, index))}
         </View>
         <View className="h-20" />
       </ScrollView>
       <View className="px-4 py-4 border-t border-gray-200 bg-white">
         <View className="flex-row justify-between items-center">
           <TouchableOpacity
             className={`px-4 py-2 rounded-lg ${currentSection === 1 ? 'bg-gray-100' : 'bg-gray-100'}`}
             onPress={handlePrevious}
             disabled={currentSection === 1}
           >
             <Text className={`font-medium ${currentSection === 1 ? 'text-gray-400' : 'text-gray-700'}`}>
               Previous
             </Text>
           </TouchableOpacity>
           <TouchableOpacity
             className="bg-blue-600 px-6 py-2 rounded-lg flex-row items-center"
             onPress={handleNext}
           >
             <Text className="text-white font-medium mr-2">
               {currentSection === totalSections ? 'Next: Videos' : 'Next'}
             </Text>
             <Icon name="arrow-right" size={16} color="white" />
           </TouchableOpacity>
         </View>
       </View>
     </SafeAreaView>
   );
 };
 
 export default ContentViewerScreen;