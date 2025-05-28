import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const primaryColor = "#04457E"; 

interface LeadItem {
  id: string;
  name: string;
  image: any;
  type: string;
  status: string;
  policyEndDate: string;
  lastCall?: {
    date: string;
    time: string;
  };
}

const CallsScreen = () => {
  // Added state for active filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'called'>('all');
  
  // Example data for leads
  const leads = [
    {
      id: '1',
      name: 'Ajay Sharma',
      image: require('../../assets/images/react-logo.png'),
      type: 'Term Insurance',
      status: 'Active',
      policyEndDate: '12 Aug 2024',
      lastCall: {
        date: '15 May 2024',
        time: '2:30 PM'
      }
    },
    {
      id: '2',
      name: 'Priya Gupta',
      image: require('../../assets/images/react-logo.png'),
      type: 'Health Insurance',
      status: 'Active',
      policyEndDate: '22 Jun 2024',
      lastCall: {
        date: '18 May 2024',
        time: '11:15 AM'
      }
    },
    {
      id: '3',
      name: 'Rohit Kumar',
      image: require('../../assets/images/react-logo.png'),
      type: 'Investment Plan',
      status: 'Active',
      policyEndDate: '10 Sep 2024',
      // No last call - new lead
    },
    {
      id: '4',
      name: 'Anita Singh',
      image: require('../../assets/images/react-logo.png'),
      type: 'Life Insurance',
      status: 'Active',
      policyEndDate: '5 Jul 2024',
      lastCall: {
        date: '20 May 2024',
        time: '9:20 AM'
      }
    },
    {
      id: '5',
      name: 'Vikash Patel',
      image: require('../../assets/images/react-logo.png'),
      type: 'Car Insurance',
      status: 'Inactive',
      policyEndDate: '15 Dec 2024',
      // No last call - new lead
    }
  ];

  // Filter leads based on active filter
  const filteredLeads = useMemo(() => {
    if (activeFilter === 'called') {
      return leads.filter(lead => lead.lastCall);
    }
    return leads;
  }, [activeFilter, leads]);

  // Function to navigate to call details screen
  const navigateToCallDetails = (lead: LeadItem) => {
    router.push('/ai-call-analysis');
  };

  // Function to navigate to AI Co-Pilot screen
  const navigateToAICoPilot = (lead: LeadItem) => {
    router.push({
      pathname: '/ai-copilot',
      params: { leadName: lead.name, leadType: lead.type }
    });
  };

  const renderLeadItem = ({ item }: { item: LeadItem }) => (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      {/* Card Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-start flex-1">
          <View className="relative mr-3">
            <Image source={item.image} className="w-12 h-12 rounded-full bg-gray-200" />
            <View className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              item.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
            <Text className="text-sm text-gray-600 font-medium mb-1">{item.type}</Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View className="mb-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="calendar-clock" size={18} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2 font-medium">Policy End:</Text>
          <Text className="text-sm font-semibold text-blue-700 ml-2">
            {item.policyEndDate}
          </Text>
        </View>
        
        {item.lastCall ? (
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="phone" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 font-medium">Last Call:</Text>
            <Text className="text-sm font-semibold text-gray-800 ml-2">
              {item.lastCall.date} at {item.lastCall.time}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="phone-off" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 font-medium">New Lead - No calls yet</Text>
          </View>
        )}
      </View>

      {/* Button Row */}
      <View className="flex-row gap-3">
        {item.lastCall ? (
          // If lead has been called before - show View Last Calls Details button
          <TouchableOpacity 
            className="bg-primary flex-row items-center justify-center py-3 px-5 rounded-xl flex-1 shadow-sm"
            onPress={() => navigateToCallDetails(item)}
          >
            <MaterialCommunityIcons name="history" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-sm">View Last Call</Text>
          </TouchableOpacity>
        ) : null}
        
        {/* AI Co-Pilot button for all leads */}
        <TouchableOpacity 
          className="bg-blue-50 border border-blue-700 flex-row items-center justify-center py-3 px-5 rounded-xl flex-1"
          onPress={() => navigateToAICoPilot(item)}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#1D4ED8" />
          <Text className="text-blue-700 font-semibold ml-2 text-sm">Call with AI Co-Pilot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Content Area with Gray Background */}
          <View className="px-4 pt-6 pb-3">
            <Text className="text-3xl font-bold text-primary">Calls</Text>
          </View>
          
          {/* Cold Calls Button */}
          <TouchableOpacity 
            className="bg-white mx-4 mb-4 rounded-2xl p-5 flex-row items-center justify-between shadow-sm border border-gray-100"
            onPress={() => console.log('Cold calls pressed')}
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons name="phone-plus" size={24} color="#1D4ED8" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-800 font-bold text-lg mb-1">Start Cold Calls</Text>
                <Text className="text-gray-600 text-sm">
                  Begin new sales calls with AI assistance
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          {/* Filter Tabs */}
          <View className="flex-row px-4 mb-3">
            <TouchableOpacity 
              className={`py-2 px-5 rounded-full mr-2 ${
                activeFilter === 'all' 
                  ? 'bg-primary' 
                  : 'bg-white border border-gray-300'
              }`}
              onPress={() => setActiveFilter('all')}
            >
              <Text className={`font-semibold ${
                activeFilter === 'all' ? 'text-white' : 'text-gray-700'
              }`}>
                All Leads
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`py-2 px-5 rounded-full ${
                activeFilter === 'called' 
                  ? 'bg-primary' 
                  : 'bg-white border border-gray-300'
              }`}
              onPress={() => setActiveFilter('called')}
            >
              <Text className={`font-semibold ${
                activeFilter === 'called' ? 'text-white' : 'text-gray-700'
              }`}>
                Previously Called
              </Text>
            </TouchableOpacity>
          </View>
        
          {/* Leads List */}
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-xl font-bold text-gray-900">My Leads</Text>
            <Text className="text-sm text-gray-600 font-medium">
              {filteredLeads.length} {activeFilter === 'called' ? 'called' : 'leads'}
            </Text>
          </View>
        
          {/* Using regular View instead of FlatList for ScrollView compatibility */}
          <View className="px-4 pb-6">
            {filteredLeads.map(item => (
              <View key={item.id}>
                {renderLeadItem({ item })}
              </View>
            ))}
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CallsScreen;