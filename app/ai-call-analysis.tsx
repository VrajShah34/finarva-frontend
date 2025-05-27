import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function AICallAnalysisScreen() {
  const primaryColor = '#04457E'; // Define primaryColor (blue)
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <>
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
          <Stack.Screen options={{ 
            headerShown: false,
            animation: 'slide_from_right',
            statusBarStyle: 'light', // For iOS
          }} />
      
      {/* Header */}
      <View className="bg-primary py-5 px-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Gromo+</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        {/* AI Call Analysis Header */}
        <View className='bg-gray-50'>
        <View className="bg-primary m-4 rounded-lg p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-bold">AI Call Analysis</Text>
            <Text className="text-white text-xs opacity-80">Analysis of Call to Ramesh Patil, With AI</Text>
          </View>
          <TouchableOpacity className="bg-[#18FFAA] w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="refresh" size={20} color="primary" />
          </TouchableOpacity>
        </View>
        
        {/* Lead Info Card */}
        <View className="bg-white mx-4 rounded-lg p-4 shadow-sm">
          <View className="flex-row justify-between items-start">
            <View className="flex-row items-center">
              <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="white" />
              </View>
              <View>
                <Text className="font-bold text-lg text-gray-800">Ramesh Patil</Text>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={14} color="#18FFAA" />
                  <Text className="text-gray-500 ml-1 text-sm">Pune, Maharashtra</Text>
                </View>
              </View>
            </View>
            
            <View className="items-end">
              <View className="bg-[#18FFAA] px-3 py-1 rounded-full mb-1">
                <Text className="text-primary font-medium text-sm">Warm Lead</Text>
              </View>
              <Text className="text-gray-500 text-sm">Active List</Text>
            </View>
          </View>
          
          {/* Call Details */}
          <View className="flex-row flex-wrap justify-between mt-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="call" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Call Duration:</Text>
                <Text className="text-sm font-medium">2 min 47 sec</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="language" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Language:</Text>
                <Text className="text-sm font-medium">Marathi</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="star-circle" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Lead Score:</Text>
                <Text className="text-sm font-medium text-green-500">84/100</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="check-circle" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Action Taken:</Text>
                <Text className="text-sm font-medium">Added to List</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="time" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Follow-up:</Text>
                <Text className="text-sm font-medium">In 2 days</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="person" size={16} color="primary" />
              <View className="ml-2">
                <Text className="text-xs text-gray-500">Advisor Pref:</Text>
                <Text className="text-sm font-medium">Female</Text>
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
        
        {showTranscript && (
          <View className="bg-white mx-4 px-4 pb-4 rounded-b-lg shadow-sm">
            <Text className="text-gray-800 mb-2">
              <Text className="font-bold">Agent:</Text> Hello Ramesh, this is Priya from GroMo. How are you doing today?
            </Text>
            <Text className="text-gray-800 mb-2">
              <Text className="font-bold">Ramesh:</Text> I'm doing well, thanks for asking.
            </Text>
            <Text className="text-gray-800 mb-2">
              <Text className="font-bold">Agent:</Text> I'm calling to discuss health insurance options for you and your family.
            </Text>
            <Text className="text-gray-800">
              <Text className="font-bold">Ramesh:</Text> Yes, I've been thinking about getting health insurance. Can you tell me about the policy options?
            </Text>
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
          
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 text-xs mb-1">Intent Detection</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-gray-800">92%</Text>
                <Text className="text-[#18FFAA] text-xs">Health Insurance</Text>
              </View>
              <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '92%' }}></View>
              </View>
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 text-xs mb-1">Response Latency Avg</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-gray-800">1.4s</Text>
                <Text className="text-[#18FFAA] text-xs">Engaged</Text>
              </View>
              <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '80%' }}></View>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 text-xs mb-1">Tone Score</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-gray-800">+7.2</Text>
                <Text className="text-[#18FFAA] text-xs">Positive</Text>
              </View>
              <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '72%' }}></View>
              </View>
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 text-xs mb-1">Keyword Density</Text>
              <View>
                <Text className="font-bold text-gray-800">"insurance" 5x</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-xs mr-1">policy 3x,</Text>
                  <Text className="text-gray-500 text-xs">premium 1x</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 text-xs mb-1">Objection Count</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-gray-800">0</Text>
                <Text className="text-[#18FFAA] text-xs">None</Text>
              </View>
              <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '0%' }}></View>
              </View>
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 text-xs mb-1">Speech Clarity</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-gray-800">89%</Text>
                <Text className="text-[#18FFAA] text-xs">Clear</Text>
              </View>
              <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '89%' }}></View>
              </View>
            </View>
          </View>
          
          <View className="mt-4">
            <Text className="text-gray-500 text-xs mb-1">AI Confidence</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-lg text-gray-800">91.6%</Text>
            </View>
            <View className="bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
              <View className="bg-[#18FFAA] h-full rounded-full" style={{ width: '91.6%' }}></View>
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
          
          <View className="mb-3 flex-row">
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="sync" size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium">Suggested Action:</Text>
              <Text className="text-gray-600">Call Ramesh within 2 days using a female advisor.</Text>
            </View>
          </View>
          
          <View className="mb-3 flex-row">
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="cart" size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium">Product Pitch:</Text>
              <Text className="text-gray-600">Health Insurance – Start with family coverage plans.</Text>
            </View>
          </View>
          
          <View className="mb-3 flex-row">
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="language" size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium">Language Setting:</Text>
              <Text className="text-gray-600">Set default language as Marathi for future interactions.</Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="pricetag" size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium">CRM Tag:</Text>
              <Text className="text-gray-600">#WarmLead #FemaleAdvisor #Pune #HealthInsurance</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="px-4 mb-24">
          <TouchableOpacity className="bg-primary p-4 rounded-lg flex-row justify-center items-center mb-3">
            <Ionicons name="calendar" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Schedule Callback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-[#18FFAA] p-4 rounded-lg flex-row justify-center items-center mb-3">
            <Ionicons name="call" size={20} color="primary" />
            <Text className="text-primary font-medium ml-2">Call Lead</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white border border-primary p-4 rounded-lg flex-row justify-center items-center">
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