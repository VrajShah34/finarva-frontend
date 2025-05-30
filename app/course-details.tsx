import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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

const CourseDetailsScreen = () => {
  const navigation = useNavigation();
  const [expandedModule, setExpandedModule] = useState<string | null>('1'); // Module 1 expanded by default
  
  // Course modules data
  const courseModules = [
    {
      id: '1',
      title: 'Introduction to Data Science',
      completed: true,
      expanded: true,
      lessons: [
        { id: '1.1', title: 'What is Data Science?', duration: '15 min', completed: true },
        { id: '1.2', title: 'Data Science Process', duration: '20 min', completed: true },
        { id: '1.3', title: 'Tools and Technologies', duration: '25 min', completed: true }
      ]
    },
    {
      id: '2',
      title: 'Data Collection & Cleaning',
      completed: true,
      expanded: false,
      lessons: [
        { id: '2.1', title: 'Data Sources', duration: '18 min', completed: true },
        { id: '2.2', title: 'Data Cleaning Techniques', duration: '22 min', completed: true },
        { id: '2.3', title: 'Data Preprocessing', duration: '20 min', completed: true }
      ]
    },
    {
      id: '3',
      title: 'Data Visualization',
      completed: false,
      expanded: false,
      lessons: [
        { id: '3.1', title: 'Basic Charts and Graphs', duration: '25 min', completed: false },
        { id: '3.2', title: 'Interactive Visualizations', duration: '30 min', completed: false },
        { id: '3.3', title: 'Dashboard Creation', duration: '35 min', completed: false }
      ]
    },
    {
      id: '4',
      title: 'Statistical Analysis',
      completed: false,
      expanded: false,
      lessons: [
        { id: '4.1', title: 'Descriptive Statistics', duration: '20 min', completed: false },
        { id: '4.2', title: 'Inferential Statistics', duration: '25 min', completed: false }
      ]
    }
  ];
  
  const toggleModuleExpansion = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
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
            onPress={() => navigation.goBack()}
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
          <Text className="text-[#1E4B88] text-3xl font-bold mb-2">Data Science Fundamentals</Text>
          <Text className="text-gray-500 text-base leading-relaxed">
            Learn the core concepts of data science and analysis with practical examples and real-world applications.
          </Text>
        </View>
        
        {/* Resume Course Section */}
        <View className="px-5 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#1E4B88] items-center justify-center">
              <Icon name="play" size={24} color="white" />
            </View>
            <View className="ml-3">
              <Text className="text-[#1E4B88] text-lg font-medium">Resume Course</Text>
              <Text className="text-gray-500">Module 3: Data Visualization</Text>
            </View>
          </View>
          
          <TouchableOpacity className="bg-[#4DF0A9] px-6 py-3 rounded-full">
            <Text className="text-[#1E4B88] font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
        
        <View className="h-[1px] bg-gray-200 mx-5 my-2" />
        
        {/* Progress Section */}
        <View className="px-5 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1E4B88] text-xl font-bold">Your Progress</Text>
            <Text className="text-[#1E4B88] text-xl font-bold">42%</Text>
          </View>
          
          {/* Progress Bar */}
          <View className="h-2 w-full bg-gray-200 rounded-full mb-6">
            <View className="h-2 bg-[#4DF0A9] rounded-full" style={{ width: '42%' }} />
          </View>
          
          {/* Progress Stats */}
          <View className="flex-row justify-between mb-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">8</Text>
              <Text className="text-gray-500 text-sm">Total Modules</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">3</Text>
              <Text className="text-gray-500 text-sm">Completed</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">4h 20m</Text>
              <Text className="text-gray-500 text-sm">Time Left</Text>
            </View>
          </View>
          
          {/* Level Badge */}
          <View className="self-start bg-blue-50 rounded-full px-4 py-2 flex-row items-center">
            <Icon name="chart-line" size={18} color="#1E4B88" />
            <Text className="text-[#1E4B88] ml-2 font-medium">Intermediate Level</Text>
          </View>
        </View>
        
        <View className="h-[8px] bg-gray-100 my-2" />
        
        {/* Course Modules */}
        <View className="px-5 py-4">
          <Text className="text-[#1E4B88] text-xl font-bold mb-4">Course Modules</Text>
          
          {courseModules.map((module) => (
            <View 
              key={module.id}
              className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden"
            >
              <TouchableOpacity 
                className="px-4 py-4 flex-row justify-between items-center"
                onPress={() => toggleModuleExpansion(module.id)}
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-gray-700 font-medium mr-2">
                    {module.id}.
                  </Text>
                  <Text className="text-gray-700 text-lg font-medium flex-1">
                    {module.title}
                  </Text>
                </View>
                
                {module.completed && (
                  <View className="mr-3">
                    <View className="bg-[#4DF0A9] rounded-full p-1">
                      <Icon name="check" size={16} color="white" />
                    </View>
                    <Text className="text-[#4DF0A9] text-xs mt-1">Completed</Text>
                  </View>
                )}
                
                <Icon 
                  name={expandedModule === module.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#64748B"
                />
              </TouchableOpacity>
              
              {/* Expanded Module Content - Lessons */}
              {expandedModule === module.id && (
                <View className="bg-gray-50 px-4 py-2">
                  {module.lessons.map((lesson) => (
                    <View 
                      key={lesson.id}
                      className="py-3 flex-row items-center justify-between border-b border-gray-200 last:border-b-0"
                    >
                      <View className="flex-row items-center">
                        {lesson.completed ? (
                          <Icon name="check-circle" size={20} color="#4DF0A9" className="mr-3" />
                        ) : (
                          <Icon name="circle-outline" size={20} color="#64748B" className="mr-3" />
                        )}
                        <Text className={`${lesson.completed ? 'text-gray-700' : 'text-gray-600'} font-medium`}>
                          {lesson.title}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-sm">{lesson.duration}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseDetailsScreen;