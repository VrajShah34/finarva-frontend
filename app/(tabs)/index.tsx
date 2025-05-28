import { router } from 'expo-router';
import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  // Function to navigate to cold calls
  const navigateToColdCalls = () => {
    router.push('/cold-calls');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="py-4">
          <Text className="text-2xl font-bold text-[#1a4689] mb-4">Home</Text>
          <Text className="text-gray-600 mb-6">
            Welcome to Gromo+. Your personalized financial growth partner.
          </Text>
          
          {/* Cold Calls Button */}
          <TouchableOpacity 
            className="bg-[#1a4689] py-4 px-5 rounded-xl mb-6 flex-row items-center shadow-md"
            onPress={navigateToColdCalls}
          >
            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Icon name="phone-plus" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Start Cold Calls</Text>
              <Text className="text-white/80 text-sm">
                Begin new sales calls with AI assistance
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Placeholder content */}
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Daily Tasks</Text>
            <Text className="text-gray-600">Placeholder for daily tasks and activities</Text>
          </View>
          
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Performance Overview</Text>
            <Text className="text-gray-600">Placeholder for performance metrics and charts</Text>
          </View>
          
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Recent Activities</Text>
            <Text className="text-gray-600">Placeholder for recent app activities and engagements</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}