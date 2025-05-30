// app/(app)/module/content-viewer.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { dummyModuleData, dummyProgress } from '../services/dummyData';
import { apiService, ModuleDetailsResponse } from '../services/api';


const ContentViewerScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [moduleData, setModuleData] = useState<ModuleDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 1;

  // Split content into sections
  const contentSections = moduleData?.module?.content?.split('\n\n') || [];

  useEffect(() => {
  const fetchModuleData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getModuleDetails(String(moduleId));

      console.log("response.data",response.data)
      
      if (response.success && response.data) {
        setModuleData(response.data);
      } else {
        setError(response.error || 'Failed to load module');
      }
    } catch (err) {
      setError('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  if (moduleId) {
    fetchModuleData();
  }
}, [moduleId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement actual audio playback
  };

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    } else {
      // Navigate to next content type (Videos)
      router.push({
        pathname: '/(module)/video-player',
        params: { moduleId, contentType: 'video_watched' }
      });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3 p-1" 
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <Text className="text-[#1E4B88] text-xl font-bold">
            Gromo<Text className="text-green-500">+</Text>
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Icon name="bookmark-outline" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image 
              source={require('../../assets/images/react-logo.png')} 
              className="w-9 h-9 rounded-full border border-gray-300"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Course title */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-[#1E4B88] text-xl font-bold">
        {moduleData?.module?.title || 'Loading...'}
        </Text>
        <View className="flex-row items-center mt-2">
          <Icon name="clock-outline" size={16} color="#666" />
          <Text className="text-gray-600 ml-1 mr-4">20 min</Text>
          <Icon name="signal" size={16} color="#666" />
          <Text className="text-gray-600 ml-1 mr-4">Beginner</Text>
          <Icon name="code-tags" size={16} color="#666" />
          <Text className="text-gray-600 ml-1">Programming</Text>
        </View>
      </View>

      {/* Navigation tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-[#1E4B88]">
          <Text className="text-[#1E4B88] font-medium">Content</Text>
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

      <ScrollView className="flex-1">
        {/* Main content section */}
        <View className="px-4 py-6">
            <Text>
         {
         contentSections
         }
         </Text>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View className="px-4 py-4 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-lg ${currentSection === 1 ? 'bg-gray-200' : 'bg-gray-100'}`}
            onPress={handlePrevious}
            disabled={currentSection === 1}
          >
            <Text className={`font-medium ${currentSection === 1 ? 'text-gray-400' : 'text-gray-700'}`}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#1E4B88] px-6 py-2 rounded-lg flex-row items-center"
            onPress={handleNext}
          >
            <Text className="text-white font-bold mr-2">
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