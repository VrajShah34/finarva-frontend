import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AICopilotScreen = () => {
  const navigation = useNavigation();
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(23); // seconds
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prevDuration => prevDuration + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Lead data
  const currentLead = {
    name: 'Ramesh Pawar',
    age: 38,
    gender: 'Male',
    location: 'Pune',
    languages: ['Hindi', 'Marathi'],
    preference: 'Prefers Female Advisor',
    leadScore: 89,
    interestedIn: 'Health Insurance',
    avgPremium: '₹8k'
  };
  
  // AI suggestions
  const aiSuggestions = [
    {
      type: 'empathy',
      text: 'Try empathizing: "Sir, I understand your concern about premiums..."',
      highlighted: true
    },
    {
      type: 'info',
      text: 'Mention our 97% claim settlement rate',
      highlighted: false
    },
    {
      type: 'question',
      text: 'Ask: "What\'s most important to you in a health plan?"',
      highlighted: false
    }
  ];
  
  // Next leads
  const nextLeads = [
    {
      name: 'Sunita Joshi',
      location: 'Mumbai',
      language: 'Hindi',
      leadScore: 87,
      product: 'Term Life'
    },
    {
      name: 'Imran Shaikh',
      location: 'Nagpur',
      language: 'Marathi',
      leadScore: 81,
      product: 'Health'
    },
    {
      name: 'Priya Sinh',
      location: 'Pune',
      language: 'Hindi',
      leadScore: 79,
      product: 'Health'
    }
  ];

  return (
   <>
         <StatusBar 
           backgroundColor = "primary" 
           barStyle="light-content" 
           translucent={true}
         />
               
         <SafeAreaView 
           edges={['right', 'left','top']} 
           className="flex-1 bg-gray-50"
           style={{ backgroundColor: "primary"}}
         >
      
      {/* App Bar */}
      {/* <View className="h-14 bg-primary flex-row items-center justify-between px-4">
        <Text className="text-white text-xl font-bold">Gromo+</Text>
        <TouchableOpacity>
          <Icon name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View> */}
      <View className='flex-1 bg-gray-50'>
      <ScrollView className="flex-1">
        {/* Smart Call Assistant */}
        <View className="bg-primary p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">Smart Call Assistant</Text>
            <Text className="text-blue-200 text-sm">Let AI guide your conversation</Text>
          </View>
          
        </View>
        
        {/* Current Customer Card */}
        <View className="bg-white mx-4 -mt-2 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-15 h-15 rounded-full bg-blue-50 justify-center items-center">
              <Icon name="account" size={40} color="#1E4B88" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 text-lg font-bold">{currentLead.name}</Text>
              <View className="flex-row items-center">
                <Icon name="map-marker" size={16} color="#4CAF50" />
                <Text className="text-gray-500 text-sm ml-1">{currentLead.location}</Text>
                <Icon name="fire" size={16} color="#FF9800" className="ml-3" />
                <Text className="text-gray-500 text-sm ml-1">{currentLead.leadScore}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Call Lead Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center mb-3 mt-4">
            <Icon name="headset" size={20} color="#4CAF50" />
            <Text className="text-blue-800 text-lg font-bold ml-2">Call Lead</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-15 h-15 rounded-full bg-blue-50 justify-center items-center">
                <Icon name="account" size={40} color="#1E4B88" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-blue-800 text-lg font-bold">{currentLead.name}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm">Age: {currentLead.age}</Text>
                  <Text className="text-gray-500 mx-2">|</Text>
                  <Text className="text-gray-500 text-sm">{currentLead.gender}</Text>
                </View>
              </View>
            </View>
            
            <View className="mt-3">
              <View className="flex-row items-center flex-wrap mb-2">
                <Icon name="map-marker" size={16} color="#4CAF50" />
                <Text className="text-gray-500 text-sm ml-1">{currentLead.location}</Text>
                
                <View className="flex-row items-center ml-4">
                  <Icon name="translate" size={16} color="#2196F3" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {currentLead.languages.join(', ')}
                  </Text>
                </View>
                
                <View className="flex-row items-center ml-4">
                  <Icon name="account-supervisor" size={16} color="#9C27B0" />
                  <Text className="text-gray-500 text-sm ml-1">{currentLead.preference}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Icon name="fire" size={16} color="#FF9800" />
                <Text className="text-gray-500 text-sm ml-1">Lead Score: {currentLead.leadScore}/100</Text>
              </View>
              
              <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
                <Text className="text-blue-800 text-sm font-medium">Interested: {currentLead.interestedIn}</Text>
                <Text className="text-blue-800 text-sm font-medium">Avg. Premium: {currentLead.avgPremium}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* AI Suggestions Section */}
        <View className="px-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Icon name="robot" size={20} color="#4CAF50" />
              <Text className="text-blue-800 text-lg font-bold ml-2">AI Suggestions</Text>
            </View>
            <Switch
              value={aiSuggestionsEnabled}
              onValueChange={setAiSuggestionsEnabled}
              trackColor={{ false: '#DDD', true: '#4CAF5080' }}
              thumbColor={aiSuggestionsEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          
          <View className="mb-2">
            {aiSuggestions.map((suggestion, index) => (
              <View 
                key={index} 
                className={`p-3 rounded-lg mb-2 border-l-4 ${
                  suggestion.highlighted 
                    ? 'bg-secondary border-green-700' 
                    : 'bg-white border-blue-800'
                }`}
              >
                <Text className={`text-base ${
                  suggestion.highlighted 
                    ? 'text-primary font-medium' 
                    : 'text-blue-800'
                }`}>
                  {suggestion.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Next Lead Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Icon name="arrow-right" size={20} color="#4CAF50" />
            <Text className="text-blue-800 text-lg font-bold ml-2">Next Lead to Call</Text>
          </View>
          
          <View className="flex-row justify-between">
            {nextLeads.map((lead, index) => (
              <View key={index} className="bg-white rounded-lg p-3 w-[31%] shadow-sm">
                <Text className="text-blue-800 text-base font-bold">{lead.name}</Text>
                <View className="flex-row justify-between items-center my-1">
                  <Text className="text-gray-500 text-xs flex-1">{lead.location}, {lead.language}</Text>
                  <View className="flex-row items-center">
                    <Icon name="fire" size={14} color="#FF9800" />
                    <Text className="text-gray-500 text-xs ml-0.5">{lead.leadScore}</Text>
                  </View>
                </View>
                <Text className="text-blue-700 text-sm font-medium">{lead.product}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      </View>
      
      {/* Call Control Footer */}
      <View className="flex-row justify-between items-center p-4 bg-white border-t border-gray-100">
        <TouchableOpacity className="w-14 h-14 rounded-full bg-green-500 justify-center items-center">
          <Icon name="microphone" size={28} color="white" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-800">{formatDuration(callDuration)}</Text>
          <Text className="text-gray-500 text-xs">Duration</Text>
        </View>
        
        <TouchableOpacity className="w-14 h-14 rounded-full bg-red-500 justify-center items-center">
          <Icon name="phone-hangup" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
  );
};

export default AICopilotScreen;