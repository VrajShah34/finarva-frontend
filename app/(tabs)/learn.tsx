import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function LearnScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="py-4">
          <Text className="text-2xl font-bold text-[#1a4689] mb-4">Learn</Text>
          <Text className="text-gray-600 mb-6">
            Expand your financial knowledge with our curated courses and resources.
          </Text>
          
          {/* Placeholder content */}
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Recommended Courses</Text>
            <Text className="text-gray-600">Placeholder for recommended financial education courses</Text>
          </View>
          
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Learning Paths</Text>
            <Text className="text-gray-600">Placeholder for structured learning paths</Text>
          </View>
          
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-gray-800 font-semibold mb-2">Knowledge Library</Text>
            <Text className="text-gray-600">Placeholder for articles, videos, and other learning materials</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}