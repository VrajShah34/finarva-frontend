import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CustomerLead = {
  id: number;
  name: string;
  productType: string;
  status: 'Active' | 'Needs Renewal';
  needsRenewal: boolean;
  upsellPotential: boolean;
  policyEndDate: string;
  lastContact: string;
  activities: {
    description: string;
    date: string;
    icon: string;
  }[];
  aiSuggestion?: string;
};

export default function PostSaleDashboardScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  // Set primary color as a variable for consistency
  const primaryColor = "#04457E";

  // Use useEffect to update status bar
  useEffect(() => {
    // Set status bar style when component mounts
    StatusBar.setBackgroundColor(primaryColor);
    StatusBar.setBarStyle('light-content');
    
    // Reset when component unmounts (optional)
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('white');
        StatusBar.setBarStyle('dark-content');
      }
    };
  }, []);

  const customerLeads: CustomerLead[] = [
    // Your lead data here
    {
      id: 1,
      name: 'Ajay Sharma',
      productType: 'Term Insurance',
      status: 'Active',
      needsRenewal: false,
      upsellPotential: true,
      policyEndDate: '12 Aug 2024',
      lastContact: '3 days ago',
      activities: [
        {
          description: 'You discussed policy features',
          date: '7 May',
          icon: 'chatbubble'
        },
        {
          description: 'Follow-up call made',
          date: '9 May',
          icon: 'call'
        }
      ],
      aiSuggestion: 'Recommend Health Insurance'
    },
    {
      id: 2,
      name: 'Priya Gupta',
      productType: 'Health Insurance',
      status: 'Needs Renewal',
      needsRenewal: true,
      upsellPotential: false,
      policyEndDate: '22 Jun 2024',
      lastContact: 'Yesterday',
      activities: [
        {
          description: 'Sent renewal reminder',
          date: '18 May',
          icon: 'chatbubble'
        }
      ],
      aiSuggestion: 'Suggest Top-Up Policy'
    }
  ];

  const filteredLeads = activeFilter === 'All' 
    ? customerLeads
    : activeFilter === 'Needs Renewal' 
      ? customerLeads.filter(lead => lead.needsRenewal)
      : customerLeads.filter(lead => lead.upsellPotential);

  const handleBackPress = () => {
    router.back();
  };

  const navigateToBuyLeads = () => {
    router.push('/buy-leads');
  };

  return (
    <>
      {/* Status Bar - positioned outside SafeAreaView for proper coloring */}
      <StatusBar 
        backgroundColor={primaryColor} 
        barStyle="light-content" 
        translucent={Platform.OS === 'android'}
      />
      
      {/* Using SafeAreaView with edges to prevent content from going under status bar */}
      <SafeAreaView 
        edges={['right', 'left','top']} 
        className="flex-1 bg-gray-50"
        style={{ backgroundColor: primaryColor }}
      >
        {/* <Stack.Screen options={{ 
          headerShown: false,
          animation: 'slide_from_right',
          statusBarStyle: 'light', // For iOS
        }} /> */}
        
        {/* Header Area */}
        <View className="py-5 px-4 flex-row justify-between items-center" style={{ backgroundColor: primaryColor }}>
          <Text className="text-white text-xl font-bold">My Leads</Text>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Menu at the top (replacing congratulation banner) */}
        {menuOpen && (
          <View className="absolute top-16 right-4 z-10 bg-white rounded-lg shadow-lg py-2 px-1 w-48">
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => setMenuOpen(false)}>
              <Ionicons name="person-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={navigateToBuyLeads}>
              <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Buy Leads</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => setMenuOpen(false)}>
              <Ionicons name="settings-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => setMenuOpen(false)}>
              <Ionicons name="help-circle-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Help & Support</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Content Area */}
        <View className="flex-1 bg-gray-50">
          <ScrollView>
            {/* Buy Leads Button - Replacing the congratulation banner */}
            <TouchableOpacity 
              className="mx-4 mt-4 rounded-2xl p-4 flex-row justify-between items-center"
              style={{ backgroundColor: primaryColor }}
              onPress={navigateToBuyLeads}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-[#18FFAA] rounded-full items-center justify-center mr-3">
                  <Ionicons name="add" size={26} color={primaryColor} />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">Buy New Leads</Text>
                  <Text className="text-[#18FFAA] text-sm">
                    Access AI-matched high-intent prospects
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={26} color="white" />
            </TouchableOpacity>
            
            {/* AI Assistant Card */}
            <View className="mx-4 mt-4 bg-white p-4 rounded-xl shadow-sm">
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
                  <MaterialCommunityIcons name="robot" size={28} color="#18FFAA" />
                </View>
                <View>
                  <Text style={{ color: primaryColor }} className="text-lg font-bold">AI Assistant</Text>
                  <Text className="text-gray-600 text-sm">
                    Monitors renewals, upsell opportunities & customer queries for you.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Filter Tabs */}
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 mt-4"
            >
              <TouchableOpacity 
                className={`py-2 px-8 rounded-full mr-2 ${activeFilter === 'All' ? '' : 'bg-white border border-gray-300'}`}
                onPress={() => setActiveFilter('All')}
                style={activeFilter === 'All' ? { backgroundColor: primaryColor } : null}
              >
                <Text className={`font-medium ${activeFilter === 'All' ? 'text-white' : 'text-gray-700'}`}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`py-2 px-8 rounded-full mr-2 ${activeFilter === 'Needs Renewal' ? '' : 'bg-white border border-gray-300'}`}
                onPress={() => setActiveFilter('Needs Renewal')}
                style={activeFilter === 'Needs Renewal' ? { backgroundColor: primaryColor } : null}
              >
                <Text className={`font-medium ${activeFilter === 'Needs Renewal' ? 'text-white' : 'text-gray-700'}`}>Needs Renewal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`py-2 px-8 rounded-full mr-2 ${activeFilter === 'Upsell Potential' ? '' : 'bg-white border border-gray-300'}`}
                onPress={() => setActiveFilter('Upsell Potential')}
                style={activeFilter === 'Upsell Potential' ? { backgroundColor: primaryColor } : null}
              >
                <Text className={`font-medium ${activeFilter === 'Upsell Potential' ? 'text-white' : 'text-gray-700'}`}>Upsell Potential</Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Customer Cards */}
            {filteredLeads.map(customer => (
              <View key={customer.id} className="mx-4 mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Customer Header */}
                <View className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image 
                      source={{ uri: `https://randomuser.me/api/portraits/${customer.id % 2 === 0 ? 'women' : 'men'}/${customer.id + 30}.jpg` }}
                      className="w-12 h-12 rounded-full"
                    />
                    <View className="ml-3">
                      <Text className="text-lg font-bold" style={{ color: primaryColor }}>{customer.name}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-600">{customer.productType}</Text>
                        <Text className="text-gray-400 mx-1">•</Text>
                        <Text style={{ color: customer.needsRenewal ? primaryColor : '#10b981' }}>
                          {customer.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Status Tag */}
                  <View className={`py-1 px-3 rounded-full ${customer.upsellPotential ? 'bg-green-100' : ''}`} style={!customer.upsellPotential ? { backgroundColor: primaryColor } : null}>
                    <Text className={`text-sm font-medium ${customer.upsellPotential ? 'text-green-600' : 'text-white'}`}>
                      {customer.upsellPotential ? 'Upsell Potential' : 'Needs Renewal'}
                    </Text>
                  </View>
                </View>
                
                {/* Policy Details */}
                <View className="px-4 pb-4 flex-row justify-between border-b border-gray-100">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={16} color="#6b7280" />
                    <View className="ml-2">
                      <Text className="text-xs text-gray-500">Policy End:</Text>
                      <Text className="text-sm font-medium text-gray-800">{customer.policyEndDate}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <View className="ml-2">
                      <Text className="text-xs text-gray-500">Last Contact:</Text>
                      <Text className="text-sm font-medium text-gray-800">{customer.lastContact}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Activity Timeline */}
                <View className="p-4">
                  {customer.activities.map((activity, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <View className="mr-3 mt-1">
                        {activity.icon === 'chatbubble' ? (
                          <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons name="chatbubble" size={16} color="#3b82f6" />
                          </View>
                        ) : (
                          <View className="bg-green-100 w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons name="call" size={16} color="#10b981" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800">{activity.description}</Text>
                      </View>
                      <Text className="text-gray-500 text-sm">{activity.date}</Text>
                    </View>
                  ))}
                  
                  {/* AI Suggestion */}
                  {customer.aiSuggestion && (
                    <View className="flex-row items-start mt-2">
                      <View className="mr-3 mt-1">
                        <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="flash" size={16} color="#8b5cf6" />
                        </View>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600">AI suggests:</Text>
                        <Text style={{ color: primaryColor }} className="font-medium">{customer.aiSuggestion}</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Action Buttons */}
                <View className="flex-row p-2 border-t border-gray-100">
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 mr-1">
                    <Ionicons name="logo-whatsapp" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1">WhatsApp</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 bg-[#18FFAA] rounded-lg mx-1">
                    <Ionicons name="call" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1">Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 ml-1">
                    <Ionicons name="pricetag" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1">Tag</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
           <View className="h-20" />
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}