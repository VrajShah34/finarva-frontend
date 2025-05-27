import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="py-4">
          <Text className="text-2xl font-bold text-[#1a4689] mb-4">Home</Text>
          <Text className="text-gray-600 mb-6">
            Welcome to Gromo+. Your personalized financial growth partner.
          </Text>
          
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