import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, Course, UserProfile } from '../services/api';

const primaryColor = "#04457E";

const LearningScreen = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Mock data for weekly activity
  const weeklyActivity = [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 0.5 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 1.0 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 0 },
  ];
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await apiService.getProfile();
        
        if (response.success && response.data) {
          setProfile(response.data.gp);
        } else {
          console.error('Failed to fetch profile:', response.error);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);
  
  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getCourses();
        
        if (response.success && response.data) {
          setCourses(response.data.courses);
        } else {
          setError(response.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError('An error occurred while fetching courses');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  // Calculate the max hours for scaling
  const maxHours = Math.max(...weeklyActivity.map(item => item.hours));

  // Update the navigation function to pass the courseId
  const navigateToCourseDetails = (courseId?: string) => {
    if (!courseId) {
      console.warn('No course ID provided for navigation');
      return;
    }
    
    console.log('Navigating to course:', courseId);
    router.push({
      pathname: '/course-details',
      params: { courseId }
    });
  }

  // Get course level label
  const getCourseLevel = (percentage: number) => {
    if (percentage <= 25) return 'BEGINNER';
    if (percentage <= 75) return 'INTERMEDIATE';
    return 'ADVANCED';
  }

  // Get appropriate button text based on course status
  const getButtonText = (status: string) => {
    switch(status) {
      case 'completed': return 'Review';
      case 'in_progress': return 'Continue';
      case 'not_started': return 'Start Now';
      default: return 'Explore';
    }
  }
  
  // Format user's first name for greeting
  const getUserFirstName = (): string => {
    if (!profile || !profile.name) return 'Learner';
    const names = profile.name.trim().split(' ');
    return names[0];
  }

  return (
    <>
    <StatusBar 
            backgroundColor={primaryColor} 
            barStyle="light-content" 
            translucent={Platform.OS === 'android'}
          />
          <SafeAreaView 
            edges={['right', 'left','top']}
            style={{ flex: 1, backgroundColor: primaryColor }}
          >
      
      {/* Header */}
      <View style={{ backgroundColor: primaryColor }} className="py-5 px-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            
            <Text className="text-white text-2xl font-bold">Learn</Text>
          </View>
          
        </View>
      <View className='flex-1 bg-gray-50'>
      <ScrollView className="flex-1 px-5">
        {/* Greeting */}
        <View className="mt-6 mb-2">
          <Text className="text-[#1E4B88] text-2xl font-bold">
            Hello, {profileLoading ? '...' : getUserFirstName()}!
          </Text>
          <Text className="text-gray-500 text-base mt-1">Continue your learning journey</Text>
        </View>
        
        {/* Active Course Card */}
        {/* Active Course Card */}
{isLoading ? (
  <View className="bg-white rounded-2xl p-5 shadow-sm my-4 items-center justify-center" style={{ minHeight: 250 }}>
    <ActivityIndicator size="large" color="#1E4B88" />
    <Text className="mt-4 text-gray-500">Loading your courses...</Text>
  </View>
) : error ? (
  <View className="bg-white rounded-2xl p-5 shadow-sm my-4 items-center justify-center" style={{ minHeight: 200 }}>
    <Icon name="alert-circle-outline" size={36} color="#FF6B6B" />
    <Text className="mt-2 text-gray-700 text-center">Couldn't load your active course</Text>
    <TouchableOpacity 
      className="mt-4 bg-[#1E4B88] px-4 py-2 rounded-lg"
      onPress={() => setIsLoading(true)}
    >
      <Text className="text-white font-medium">Retry</Text>
    </TouchableOpacity>
  </View>
) : courses.length > 0 ? (
  <View className="bg-white rounded-2xl p-5 shadow-sm my-4">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-[#1E4B88] text-sm font-medium">ACTIVE COURSE</Text>
      {/* Get the active course or first course */}
      {(() => {
        const activeCourse = courses.find(c => c.status === 'in_progress') || courses[0];
        return (
          <Text className="text-[#1E4B88] font-bold text-base">
            {activeCourse.progress_percentage}% Complete
          </Text>
        );
      })()}
    </View>
    
    {/* Dynamic course title */}
    {(() => {
      const activeCourse = courses.find(c => c.status === 'in_progress') || courses[0];
      return (
        <>
          <Text className="text-gray-800 text-2xl font-bold mb-4">
            {activeCourse.title}
          </Text>
          
          {/* Progress Bar */}
          <View className="h-2 w-full bg-gray-200 rounded-full mb-4">
            <View 
              className="h-2 bg-gradient-to-r from-[#1E4B88] to-[#4DF0A9] rounded-full" 
              style={{ width: `${activeCourse.progress_percentage}%` }} 
            />
          </View>
          
          <View className="mb-6">
            <View className="flex-row">
              <Text className="text-gray-600">Course topic: </Text>
              <Text className="text-[#1E4B88] font-medium">{activeCourse.topic}</Text>
            </View>
            <Text className="text-gray-500 mt-1">
              {activeCourse.module_ids?.length || 0} modules total
            </Text>
          </View>
        </>
      );
    })()}
    
    {/* Module Icons - These would ideally be based on module completion data */}
    <View className="flex-row justify-around mb-6">
      <View className="items-center">
        <View className="w-14 h-14 rounded-full bg-[#1E4B88] items-center justify-center mb-2">
          <Icon name="headphones" size={24} color="white" />
        </View>
        <Text className="text-[#1E4B88] text-xs font-medium text-center">Text + Voice</Text>
        <Text className="text-xs text-gray-500">Completed</Text>
      </View>
      
      <View className="items-center">
        <View className="w-14 h-14 rounded-full bg-[#1E4B88] items-center justify-center mb-2">
          <Icon name="video" size={24} color="white" />
        </View>
        <Text className="text-[#1E4B88] text-xs font-medium text-center">Videos</Text>
        <Text className="text-xs text-gray-500">Completed</Text>
      </View>
      
      <View className="items-center">
        <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mb-2">
          <Icon name="link-variant" size={24} color="#64748B" />
        </View>
        <Text className="text-[#1E4B88] text-xs font-medium text-center">Resources</Text>
        <Text className="text-xs text-gray-500">In Progress</Text>
      </View>
      
      <View className="items-center">
        <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mb-2">
          <Icon name="notebook" size={24} color="#64748B" />
        </View>
        <Text className="text-[#1E4B88] text-xs font-medium text-center">Case Study</Text>
        <Text className="text-xs text-gray-500">Locked</Text>
      </View>
    </View>
    
    {/* Continue Button */}
    <TouchableOpacity 
      className="bg-[#1E4B88] py-4 rounded-lg items-center"
      onPress={() => {
        // Find an in-progress course or use the first course
        const activeCourse = courses.find(c => c.status === 'in_progress') || courses[0];
        if (activeCourse) {
          navigateToCourseDetails(activeCourse.course_id);
        }
      }}
    >
      <View className="flex-row items-center">
        <Icon name="play" size={18} color="white" />
        <Text className="text-white font-bold text-lg ml-2">Continue Learning</Text>
      </View>
    </TouchableOpacity>
  </View>
) : (
  <View className="bg-white rounded-2xl p-5 shadow-sm my-4 items-center justify-center" style={{ minHeight: 200 }}>
    <Icon name="book-outline" size={40} color="#1E4B88" />
    <Text className="mt-4 text-gray-700 text-center">No active courses yet</Text>
    <TouchableOpacity 
      className="mt-4 bg-[#1E4B88] px-4 py-2 rounded-lg"
      onPress={() => {/* Navigate to course catalog */}}
    >
      <Text className="text-white font-medium">Find a Course</Text>
    </TouchableOpacity>
  </View>
)}
        
        {/* Progress Section */}
        <View className="mt-2 mb-6">
          <Text className="text-[#1E4B88] text-xl font-bold mb-4">Your Progress</Text>
          
          <View className="flex-row justify-between">
            {/* Monthly Progress */}
            <View className="bg-white rounded-xl p-4 shadow-sm w-[48%]">
              <Text className="text-gray-500 mb-2 text-center">This month</Text>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                  <Icon name="notebook-multiple" size={24} color="#1E4B88" />
                </View>
                <Text className="text-3xl font-bold text-gray-800">12</Text>
                <Text className="text-gray-500 text-sm">Modules Completed</Text>
              </View>
            </View>
            
            {/* Total Progress */}
            <View className="bg-white rounded-xl p-4 shadow-sm w-[48%]">
              <Text className="text-gray-500 mb-2 text-center">Total</Text>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                  <Icon name="school" size={24} color="#1E4B88" />
                </View>
                <Text className="text-3xl font-bold text-gray-800">3</Text>
                <Text className="text-gray-500 text-sm">Courses Completed</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Weekly Activity */}
        {/* <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Weekly Activity</Text>
            <Text className="text-gray-500 font-medium">8.5 hrs total</Text>
          </View>
          
          <View className="flex-row justify-between items-end h-32 bg-white p-4 rounded-lg shadow-sm">
            {weeklyActivity.map((item, index) => (
              <View key={index} className="items-center">
                <View className="w-6 mb-2">
                  <View 
                    className={`w-6 rounded-t-md ${item.hours > 0 ? 'bg-[#1E4B88]' : 'bg-gray-200'}`} 
                    style={{ height: item.hours > 0 ? `${(item.hours / maxHours) * 80}%` : 0 }}
                  />
                </View>
                <Text className="text-gray-500 text-xs">{item.day}</Text>
              </View>
            ))}
          </View>
        </View> */}
        
        {/* Recommended Courses - Updated with API data */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Recommended For You</Text>
            
          </View>
          
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#1E4B88" />
              <Text className="mt-2 text-gray-500">Loading courses...</Text>
            </View>
          ) : error ? (
            <View className="py-8 items-center">
              <Icon name="alert-circle-outline" size={40} color="#FF6B6B" />
              <Text className="mt-2 text-gray-700">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-[#1E4B88] px-4 py-2 rounded-lg"
                onPress={() => setIsLoading(true)} // This will trigger the useEffect again
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {courses.length > 0 ? (
                courses.map(course => (
                  <View 
                    key={course._id} 
                    className="bg-white rounded-xl shadow-sm mr-4 overflow-hidden"
                    style={{ width: 280 }}
                  >
                    <View className="p-4">
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="bg-blue-50 px-3 py-1 rounded-md">
                          <Text className="text-[#1E4B88] font-medium text-xs">
                            {getCourseLevel(course.progress_percentage)}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Icon name="translate" size={14} color="#64748B" />
                          <Text className="text-gray-500 text-xs ml-1">{course.language}</Text>
                        </View>
                      </View>
                      
                      <Text className="text-gray-800 text-xl font-bold mb-2" numberOfLines={2}>
                        {course.title}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>
                        {course.topic}
                      </Text>
                      
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-500">{course.modules?.length || course.module_ids.length} modules</Text>
                        <TouchableOpacity 
  className="bg-[#1E4B88] py-2 px-4 rounded-lg"
  onPress={() => navigateToCourseDetails(course.course_id)}
>
  <Text className="text-white font-medium">{getButtonText(course.status)}</Text>
</TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="bg-white rounded-xl shadow-sm mr-4 overflow-hidden p-8 items-center justify-center" style={{ width: 280 }}>
                  <Icon name="book-outline" size={40} color="#1E4B88" />
                  <Text className="text-gray-700 mt-4 text-center">No courses available yet</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
    </>
  );
};

// Helper function to generate avatar initials (copied from profile page)
const getInitials = (name: string): string => {
  if (!name) return 'GP';
  const names = name.trim().split(' ');
  return names.length === 1 
    ? names[0].slice(0, 2).toUpperCase()
    : (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default LearningScreen;