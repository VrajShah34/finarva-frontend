import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  
  // Start course and fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      // Ensure courseId is a string and not null/undefined
      const courseIdStr = courseId ? String(courseId) : null;
      
      if (!courseIdStr) {
        setError('No course ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Starting course with ID:', courseIdStr);
        
        // Use the API service to start the course with the validated ID
        const response = await apiService.startCourse(courseIdStr);
        
        if (response.success && response.data && response.data.course) {
          // Initialize course details
          const course = response.data.course;
          setCourseDetails({
            ...course,
            modules: [],
          });
          
          // Fetch module details
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
  
  // Fetch details for all modules in the course
  const fetchModuleDetails = async (course: Course) => {
    if (!course || !course.module_ids || course.module_ids.length === 0) {
      return;
    }
    
    try {
      setLoadingModules(true);
      const moduleDetailsPromises = course.module_ids.map(async (moduleId) => {
        const response = await apiService.getModuleDetails(moduleId);
        
        if (!response.success || !response.data) {
          throw new Error(`Failed to fetch module ${moduleId}: ${response.error}`);
        }
        
        return {
          ...response.data.module,
          progress: response.data.progress,
          isExpanded: false
        };
      });
      
      const moduleDetails = await Promise.all(moduleDetailsPromises);
      setCourseDetails(prev => prev ? { ...prev, modules: moduleDetails } : null);
      
      // Expand the first in-progress module
      const inProgressModule = moduleDetails.find(m => m.progress.status === 'in_progress');
      if (inProgressModule) {
        setExpandedModule(inProgressModule.module_id);
      } else if (moduleDetails.length > 0) {
        setExpandedModule(moduleDetails[0].module_id);
      }
      
    } catch (err) {
      console.error('Error fetching module details:', err);
      Alert.alert('Error', 'Failed to load module details. Please try again.');
    } finally {
      setLoadingModules(false);
    }
  };
  
  const toggleModuleExpansion = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };
  
  const getModuleCompletionStatus = (module: ModuleWithProgress) => {
    if (!module.progress) return 'not_started';
    return module.progress.status;
  };
  
  // Get content type completion status
  const isContentTypeCompleted = (module: ModuleWithProgress, contentType: string) => {
    if (!module.progress || !module.progress.completed_sections) return false;
    return module.progress.completed_sections.includes(contentType);
  };
  
  // Function to get contentType label based on status
  const getContentTypeLabel = (module: ModuleWithProgress, contentType: string) => {
    if (isContentTypeCompleted(module, contentType)) {
      return 'Completed';
    }
    
    // Logic for determining if content is in progress or locked
    const contentTypes = ['content_viewed', 'video_watched', 'resources_accessed', 'case_completed'];
    const contentIndex = contentTypes.indexOf(contentType);
    const prevContentType = contentIndex > 0 ? contentTypes[contentIndex - 1] : null;
    
    if (!prevContentType || isContentTypeCompleted(module, prevContentType)) {
      return 'In Progress';
    }
    
    return 'Locked';
  };
  
  const calculateOverallProgress = () => {
    if (!courseDetails || !courseDetails.modules || courseDetails.modules.length === 0) {
      return 0;
    }
    
    return courseDetails.progress_percentage || 0;
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
          <TouchableOpacity className="mr-4">
            <Icon name="share-variant-outline" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image 
              source={require('../assets/images/react-logo.png')} 
              className="w-9 h-9 rounded-full border border-gray-300"
            />
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
                  // Find the first in-progress module
                  const inProgressModule = courseDetails.modules.find(m => 
                    m.progress && m.progress.status === 'in_progress'
                  );
                  
                  if (inProgressModule) {
                    // Navigate to the appropriate content type
                    const contentTypes = ['content_viewed', 'video_watched', 'resources_accessed', 'case_completed'];
                    
                    // Find the first incomplete content type
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
        
        {/* Progress Section */}
        <View className="px-5 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Your Progress</Text>
            <Text className="text-[#1E4B88] text-xl font-bold">{calculateOverallProgress()}%</Text>
          </View>
          
          {/* Progress Bar */}
          <View className="h-2 w-full bg-gray-200 rounded-full mb-6">
            <View 
              className="h-2 bg-[#4DF0A9] rounded-full" 
              style={{ width: `${calculateOverallProgress()}%` }} 
            />
          </View>
          
          {/* Progress Stats */}
          <View className="flex-row justify-between mb-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {courseDetails.modules.length}
              </Text>
              <Text className="text-gray-500 text-sm">Total Modules</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {courseDetails.modules.filter(m => m.progress && m.progress.status === 'completed').length}
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
                    
                    {/* Completed badge */}
                    {module.progress && module.progress.status === 'completed' && (
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
                  
                  {/* Only show the icons row when module is NOT expanded */}
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
                      
                      {/* Videos Icon */}
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
                      
                      {/* Resources Icon */}
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
                      
                      {/* Case Study Icon */}
                      <View className="items-center">
                        <View className={`w-8 h-8 rounded-full ${isContentTypeCompleted(module, 'case_completed') ? 'bg-[#1E4B88]' : 'bg-gray-200'} items-center justify-center`}>
                          <Icon 
                            name="notebook" 
                            size={16} 
                            color={isContentTypeCompleted(module, 'case_completed') ? "white" : "#64748B"} 
                          />
                        </View>
                        <Text className="text-xs text-gray-600 mt-1">Case</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Expanded Content - Stacked Content Types */}
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
                    {module.video_url && (
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
                          className={`${isContentTypeCompleted(module, 'case_submitted') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                          onPress={() => navigateToModuleContent(module, 'video_watched')}
                        >
                          <Text className="text-white font-bold">
                            {isContentTypeCompleted(module, 'case_submitted') ? 'Review' : 'Start'}
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
                          className={`${isContentTypeCompleted(module, 'case_submitted') ? 'bg-[#4DF0A9]' : 'bg-[#1E4B88]'} py-2 rounded-lg items-center mt-1`}
                          onPress={() => navigateToModuleContent(module, 'resources_accessed')}
                        >
                          <Text className="text-white font-bold">
                            {isContentTypeCompleted(module, 'case_submitted') ? 'Review' : 'Start'}
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
  );
};

export default CourseDetailsScreen;