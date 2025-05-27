import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to the main tabs when user clicks "Get Started"
    router.push('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 items-center justify-center px-6 ">
        <View className="bg-white rounded-3xl w-full py-10 px-6 items-center gap-5 shadow-lg">
          {/* Logo */}
          <View className="flex-row items-center mb-6">
            <Text className="text-[#1a4689] text-3xl font-bold">Gromo</Text>
            <Text className="text-green-500 text-3xl font-bold">+</Text>
          </View>
          
          {/* Welcome message */}
          <View className="items-center mb-6">
            <Text className="text-[#1a4689] text-xl font-bold mb-1">
              👋 Welcome to Gromo+
            </Text>
            <Text className="text-gray-500 text-base text-center font-semibold">
              Your trusted partner in financial growth
            </Text>
          </View>
          
          {/* Illustration */}
          <View className="w-full mb-8">
            <Image
              source={require('../assets/images/landingscreen.png')}
              className="w-full h-48 rounded-lg"
              resizeMode="contain"
            />
          </View>
          
          {/* Get Started Button */}
          <TouchableOpacity 
            className="bg-[#1a4689] w-full py-4 rounded-xl mb-4"
            onPress={handleGetStarted}
          >
            <Text className="text-white text-center font-bold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
          
          {/* Footer text */}
          <Text className="text-gray-500 text-sm text-center">
            Empowering financial inclusion across India
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}