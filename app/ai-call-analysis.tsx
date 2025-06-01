import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define interface for conversation data
interface ConversationData {
  interest: {
    products: string[];
    interest_level: string;
    budget_range: string;
    urgency_level: string;
  };
  personal_data: {
    occupation: string;
    age: number;
    income: number;
    state: string;
  };
  sentiment_analysis: {
    overall_sentiment: string;
    user_sentiment: string;
    agent_performance: string;
  };
  key_insights: {
    main_topics: string[];
    user_concerns: string[];
    next_steps: string[];
    product_interest_level: string;
    decision_timeline: string;
  };
  financial_profile: {
    income_indicators: string[];
    occupation_hints: string[];
    financial_needs: string[];
    budget_mentioned: boolean;
    investment_experience: string;
    estimated_income_range: string;
    salary_mentioned: number;
  };
  conversation_quality: {
    information_gathered: string;
    rapport_building: string;
    objection_handling: string;
  };
  recommendations: {
    immediate_actions: string[];
    follow_up_strategy: string;
    priority_level: string;
  };
  _id: string;
  conversation_id: string;
  callSid: string;
  lead_id: string;
  transcript: {
    type: string;
    text: string;
    timestamp: string;
    _id: string;
  }[];
  summary: string;
  interests: string[];
  objections: string[];
  positive_responses: string[];
  status: string;
  call_duration: number;
  user_engagement: string;
  createdAt: string;
  last_analyzed: string;
  updatedAt: string;
}

