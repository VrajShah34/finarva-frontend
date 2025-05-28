import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LearningScreen = () => {
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
  
  // Mock data for recommended courses
  const recommendedCourses = [
    {
      id: '1',
      title: 'Spanish Conversation Skills',
      description: 'Take your Spanish to the next level with practical conversation scenarios.',
      modules: '12 modules',
      duration: '8 weeks',
      level: 'INTERMEDIATE',
      buttonText: 'Start Now'
    },
    {
      id: '2',
      title: 'Italian Basics',
      description: 'Learn essential vocabulary and grammar for everyday communication.',
      modules: '10 modules',
      duration: '6 weeks',
      level: 'BEGINNER',
      buttonText: 'Enroll'
    },
    {
      id: '3',
      title: 'Financial Planning',
      description: 'Master the fundamentals of personal finance and investment strategies.',
      modules: '8 modules',
      duration: '4 weeks',
      level: 'BEGINNER',
      buttonText: 'Explore'
    }
  ];
  
  // Calculate the max hours for scaling
  const maxHours = Math.max(...weeklyActivity.map(item => item.hours));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="bg-white px-5 py-4 flex-row justify-between items-center border-b border-gray-200">
        <Text className="text-[#1E4B88] text-2xl font-bold">
          Gromo<Text className="text-green-500">+</Text>
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Icon name="bell-outline" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image 
              source={require('../../assets/images/react-logo.png')} 
              className="w-9 h-9 rounded-full border border-gray-300"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-5">
        {/* Greeting */}
        <View className="mt-6 mb-2">
          <Text className="text-[#1E4B88] text-2xl font-bold">Hello, Sarah!</Text>
          <Text className="text-gray-500 text-base mt-1">Continue your learning journey</Text>
        </View>
        
        {/* Active Course Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm my-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[#1E4B88] text-sm font-medium">ACTIVE COURSE</Text>
            <Text className="text-[#1E4B88] font-bold text-base">65% Complete</Text>
          </View>
          
          <Text className="text-gray-800 text-2xl font-bold mb-4">Spanish for Beginners</Text>
          
          {/* Progress Bar */}
          <View className="h-2 w-full bg-gray-200 rounded-full mb-4">
            <View className="h-2 bg-gradient-to-r from-[#1E4B88] to-[#4DF0A9] rounded-full" style={{ width: '65%' }} />
          </View>
          
          <View className="mb-6">
            <View className="flex-row">
              <Text className="text-gray-600">Current module: </Text>
              <Text className="text-[#1E4B88] font-medium">Basic Conversations</Text>
            </View>
            <Text className="text-gray-500 mt-1">Estimated time: 15 minutes remaining</Text>
          </View>
          
          {/* Module Icons */}
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
          <TouchableOpacity className="bg-[#1E4B88] py-4 rounded-lg items-center">
            <View className="flex-row items-center">
              <Icon name="play" size={18} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Continue Learning</Text>
            </View>
          </TouchableOpacity>
        </View>
        
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
        <View className="mb-8">
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
        </View>
        
        {/* Recommended Courses - Added new section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Recommended For You</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">View all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {recommendedCourses.map(course => (
              <View 
                key={course.id} 
                className="bg-white rounded-xl shadow-sm mr-4 overflow-hidden"
                style={{ width: 280 }}
              >
                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-blue-50 px-3 py-1 rounded-md">
                      <Text className="text-[#1E4B88] font-medium text-xs">{course.level}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Icon name="clock-outline" size={14} color="#64748B" />
                      <Text className="text-gray-500 text-xs ml-1">{course.duration}</Text>
                    </View>
                  </View>
                  
                  <Text className="text-gray-800 text-xl font-bold mb-2">{course.title}</Text>
                  <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>
                    {course.description}
                  </Text>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500">{course.modules}</Text>
                    <TouchableOpacity className="bg-[#1E4B88] py-2 px-4 rounded-lg">
                      <Text className="text-white font-medium">{course.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LearningScreen;