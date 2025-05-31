import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, BulkCallRequest, CallDetails } from './services/api';

const primaryColor = "#04457E";
const { height, width } = Dimensions.get('window');

// Helper to format date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to format date string with date included
const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Helper to calculate call duration in minutes and seconds
const calculateDuration = (dateString: string) => {
  const startTime = new Date(dateString).getTime();
  const currentTime = new Date().getTime();
  const durationMs = currentTime - startTime;
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Generate random avatar for leads
const getAvatarColor = (id: string) => {
  const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get name from phone number (placeholder until we have real data)
const getNameFromPhone = (phone: string) => {
  const names = [
    'Rajesh Kumar', 'Priya Sharma', 'Sameer Patel', 'Anjali Desai', 
    'Vikram Singh', 'Meera Reddy', 'Amit Verma', 'Neha Gupta'
  ];
  const hash = phone.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return names[hash % names.length];
};

// Get location from lead_id (placeholder until we have real data)
const getLocationFromId = (id: string) => {
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 
    'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return locations[hash % locations.length];
};

const AIColdCallsScreen = () => {
  // State for tab selection
  const [activeTab, setActiveTab] = useState('scheduled');
  
  // Bottom sheet state and animation
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [leadNumber, setLeadNumber] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // API Data States
  const [callRequests, setCallRequests] = useState<BulkCallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View states
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showingDetails, setShowingDetails] = useState(false);
  
  // Transform call data for display
  const transformCallToDisplayData = (call: CallDetails, requestInfo: BulkCallRequest) => {
    // Initialize with placeholder values
    let name = "Loading...";
    let location = getLocationFromId(call.lead_id); // Keep location logic as is for now
    const isLive = call.status === 'INITIATED' || call.status === 'IN_PROGRESS';
    
    // Store the call data to return later
    const callData = {
      id: call.lead_id,
      requestId: requestInfo.request_id,
      name: name,
      location: location,
      language: location === 'Mumbai' ? 'Hindi speaking' : 'English speaking',
      status: isLive ? 'live' : call.status === 'COMPLETED' ? 'completed' : 'failed',
      duration: isLive ? calculateDuration(requestInfo.createdAt) : '',
      isRecording: isLive,
      leadScore: call.status === 'COMPLETED' ? '85/100' : undefined,
      callSid: call.callSid,
      conversation_id: call.conversation_id,
      phone: call.phonenumber,
      createdAt: requestInfo.createdAt,
      updatedAt: call.updatedAt,
      error: call.error,
      type: 'scheduled', // All API calls are considered scheduled
      avatar: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${getAvatarColor(call.lead_id).replace('#', '')}&color=fff` }
    };
    
    // Fetch the lead data from the API
    fetchLeadInfo(call.lead_id, callData);
    
    return callData;
  };

  // Add a state for storing lead information
  const [leadInfo, setLeadInfo] = useState<Record<string, any>>({});

  // Update the fetchLeadInfo function to use the API service
  const fetchLeadInfo = async (leadId: string, callData: any) => {
    try {
      const response = await apiService.getLeadById(leadId);
      
      if (!response.success) {
        console.error(`Failed to fetch lead info for ${leadId}: ${response.error}`);
        return;
      }
      
      if (response.data && response.data.lead && response.data.lead.contact) {
        // Update the lead info state
        setLeadInfo(prevInfo => ({
          ...prevInfo,
          [leadId]: response.data.lead
        }));
        
        // Force a re-render
        setCallRequests(prev => [...prev]);
      }
    } catch (error) {
      console.error(`Error fetching lead info for ${leadId}:`, error);
    }
  };
  
  // Fetch calls data from API
  useEffect(() => {
    const fetchCallRequests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getBulkCallRequests();
        
        if (response.success && response.data) {
          setCallRequests(response.data.bulk_requests);
        } else {
          console.error('Failed to fetch call requests:', response.error);
          setError(response.error || 'Failed to load call data');
        }
      } catch (err) {
        console.error('Error fetching call requests:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCallRequests();
    
    // Set up a refresh interval
    const intervalId = setInterval(fetchCallRequests, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get a specific bulk request by ID
  const getSelectedBulkRequest = () => {
    if (!selectedRequestId) return null;
    return callRequests.find(request => request.request_id === selectedRequestId);
  };
  
  // Get all calls for a specific bulk request
  const getCallsForSelectedRequest = () => {
    const request = getSelectedBulkRequest();
    if (!request) return [];
    
    return request.calls.map(call => transformCallToDisplayData(call, request));
  };
  
  // Get call statistics
  const getCallStats = () => {
    if (callRequests.length === 0) return { total: 0, completed: 0, failed: 0, initiated: 0 };
    
    return callRequests.reduce((stats, request) => {
      return {
        total: stats.total + request.total_calls,
        completed: stats.completed + request.completed_calls,
        failed: stats.failed + request.failed_calls,
        initiated: stats.initiated + (request.summary.initiated || 0)
      };
    }, { total: 0, completed: 0, failed: 0, initiated: 0 });
  };
  
  const callStats = getCallStats();

  const goBack = () => {
    if (showingDetails) {
      // Go back to the list of bulk requests
      setSelectedRequestId(null);
      setShowingDetails(false);
    } else {
      router.back();
    }
  };
  
  // Improved animation functions for bottom sheet
  const showBottomSheet = () => {
    setErrorMessage('');
    setBottomSheetVisible(true);
    
    // Animate backdrop and sheet together
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(bottomSheetAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const hideBottomSheet = () => {
    // Dismiss keyboard if it's showing
    Keyboard.dismiss();
    
    // Animate backdrop and sheet together
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(bottomSheetAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setBottomSheetVisible(false);
    });
  };
  
  // AI qualification steps
  const qualificationSteps = [
    'Contact is added to Gromo Directory',
    'AI cold call is initiated via Twilio (voice, multilingual)',
    'AI converses, detects intent & scores interest live',
    'High-intent leads are added to your Active Leads List',
  ];
  
  const initiatePersonalizedCall = () => {
    // Validate phone number
    if (leadNumber.trim() === '') {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    
    // Here you would handle the API call to initiate the personalized call
    console.log('Initiating personalized call to:', leadNumber, 'with prompt:', customPrompt);
    
    // Close the bottom sheet
    hideBottomSheet();
    
    // Reset form fields
    setLeadNumber('');
    setCustomPrompt('');
    setErrorMessage('');
    
    // Switch to personalized tab
    setActiveTab('personalized');
  };

  // Get status color for bulk request
  const getBulkRequestStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return { bg: '#E6FFF2', text: '#047857' };
      case 'PROCESSING': return { bg: '#EEF6FF', text: '#1E40AF' };
      case 'PARTIALLY_COMPLETED': return { bg: '#FEF3C7', text: '#B45309' };
      case 'FAILED': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  // Function to view details of a specific bulk call request
  const viewRequestDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowingDetails(true);
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
        {/* Header with solid primary color */}
        <View
          className="px-5 pt-4 pb-6 flex-row justify-between items-center shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack} className="mr-3">
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              {showingDetails ? 'Call Details' : 'AI Cold Calls'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 bg-gray-50 rounded-t-3xl mt-2">
          {/* Tab Navigation - only show when not viewing details */}
          {!showingDetails && (
            <View className="flex-row px-4 pt-6 pb-2">
              <TouchableOpacity 
                className={`flex-1 py-3 ${activeTab === 'scheduled' ? 'border-b-2 border-[#1E4B88]' : 'border-b border-gray-200'}`}
                onPress={() => setActiveTab('scheduled')}
              >
                <Text 
                  className={`text-center font-semibold ${activeTab === 'scheduled' ? 'text-[#1E4B88]' : 'text-gray-500'}`}
                >
                  Scheduled Calls
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 ${activeTab === 'personalized' ? 'border-b-2 border-[#1E4B88]' : 'border-b border-gray-200'}`}
                onPress={() => setActiveTab('personalized')}
              >
                <Text 
                  className={`text-center font-semibold ${activeTab === 'personalized' ? 'text-[#1E4B88]' : 'text-gray-500'}`}
                >
                  Personalized Calls
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <ScrollView className="flex-1">
            {/* Display when showing bulk call list */}
            {!showingDetails && (
              <>
                {/* AI Cold Calls Banner */}
                <View className="mx-4 mt-4 mb-6 rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={['#1E4B88', '#27649F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-2xl p-5 shadow-lg"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-xl font-bold mb-2">
                          {activeTab === 'scheduled' ? 'Automated Lead Generation' : 'Personalized Cold Calls'}
                        </Text>
                        <Text className="text-white/85 text-sm leading-5">
                          {activeTab === 'scheduled' 
                            ? 'Our AI is making calls to your contacts and qualifying leads in real-time.'
                            : 'Target specific leads with customized AI conversations tailored to their needs.'}
                        </Text>
                        
                        <View className="flex-row mt-4">
                          <View className="bg-[#ffffff20] px-3 py-1.5 rounded-full flex-row items-center mr-3">
                            <Icon name="clock-outline" size={14} color="#4DF0C2" className="mr-1" />
                            <Text className="text-white text-xs">Today: {callRequests.length} campaigns</Text>
                          </View>
                          
                          {activeTab === 'scheduled' && callStats.initiated > 0 && (
                            <View className="bg-[#ffffff20] px-3 py-1.5 rounded-full flex-row items-center">
                              <Icon name="phone-in-talk" size={14} color="#4DF0C2" className="mr-1" />
                              <Text className="text-white text-xs">Live: {callStats.initiated}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View className="bg-[#4DF0C2] p-3 rounded-xl shadow-sm">
                        <Icon 
                          name={activeTab === 'scheduled' ? "robot" : "robot-excited"} 
                          size={30} 
                          color="#1E4B88" 
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Bulk Call Requests Section */}
                <View className="mx-4 mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-2" />
                      <Text className="text-[#1E4B88] text-lg font-bold">
                        {activeTab === 'scheduled' ? 'AI Call Campaigns' : 'Personalized Call Campaigns'}
                      </Text>
                    </View>
                    <View className="bg-[#E0F2FF] px-3 py-1 rounded-lg">
                      <Text className="text-[#1E4B88] font-medium text-sm">
                        {callRequests.length} total
                      </Text>
                    </View>
                  </View>

                  {/* Loading State */}
                  {loading && (
                    <View className="bg-white rounded-xl p-8 items-center justify-center">
                      <ActivityIndicator size="large" color={primaryColor} />
                      <Text className="text-gray-500 text-base mt-4 text-center">
                        Loading campaign data...
                      </Text>
                    </View>
                  )}
                  
                  {/* Error State */}
                  {!loading && error && (
                    <View className="bg-white rounded-xl p-8 items-center justify-center">
                      <Icon name="alert-circle-outline" size={50} color="#EF4444" />
                      <Text className="text-gray-700 text-lg mt-4 text-center font-medium">Something went wrong</Text>
                      <Text className="text-gray-500 text-sm mt-2 text-center">{error}</Text>
                      <TouchableOpacity 
                        className="mt-4 bg-[#1E4B88] px-5 py-3 rounded-lg"
                        onPress={() => window.location.reload()}
                      >
                        <Text className="text-white font-semibold">Try Again</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Bulk Call Request Cards */}
                  {!loading && !error && activeTab === 'scheduled' && callRequests.length > 0 ? (
                    callRequests.map((request) => {
                      const statusColors = getBulkRequestStatusColor(request.status);
                      const hasLiveCalls = request.summary.initiated > 0;
                      
                      return (
                        <TouchableOpacity 
                          key={request.request_id}
                          className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                          activeOpacity={0.9}
                          onPress={() => viewRequestDetails(request.request_id)}
                        >
                          <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                              <View 
                                className="w-10 h-10 rounded-lg items-center justify-center"
                                style={{ backgroundColor: '#E8F5FF' }}
                              >
                                <Icon name="phone-outline" size={20} color="#1E4B88" />
                              </View>
                              <View className="ml-3">
                                <Text className="text-[#1E4B88] font-bold">
                                  Bulk Call Campaign
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                  {formatFullDate(request.createdAt)}
                                </Text>
                              </View>
                            </View>
                            
                            <View 
                              className="px-3 py-1 rounded-full"
                              style={{ backgroundColor: statusColors.bg }}
                            >
                              <Text 
                                className="font-medium text-sm"
                                style={{ color: statusColors.text }}
                              >
                                {request.status.replace('_', ' ')}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Campaign info */}
                          <View className="bg-gray-50 rounded-xl p-3 mb-3">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-gray-500 text-xs">Total Calls:</Text>
                              <Text className="text-[#1E4B88] font-bold">{request.total_calls}</Text>
                            </View>
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-gray-500 text-xs">Completed:</Text>
                              <Text className="text-green-600 font-bold">{request.completed_calls}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-gray-500 text-xs">Failed:</Text>
                              <Text className="text-red-500 font-bold">{request.failed_calls}</Text>
                            </View>
                          </View>
                          
                          {/* Additional info and status indicators */}
                          <View className="flex-row justify-between items-center">
                            {request.additional_info ? (
                              <Text className="text-gray-500 text-xs flex-1 mr-3">
                                {request.additional_info}
                              </Text>
                            ) : (
                              <View />
                            )}
                            
                            <View className="flex-row">
                              {hasLiveCalls && (
                                <View className="bg-[#E6FFF2] px-2 py-1 rounded-full flex-row items-center mr-2">
                                  <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-1 animate-pulse" />
                                  <Text className="text-[#005E36] font-medium text-xs">
                                    {request.summary.initiated} Active
                                  </Text>
                                </View>
                              )}
                              
                              <TouchableOpacity
                                className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center"
                                onPress={() => viewRequestDetails(request.request_id)}
                              >
                                <Icon name="chevron-right" size={16} color="#1E4B88" />
                                <Text className="text-[#1E4B88] font-medium text-xs ml-1">Details</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : !loading && !error && activeTab === 'scheduled' ? (
                    <View className="bg-white rounded-xl p-8 items-center justify-center">
                      <Icon name="phone-off" size={50} color="#D1D5DB" />
                      <Text className="text-gray-500 text-base mt-4 text-center">
                        No call campaigns found.
                      </Text>
                      <TouchableOpacity 
                        className="mt-4 bg-[#1E4B88] px-5 py-3 rounded-lg"
                        onPress={showBottomSheet}
                      >
                        <Text className="text-white font-semibold">Start New Campaign</Text>
                      </TouchableOpacity>
                    </View>
                  ) : !loading && !error && activeTab === 'personalized' ? (
                    <View className="bg-white rounded-xl p-8 items-center justify-center">
                      <Icon name="phone-off" size={50} color="#D1D5DB" />
                      <Text className="text-gray-500 text-base mt-4 text-center">
                        No personalized calls found.
                      </Text>
                      <TouchableOpacity 
                        className="mt-4 bg-[#1E4B88] px-5 py-3 rounded-lg"
                        onPress={showBottomSheet}
                      >
                        <Text className="text-white font-semibold">Start New Call</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Stats Card */}
                {!loading && !error && callRequests.length > 0 && (
                  <View className="mx-4 mb-6 bg-[#E8FDF7] rounded-xl p-5 shadow-sm">
                    <Text className="text-[#1E4B88] text-base font-bold mb-3">Call Performance</Text>
                    
                    <View className="flex-row justify-between mb-2">
                      <View className="bg-white/60 rounded-lg p-3 flex-1 mr-2">
                        <View className="flex-row items-center mb-1">
                          <Icon name="phone-outgoing" size={16} color="#1E4B88" />
                          <Text className="text-gray-600 text-xs ml-1">Total Calls</Text>
                        </View>
                        <Text className="text-[#1E4B88] text-xl font-bold">{callStats.total}</Text>
                      </View>
                      
                      <View className="bg-white/60 rounded-lg p-3 flex-1 ml-2">
                        <View className="flex-row items-center mb-1">
                          <Icon name="account-check" size={16} color="#22C55E" />
                          <Text className="text-gray-600 text-xs ml-1">Completed</Text>
                        </View>
                        <Text className="text-[#1E4B88] text-xl font-bold">{callStats.completed}</Text>
                      </View>
                    </View>
                    
                    <View className="bg-white/60 rounded-lg p-3">
                      <View className="flex-row items-center mb-1">
                        <Icon name="speedometer" size={16} color="#FF9800" />
                        <Text className="text-gray-600 text-xs ml-1">Success Rate</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-[#1E4B88] text-xl font-bold">
                          {callStats.total > 0 ? `${Math.round((callStats.completed / callStats.total) * 100)}%` : '0%'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Display when showing detailed call list for a specific bulk request */}
            {showingDetails && selectedRequestId && (
              <>
                {/* Selected bulk request information */}
                {(() => {
                  const request = getSelectedBulkRequest();
                  if (!request) return null;
                  
                  const statusColors = getBulkRequestStatusColor(request.status);
                  const callsData = getCallsForSelectedRequest();
                  
                  return (
                    <>
                      {/* Campaign Info Card */}
                      <View className="mx-4 mt-4 mb-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-[#1E4B88] text-lg font-bold">Campaign Summary</Text>
                          <View 
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: statusColors.bg }}
                          >
                            <Text 
                              className="font-medium text-sm"
                              style={{ color: statusColors.text }}
                            >
                              {request.status.replace('_', ' ')}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="bg-gray-50 rounded-xl p-4 mb-3">
                          <View className="flex-row mb-2">
                            <View className="flex-1">
                              <Text className="text-gray-500 text-xs">Total Calls</Text>
                              <Text className="text-[#1E4B88] text-xl font-bold">{request.total_calls}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-500 text-xs">Completed</Text>
                              <Text className="text-green-600 text-xl font-bold">{request.completed_calls}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-500 text-xs">Failed</Text>
                              <Text className="text-red-500 text-xl font-bold">{request.failed_calls}</Text>
                            </View>
                          </View>
                          
                          <View className="pt-2 border-t border-gray-200">
                            <Text className="text-gray-500 text-xs mb-1">Campaign started:</Text>
                            <Text className="text-gray-700 font-medium">{formatFullDate(request.createdAt)}</Text>
                          </View>
                        </View>
                        
                        {/* Performance Metrics */}
                        <Text className="text-[#1E4B88] font-bold mb-2">Performance Metrics</Text>
                        <View className="flex-row justify-between mb-1">
                          <View className="flex-row items-center">
                            <Icon name="check-circle-outline" size={14} color="#047857" />
                            <Text className="text-gray-600 text-xs ml-1">Completion Rate:</Text>
                          </View>
                          <Text className="text-[#047857] font-bold">{request.performance_metrics.completion_rate}</Text>
                        </View>
                        <View className="flex-row justify-between mb-1">
                          <View className="flex-row items-center">
                            <Icon name="phone-check" size={14} color="#1E40AF" />
                            <Text className="text-gray-600 text-xs ml-1">Answer Rate:</Text>
                          </View>
                          <Text className="text-[#1E40AF] font-bold">{request.performance_metrics.answer_rate}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <View className="flex-row items-center">
                            <Icon name="chart-line-variant" size={14} color="#B45309" />
                            <Text className="text-gray-600 text-xs ml-1">Success Rate:</Text>
                          </View>
                          <Text className="text-[#B45309] font-bold">{request.performance_metrics.success_rate}</Text>
                        </View>
                      </View>
                      
                      {/* Individual Calls List */}
                      <View className="mx-4 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-2" />
                            <Text className="text-[#1E4B88] text-lg font-bold">Individual Calls</Text>
                          </View>
                          <View className="bg-[#E0F2FF] px-3 py-1 rounded-lg">
                            <Text className="text-[#1E4B88] font-medium text-sm">
                              {callsData.length} calls
                            </Text>
                          </View>
                        </View>
                        
                        {/* Call Cards */}
                        {callsData.length > 0 ? (
                          callsData.map((call) => (
                            <TouchableOpacity 
                              key={call.id}
                              className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                              activeOpacity={0.9}
                              onPress={() => {
                                // If there's a conversation_id, navigate to AI call analysis
                                if (call.conversation_id) {
                                  router.push({
                                    pathname: '/ai-call-analysis',
                                    params: { 
                                      conversationId: call.conversation_id,
                                      callSid: call.callSid,      
                                      leadName: leadInfo[call.id]?.contact?.name || call.name,
                                      phoneNumber: call.phone,
                                      location: call.location || 'Not specified'
                                    }
                                  });
                                }
                              }}
                            >
                              <View className="flex-row items-center">
                                <View className="relative">
                                  {typeof call.avatar === 'string' ? (
                                    <View 
                                      className="w-14 h-14 rounded-full border-2 border-gray-100 items-center justify-center"
                                      style={{ backgroundColor: getAvatarColor(call.id) }}
                                    >
                                      <Text className="text-white text-xl font-bold">{call.name[0]}</Text>
                                    </View>
                                  ) : (
                                    <Image source={call.avatar} className="w-14 h-14 rounded-full border-2 border-gray-100" />
                                  )}
                                  <View className="absolute bottom-0 right-0 bg-[#4DF0A9] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                                    {call.status === 'live' ? (
                                      <Icon name="phone" size={10} color="#005E36" />
                                    ) : call.status === 'completed' ? (
                                      <Icon name="check" size={10} color="#005E36" />
                                    ) : (
                                      <Icon name="close" size={10} color="#005E36" />
                                    )}
                                  </View>
                                </View>
                                
                                <View className="ml-4 flex-1">
                                  <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-[#1E4B88] text-lg font-bold">
                                      {leadInfo[call.id]?.contact?.name || call.name}
                                    </Text>
                                    {call.status === 'live' ? (
                                      <View className="bg-[#E6FFF2] px-3 py-1 rounded-full flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-2 animate-pulse" />
                                        <Text className="text-[#005E36] font-medium text-sm">Live</Text>
                                      </View>
                                    ) : call.status === 'completed' ? (
                                      <View className="bg-blue-50 px-3 py-1 rounded-full">
                                        <Text className="text-blue-600 font-medium text-sm">Completed</Text>
                                      </View>
                                    ) : (
                                      <View className="bg-red-50 px-3 py-1 rounded-full">
                                        <Text className="text-red-600 font-medium text-sm">Failed</Text>
                                      </View>
                                    )}
                                  </View>
                                  
                                  
                                  
                                  {call.status === 'live' ? (
                                    <View className="flex-row items-center mt-2 bg-red-50 px-2 py-1 rounded-md self-start">
                                      <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                                      <Text className="text-gray-700 text-xs">Recording </Text>
                                      <Text className="text-gray-900 font-medium text-xs">{call.duration}</Text>
                                    </View>
                                  ) : call.status === 'completed' && call.leadScore ? (
                                    <View className="flex-row items-center mt-2 bg-green-50 px-2 py-1 rounded-md self-start">
                                      <Icon name="chart-line-variant" size={14} color="#22C55E" />
                                      <Text className="text-gray-900 font-medium text-xs ml-1">Lead Score: {call.leadScore}</Text>
                                    </View>
                                  ) : call.error ? (
                                    <View className="flex-row items-center mt-2 bg-red-50 px-2 py-1 rounded-md self-start">
                                      <Icon name="alert-circle-outline" size={14} color="#EF4444" />
                                      <Text className="text-gray-900 font-medium text-xs ml-1 flex-1">
                                        {call.error.substring(0, 40)}{call.error.length > 40 ? '...' : ''}
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              </View>
                              
                              <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-100">
                                <View className="flex-row items-center">
                                  <Icon name="phone-outgoing" size={14} color="#6B7280" />
                                  <Text className="text-gray-500 text-xs ml-1">
                                    {formatDate(call.createdAt)}
                                  </Text>
                                </View>
                              
                                <View className="flex-row">
                                  <TouchableOpacity className="flex-row items-center px-3 py-1.5 mr-3">
                                    <Icon name="information-outline" size={16} color="#1E4B88" />
                                    <Text className="text-[#1E4B88] font-medium text-xs ml-1">Details</Text>
                                  </TouchableOpacity>
                                  
                                  {call.status === 'live' ? (
                                    <TouchableOpacity className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-md">
                                      <Icon name="phone-off" size={16} color="#EF4444" />
                                      <Text className="text-red-500 font-medium text-xs ml-1">End Call</Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <TouchableOpacity className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-md">
                                      <Icon name="text-box-outline" size={16} color="#1E4B88" />
                                      <Text className="text-[#1E4B88] font-medium text-xs ml-1">View Report</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>
                          )) ): (
                            <View className="bg-white rounded-xl p-8 items-center justify-center">
                              <Icon name="phone-off" size={50} color="#D1D5DB" />
                              <Text className="text-gray-500 text-base mt-4 text-center">
                                No call details available.
                              </Text>
                            </View>
                          )}
                      </View>
                    </>
                  );
                })()}
              </>
            )}
            
            {/* AI Qualification Process - only show on main page */}
            {!showingDetails && (
              <View className="mx-4 mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-4">
                  <View className="bg-[#E8FDF7] p-2.5 rounded-lg mr-3">
                    <Icon name="robot" size={22} color="#1E4B88" />
                  </View>
                  <Text className="text-[#1E4B88] text-lg font-bold flex-1">
                    How AI Qualifies Your Leads
                  </Text>
                </View>
                
                <Text className="text-gray-600 mb-5 leading-5">
                  Our AI conducts natural conversations to identify high-intent prospects before they reach your dashboard.
                </Text>
                
                {/* Qualification Steps */}
                <View className="bg-[#F8FAFC] rounded-xl p-4">
                  {qualificationSteps.map((step, index) => (
                    <View key={index} className="flex-row mb-4 last:mb-0">
                      <View className="mr-3">
                        <LinearGradient
                          colors={['#1E4B88', '#2764A0']}
                          className="rounded-full w-7 h-7 items-center justify-center"
                        >
                          <Text className="text-white text-xs font-bold">{index + 1}</Text>
                        </LinearGradient>
                        
                        {index < qualificationSteps.length - 1 && (
                          <View className="absolute top-7 bottom-0 left-3.5 w-0.5 h-full bg-gray-200 -z-10" />
                        )}
                      </View>
                      
                      <View className="flex-1 pt-1">
                        <Text className="text-gray-700 leading-5">{step}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity 
                  className="mt-4 border border-[#1E4B88] rounded-lg py-3 items-center"
                  onPress={showBottomSheet}
                >
                  <Text className="text-[#1E4B88] font-bold">Start New Call</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Floating Action Button - only show when not in details view */}
        {!showingDetails && (
          <TouchableOpacity 
            className="absolute bottom-6 right-6 bg-[#1E4B88] w-14 h-14 rounded-full items-center justify-center shadow-lg"
            activeOpacity={0.8}
            onPress={showBottomSheet}
          >
            <Icon name="plus" size={30} color="white" />
          </TouchableOpacity>
        )}
        
        {/* Bottom Sheet - keeping this as is */}
        {bottomSheetVisible && (
          <View 
            className="absolute inset-0 flex-1"
            pointerEvents="box-none"
          >
            {/* Backdrop */}
            <Animated.View 
              className="absolute inset-0 bg-black/60"
              style={{ opacity: backdropOpacity }}
            >
              <TouchableWithoutFeedback onPress={hideBottomSheet}>
                <View className="flex-1" />
              </TouchableWithoutFeedback>
            </Animated.View>
            
            {/* Bottom Sheet Content */}
            <Animated.View 
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
              style={{
                transform: [{ translateY: bottomSheetAnim }],
                maxHeight: height * 0.85,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 10,
              }}
            >
              {/* Handle Bar */}
              <View className="items-center pt-2 pb-4">
                <View className="w-12 h-1.5 rounded-full bg-gray-300" />
              </View>
              
              {/* Content */}
              <ScrollView 
                className="px-6"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-[#1E4B88] text-xl font-bold">New Personalized Call</Text>
                  <TouchableOpacity 
                    onPress={hideBottomSheet}
                    className="h-10 w-10 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Icon name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <Text className="text-gray-700 font-medium mb-2">Lead Phone Number</Text>
                <View className={`flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-1 ${errorMessage ? 'border border-red-400' : ''}`}>
                  <Icon name="phone" size={20} color={errorMessage ? "#EF4444" : "#6B7280"} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800"
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={leadNumber}
                    onChangeText={(text) => {
                      setLeadNumber(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </View>
                
                {errorMessage ? (
                  <Text className="text-red-500 text-xs ml-1 mb-3">{errorMessage}</Text>
                ) : (
                  <Text className="text-gray-400 text-xs ml-1 mb-3">Example: +91 9876543210</Text>
                )}
                
                <Text className="text-gray-700 font-medium mb-2">Custom AI Prompt (Optional)</Text>
                <View className="bg-gray-100 rounded-lg px-4 py-3 mb-2">
                  <TextInput
                    className="text-gray-800"
                    placeholder="Give specific instructions to the AI..."
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    style={{ height: 100 }}
                  />
                </View>
                <Text className="text-gray-400 text-xs ml-1 mb-4">
                  Example: "Ask about their retirement planning needs" or "Focus on child education plans"
                </Text>
                
                {/* Example prompts */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-medium mb-2">Suggested Prompts</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="pb-2"
                  >
                    {[
                      "Focus on retirement planning",
                      "Discuss health insurance benefits",
                      "Highlight tax saving options",
                      "Check interest in child education plans",
                    ].map((prompt, index) => (
                      <TouchableOpacity 
                        key={index}
                        className="bg-blue-50 py-2 px-4 rounded-full mr-2 border border-blue-100"
                        onPress={() => setCustomPrompt(prompt)}
                      >
                        <Text className="text-[#1E4B88]">{prompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View className="bg-blue-50 rounded-lg p-4 mb-6">
                  <View className="flex-row items-start">
                    <Icon name="information-outline" size={20} color="#1E4B88" />
                    <Text className="text-gray-700 text-sm ml-2 flex-1">
                      Personalized calls use AI to have targeted conversations based on your custom instructions. This helps approach specific leads with tailored messaging.
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  className="bg-[#1E4B88] rounded-lg py-4 items-center mb-8"
                  onPress={initiatePersonalizedCall}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <Icon name="phone-plus" size={20} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-base">Make Personalized Call</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default AIColdCallsScreen;