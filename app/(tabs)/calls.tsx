import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService } from '../services/api';

const primaryColor = "#04457E";

interface Conversation {
  _id: string;
  conversation_id: string;
  callSid: string;
  lead_id: string;
  status: string;
  call_duration: number;
  summary: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
  interest: {
    products: string[];
    interest_level: string;
    budget_range: string;
    urgency_level: string;
  };
  personal_data: {
    occupation: string;
    age: number | null;
    income: number | null;
    state: string;
  };
  transcript: Array<{
    type: string;
    text: string;
    timestamp: string;
    _id: string;
  }>;
}

// Interface for co-pilot analysis items
interface CopilotAnalysisItem {
  _id: string;
  agent_messages: number;
  agent_name: string | null;
  analysis: {
    bad_points: string[];
    bad_transcript: string;
    good_points: string[];
    intent: string;
    problematic_messages: Array<{
      issue: string;
      message_number: number;
      message_text: string;
      suggestion: string;
    }>;
    sentiment: string;
    theory: string;
    topic: string;
  };
  analysis_id: string;
  call_duration: number | null;
  created_at: string;
  department: string | null;
  lead_id: string;
  total_issues: number;
  total_messages: number;
  transcript: Array<{
    message: string;
    role: string;
  }>;
  user_messages: number;
}

