import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const primaryColor = "#04457E"; 

interface CallItem {
  id: string;
  name: string;
  image: any;
  type: string;
  status: string;
  lastCallDate: string;
  lastCallTime: string;
  policyEndDate: string;
}

const CallsScreen = () => {
  const navigation = useNavigation();
  
  // Example data for recent calls
  const recentCalls = [
    {
      id: '1',
      name: 'Ajay Sharma',
      image: require('../../assets/images/react-logo.png'),
      type: 'Term Insurance',
      status: 'Active',
      lastCallDate: '15 May 2024',
      lastCallTime: '2:30 PM',
      policyEndDate: '12 Aug 2024'
    },
    {
      id: '2',
      name: 'Priya Gupta',
      image: require('../../assets/images/react-logo.png'),
      type: 'Health Insurance',
      status: 'Active',
      lastCallDate: '18 May 2024',
      lastCallTime: '11:15 AM',
      policyEndDate: '22 Jun 2024'
    },
    {
      id: '3',
      name: 'Rohit Kumar',
      image: require('../../assets/images/react-logo.png'),
      type: 'Investment Plan',
      status: 'Active',
      lastCallDate: '12 May 2024',
      lastCallTime: '4:45 PM',
      policyEndDate: '10 Sep 2024'
    },
    {
      id: '4',
      name: 'Anita Singh',
      image: require('../../assets/images/react-logo.png'),
      type: 'Life Insurance',
      status: 'Active',
      lastCallDate: '20 May 2024',
      lastCallTime: '9:20 AM',
      policyEndDate: '5 Jul 2024'
    },
    {
      id: '5',
      name: 'Vikash Patel',
      image: require('../../assets/images/react-logo.png'),
      type: 'Car Insurance',
      status: 'Inactive',
      lastCallDate: '8 May 2024',
      lastCallTime: '3:10 PM',
      policyEndDate: '15 Dec 2024'
    }
  ];

  // Function to navigate to call details screen
  const navigateToCallDetails = (call: CallItem) => {
    // For Expo Router
    router.push('/ai-call-analysis');
  };

  // Function to navigate to AI Co-Pilot screen
  const navigateToAICoPilot = (call: CallItem) => {
    // For Expo Router - navigate to AI Co-Pilot screen with call data
    router.push({
      pathname: '/ai-copilot',
      params: { leadName: call.name, leadType: call.type }
    });
  };

  const renderCallItem = ({ item }: { item: CallItem }) => (
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
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="phone-clock" size={18} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2 font-medium">Last Call:</Text>
          <Text className="text-sm font-semibold text-gray-800 ml-2">
            {item.lastCallDate} at {item.lastCallTime}
          </Text>
        </View>
      </View>

      {/* Button Row */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="bg-primary flex-row items-center justify-center py-3 px-5 rounded-xl flex-1 shadow-sm"
          onPress={() => navigateToCallDetails(item)}
        >
          <MaterialCommunityIcons name="eye" size={20} color="white" />
          <Text className="text-white font-semibold ml-2 text-sm">View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-blue-50 border border-blue-700 flex-row items-center justify-center py-3 px-5 rounded-xl flex-1"
          onPress={() => navigateToAICoPilot(item)}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#1D4ED8" />
          <Text className="text-blue-700 font-semibold ml-2 text-sm">AI Co-Pilot</Text>
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
        >
         
      
      {/* Header */}
      <View className="bg-primary py-5 px-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Gromo+</Text>
      
      </View>
      
      {/* Content Area with Gray Background */}
      <View className="px-4 pt-6 pb-3">
          <Text className="text-3xl font-bold text-primary">Calls</Text>
      </View>
      <View className="flex-1 bg-gray-50">
        {/* Cold Calls Button */}
        <TouchableOpacity 
          className="bg-white m-4 rounded-2xl p-5 flex-row items-center justify-between shadow-sm border border-gray-100"
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
        
        {/* Recent Calls List */}
        <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
          <Text className="text-xl font-bold text-gray-900">Recent Calls</Text>
          <Text className="text-sm text-gray-600 font-medium">{recentCalls.length} calls</Text>
        </View>
        
        <FlatList
          data={recentCalls}
          renderItem={renderCallItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
    </>
  );
};

export default CallsScreen;