export default function AICallAnalysisScreen() {
  const primaryColor = '#04457E';
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract params
  const conversationId = params.conversationId as string;
  const leadName = params.leadName as string || 'Lead';
  const phoneNumber = params.phoneNumber as string || 'Not available';
  const location = params.location as string || 'Not specified';
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  
  // Format call duration to minutes and seconds
  const formatCallDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };
  
  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper to convert interest level to score
  const getInterestScore = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return { score: '84/100', color: '#22C55E' };
      case 'medium': return { score: '65/100', color: '#FBBF24' };
      case 'low': return { score: '35/100', color: '#EF4444' };
      default: return { score: 'N/A', color: '#6B7280' };
    }
  };
  
  const getLanguageFromTranscript = (transcript: any[]) => {
    if (!transcript || transcript.length === 0) return 'English';
    
    // Basic language detection based on script
    const hindiPattern = /[\u0900-\u097F]/; // Hindi Unicode range
    
    
    const sampleText = transcript[0]?.text || '';
    
    
    if (hindiPattern.test(sampleText)) return 'Hindi';
    return 'English';
  };
  
  // Fetch conversation data
  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId) {
        setError('Conversation ID is missing');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Use the API endpoint from your requirements
        const response = await fetch(`https://resolutions-consequently-covered-gathered.trycloudflare.com/conversation/${conversationId}`);
        const data = await response.json();
        
        if (data.success && data.conversation) {
          setConversationData(data.conversation);
          console.log("Conversation data loaded:", data.conversation);
        } else {
          setError(data.error || 'Failed to load conversation data');
        }
      } catch (err) {
        console.error('Error fetching conversation data:', err);
        setError('An error occurred while fetching the conversation data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversationData();
  }, [conversationId]);
  
  const handleBackPress = () => {
    router.back();
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
          <Text className="text-white text-xl font-bold">AI Call Analysis</Text>
        </View>
        
        <View className="flex-1 bg-gray-50 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-gray-600 mt-4">Loading call analysis...</Text>
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
          <Text className="text-white text-xl font-bold">AI Call Analysis</Text>
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
  
  const interestLevel = conversationData?.interest?.interest_level || 'unknown';
  const interestScore = getInterestScore(interestLevel);
  const language = getLanguageFromTranscript(conversationData?.transcript || []);
  const callDuration = conversationData?.call_duration ? formatCallDuration(conversationData.call_duration) : 'N/A';
  const leadStatus = 
    interestLevel === 'high' ? 'Warm Lead' : 
    interestLevel === 'medium' ? 'Interested Lead' : 'Cold Lead';
  const leadStatusColor = 
    interestLevel === 'high' ? '#18FFAA' : 
    interestLevel === 'medium' ? '#FCD34D' : '#F87171';
  
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
          <Text className="text-white text-xl font-bold">AI Call Analysis</Text>
        </View>
      
        <ScrollView className="flex-1">
          <View className='bg-gray-50'>
            {/* AI Call Analysis Header */}
            <View className="bg-primary m-4 rounded-lg p-4 flex-row justify-between items-center">
              <View>
                <Text className="text-white text-lg font-bold">Cold Call Analysis</Text>
                <Text className="text-white text-xs opacity-80">
                  Analysis of Call to {leadName || 'Lead'}
                </Text>
              </View>
              
            </View>
            
            {/* Lead Info Card */}
            <View className="bg-white mx-4 rounded-lg p-4 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="white" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg text-gray-800">{leadName}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={14} color="#18FFAA" />
                      <Text className="text-gray-500 ml-1 text-sm">India</Text>
                    </View>
                  </View>
                </View>
                
                <View className="items-end">
                  <View className="px-3 py-1 rounded-full mb-1" style={{ backgroundColor: leadStatusColor }}>
                    <Text className="text-primary font-medium text-sm">{leadStatus}</Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {conversationData?.status === 'INTERESTED' ? 'Active List' : 'Nurture List'}
                  </Text>
                </View>
              </View>
              
              {/* Call Details */}
              <View className="flex-row flex-wrap justify-between mt-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="call" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Call Duration:</Text>
                    <Text className="text-sm font-medium">{callDuration}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="language" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Language:</Text>
                    <Text className="text-sm font-medium">{language}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="star-circle" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Lead Score:</Text>
                    <Text className="text-sm font-medium" style={{ color: interestScore.color }}>
                      {interestScore.score}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <MaterialIcons name="check-circle" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Action Taken:</Text>
                    <Text className="text-sm font-medium">
                      {conversationData?.status === 'INTERESTED' ? 'Added to List' : 'Nurturing'}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Follow-up:</Text>
                    <Text className="text-sm font-medium">
                      {conversationData?.recommendations?.follow_up_strategy === 'call_back' ? 'In 2 days' : 'Not required'}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="briefcase" size={16} color="primary" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500">Occupation:</Text>
                    <Text className="text-sm font-medium">
                      {conversationData?.personal_data?.occupation || 'Not mentioned'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Call Transcript */}
            <TouchableOpacity 
              className="bg-white mx-4 mt-3 rounded-lg p-4 flex-row justify-between items-center shadow-sm"
              onPress={() => setShowTranscript(!showTranscript)}
            >
              <View className="flex-row items-center">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="document-text" size={16} color="primary" />
                </View>
                <Text className="text-primary font-medium">Call Transcript</Text>
              </View>
              <Ionicons name={showTranscript ? "chevron-up" : "chevron-down"} size={20} color="primary" />
            </TouchableOpacity>
            
            {showTranscript && conversationData?.transcript && (
              <View className="bg-white mx-4 px-4 pb-4 rounded-b-lg shadow-sm">
                {conversationData.transcript.map((message, index) => (
                  <Text key={index} className="text-gray-800 mb-2">
                    <Text className="font-bold">
                      {message.type === 'agent' ? 'Agent' : leadName}:
                    </Text> {message.text}
                    <Text className="text-gray-400 text-xs"> ({formatTimestamp(message.timestamp)})</Text>
                  </Text>
                ))}
              </View>
            )}
            
            {/* Analytics */}
            <View className="bg-white mx-4 mt-3 rounded-lg p-4 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="analytics" size={16} color="primary" />
                </View>
                <Text className="text-primary font-medium">Analytics</Text>
              </View>
              
              {/* Products Interest */}
              <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-500 text-xs mb-1">Interest Level</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-lg text-gray-800">
                      {conversationData?.interest?.interest_level || 'Not detected'}
                    </Text>
                    <Text className="text-[#18FFAA] text-xs">
                      {conversationData?.interest?.products?.length 
                        ? conversationData.interest.products.join(', ').replace(/_/g, ' ')
                        : 'No products mentioned'}
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                    <View 
                      className="bg-[#18FFAA] h-full rounded-full" 
                      style={{ 
                        width: conversationData?.interest?.interest_level === 'high' ? '90%' : 
                               conversationData?.interest?.interest_level === 'medium' ? '60%' : 
                               conversationData?.interest?.interest_level === 'low' ? '30%' : '0%'
                      }}
                    ></View>
                  </View>
                </View>
                
                <View className="flex-1 ml-2">
                  <Text className="text-gray-500 text-xs mb-1">Urgency Level</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-lg text-gray-800">
                      {conversationData?.interest?.urgency_level?.replace(/_/g, ' ') || 'Not specified'}
                    </Text>
                    <Text className="text-[#18FFAA] text-xs">
                      {conversationData?.interest?.urgency_level === 'short_term' ? 'Urgent' : 
                       conversationData?.interest?.urgency_level === 'within_month' ? 'Soon' : 'Long-term'}
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                    <View 
                      className="bg-[#18FFAA] h-full rounded-full" 
                      style={{ 
                        width: conversationData?.interest?.urgency_level === 'short_term' ? '90%' : 
                               conversationData?.interest?.urgency_level === 'within_month' ? '60%' : 
                               conversationData?.interest?.urgency_level === 'long_term' ? '30%' : '0%'
                      }}
                    ></View>
                  </View>
                </View>
              </View>
              
              {/* Sentiment Analysis */}
              <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-500 text-xs mb-1">Overall Sentiment</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-lg text-gray-800">
                      {conversationData?.sentiment_analysis?.overall_sentiment || 'Neutral'}
                    </Text>
                    <Text className="text-[#18FFAA] text-xs">
                      {conversationData?.sentiment_analysis?.user_sentiment || 'Not analyzed'}
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                    <View 
                      className="bg-[#18FFAA] h-full rounded-full" 
                      style={{ 
                        width: conversationData?.sentiment_analysis?.overall_sentiment === 'positive' ? '90%' : 
                               conversationData?.sentiment_analysis?.overall_sentiment === 'neutral' ? '50%' : '25%'
                      }}
                    ></View>
                  </View>
                </View>
                
                <View className="flex-1 ml-2">
                  <Text className="text-gray-500 text-xs mb-1">Main Topics</Text>
                  <View>
                    {conversationData?.key_insights?.main_topics?.slice(0, 2).map((topic, index) => (
                      <Text key={index} className="text-gray-800 font-medium" style={{ fontSize: 13 }}>
                        "{topic}"
                      </Text>
                    ))}
                    {(!conversationData?.key_insights?.main_topics || 
                      conversationData.key_insights.main_topics.length === 0) && (
                      <Text className="text-gray-800 font-medium" style={{ fontSize: 13 }}>
                        No main topics detected
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              
              {/* Objections and User Engagement */}
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-500 text-xs mb-1">Objection Count</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-lg text-gray-800">
                      {conversationData?.objections?.length || 0}
                    </Text>
                    <Text className="text-[#18FFAA] text-xs">
                      {conversationData?.objections && conversationData.objections.length > 0 ? 'Some concerns' : 'None detected'}
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                    <View 
                      className="bg-[#18FFAA] h-full rounded-full" 
                      style={{ 
                        width: conversationData?.objections?.length 
                          ? `${Math.min((conversationData.objections.length / 3) * 100, 100)}%` 
                          : '0%'
                      }}
                    ></View>
                  </View>
                </View>
                
                <View className="flex-1 ml-2">
                  <Text className="text-gray-500 text-xs mb-1">User Response</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-lg text-gray-800">
                      {conversationData?.positive_responses?.length || 0}
                    </Text>
                    <Text className="text-[#18FFAA] text-xs">
                      {(conversationData?.positive_responses && conversationData.positive_responses.length > 2) ? 'Very responsive' : 
                       (conversationData?.positive_responses && conversationData.positive_responses.length > 0) ? 'Responsive' : 'Limited'}
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                    <View 
                      className="bg-[#18FFAA] h-full rounded-full" 
                      style={{ 
                        width: conversationData?.positive_responses?.length
                          ? `${Math.min((conversationData.positive_responses.length / 3) * 100, 100)}%`
                          : '0%'
                      }}
                    ></View>
                  </View>
                </View>
              </View>
              
              {/* User Engagement */}
              <View className="mt-4">
                <Text className="text-gray-500 text-xs mb-1">User Engagement</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-lg text-gray-800">
                    {conversationData?.user_engagement || 'Medium'}
                  </Text>
                  <Text className="text-xs" style={{ color: interestScore.color }}>
                    {conversationData?.call_duration 
                      ? `${Math.floor(conversationData.call_duration / 60)}:${(conversationData.call_duration % 60).toString().padStart(2, '0')}`
                      : 'N/A'}
                  </Text>
                </View>
                <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                  <View 
                    className="bg-[#18FFAA] h-full rounded-full" 
                    style={{ 
                      width: conversationData?.user_engagement === 'High' ? '90%' : 
                             conversationData?.user_engagement === 'Medium' ? '60%' : '30%'
                    }}
                  ></View>
                </View>
              </View>
            </View>
            
            {/* AI Recommendations */}
            <View className="bg-white mx-4 mt-3 rounded-lg p-4 shadow-sm mb-4">
              <View className="flex-row items-center mb-4">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="bulb" size={16} color="primary" />
                </View>
                <Text className="text-primary font-medium">AI Recommendations</Text>
              </View>
              
              {/* Suggested Action */}
              <View className="mb-3 flex-row">
                <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="sync" size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium">Suggested Actions:</Text>
                  {conversationData?.recommendations?.immediate_actions?.map((action, index) => (
                    <Text key={index} className="text-gray-600 mt-1">• {action}</Text>
                  ))}
                  {(!conversationData?.recommendations?.immediate_actions || 
                    conversationData.recommendations.immediate_actions.length === 0) && (
                    <Text className="text-gray-600">No immediate actions recommended</Text>
                  )}
                </View>
              </View>
              
              {/* Product Interest */}
              <View className="mb-3 flex-row">
                <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="cart" size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium">Product Interest:</Text>
                  <Text className="text-gray-600">
                    {conversationData?.interest?.products && Array.isArray(conversationData.interest.products) && conversationData.interest.products.length > 0
                      ? conversationData.interest.products.map(p => 
                          p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        ).join(', ')
                      : 'No specific products mentioned'}
                  </Text>
                  {conversationData?.interest?.budget_range && (
                    <Text className="text-gray-600 mt-1">
                      Budget: {conversationData.interest.budget_range}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* User Concerns */}
              <View className="mb-3 flex-row">
                <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="alert-circle" size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium">User Concerns:</Text>
                  {conversationData?.key_insights?.user_concerns?.map((concern, index) => (
                    <Text key={index} className="text-gray-600 mt-1">• {concern}</Text>
                  ))}
                  {(!conversationData?.key_insights?.user_concerns || 
                    conversationData.key_insights.user_concerns.length === 0) && (
                    <Text className="text-gray-600">No concerns detected</Text>
                  )}
                </View>
              </View>
              
              {/* Financial Profile */}
              <View className="mb-3 flex-row">
                <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="cash" size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium">Financial Profile:</Text>
                  <Text className="text-gray-600">
                    {conversationData?.personal_data?.occupation ? `${conversationData.personal_data.occupation}, ` : ''}
                    {conversationData?.personal_data?.age ? `${conversationData.personal_data.age} years old, ` : ''}
                    {conversationData?.personal_data?.income ? `₹${conversationData.personal_data.income} income` : 'Income not specified'}
                  </Text>
                  {conversationData?.financial_profile?.estimated_income_range && (
                    <Text className="text-gray-600 mt-1">
                      Estimated income: {conversationData.financial_profile.estimated_income_range.replace(/_/g, ' ')}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Next Steps */}
              <View className="flex-row">
                <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="arrow-forward-circle" size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium">Next Steps:</Text>
                  {conversationData?.key_insights?.next_steps?.map((step, index) => (
                    <Text key={index} className="text-gray-600 mt-1">• {step}</Text>
                  ))}
                  {(!conversationData?.key_insights?.next_steps || 
                    conversationData.key_insights.next_steps.length === 0) && (
                    <Text className="text-gray-600">No specific next steps recommended</Text>
                  )}
                  {conversationData?.recommendations?.follow_up_strategy && (
                    <Text className="text-gray-600 mt-2 font-medium">
                      Follow-up strategy: {conversationData.recommendations.follow_up_strategy.replace(/_/g, ' ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View className="px-4 mb-24">
             
              
              <TouchableOpacity 
                className="bg-[#18FFAA] p-4 rounded-lg flex-row justify-center items-center mb-3"
                onPress={() => {
                  if (phoneNumber && phoneNumber !== 'Not available') {
                    Linking.openURL(`tel:${phoneNumber}`);
                  } else {
                    Alert.alert('Error', 'Phone number not available');
                  }
                }}
              >
                <Ionicons name="call" size={20} color="primary" />
                <Text className="text-primary font-medium ml-2">Call Lead</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white border border-primary p-4 rounded-lg flex-row justify-center items-center"
                onPress={() => {
                  if (phoneNumber && phoneNumber !== 'Not available') {
                    Linking.openURL(`sms:${phoneNumber}`);
                  } else {
                    Alert.alert('Error', 'Phone number not available');
                  }
                }}
              >
                <Ionicons name="chatbubble" size={20} color="primary" />
                <Text className="text-primary font-medium ml-2">Send Follow-up Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}