import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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

const primaryColor = "#04457E";
const { height, width } = Dimensions.get('window');

const AIColdCallsScreen = () => {
  // State for tab selection - keeping this as is
  const [activeTab, setActiveTab] = useState('scheduled');
  
  // Bottom sheet state and animation
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [leadNumber, setLeadNumber] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Active calls data
  const activeCalls = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      language: 'Hindi speaking',
      status: 'live',
      duration: '00:45',
      isRecording: true,
      avatar: require('../assets/images/react-logo.png'),
      type: 'scheduled'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      location: 'Pune',
      language: 'Marathi speaking',
      status: 'completed',
      leadScore: '92/100',
      avatar: require('../assets/images/react-logo.png'),
      type: 'scheduled'
    },
    {
      id: '3',
      name: 'Sameer Patel',
      location: 'Delhi',
      language: 'Hindi speaking',
      status: 'live',
      duration: '01:12',
      isRecording: true,
      avatar: require('../assets/images/react-logo.png'),
      type: 'personalized'
    },
    {
      id: '4',
      name: 'Anjali Desai',
      location: 'Bangalore',
      language: 'English speaking',
      status: 'completed',
      leadScore: '87/100',
      avatar: require('../assets/images/react-logo.png'),
      type: 'personalized'
    },
  ];

  // AI qualification steps
  const qualificationSteps = [
    'Contact is added to Gromo Directory',
    'AI cold call is initiated via Twilio (voice, multilingual)',
    'AI converses, detects intent & scores interest live',
    'High-intent leads are added to your Active Leads List',
  ];

  const goBack = () => {
    router.back();
  };
  
  // Filter calls based on active tab
  const filteredCalls = activeCalls.filter(call => call.type === activeTab);
  
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
  
  // Prevent any outside touches from propagating when bottom sheet is visible
  useEffect(() => {
    if (bottomSheetVisible) {
      const backHandler = () => {
        hideBottomSheet();
        return true;
      };
      
      // Here you would set up a back handler for Android
      // BackHandler.addEventListener('hardwareBackPress', backHandler);
      
      return () => {
        // BackHandler.removeEventListener('hardwareBackPress', backHandler);
      };
    }
  }, [bottomSheetVisible]);
  
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
        {/* Header with solid primary color - REMOVED gradient */}
        <View
          className="px-5 pt-4 pb-6 flex-row justify-between items-center shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack} className="mr-3">
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">AI Cold Calls</Text>
          </View>
         
        </View>

        {/* Content */}
        <View className="flex-1 bg-gray-50 rounded-t-3xl mt-2">
          {/* Tab Navigation */}
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
          
          <ScrollView className="flex-1">
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
                        <Text className="text-white text-xs">Today: {filteredCalls.length} calls</Text>
                      </View>
                      <View className="bg-[#ffffff20] px-3 py-1.5 rounded-full flex-row items-center">
                        <Icon name="flag-outline" size={14} color="#4DF0C2" className="mr-1" />
                        <Text className="text-white text-xs">
                          {filteredCalls.filter(call => call.status === 'completed').length} qualified
                        </Text>
                      </View>
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

            {/* Active AI Calls Section */}
            <View className="mx-4 mb-3">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-2" />
                  <Text className="text-[#1E4B88] text-lg font-bold">
                    {activeTab === 'scheduled' ? 'Active Scheduled Calls' : 'Active Personalized Calls'}
                  </Text>
                </View>
                <View className="bg-[#E0F2FF] px-3 py-1 rounded-lg">
                  <Text className="text-[#1E4B88] font-medium text-sm">
                    {filteredCalls.filter(call => call.status === 'live').length} in progress
                  </Text>
                </View>
              </View>

              {/* Call Cards */}
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call) => (
                  <TouchableOpacity 
                    key={call.id} 
                    className="mb-4 bg-white rounded-2xl p-4 shadow-md border border-gray-100"
                    activeOpacity={0.9}
                  >
                    <View className="flex-row items-center">
                      <View className="relative">
                        <Image source={call.avatar} className="w-14 h-14 rounded-full border-2 border-gray-100" />
                        <View className="absolute bottom-0 right-0 bg-[#4DF0A9] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                          {call.status === 'live' ? (
                            <Icon name="phone" size={10} color="#005E36" />
                          ) : (
                            <Icon name="check" size={10} color="#005E36" />
                          )}
                        </View>
                      </View>
                      
                      <View className="ml-4 flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-[#1E4B88] text-lg font-bold">{call.name}</Text>
                          {call.status === 'live' ? (
                            <View className="bg-[#E6FFF2] px-3 py-1 rounded-full flex-row items-center">
                              <View className="w-2 h-2 rounded-full bg-[#4DF0A9] mr-2 animate-pulse" />
                              <Text className="text-[#005E36] font-medium text-sm">Live</Text>
                            </View>
                          ) : (
                            <View className="bg-blue-50 px-3 py-1 rounded-full">
                              <Text className="text-blue-600 font-medium text-sm">Completed</Text>
                            </View>
                          )}
                        </View>
                        
                        <Text className="text-gray-500 text-sm">
                          {call.location} • {call.language}
                        </Text>
                        
                        {call.isRecording ? (
                          <View className="flex-row items-center mt-2 bg-red-50 px-2 py-1 rounded-md self-start">
                            <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                            <Text className="text-gray-700 text-xs">Recording </Text>
                            <Text className="text-gray-900 font-medium text-xs">{call.duration}</Text>
                          </View>
                        ) : call.leadScore ? (
                          <View className="flex-row items-center mt-2 bg-green-50 px-2 py-1 rounded-md self-start">
                            <Icon name="chart-line-variant" size={14} color="#22C55E" />
                            <Text className="text-gray-900 font-medium text-xs ml-1">Lead Score: {call.leadScore}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    
                    <View className="flex-row justify-end mt-3 pt-2 border-t border-gray-100">
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
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-white rounded-xl p-8 items-center justify-center">
                  <Icon name="phone-off" size={50} color="#D1D5DB" />
                  <Text className="text-gray-500 text-base mt-4 text-center">
                    No {activeTab} calls in progress.
                  </Text>
                  <TouchableOpacity 
                    className="mt-4 bg-[#1E4B88] px-5 py-3 rounded-lg"
                    onPress={showBottomSheet}
                  >
                    <Text className="text-white font-semibold">Start New Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Stats Card */}
            <View className="mx-4 mb-6 bg-[#E8FDF7] rounded-xl p-5 shadow-sm">
              <Text className="text-[#1E4B88] text-base font-bold mb-3">This Week's Performance</Text>
              
              <View className="flex-row justify-between mb-2">
                <View className="bg-white/60 rounded-lg p-3 flex-1 mr-2">
                  <View className="flex-row items-center mb-1">
                    <Icon name="phone-outgoing" size={16} color="#1E4B88" />
                    <Text className="text-gray-600 text-xs ml-1">Total Calls</Text>
                  </View>
                  <Text className="text-[#1E4B88] text-xl font-bold">42</Text>
                </View>
                
                <View className="bg-white/60 rounded-lg p-3 flex-1 ml-2">
                  <View className="flex-row items-center mb-1">
                    <Icon name="account-check" size={16} color="#22C55E" />
                    <Text className="text-gray-600 text-xs ml-1">Qualified</Text>
                  </View>
                  <Text className="text-[#1E4B88] text-xl font-bold">18</Text>
                </View>
              </View>
              
              <View className="bg-white/60 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <Icon name="speedometer" size={16} color="#FF9800" />
                  <Text className="text-gray-600 text-xs ml-1">Qualification Rate</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-[#1E4B88] text-xl font-bold">42.8%</Text>
                  <View className="flex-row items-center ml-2">
                    <Icon name="arrow-up" size={12} color="#22C55E" />
                    <Text className="text-[#22C55E] text-xs">5.2%</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* AI Qualification Process */}
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
          </ScrollView>
        </View>

        {/* Floating Action Button - keeping this as is */}
        <TouchableOpacity 
          className="absolute bottom-6 right-6 bg-[#1E4B88] w-14 h-14 rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.8}
          onPress={showBottomSheet}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
        
        {/* Improved Bottom Sheet */}
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