// Updated course-details.tsx with chatbot_completed as the ONLY completion criteria

import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  apiService,
  Course,
  Module,
  ModuleProgress
} from './services/api';

interface ModuleWithProgress extends Module {
  progress: ModuleProgress;
  isExpanded?: boolean;
}

interface CourseDetails extends Course {
  modules: ModuleWithProgress[];
}

const CourseDetailsScreen = () => {
  const navigation = useNavigation();
  const { courseId } = useLocalSearchParams();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loadingModules, setLoadingModules] = useState<boolean>(false);
  const [previousExpandedModule, setPreviousExpandedModule] = useState<string | null>(null);

  console.log('Module progress:', courseDetails?.modules[0]?.progress.completed_sections);
  
  // Animation values for sequential animation
  const textContentAnim = useRef(new Animated.Value(0)).current;
  const videoContentAnim = useRef(new Animated.Value(0)).current;
  const resourcesContentAnim = useRef(new Animated.Value(0)).current;
  const caseStudyContentAnim = useRef(new Animated.Value(0)).current;

  // Start course and fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      const courseIdStr = courseId ? String(courseId) : null;
      
      if (!courseIdStr) {
        setError('No course ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('🔄 REFRESHING: Starting course with ID:', courseIdStr);
        
        const response = await apiService.startCourse(courseIdStr);
        console.log('Course start response:', response);
        
        if (response.success && response.data && response.data.course) {
          const course = response.data.course;
          setCourseDetails({
            ...course,
            modules: [],
          });
          
          await fetchModuleDetails(course);
        } else {
          setError(response.error || response.message || 'Failed to load course');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId]);

  // Add focus listener to refresh data when user comes back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 SCREEN FOCUSED - Refreshing course data...');
      
      // Clear previous data and refresh
      setCourseDetails(null);
      setError(null);
      
      // Fetch fresh data
      const courseIdStr = courseId ? String(courseId) : null;
      if (courseIdStr) {
        refreshCourseData(courseIdStr);
      }
    });

    return unsubscribe;
  }, [navigation, courseId]);

  // Separate refresh function for better control
  const refreshCourseData = async (courseIdStr: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 REFRESHING COURSE DATA for ID:', courseIdStr);
      
      const response = await apiService.startCourse(courseIdStr);
      console.log('Refreshed course data:', response);
      
      if (response.success && response.data && response.data.course) {
        const course = response.data.course;
        setCourseDetails({
          ...course,
          modules: [],
        });
        
        await fetchModuleDetails(course);
        console.log('✅ Course data refreshed successfully');
      } else {
        setError(response.error || response.message || 'Failed to load course');
      }
    } catch (err) {
      console.error('❌ Error refreshing course details:', err);
      setError('Failed to refresh course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch details for all modules in the course - Enhanced with refresh logging
  const fetchModuleDetails = async (course: Course) => {
    if (!course || !course.module_ids || course.module_ids.length === 0) {
      return;
    }
    
    try {
      setLoadingModules(true);
      console.log('🔄 REFRESHING MODULE DETAILS for', course.module_ids.length, 'modules');
      
      const moduleDetailsPromises = course.module_ids.map(async (moduleId) => {
        const response = await apiService.getModuleDetails(moduleId);
        
        if (!response.success || !response.data) {
          throw new Error(`Failed to fetch module ${moduleId}: ${response.error}`);
        }
        
        // Log the fresh module progress data
        console.log(`📋 Fresh data for module ${response.data.module.title}:`, {
          status: response.data.progress?.status,
          completed_sections: response.data.progress?.completed_sections,
          progress_percentage: response.data.progress?.progress_percentage
        });
        
        return {
          ...response.data.module,
          progress: response.data.progress,
          isExpanded: false
        };
      });
      
      const moduleDetails = await Promise.all(moduleDetailsPromises);
      setCourseDetails(prev => prev ? { ...prev, modules: moduleDetails } : null);
      
      console.log('✅ All module details refreshed successfully');
      
      // Expand the first in-progress module
      const inProgressModule = moduleDetails.find(m => m.progress.status === 'in_progress');
      if (inProgressModule) {
        setExpandedModule(inProgressModule.module_id);
      } else if (moduleDetails.length > 0) {
        setExpandedModule(moduleDetails[0].module_id);
      }
      
    } catch (err) {
      console.error('❌ Error refreshing module details:', err);
      Alert.alert('Error', 'Failed to refresh module details. Please try again.');
    } finally {
      setLoadingModules(false);
    }
  };
  
  const toggleModuleExpansion = (moduleId: string) => {
    if (expandedModule !== null) {
      setPreviousExpandedModule(expandedModule);
      textContentAnim.setValue(0);
      videoContentAnim.setValue(0);
      resourcesContentAnim.setValue(0);
      caseStudyContentAnim.setValue(0);
    }

    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      
      Animated.stagger(150, [
        Animated.timing(textContentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(videoContentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(resourcesContentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(caseStudyContentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // SIMPLIFIED: Check if module is completed based ONLY on chatbot_completed
  const isModuleCompleted = (module: ModuleWithProgress) => {
    if (!module.progress || !module.progress.completed_sections) return false;
    
    // ONLY CRITERIA: chatbot_completed must be present
    const hasCompletedChatbot = module.progress.completed_sections.includes('chatbot_completed');
    
    console.log(`📋 Module ${module.title}: chatbot_completed = ${hasCompletedChatbot}`);
    
    return hasCompletedChatbot;
  };

  // SIMPLIFIED: Show all content types as available (no individual completion tracking)
  const isContentTypeCompleted = (module: ModuleWithProgress, contentType: string) => {
    // If module is completed (has chatbot_completed), show everything as completed
    if (isModuleCompleted(module)) {
      return true;
    }
    
    // Otherwise, just check if they've accessed individual sections (for visual feedback only)
    if (!module.progress || !module.progress.completed_sections) return false;
    return module.progress.completed_sections.includes(contentType);
  };

  // SIMPLIFIED: Calculate progress based ONLY on completed modules (chatbot_completed)
  const calculateOverallProgress = () => {
    if (!courseDetails || !courseDetails.modules || courseDetails.modules.length === 0) {
      return 0;
    }
    
    const totalModules = courseDetails.modules.length;
    const completedModules = courseDetails.modules.filter(module => isModuleCompleted(module)).length;
    
    const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    console.log('🎯 SIMPLIFIED COURSE PROGRESS:', {
      completed_modules: completedModules,
      total_modules: totalModules,
      progress: progressPercentage + '%',
      completed_module_titles: courseDetails.modules
        .filter(module => isModuleCompleted(module))
        .map(m => m.title)
    });
    
    return progressPercentage;
  };

  // Count completed modules for display
  const getCompletedModulesCount = () => {
    if (!courseDetails || !courseDetails.modules) return 0;
    return courseDetails.modules.filter(module => isModuleCompleted(module)).length;
  };
  
  // Navigate to specific module content
  const navigateToModuleContent = (module: ModuleWithProgress, contentType: string) => {
    let pathname = '';
    
    switch (contentType) {
      case 'content_viewed':
        pathname = '/(module)/content-viewer';
        break;
      case 'video_watched':
        pathname = '/(module)/video-player';
        break;
      case 'resources_accessed':
        pathname = '/(module)/resources';
        break;
      case 'case_completed':
        pathname = '/(module)/case-study';
        break;
      default:
        pathname = '/(module)/content-viewer';
    }

    router.push({
      pathname,
      params: {
        moduleId: module.module_id,
        contentType: contentType
      }
    });
  };
  
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1E4B88" />
        <Text className="mt-4 text-gray-600">Loading course details...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !courseDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <Icon name="alert-circle-outline" size={50} color="#FF6B6B" />
        <Text className="mt-4 text-gray-800 text-lg text-center">{error || 'Failed to load course'}</Text>
        <TouchableOpacity 
          className="mt-6 bg-[#1E4B88] px-5 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <>
          {/* Status Bar - positioned outside SafeAreaView for proper coloring */}
          <StatusBar 
              backgroundColor="white" 
              barStyle="light-content" 
              translucent={true}
            />
            
            {/* Using SafeAreaView with edges to prevent content from going under status bar */}
            <SafeAreaView 
              edges={['right', 'left','top']} 
              className="flex-1 bg-gray-50"
              style={{ backgroundColor: "white" }}
            >
      
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
          <TouchableOpacity className="mr-4">
            <Icon name="share-variant-outline" size={24} color="#1E4B88" />
          </TouchableOpacity>
          
        </View>
      </View>
      
      <ScrollView className="flex-1">
        {/* Course Title and Description */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-[#1E4B88] text-3xl font-bold mb-2">{courseDetails.title}</Text>
          <Text className="text-gray-500 text-base leading-relaxed">
            {courseDetails.topic}
          </Text>
        </View>
        
        {/* Resume Course Section - Show if there's an in-progress module */}
        {courseDetails.modules.some(m => m.progress && m.progress.status === 'in_progress') && (
          <>
            <View className="px-5 py-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-[#1E4B88] items-center justify-center">
                  <Icon name="play" size={24} color="white" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[#1E4B88] text-lg font-medium">Resume Course</Text>
                  <Text className="text-gray-500 flex-shrink" numberOfLines={2}>
                    {courseDetails.modules.find(m => m.progress && m.progress.status === 'in_progress')?.title || 'Next Module'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                className="bg-[#4DF0A9] px-6 py-3 rounded-full mt-3 self-start"
                onPress={() => {
                  const inProgressModule = courseDetails.modules.find(m => 
                    m.progress && m.progress.status === 'in_progress'
                  );
                  
                  if (inProgressModule) {
                    const contentTypes = ['content_viewed', 'video_watched', 'resources_accessed', 'case_completed'];
                    
                    const nextContentType = contentTypes.find(type => 
                      !isContentTypeCompleted(inProgressModule, type)
                    ) || 'content_viewed';
                    
                    navigateToModuleContent(inProgressModule, nextContentType);
                  }
                }}
              >
                <Text className="text-[#1E4B88] font-bold">Continue</Text>
              </TouchableOpacity>
            </View>
            
            <View className="h-[1px] bg-gray-200 mx-5 my-2" />
          </>
        )}
        
        {/* Progress Section - Enhanced with real-time refresh */}
        <View className="px-5 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Your Progress</Text>
            <View className="flex-row items-center">
              <Text className="text-[#1E4B88] text-xl font-bold">{calculateOverallProgress()}%</Text>
              <TouchableOpacity 
                className="ml-3 p-1"
                onPress={() => {
                  const courseIdStr = courseId ? String(courseId) : null;
                  if (courseIdStr) {
                    console.log('🔄 Manual refresh triggered');
                    refreshCourseData(courseIdStr);
                  }
                }}
              >
                <Icon name="refresh" size={20} color="#1E4B88" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View className="h-2 w-full bg-gray-200 rounded-full mb-6">
            <View 
              className="h-2 bg-[#4DF0A9] rounded-full" 
              style={{ width: `${calculateOverallProgress()}%` }} 
            />
          </View>
          
          {/* Progress Stats - SIMPLIFIED to show only chatbot-completed modules */}
          <View className="flex-row justify-between mb-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {courseDetails.modules.length}
              </Text>
              <Text className="text-gray-500 text-sm">Total Modules</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {getCompletedModulesCount()}
              </Text>
              <Text className="text-gray-500 text-sm">Completed</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {courseDetails.modules.reduce((total, module) => total + (module.estimated_time_min || 0), 0)} min
              </Text>
              <Text className="text-gray-500 text-sm">Total Time</Text>
            </View>
          </View>
          
          {/* Level Badge */}
          <View className="self-start bg-blue-50 rounded-full px-4 py-2 flex-row items-center">
            <Icon name="chart-line" size={18} color="#1E4B88" />
            <Text className="text-[#1E4B88] ml-2 font-medium">
              {calculateOverallProgress() <= 30 ? 'Beginner' : 
               calculateOverallProgress() <= 70 ? 'Intermediate' : 'Advanced'} Level
            </Text>
          </View>
        </View>
        
        <View className="h-[8px] bg-gray-100 my-2" />
        
        {/* Course Modules */}
        <View className="px-5 py-4">
          <Text className="text-[#1E4B88] text-xl font-bold mb-4">Course Modules</Text>
          
          {loadingModules ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#1E4B88" />
              <Text className="mt-2 text-gray-500">Loading modules...</Text>
            </View>
          ) : (
            courseDetails.modules.map((module) => (
              <View 
                key={module.module_id}
                className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden"
              >
                {/* Module Header with title and expand/collapse */}
                <View>
                  <TouchableOpacity 
                    className="px-4 pt-4 pb-2 flex-row justify-between items-center"
                    onPress={() => toggleModuleExpansion(module.module_id)}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-gray-700 font-medium mr-2">
                        {courseDetails.modules.indexOf(module) + 1}.
                      </Text>
                      <Text className="text-gray-700 text-lg font-medium flex-1">
                        {module.title}
                      </Text>
                    </View>
                    
                    {/* Completed badge - ONLY shows if chatbot_completed exists */}
                    {isModuleCompleted(module) && (
                      <View className="mr-3">
                        <View className="bg-[#4DF0A9] rounded-full p-1">
                          <Icon name="check" size={12} color="white" />
                        </View>
                      </View>
                    )}
                    
                    <Icon 
                      name={expandedModule === module.module_id ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#64748B"
                    />
                  </TouchableOpacity>
                  
                  {/* Module content sections - all always available */}
                  {expandedModule !== module.module_id && (
                    <View className="flex-row justify-around px-4 py-3">
                      {/* Text + Voice Icon */}
                      <View className="items-center">
                        <View className={`w-8 h-8 rounded-full ${isContentTypeCompleted(module, 'content_viewed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center`}>
                          <Icon 
                            name="headphones" 
                            size={16} 
                            color={isContentTypeCompleted(module, 'content_viewed') ? "white" : "#64748B"} 
                          />
                        </View>
                        <Text className="text-xs text-gray-600 mt-1">Text</Text>
                      </View>
                      
                      {/* Videos Icon - Only show if video exists */}
                      {module.video_url && module.video_url.trim() !== '' && (
                        <View className="items-center">
                          <View className={`w-8 h-8 rounded-full ${isContentTypeCompleted(module, 'video_watched') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center`}>
                            <Icon 
                              name="video" 
                              size={16} 
                              color={isContentTypeCompleted(module, 'video_watched') ? "white" : "#64748B"} 
                            />
                          </View>
                          <Text className="text-xs text-gray-600 mt-1">Videos</Text>
                        </View>
                      )}
                      
                      {/* Resources Icon */}
                      {module.external_resources && module.external_resources.length > 0 && (
                        <View className="items-center">
                          <View className={`w-8 h-8 rounded-full ${isContentTypeCompleted(module, 'resources_accessed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center`}>
                            <Icon 
                              name="link-variant" 
                              size={16} 
                              color={isContentTypeCompleted(module, 'resources_accessed') ? "white" : "#64748B"} 
                            />
                          </View>
                          <Text className="text-xs text-gray-600 mt-1">Docs</Text>
                        </View>
                      )}
                      
                      {/* Case Study Icon */}
                      <View className="items-center">
                        <View className={`w-8 h-8 rounded-full ${isContentTypeCompleted(module, 'chatbot_completed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center`}>
                          <Icon 
                            name="notebook" 
                            size={16} 
                            color={isContentTypeCompleted(module, 'chatbot_completed') ? "white" : "#64748B"} 
                          />
                        </View>
                        <Text className="text-xs text-gray-600 mt-1">Case</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Expanded Content - All sections always available */}
                {expandedModule === module.module_id && (
                  <View className="bg-gray-50 px-4 py-4 border-t border-gray-200">
                    {/* Text + Voice Section */}
                    <View className="mb-4 bg-white rounded-lg p-3 shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <View className={`w-12 h-12 rounded-full ${isContentTypeCompleted(module, 'content_viewed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center mr-3`}>
                          <Icon 
                            name="headphones" 
                            size={24} 
                            color={isContentTypeCompleted(module, 'content_viewed') ? "white" : "#64748B"} 
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-gray-800 font-bold text-lg">Text + Voice</Text>
                            <Text className="text-gray-500 text-sm">{module.estimated_time_min} min</Text>
                          </View>
                          <Text className="text-gray-600 text-sm">{module.generated_summary}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        className={`${isContentTypeCompleted(module, 'content_viewed') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                        onPress={() => navigateToModuleContent(module, 'content_viewed')}
                      >
                        <Text className="text-white font-bold">
                          {isContentTypeCompleted(module, 'content_viewed') ? 'Review' : 'Start'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Videos Section - Only show if there's a video URL */}
                    {module.video_url && module.video_url.trim() !== '' && (
                      <View className="mb-4 bg-white rounded-lg p-3 shadow-sm">
                        <View className="flex-row items-center mb-2">
                          <View className={`w-12 h-12 rounded-full ${isContentTypeCompleted(module, 'video_watched') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center mr-3`}>
                            <Icon 
                              name="video" 
                              size={24} 
                              color={isContentTypeCompleted(module, 'video_watched') ? "white" : "#64748B"} 
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row justify-between items-center">
                              <Text className="text-gray-800 font-bold text-lg">Video Lessons</Text>
                              <Text className="text-gray-500 text-sm">~15 min</Text>
                            </View>
                            <Text className="text-gray-600 text-sm">Watch instructor-led video explanations</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          className={`${isContentTypeCompleted(module, 'video_watched') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                          onPress={() => navigateToModuleContent(module, 'video_watched')}
                        >
                          <Text className="text-white font-bold">
                            {isContentTypeCompleted(module, 'video_watched') ? 'Review' : 'Start'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {/* Resources Section - Only show if there are external resources */}
                    {module.external_resources && module.external_resources.length > 0 && (
                      <View className="mb-4 bg-white rounded-lg p-3 shadow-sm">
                        <View className="flex-row items-center mb-2">
                          <View className={`w-12 h-12 rounded-full ${isContentTypeCompleted(module, 'resources_accessed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center mr-3`}>
                            <Icon 
                              name="link-variant" 
                              size={24} 
                              color={isContentTypeCompleted(module, 'resources_accessed') ? "white" : "#64748B"} 
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row justify-between items-center">
                              <Text className="text-gray-800 font-bold text-lg">Resources</Text>
                              <Text className="text-gray-500 text-sm">{module.external_resources.length} links</Text>
                            </View>
                            <Text className="text-gray-600 text-sm">Additional reading materials and references</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          className={`${isContentTypeCompleted(module, 'resources_accessed') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                          onPress={() => navigateToModuleContent(module, 'resources_accessed')}
                        >
                          <Text className="text-white font-bold">
                            {isContentTypeCompleted(module, 'resources_accessed') ? 'Review' : 'Start'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {/* Case Study Section - Only show if there's a case scenario */}
                    {module.case_scenario && (
                      <View className="mb-1 bg-white rounded-lg p-3 shadow-sm">
                        <View className="flex-row items-center mb-2">
                          <View className={`w-12 h-12 rounded-full ${isContentTypeCompleted(module, 'chatbot_completed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center mr-3`}>
                            <Icon 
                              name="notebook" 
                              size={24} 
                              color={isContentTypeCompleted(module, 'chatbot_completed') ? "white" : "#64748B"} 
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row justify-between items-center">
                              <Text className="text-gray-800 font-bold text-lg">Case Study</Text>
                              <Text className="text-gray-500 text-sm">Quiz</Text>
                            </View>
                            <Text className="text-gray-600 text-sm" numberOfLines={2}>
                              {module.case_scenario.context}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          className={`${isContentTypeCompleted(module, 'chatbot_completed') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                          onPress={() => navigateToModuleContent(module, 'case_completed')}
                        >
                          <Text className="text-white font-bold">
                            {isContentTypeCompleted(module, 'chatbot_completed') ? 'Review' : 'Start'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

export default CourseDetailsScreen;