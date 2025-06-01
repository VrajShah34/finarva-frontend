import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from './services/api';

export default function ConversationAnalysisScreen() {
  const primaryColor = '#04457E';
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract params
  const analysisId = params.analysisId as string;
  const leadName = params.leadName as string || 'Agent';
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Fetch analysis data
  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!analysisId) {
        setError('Analysis ID is missing');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await apiService.getConversationAnalysis(analysisId);
        
        if (response.success && response.data) {
          setAnalysisData(response.data);
          console.log("Analysis data loaded:", response.data);
        } else {
          setError(response.error || 'Failed to load analysis data');
        }
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError('An error occurred while fetching the analysis data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [analysisId]);
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleCreateCourse = async () => {
    if (!analysisData?.analysis?.topic) {
      Alert.alert('Error', 'No topic available to create a course');
      return;
    }
    
    setCreating(true);
    try {
      const response = await apiService.createCourseFromPrompt(analysisData.analysis.topic);
      
      if (response.success && response.data) {
        Alert.alert(
          'Success',
          `Course on "${analysisData.analysis.topic}" has been created successfully!`,
          [
            {
              text: 'View Course',
              onPress: () => {
                if (response.data?.course_id) {
                  router.push(`/courses/${response.data.course_id}`);
                } else {
                  router.push('/courses');
                }
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      Alert.alert('Error', 'An error occurred while creating the course');
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView edges={['right', 'left', 'top']} style={{ backgroundColor: primaryColor }} className="flex-1">
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent={true} />
        <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right', statusBarStyle: 'light' }} />
        
        <View className="bg-primary py-5 px-4 flex-row items-center">
          <TouchableOpacity onPress={handleBackPress} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Conversation Analysis</Text>
        </View>
        
        <View className="flex-1 bg-gray-50 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-gray-600 mt-4">Loading analysis data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView edges={['right', 'left', 'top']} style={{ backgroundColor: primaryColor }} className="flex-1">
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent={true} />
        <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right', statusBarStyle: 'light' }} />
        
        <View className="bg-primary py-5 px-4 flex-row items-center">
          <TouchableOpacity onPress={handleBackPress} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Conversation Analysis</Text>
        </View>
        
        <View className="flex-1 bg-gray-50 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text className="text-gray-800 font-bold text-lg mt-4 text-center">Error Loading Data</Text>
          <Text className="text-gray-600 mt-2 text-center">{error}</Text>
          <TouchableOpacity 
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
            onPress={handleBackPress}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '#22C55E';
      case 'neutral': return '#FBBF24';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <StatusBar 
        backgroundColor={primaryColor} 
        barStyle="light-content" 
        translucent={true}
      />
      
      <SafeAreaView 
        edges={['right', 'left','top']} 
        className="flex-1 bg-gray-50"
        style={{ backgroundColor: primaryColor }}
      >
        <Stack.Screen options={{ 
          headerShown: false,
          animation: 'slide_from_right',
          statusBarStyle: 'light',
        }} />
      
        {/* Header */}
        <View className="bg-primary py-5 px-4 flex-row items-center">
          <TouchableOpacity onPress={handleBackPress} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Conversation Analysis</Text>
        </View>
      
        <ScrollView className="flex-1">
          <View className='bg-gray-50'>
            {/* Analysis Header */}
            <View className="bg-primary m-4 rounded-lg p-4 flex-row justify-between items-center">
              <View>
                <Text className="text-white text-lg font-bold">AI Conversation Analysis</Text>
                <Text className="text-white text-xs opacity-80">
                  Analysis ID: {analysisData.analysis_id?.substring(0, 12)}...
                </Text>
              </View>
              
              <Text className="text-white text-xs opacity-80">
                {formatDate(analysisData.created_at)}
              </Text>
            </View>
            
            {/* Topic and Intent Card */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center flex-1">
                  <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="chatbubbles" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-800">{analysisData.analysis.topic || 'No Topic'}</Text>
                    <Text className="text-gray-500 text-sm">Topic</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  className="bg-[#18FFAA] px-3 py-2 rounded-lg flex-row items-center"
                  onPress={handleCreateCourse}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <>
                      <Ionicons name="school" size={18} color={primaryColor} />
                      <Text className="text-primary font-medium text-sm ml-1">Create Course</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              <View className="mt-4 bg-blue-50 p-3 rounded-lg">
                <Text className="text-gray-700 font-medium">Intent:</Text>
                <Text className="text-gray-600 mt-1">{analysisData.analysis.intent || 'No intent detected'}</Text>
              </View>
            </View>
            
            {/* Summary Card */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="stats-chart" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Summary</Text>
              </View>
              
              <View className="flex-row flex-wrap justify-between">
                <View className="w-1/2 px-2 mb-3">
                  <Text className="text-gray-500 text-xs">Total Messages</Text>
                  <Text className="font-bold text-lg text-gray-800">{analysisData.total_messages}</Text>
                </View>
                
                <View className="w-1/2 px-2 mb-3">
                  <Text className="text-gray-500 text-xs">Agent Messages</Text>
                  <Text className="font-bold text-lg text-gray-800">{analysisData.agent_messages}</Text>
                </View>
                
                <View className="w-1/2 px-2 mb-3">
                  <Text className="text-gray-500 text-xs">User Messages</Text>
                  <Text className="font-bold text-lg text-gray-800">{analysisData.user_messages}</Text>
                </View>
                
                <View className="w-1/2 px-2 mb-3">
                  <Text className="text-gray-500 text-xs">Issues Detected</Text>
                  <Text className="font-bold text-lg text-gray-800">{analysisData.total_issues}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-2">
                <Text className="text-gray-700 mr-2">Sentiment:</Text>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: getSentimentColor(analysisData.analysis.sentiment) + '20' }}>
                  <Text className="font-medium" style={{ color: getSentimentColor(analysisData.analysis.sentiment) }}>
                    {analysisData.analysis.sentiment || 'Neutral'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Strengths */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="thumbs-up" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Strengths</Text>
              </View>
              
              {analysisData.analysis.good_points && analysisData.analysis.good_points.length > 0 ? (
                analysisData.analysis.good_points.map((point: string, index: number) => (
                  <View key={index} className="flex-row mb-2">
                    <View className="w-6 items-center pt-1">
                      <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                    </View>
                    <Text className="text-gray-700 flex-1 ml-1">{point}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No strengths identified</Text>
              )}
            </View>
            
            {/* Areas for Improvement */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="alert-circle" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Areas for Improvement</Text>
              </View>
              
              {analysisData.analysis.bad_points && analysisData.analysis.bad_points.length > 0 ? (
                analysisData.analysis.bad_points.map((point: string, index: number) => (
                  <View key={index} className="flex-row mb-2">
                    <View className="w-6 items-center pt-1">
                      <MaterialIcons name="error" size={16} color="#EF4444" />
                    </View>
                    <Text className="text-gray-700 flex-1 ml-1">{point}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No areas for improvement identified</Text>
              )}
            </View>
            
            {/* Problematic Messages */}
            {analysisData.analysis.problematic_messages && analysisData.analysis.problematic_messages.length > 0 && (
              <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
                <View className="flex-row items-center mb-3">
                  <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                    <Ionicons name="chatbox-ellipses" size={16} color={primaryColor} />
                  </View>
                  <Text className="text-primary font-medium">Message Issues</Text>
                </View>
                
                {analysisData.analysis.problematic_messages.map((message: any, index: number) => (
                  <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-medium text-gray-700">Message {message.message_number}:</Text>
                      <Text className="text-gray-500 text-xs ml-auto">Agent</Text>
                    </View>
                    
                    <View className="bg-white p-2 rounded-md mb-2 border border-gray-200">
                      <Text className="text-gray-700">{message.message_text}</Text>
                    </View>
                    
                    <View className="flex-row mb-1 items-center">
                      <MaterialIcons name="error" size={14} color="#EF4444" />
                      <Text className="text-gray-700 font-medium ml-1 text-sm">Issue:</Text>
                    </View>
                    <Text className="text-gray-600 mb-2 pl-5">{message.issue}</Text>
                    
                    <View className="flex-row mb-1 items-center">
                      <MaterialIcons name="lightbulb" size={14} color="#FBBF24" />
                      <Text className="text-gray-700 font-medium ml-1 text-sm">Suggestion:</Text>
                    </View>
                    <Text className="text-gray-600 pl-5">{message.suggestion}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Conversation Transcript */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="chatbubbles" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Conversation Transcript</Text>
              </View>
              
              {analysisData.transcript && analysisData.transcript.length > 0 ? (
                analysisData.transcript.map((msg: any, index: number) => (
                  <View 
                    key={index} 
                    className={`mb-3 p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-50 ml-10' 
                        : 'bg-gray-50 mr-10'
                    }`}
                  >
                    <View className="flex-row items-center mb-1">
                      <Text className="font-medium text-xs text-gray-500">
                        {msg.role === 'user' ? 'User' : 'Agent'}
                      </Text>
                    </View>
                    <Text className="text-gray-700">{msg.message}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No transcript available</Text>
              )}
            </View>
            
            {/* Theory and Additional Info */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="school" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Learning Theory</Text>
              </View>
              
              <View className="bg-blue-50 p-3 rounded-lg mb-2">
                <Text className="text-gray-700 font-medium">Relevant Theory:</Text>
                <Text className="text-gray-600 mt-1">{analysisData.analysis.theory || 'No specific theory identified'}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-primary mt-3 p-3 rounded-lg flex-row justify-center items-center"
                onPress={handleCreateCourse}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="school" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Create Learning Course on {analysisData.analysis.topic}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}