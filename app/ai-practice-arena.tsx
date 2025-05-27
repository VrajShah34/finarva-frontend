import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const primaryColor = '#04457E'; 

export default function AIPracticeArenaScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const handleBackPress = () => {
    router.back();
  };
  
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  const faqs = [
    {
      question: "What is a Lead Interest Score?",
      answer: "A Lead Interest Score is a numerical value between 0-100 that indicates how interested a lead is in your products or services. It's calculated based on their interactions, questions, response time, and other behavioral signals detected by our AI during calls."
    },
    {
      question: "Will AI call my contacts automatically?",
      answer: "No. The AI will only qualify leads that you've uploaded. It doesn't initiate calls on its own. You maintain full control over who gets contacted and when. The system simply helps identify which leads are most promising."
    },
    {
      question: "Is my contact's data safe and private?",
      answer: "Yes, absolutely. We take privacy very seriously. All data is encrypted, and we comply with all relevant data protection regulations. Your contacts' information is only used for lead qualification and is never shared with third parties."
    }
  ];
  
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
        <View className='bg-gray-50'>
        {/* AI Practice Arena Header */}
        <View className="bg-primary m-4 rounded-lg p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">AI Practice Arena</Text>
            <Text className="text-white text-xs opacity-80">Sharpen your skills in real-time with our AI Avatar.</Text>
          </View>
          <TouchableOpacity className="bg-[#18FFAA] w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="refresh" size={20} color="primary" />
          </TouchableOpacity>
        </View>
        
        {/* How does this work? */}
        <View className="bg-white mx-4 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row mb-4">
            <View className="bg-primary w-10 h-10 rounded-lg items-center justify-center mr-3">
              <Ionicons name="help" size={20} color="white" />
            </View>
            <Text className="text-primary text-lg font-bold self-center">How does this work?</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row">
              <View className="bg-[#18FFAA] rounded w-8 h-8 items-center justify-center mr-3 mt-0.5">
                <MaterialIcons name="phone-in-talk" size={16} color="primary" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">
                  AI cold call is regionally contextual & conversational in local language (auto-selected)
                </Text>
              </View>
            </View>
            
            <View className="flex-row">
              <View className="bg-[#18FFAA] rounded w-8 h-8 items-center justify-center mr-3 mt-0.5">
                <Ionicons name="volume-high" size={16} color="primary" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">
                  Listens for keywords, tone, confidence & intent signals in real time
                </Text>
              </View>
            </View>
            
            <View className="flex-row">
              <View className="bg-[#18FFAA] rounded w-8 h-8 items-center justify-center mr-3 mt-0.5">
                <Ionicons name="shield-checkmark" size={16} color="primary" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">
                  Privacy-respecting voice-to-text & intent classification; only qualified leads are surfaced
                </Text>
              </View>
            </View>
            
            <View className="flex-row">
              <View className="bg-[#18FFAA] rounded w-8 h-8 items-center justify-center mr-3 mt-0.5">
                <Ionicons name="time" size={16} color="primary" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">
                  Unqualified leads stored for future re-engagement — no spam for you
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* More time for real sales */}
        <View className="bg-primary mx-4 rounded-lg p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="flash" size={24} color="#18FFAA" />
            <Text className="text-white font-bold text-lg ml-2">More time for real sales</Text>
          </View>
          
          <Text className="text-white mb-2">
            Gromo AI pre-qualifies leads <Text className="text-[#18FFAA]">while you're offline</Text>, so you focus only on high-probability, warm conversations.
          </Text>
          
          <Text className="text-white">
            Scalable, intelligent lead mining — <Text className="text-[#18FFAA]">boosting morale and conversion rates.</Text>
          </Text>
        </View>
        
        {/* FAQ Section */}
        <View className="bg-white mx-4 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="bg-primary w-8 h-8 rounded-full items-center justify-center mr-2">
              <Ionicons name="help" size={16} color="white" />
            </View>
            <Text className="text-primary font-bold text-lg">Frequently Asked</Text>
          </View>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              className={`border-b border-gray-200 py-3 ${index === faqs.length - 1 ? 'border-b-0' : ''}`}
              onPress={() => toggleFaq(index)}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-primary font-medium">{faq.question}</Text>
                <Ionicons 
                  name={expandedFaq === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="primary" 
                />
              </View>
              
              {expandedFaq === index && (
                <Text className="text-gray-600 mt-2">
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Add More Contacts */}
        <View className="bg-[#18FFAA] mx-4 rounded-lg p-5 mb-20">
          <View className="flex-row items-center justify-center mb-2">
            <View className="bg-primary w-8 h-8 rounded-full items-center justify-center mr-2">
              <Ionicons name="add" size={18} color="white" />
            </View>
            <Text className="text-primary font-bold text-lg">Add More Contacts</Text>
          </View>
          
          <Text className="text-primary text-center mb-4">
            The more you add, the more leads Gromo AI can qualify for you.
          </Text>
          
          <TouchableOpacity className="bg-primary py-3 px-6 rounded-lg self-center">
            <Text className="text-white font-medium">Add Contact</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}