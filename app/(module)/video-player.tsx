// app/(app)/module/video-player.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { apiService, ModuleDetailsResponse } from '../services/api';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [moduleData, setModuleData] = useState<ModuleDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getModuleDetails(String(moduleId));
  
        console.log("video url response", response.data?.module.video_url);
        
        if (response.success && response.data) {
          setModuleData(response.data);
          // Set estimated duration from module data
          if (response.data.module.estimated_time_min) {
            setDuration(response.data.module.estimated_time_min * 60); // Convert minutes to seconds
          }
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

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const onStateChange = useCallback((state: string) => {
    console.log('YouTube player state:', state);
    if (state === 'ended') {
      setIsPlaying(false);
    } else if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused') {
      setIsPlaying(false);
    }
  }, []);

  const onReady = useCallback(() => {
    console.log('YouTube player is ready');
    setIsPlayerReady(true);
    setVideoError(null);
  }, []);

  const onError = useCallback((error: string) => {
    console.error('YouTube player error:', error);
    setVideoError('Failed to load video. Please check your connection.');
    setIsPlayerReady(false);
  }, []);

  const onProgress = useCallback((data: { currentTime: number; duration: number }) => {
    setCurrentTime(data.currentTime);
    if (data.duration > 0 && duration === 0) {
      setDuration(data.duration);
    }
  }, [duration]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white p-3">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-600 text-center mb-4">{error}</Text>
          <TouchableOpacity 
            className="bg-[#1E4B88] px-6 py-3 rounded-lg"
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const videoUrl = moduleData?.module?.video_url;
  const videoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  return (
    <>
        <StatusBar 
          backgroundColor="white" 
          barStyle="light-content" 
          translucent={Platform.OS === 'android'}
        />
        <SafeAreaView 
          edges={['right', 'left','top']}
          style={{ flex: 1, backgroundColor: "white" }}
        >
      
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            className="mr-3 p-1" 
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <Text className="text-[#1E4B88] text-lg font-bold flex-1" numberOfLines={1}>
            {moduleData?.module?.title || 'Module Video'}
          </Text>
        </View>
        
        <TouchableOpacity className="ml-4">
          <Icon name="dots-vertical" size={24} color="#1E4B88" />
        </TouchableOpacity>
      </View>

      {/* Navigation tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Content</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-[#1E4B88]">
          <Text className="text-[#1E4B88] font-medium">Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Assessment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Video Player */}
        <View className="bg-black">
          {videoId ? (
            <View style={{ height: width * 9 / 16 }}>
              <YoutubePlayer
                ref={playerRef}
                height={width * 9 / 16}
                width={width}
                videoId={videoId}
                play={isPlaying}
                onChangeState={onStateChange}
                onReady={onReady}
                onError={onError}
                onProgress={onProgress}
                initialPlayerParams={{
                  cc_lang_pref: 'en',
                  showClosedCaptions: true,
                  controls: true,
                  modestbranding: true,
                  rel: false,
                  showinfo: false,
                }}
                webViewStyle={{
                  opacity: 0.99, // Fix for Android
                }}
                webViewProps={{
                  androidLayerType: 'hardware',
                }}
              />
              
              {/* Loading overlay */}
              {!isPlayerReady && (
                <View className="absolute inset-0 bg-gray-900 justify-center items-center">
                  <View className="bg-black bg-opacity-50 rounded-full p-4 mb-2">
                    <Icon name="play" size={32} color="white" />
                  </View>
                  <Text className="text-white text-sm">Loading video...</Text>
                </View>
              )}
            </View>
          ) : (
            // No valid YouTube video
            <View 
              className="bg-gray-800 justify-center items-center"
              style={{ height: width * 9 / 16 }}
            >
              <Icon name="video-off" size={48} color="#666" />
              <Text className="text-gray-400 mt-2 text-center px-4">
                {videoUrl ? 'Invalid YouTube URL' : 'No video available'}
              </Text>
              {videoUrl && (
                <Text className="text-gray-500 text-xs mt-1 px-4 text-center">
                  URL: {videoUrl}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Video Error */}
        {videoError && (
          <View className="bg-red-50 border border-red-200 rounded-lg m-4 p-4">
            <View className="flex-row items-center mb-2">
              <Icon name="alert-circle" size={20} color="#DC2626" />
              <Text className="text-red-700 font-medium ml-2">Video Error</Text>
            </View>
            <Text className="text-red-600">{videoError}</Text>
            <TouchableOpacity 
              className="mt-3 bg-red-600 px-4 py-2 rounded-lg self-start"
              onPress={() => {
                setVideoError(null);
                setIsPlayerReady(false);
              }}
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video Controls Info */}
        {isPlayerReady && videoId && (
          <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="bg-[#1E4B88] rounded-full p-2 mr-3"
                  onPress={togglePlayPause}
                >
                  <Icon 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
                
                <View>
                  <Text className="text-gray-800 font-medium">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </Text>
                  {duration > 0 && (
                    <Text className="text-gray-600 text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                  )}
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Icon name="youtube" size={24} color="#FF0000" />
                <Text className="text-gray-600 text-sm ml-1">YouTube</Text>
              </View>
            </View>
          </View>
        )}

        {/* Video info */}
        <View className="px-4 py-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {moduleData?.module?.title || 'Module Video'}
          </Text>
          
          {duration > 0 && (
            <Text className="text-gray-600 text-base mb-2">
              Duration: {formatTime(duration)}
            </Text>
          )}
          
          <Text className="text-gray-700 text-base leading-relaxed mb-4">
            {moduleData?.module?.generated_summary || 'Watch this video to learn more about the module content.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View className="px-4 py-4 pb-6 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className="bg-gray-100 px-4 py-2 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 font-medium">Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#1E4B88] px-6 py-2 rounded-lg flex-row items-center"
            onPress={() => router.push({
              pathname: '/(module)/resources',
              params: { moduleId, contentType: 'resources_accessed' }
            })}
          >
            <Text className="text-white font-bold mr-2">Next: Resources</Text>
            <Icon name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
};

export default VideoPlayerScreen;