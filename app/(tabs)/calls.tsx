import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define primary color as a constant
const primaryColor = "#04457E";

type LeadType = {
  id: number;
  name: string;
  age: number;
  location: string;
  interest: string;
  interestScore: number;
  match: number;
  language: string;
  advisorGender: string;
  category: string;
  premium: number;
  avatarColor: string;
};

export default function CallsScreen() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(['Pune', 'Health']);

  // Set status bar effect
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(primaryColor);
      StatusBar.setBarStyle('light-content');
    }
    return () => {};
  }, []);
  
  const leads: LeadType[] = [
    {
      id: 1,
      name: 'Ramesh',
      age: 38,
      location: 'Pune',
      interest: 'Wants to learn more about',
      interestScore: 89,
      match: 91,
      language: 'Hindi',
      advisorGender: 'Female',
      category: 'Health Insurance',
      premium: 8000,
      avatarColor: '#4f46e5',
    },
    {
      id: 2,
      name: 'Priya',
      age: 32,
      location: 'Mumbai',
      interest: 'Wants coverage for',
      interestScore: 92,
      match: 95,
      language: 'Hindi',
      advisorGender: 'Male',
      category: 'Term Life',
      premium: 12000,
      avatarColor: '#8b5cf6',
    }
  ];
  
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleBack = () => {
    router.back();
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
        style={{ flex: 1, backgroundColor: primaryColor }}
      >
        {/* Fix the header with proper styling */}
        <Stack.Screen 
          options={{ 
            headerShown: false,
            title: "Buy Leads",
            statusBarStyle: 'light',
            headerStyle: { backgroundColor: primaryColor },
          }} 
        />
        
        {/* Header */}
        <View style={{ backgroundColor: primaryColor }} className="py-5 px-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            
            <Text className="text-white text-xl font-bold pl-3">Gromo+</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Content Area */}
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">
            <View className="px-5 py-6">
              {/* Header with avatar - improved spacing */}
              <View className="flex-row items-center mb-6">
                <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#18FFAA]">
                  <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text style={{ color: primaryColor }} className="text-xl font-bold">Buy Leads</Text>
                  <Text className="text-gray-600 text-sm">
                    AI-curated, high-intent prospects selected for you
                  </Text>
                </View>
              </View>
              
              {/* Matching Banner - improved styling */}
              <View style={{ backgroundColor: primaryColor }} className="p-5 rounded-xl mb-6 shadow-sm">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#FFD700" />
                  <Text className="text-white text-lg font-bold ml-1">
                    We found leads that match your strengths!
                  </Text>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-wrap">
                    <View className="bg-[#3b82f6] bg-opacity-30 py-1.5 px-3 rounded-md flex-row items-center mr-3 mb-2">
                      <MaterialIcons name="language" size={16} color="white" />
                      <Text className="text-white ml-1 font-medium">Hindi</Text>
                    </View>
                    
                    <View className="bg-[#3b82f6] bg-opacity-30 py-1.5 px-3 rounded-md flex-row items-center mb-2">
                      <MaterialCommunityIcons name="tag-multiple" size={16} color="white" />
                      <Text className="text-white ml-1 font-medium">Term Life, Health</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between mt-4">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="medal" size={24} color="#FFD700" />
                    <Text className="text-white font-bold text-xl ml-1">92% Match</Text>
                  </View>
                  
                  <TouchableOpacity className=" bg-opacity-55 bg-slate-500 py-2 px-4 rounded-xl shadow-sm">
                    <Text className="text-white font-medium">Premium Leads</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Filters - improved spacing and layout */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingRight: 20 }}
                className="mb-7"
              >
                <TouchableOpacity 
                  className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes('Filters') ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => toggleFilter('Filters')}
                  style={activeFilters.includes('Filters') ? { backgroundColor: primaryColor } : null}
                >
                  <Ionicons 
                    name="funnel" 
                    size={18} 
                    color={activeFilters.includes('Filters') ? "white" : primaryColor} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${activeFilters.includes('Filters') ? 'text-white' : ''}`}
                    style={!activeFilters.includes('Filters') ? { color: primaryColor } : null}
                  >
                    Filters
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes('Pune') ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => toggleFilter('Pune')}
                  style={activeFilters.includes('Pune') ? { backgroundColor: primaryColor } : null}
                >
                  <Ionicons 
                    name="location" 
                    size={18}
                    color={activeFilters.includes('Pune') ? "white" : primaryColor} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${activeFilters.includes('Pune') ? 'text-white' : ''}`}
                    style={!activeFilters.includes('Pune') ? { color: primaryColor } : null}
                  >
                    Pune
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes('Health') ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => toggleFilter('Health')}
                  style={activeFilters.includes('Health') ? { backgroundColor: primaryColor } : null}
                >
                  <Ionicons 
                    name="heart" 
                    size={18} 
                    color={activeFilters.includes('Health') ? "white" : primaryColor} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${activeFilters.includes('Health') ? 'text-white' : ''}`}
                    style={!activeFilters.includes('Health') ? { color: primaryColor } : null}
                  >
                    Health
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes('Term') ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => toggleFilter('Term')}
                  style={activeFilters.includes('Term') ? { backgroundColor: primaryColor } : null}
                >
                  <Ionicons 
                    name="shield-checkmark" 
                    size={18} 
                    color={activeFilters.includes('Term') ? "white" : primaryColor} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${activeFilters.includes('Term') ? 'text-white' : ''}`}
                    style={!activeFilters.includes('Term') ? { color: primaryColor } : null}
                  >
                    Term
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              
              {/* Lead Cards - improved layout and spacing */}
              {leads.map((lead) => (
                <View key={lead.id} className="bg-white rounded-xl p-5 mb-5 shadow-sm">
                  {/* Lead Header - better spacing */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: lead.avatarColor }}
                      >
                        <Text className="text-white font-bold">{lead.name.charAt(0)}</Text>
                      </View>
                      <View className="ml-3">
                        <View className="flex-row items-center">
                          <Text className="font-bold text-gray-800 text-base">{lead.name}</Text>
                          <Text className="text-gray-500 ml-2">({lead.age} yrs)</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="location" size={12} color="#f87171" />
                          <Text className="text-gray-500 text-sm ml-1">{lead.location}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View 
                      className="px-3 py-1.5 rounded-full"
                      style={{ 
                        backgroundColor: lead.id === 1 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(79, 70, 229, 0.1)'
                      }}
                    >
                      <Text 
                        className="font-medium"
                        style={{ 
                          color: lead.id === 1 ? '#8b5cf6' : '#4f46e5' 
                        }}
                      >
                        {lead.id === 1 ? "Health" : "Term Life"}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Lead Interest - improved layout */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center flex-wrap flex-1 mr-2">
                      <Ionicons name="chatbubble-ellipses" size={18} color="#6b7280" />
                      <Text className="text-gray-700 ml-2 flex-1">
                        {lead.interest}
                      </Text>
                    </View>
                    
                    <Text 
                      className="font-semibold text-right"
                      style={{ 
                        color: lead.id === 1 ? '#8b5cf6' : '#4f46e5'
                      }}
                    >
                      {lead.id === 1 ? "Health Insurance" : "family"}
                    </Text>
                  </View>
                  
                  {/* Lead Stats - improved spacing and badges */}
                  <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
                    <View className="flex-row flex-wrap">
                      <View className="bg-green-100 px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-green-600 text-xs font-bold">
                          Interest Score: {lead.interestScore}
                        </Text>
                      </View>
                      
                      <View className="bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center mr-2 mb-2">
                        <MaterialIcons name="language" size={12} color="#3b82f6" />
                        <Text className="text-blue-500 text-xs font-medium ml-1">
                          {lead.language}
                        </Text>
                      </View>
                      
                      <View className="bg-purple-50 rounded-full px-3 py-1.5 flex-row items-center mb-2">
                        <Ionicons name="person" size={12} color="#8b5cf6" />
                        <Text className="text-purple-600 text-xs font-medium ml-1">
                          {lead.advisorGender} Advisor
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-2">
                    <View>
                      <Text className="text-xs text-gray-500">Avg Premium:</Text>
                      <Text className="text-green-600 font-bold text-base">
                        ₹{(lead.premium/1000).toFixed(0)}k
                      </Text>
                    </View>
                  </View>
                  
                  {/* Match and Add Button - improved styling */}
                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center pr-2">
                      <MaterialCommunityIcons name="medal" size={20} color="#10b981" />
                      <Text className="text-green-500 font-bold text-base ml-1">
                        Match {lead.match}%
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mr-5 ">
                      <TouchableOpacity 
                        className="rounded-l-2xl px-5 py-2.5 flex-row items-center shadow-sm"
                        style={{ backgroundColor: '#4f46e5' }}
                      >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-medium ml-1">
                          Add to My Leads
                        </Text>
                      </TouchableOpacity>
                      
                      <View className="bg-[#3b82f6] rounded-r-2xl py-2.5 px-4 shadow-sm">
                        <Text className="text-white font-bold">₹{lead.id === 1 ? '10' : '15'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              
              {/* Add bottom padding for safe scrolling */}
              <View className="h-20" />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}