const CallsScreen = () => {
  // Updated state for active filter to include 'co-pilot'
  const [activeFilter, setActiveFilter] = useState<'all' | 'called' | 'co-pilot'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [copilotAnalysis, setCopilotAnalysis] = useState<CopilotAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add state to store lead information
  const [leadInfo, setLeadInfo] = useState<Record<string, any>>({});
  
  // Add state to track expanded analysis item
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  // Add state for course creation
  const [creatingCourse, setCreatingCourse] = useState(false);
  
  // Add to the state variables at the top of the CallsScreen component
  const [leadNames, setLeadNames] = useState<Record<string, string>>({});

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversations();
      
      if (response.success && response.data) {
        const conversations = response.data.conversations;
        setConversations(conversations);
        
        // Fetch lead info for each conversation
        conversations.forEach(conversation => {
          fetchLeadInfo(conversation.lead_id);
        });
      } else {
        setError('Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('An error occurred while fetching conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch co-pilot analysis items
  const fetchCopilotAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCopilotAnalysisItems();
      
      if (response.success && response.data) {
        setCopilotAnalysis(response.data.data);
      } else {
        setError('Failed to fetch co-pilot analysis');
      }
    } catch (err) {
      console.error('Error fetching co-pilot analysis:', err);
      setError('An error occurred while fetching co-pilot analysis');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch lead information by ID
  const fetchLeadInfo = async (leadId: string) => {
    try {
      const response = await apiService.getLeadById(leadId);
      
      if (response.success && response.data && response.data.lead) {
        // Update the lead info state with the fetched data
        setLeadInfo(prevInfo => ({
          ...prevInfo,
          [leadId]: response.data?.lead
        }));
      } else {
        console.error(`Failed to fetch lead info for ${leadId}`);
      }
    } catch (error) {
      console.error(`Error fetching lead info for ${leadId}:`, error);
    }
  };

  // Modified useEffect to better handle lead name loading
  useEffect(() => {
    const loadData = async () => {
      if (activeFilter === 'co-pilot') {
        setLoading(true);
        try {
          const response = await apiService.getCopilotAnalysisItems();
          
          if (response.success && response.data) {
            setCopilotAnalysis(response.data.data);
            
            // After setting the analysis data, fetch all lead names
            if (response.data.data && response.data.data.length > 0) {
              // Fetch all lead IDs in parallel
              const fetchPromises = response.data.data.map(item => {
                if (!item.lead_id || leadNames[item.lead_id]) return Promise.resolve();
                return fetchLeadName(item.lead_id);
              });
              
              // Wait for all fetch operations to complete
              await Promise.all(fetchPromises);
            }
          } else {
            setError('Failed to fetch co-pilot analysis');
          }
        } catch (err) {
          console.error('Error fetching co-pilot analysis:', err);
          setError('An error occurred while fetching co-pilot analysis');
        } finally {
          setLoading(false);
        }
      } else {
        await fetchConversations();
      }
    };
    
    loadData();
  }, [activeFilter]);

  // Improved fetchLeadName function with better error handling
  const fetchLeadName = async (leadId: string): Promise<void> => {
    if (!leadId) return;
    
    // Check if we already have this lead name
    if (leadNames[leadId]) return;
    
    try {
      console.log(`Fetching lead name for ID: ${leadId}`);
      const response = await apiService.getLeadById(leadId);
      
      if (response.success && response.data && response.data.lead && response.data.lead.contact) {
        // Update the lead names state with the fetched data
        setLeadNames(prevNames => ({
          ...prevNames,
          [leadId]: response.data.lead.contact?.name || `Lead ${leadId.substring(0, 5)}`
        }));
        console.log(`Successfully fetched name for ${leadId}: ${response.data.lead.contact?.name}`);
      } else {
        // Set a fallback name when API succeeds but doesn't have the contact name
        setLeadNames(prevNames => ({
          ...prevNames,
          [leadId]: `Lead ${leadId.substring(0, 5)}`
        }));
        console.log(`No contact name found for lead ${leadId}, using fallback`);
      }
    } catch (error) {
      console.error(`Error fetching lead info for ${leadId}:`, error);
      // Set a fallback name even when the API fails
      setLeadNames(prevNames => ({
        ...prevNames,
        [leadId]: `Lead ${leadId.substring(0, 5)}`
      }));
    }
  };

  // Toggle expanded state for analysis item
  const toggleAnalysisExpanded = (itemId: string) => {
    if (expandedAnalysisId === itemId) {
      setExpandedAnalysisId(null);
    } else {
      setExpandedAnalysisId(itemId);
    }
  };
  
  // Create course from topic
  const handleCreateCourse = async (topic: string) => {
    if (!topic) {
      Alert.alert('Error', 'No topic available to create a course');
      return;
    }
    
    setCreatingCourse(true);
    try {
      const response = await apiService.createCourseFromPrompt(topic);
      
      if (response.success && response.data) {
        Alert.alert(
          'Success',
          `Course on "${topic}" has been created successfully!`,
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
      setCreatingCourse(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeFilter === 'co-pilot') {
        await fetchCopilotAnalysis();
      } else {
        await fetchConversations();
      }
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (activeFilter === 'co-pilot') {
      const fetchData = async () => {
        await fetchCopilotAnalysis();
        
        // After analysis is loaded, fetch lead names for each item
        if (copilotAnalysis && copilotAnalysis.length > 0) {
          copilotAnalysis.forEach(item => {
            fetchLeadName(item.lead_id);
          });
        }
      };
      
      fetchData();
    } else {
      fetchConversations();
    }
  }, [activeFilter]);

  // Filter conversations based on active filter
  const filteredConversations = useMemo(() => {
    if (activeFilter === 'co-pilot') {
      return []; // We'll handle co-pilot display separately
    }
    
    // Only show conversations that are not "NEW"
    const validConversations = conversations.filter(
      conversation => conversation.status !== "NEW" && conversation.status !== "NO_RESPONSE"
    );
    
    if (activeFilter === 'called') {
      return validConversations.filter(conversation => 
        conversation.call_duration > 30 || conversation.status === "COMPLETED" || conversation.status === "INTERESTED"
      );
    }
    return validConversations;
  }, [activeFilter, conversations]);

  // Function to navigate to call details screen
  const navigateToCallDetails = (conversation: Conversation) => {
    // Get the lead name from either leadInfo or fallback to transcript extraction
    const leadName = leadInfo[conversation.lead_id]?.contact?.name || 
                    getNameFromTranscript(conversation.transcript) || 'Lead';
    
    router.push({
      pathname: '/ai-call-analysis',
      params: { 
        conversationId: conversation.conversation_id,
        callSid: conversation.callSid,
        leadName: leadName,
        phoneNumber: leadInfo[conversation.lead_id]?.contact?.phone || ''
      }
    });
  };

  // Function to navigate to AI Co-Pilot screen
  const navigateToAICoPilot = (conversation: Conversation) => {
    // Get the lead name from either leadInfo or fallback to transcript extraction
    const leadName = leadInfo[conversation.lead_id]?.contact?.name || 
                    getNameFromTranscript(conversation.transcript) || 'Lead';
    
    router.push({
      pathname: '/ai-copilot',
      params: { 
        leadName: leadName,
        leadType: conversation.interest.products.join(', ') || 'General'
      }
    });
  };

  // Function to navigate to conversation analysis screen
  const navigateToConversationAnalysis = (analysisItem: CopilotAnalysisItem) => {
    router.push({
      pathname: '/conversation-analysis',
      params: { 
        analysisId: analysisItem.analysis_id,
        leadName: analysisItem.agent_name || 'Agent'
      }
    });
  };

  // Helper function to extract name from transcript
  const getNameFromTranscript = (transcript: any[]): string => {
    if (!transcript || transcript.length === 0) return '';
    
    // Try to extract name from the first agent message
    const firstAgentMessage = transcript.find(msg => msg.type === 'agent');
    if (firstAgentMessage && firstAgentMessage.text) {
      // Extract name between "नमस्ते" and "जी"
      const match = firstAgentMessage.text.match(/नमस्ते\s+(.*?)\s+जी/);
      if (match && match[1]) return match[1];
    }
    
    return '';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Get interest level color
  const getInterestLevelColor = (interestLevel: string | undefined) => {
    if (!interestLevel) return 'bg-gray-100 text-gray-800';
    
    switch (interestLevel.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Updated getSentimentColor to return CSS class names instead of hex colors
  const getSentimentColor = (sentiment: string | undefined): string => {
    if (!sentiment) return 'gray';
    
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'green';
      case 'neutral': return 'yellow';
      case 'negative': return 'red';
      default: return 'gray';
    }
  };

  // Format call duration
  const formatCallDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderConversationItem = (conversation: Conversation) => {
    // Get lead name from either leadInfo or fallback to transcript extraction
    const leadName = leadInfo[conversation.lead_id]?.contact?.name || 
                    getNameFromTranscript(conversation.transcript) || 'Lead';
    
    // Get product interests
    const products = conversation.interest.products.length > 0 
      ? conversation.interest.products.join(', ') 
      : 'No specific product';
    
    // Generate policy end date (mock - 1 year from created date)
    const createdDate = new Date(conversation.createdAt);
    const policyEndDate = new Date(createdDate);
    policyEndDate.setFullYear(policyEndDate.getFullYear() + 1);
    
    return (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        {/* Card Header */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-start flex-1">
            <View className="relative mr-3">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                <Text className="text-blue-800 text-xl font-bold">{leadName.charAt(0)}</Text>
              </View>
              <View className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                conversation.status === 'QUALIFIED' || conversation.status === 'INTERESTED' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">{leadName}</Text>
              <Text className="text-sm text-gray-600 font-medium mb-1">{products}</Text>
              <View className="flex-row items-center">
                <View className={`px-2 py-0.5 rounded-full mt-1 ${getInterestLevelColor(conversation.interest?.interest_level)}`}>
                  <Text className="text-xs font-medium">
                    {(conversation.interest?.interest_level || 'UNKNOWN').toUpperCase()} INTEREST
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View className="mb-4 pb-4 border-b border-gray-100">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 font-medium">Call Date:</Text>
            <Text className="text-sm font-semibold text-blue-700 ml-2">
              {formatDate(conversation.createdAt)}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="phone" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 font-medium">Call Duration:</Text>
            <Text className="text-sm font-semibold text-gray-800 ml-2">
              {formatCallDuration(conversation.call_duration)}
            </Text>
          </View>
        </View>

        {/* Button Row */}
        <View className="flex-row gap-3">
          <TouchableOpacity 
            className="bg-primary flex-row items-center justify-center py-3 px-5 rounded-xl flex-1 shadow-sm"
            onPress={() => navigateToCallDetails(conversation)}
          >
            <MaterialCommunityIcons name="history" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-sm">View Last Call</Text>
          </TouchableOpacity>
        
          {/* AI Co-Pilot button for all leads */}
          <TouchableOpacity 
            className="bg-blue-50 border border-blue-700 flex-row items-center justify-center py-3 px-5 rounded-xl flex-1"
            onPress={() => navigateToAICoPilot(conversation)}
          >
            <MaterialCommunityIcons name="robot" size={20} color="#1D4ED8" />
            <Text className="text-blue-700 font-semibold ml-2 text-sm">Call with AI Co-Pilot</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Updated renderCopilotAnalysisItem function to handle lead names better
  const renderCopilotAnalysisItem = (item: CopilotAnalysisItem) => {
    const isExpanded = expandedAnalysisId === item._id;
    
    // Improved lead name handling with fallbacks
    const leadName = leadNames[item.lead_id] || `Lead ${item.lead_id?.substring(0, 5) || 'Unknown'}`;
    const isLoading = !leadNames[item.lead_id];
    
    // Get first character for avatar
    const avatarChar = leadName !== 'Loading...' ? 
      (leadName.charAt(0).toUpperCase() || '?') : 
      '?';
    
    return (
      <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100">
        {/* Collapsible Card Header */}
        <TouchableOpacity 
          className="p-5"
          onPress={() => toggleAnalysisExpanded(item._id)}
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-start flex-1">
              <View className="relative mr-3">
                <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <Text className="text-indigo-800 text-xl font-bold">{avatarChar}</Text>
                  )}
                </View>
                <View className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-blue-500`} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {leadName}
                  </Text>
                  {isLoading && (
                    <ActivityIndicator 
                      size="small" 
                      color="#4F46E5" 
                      style={{ marginLeft: 8, marginBottom: 4 }}
                    />
                  )}
                </View>
                <Text className="text-sm text-gray-600 font-medium mb-1">
                  {item.analysis.topic || 'Co-Pilot Conversation'}
                </Text>
                <Text className="text-xs text-gray-500">
                  {item.analysis.intent || 'No intent detected'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className={`px-2 py-0.5 rounded-full bg-${getSentimentColor(item.analysis.sentiment)}-100`}>
                    <Text className={`text-xs font-medium text-${getSentimentColor(item.analysis.sentiment)}-800`}>
                      {(item.analysis.sentiment || 'UNKNOWN').toUpperCase()} SENTIMENT
                    </Text>
                  </View>
                </View>
              </View>
              <MaterialCommunityIcons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#6B7280" 
              />
            </View>
          </View>

          {/* Details Section */}
          <View className="pb-2">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="calendar-clock" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 font-medium">Analysis Date:</Text>
              <Text className="text-sm font-semibold text-blue-700 ml-2">
                {formatDate(item.created_at)}
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="message-text" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 font-medium">Messages:</Text>
              <Text className="text-sm font-semibold text-gray-800 ml-2">
                {item.total_messages} (User: {item.user_messages}, Agent: {item.agent_messages})
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 font-medium">Issues:</Text>
              <Text className="text-sm font-semibold text-gray-800 ml-2">
                {item.total_issues}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Analysis Details */}
        {isExpanded && (
          <View className="px-5 pt-0 pb-5">
            <View className="h-px bg-gray-200 mb-4" />
            
            {/* Strengths */}
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="thumbs-up" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Strengths</Text>
              </View>
              
              {item.analysis.good_points && item.analysis.good_points.length > 0 ? (
                item.analysis.good_points.map((point: string, index: number) => (
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
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="alert-circle" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Areas for Improvement</Text>
              </View>
              
              {item.analysis.bad_points && item.analysis.bad_points.length > 0 ? (
                item.analysis.bad_points.map((point: string, index: number) => (
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
            {item.analysis.problematic_messages && item.analysis.problematic_messages.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                    <Ionicons name="chatbox-ellipses" size={16} color={primaryColor} />
                  </View>
                  <Text className="text-primary font-medium">Message Issues</Text>
                </View>
                
                {item.analysis.problematic_messages.map((message: any, index: number) => (
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
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="chatbubbles" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Conversation Transcript</Text>
              </View>
              
              {item.transcript && item.transcript.length > 0 ? (
                item.transcript.map((msg: any, index: number) => (
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
            
            {/* Theory and Course Creation */}
            <View className="mb-2">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-md bg-[#18FFAA] items-center justify-center mr-2">
                  <Ionicons name="school" size={16} color={primaryColor} />
                </View>
                <Text className="text-primary font-medium">Learning Theory</Text>
              </View>
              
              <View className="bg-blue-50 p-3 rounded-lg mb-2">
                <Text className="text-gray-700 font-medium">Relevant Theory:</Text>
                <Text className="text-gray-600 mt-1">{item.analysis.theory || 'No specific theory identified'}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-primary mt-3 p-3 rounded-lg flex-row justify-center items-center"
                onPress={() => handleCreateCourse(item.analysis.topic)}
                disabled={creatingCourse}
              >
                {creatingCourse ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="school" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Create Learning Course on {item.analysis.topic}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Status Bar - positioned outside SafeAreaView for proper coloring */}
      <StatusBar 
        backgroundColor={primaryColor} 
        barStyle="light-content" 
        translucent={true}
      />
        
      {/* Using SafeAreaView with edges to prevent content from going under status bar */}
      <SafeAreaView 
        edges={['right', 'left','top']} 
        className="flex-1 bg-gray-50"
        style={{ backgroundColor: primaryColor }}
        
      >
        {/* Header - Fixed at top */}
        <View className="bg-primary py-5 px-4 flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Gromo+</Text>
        </View>
      
        {/* Make the whole content scrollable */}
        <View className="flex-1 bg-gray-50">
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[primaryColor]}
                tintColor={primaryColor}
              />
            }
          >
            {/* Content Area with Gray Background */}
            <View className="px-4 pt-6 pb-3">
              <Text className="text-3xl font-bold text-primary">Calls</Text>
            </View>
            
            {/* Cold Calls Button */}
            <TouchableOpacity 
              className="bg-white mx-4 mb-4 rounded-2xl p-5 flex-row items-center justify-between shadow-sm border border-gray-100"
              onPress={() => router.push('/cold-calls')}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                  <MaterialCommunityIcons name="phone-plus" size={24} color="#1D4ED8" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-800 font-bold text-lg mb-1">View Cold Calls</Text>
                  <Text className="text-gray-600 text-sm">
                    Begin new sales calls with AI assistance
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            {/* Filter Tabs - Updated to include co-pilot */}
            <View className="flex-row px-4 mb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity 
                  className={`py-2 px-5 rounded-full mr-2 ${
                    activeFilter === 'all' 
                      ? 'bg-primary' 
                      : 'bg-white border border-gray-300'
                  }`}
                  onPress={() => {
                    setActiveFilter('all');
                    setExpandedAnalysisId(null); // Reset expanded state when changing filters
                  }}
                >
                  <Text className={`font-semibold ${
                    activeFilter === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                    All Leads
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`py-2 px-5 rounded-full ${
                    activeFilter === 'co-pilot' 
                      ? 'bg-primary' 
                      : 'bg-white border border-gray-300'
                  }`}
                  onPress={() => {
                    setActiveFilter('co-pilot');
                    setExpandedAnalysisId(null); // Reset expanded state when changing filters
                  }}
                >
                  <Text className={`font-semibold ${
                    activeFilter === 'co-pilot' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Co-Pilot Calls
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          
            {/* Leads List - Updated title based on filter */}
            <View className="flex-row justify-between items-center px-4 mb-3">
              <Text className="text-xl font-bold text-gray-900">
                {activeFilter === 'co-pilot' ? 'Co-Pilot Analysis' : 'My Leads'}
              </Text>
              <Text className="text-sm text-gray-600 font-medium">
                {activeFilter === 'co-pilot' 
                  ? `${copilotAnalysis.length} analysis items` 
                  : `${filteredConversations.length} leads`
                }
              </Text>
            </View>
          
            {/* Content based on active filter */}
            <View className="px-4 pb-6">
              {loading && !refreshing ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text className="mt-4 text-gray-500">
                    {activeFilter === 'co-pilot' 
                      ? 'Loading co-pilot analysis...' 
                      : 'Loading conversations...'}
                  </Text>
                </View>
              ) : error ? (
                <View className="py-10 items-center">
                  <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#FF6B6B" />
                  <Text className="mt-4 text-gray-700 text-center">{error}</Text>
                  <TouchableOpacity 
                    className="mt-4 bg-primary px-4 py-2 rounded-lg"
                    onPress={activeFilter === 'co-pilot' ? fetchCopilotAnalysis : fetchConversations}
                  >
                    <Text className="text-white font-medium">Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : activeFilter === 'co-pilot' ? (
                // Co-pilot analysis display
                copilotAnalysis.length === 0 ? (
                  <View className="py-10 items-center">
                    <MaterialCommunityIcons name="robot-off" size={50} color="#D1D5DB" />
                    <Text className="mt-4 text-gray-500 text-center">
                      No co-pilot analysis found. Try making some co-pilot calls!
                    </Text>
                    <TouchableOpacity 
                      className="mt-4 bg-primary px-5 py-3 rounded-lg"
                      onPress={() => router.push('/cold-calls')}
                    >
                      <Text className="text-white font-medium">Start Co-Pilot Calls</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  copilotAnalysis.map(item => (
                    <View key={item._id}>
                      {renderCopilotAnalysisItem(item)}
                    </View>
                  ))
                )
              ) : filteredConversations.length === 0 ? (
                // Empty conversations state
                <View className="py-10 items-center">
                  <MaterialCommunityIcons name="phone-off" size={50} color="#D1D5DB" />
                  <Text className="mt-4 text-gray-500 text-center">
                    No conversations found. Try making some cold calls!
                  </Text>
                  <TouchableOpacity 
                    className="mt-4 bg-primary px-5 py-3 rounded-lg"
                    onPress={() => router.push('/cold-calls')}
                  >
                    <Text className="text-white font-medium">Start Cold Calls</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Conversations display
                filteredConversations.map(conversation => (
                  <View key={conversation._id}>
                    {renderConversationItem(conversation)}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CallsScreen;