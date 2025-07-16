import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AssessmentScreen() {
  const router = useRouter();
  const [isAssessing, setIsAssessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const progressAnim = useState(new Animated.Value(0))[0];
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (isAssessing) {
      setProgressValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setIsAssessing(false);
          setIsComplete(true);
        }
      });
      
      // Update progress value for text display
      const interval = setInterval(() => {
        let currentValue = 0;
        progressAnim.addListener(({ value }) => {
          currentValue = value;
        });
        currentValue && setProgressValue(currentValue);
        if (currentValue >= 1) {
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isAssessing]);

  const startAssessment = () => {
    setIsAssessing(true);
  };

  const continueToApp = () => {
    router.push('/quiz');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerTitle: "Gromo+",
        headerTitleStyle: { color: '#1a4689', fontWeight: 'bold' },
        headerStyle: { backgroundColor: 'white' },
      }} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-8">
          {/* Header */}
          <View className="items-center mb-8 mt-5">
            <View className="flex-row items-center mb-2">
              <View className="h-8 w-8 rounded-full bg-gray-200 mr-2 items-center justify-center">
                <MaterialCommunityIcons name="brain" size={20} color="#1a4689" />
              </View>
              <View className="flex-row items-center">
                <Text className="text-[#1a4689] text-2xl font-bold">GroMo</Text>
                <Text className="text-green-500 text-2xl font-bold">+</Text>
              </View>
            </View>
            
            <Text className="text-[#1a4689] text-2xl font-bold mb-2 text-center">
              Let&apos;s understand your strengths!
            </Text>
            
            <Text className="text-gray-600 text-center">
              We&apos;ll guide you through two quick steps to design your perfect learning path.
            </Text>

            <View className="w-full h-[1px] bg-gray-200 mt-6" />
          </View>
          
          {/* Voice Assessment Section - Blue Background */}
          <View className="bg-[#1a4689] rounded-3xl mb-8">
            <View className="px-5 py-8">
              <View className="flex-row items-center mb-4">
                <Ionicons name="mic" size={24} color="#4ade80" />
                <Text className="text-white text-xl font-bold ml-2">
                  Soft Skill AI Voice Assessment
                </Text>
              </View>
              
              <Text className="text-blue-200 mb-6">
                Speak to our AI and try pitching to a potential customer. We&apos;ll assess your 
                clarity, confidence & persuasion.
              </Text>
              
              {!isComplete ? (
                <>
                  <TouchableOpacity 
                    className={`bg-white py-4 rounded-xl mb-4 flex-row justify-center items-center ${
                      isAssessing ? 'opacity-70' : ''
                    }`}
                    onPress={startAssessment}
                    disabled={isAssessing}
                  >
                    <Ionicons name="mic" size={20} color="#1a4689" />
                    <Text className="text-[#1a4689] text-center font-bold ml-2">
                      Start Voice Assessment Call
                    </Text>
                  </TouchableOpacity>
                  
                  {isAssessing && (
                    <>
                      <View className="w-full h-4 bg-white/20 rounded-full mb-2">
                        <Animated.View 
                          className="h-full rounded-full"
                          style={{ width: progressWidth, backgroundColor: '#4ade80' }}
                        />
                      </View>
                      <Text className="text-blue-200 text-center">
                        Analyzing voice fluency...
                      </Text>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Voice Assessment Results */}
                  <View className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <View className="flex-row items-center mb-4">
                      <MaterialIcons name="science" size={20} color="#4ade80" />
                      <Text className="text-white text-lg font-bold ml-2">
                        AI Voice Result (Demo Data)
                      </Text>
                    </View>
                    
                    {/* Name & Duration */}
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="person-circle" size={16} color="#93c5fd" />
                      <Text className="text-blue-100 ml-2">
                        <Text className="font-bold">Name:</Text> Ramesh Patil
                      </Text>
                    </View>
                    
                    <View className="mb-4 flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#93c5fd" />
                      <Text className="text-blue-100 ml-2">
                        <Text className="font-bold">Duration:</Text> 1 min 40 sec
                      </Text>
                    </View>
                    
                    <View className="mb-3 flex-row items-center">
                      <Ionicons name="search" size={16} color="#93c5fd" />
                      <Text className="text-blue-100 ml-2 font-bold">
                        AI Evaluation:
                      </Text>
                    </View>
                    
                    {/* Metrics */}
                    <View className="space-y-4 mb-5">
                      {/* Clarity */}
                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-blue-100">Clarity</Text>
                          <Text className="text-white font-bold">7.8</Text>
                        </View>
                        <View className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                          <LinearGradient
                            colors={['#4ade80', '#3b82f6', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-full"
                            style={{ width: '78%' }}
                          />
                        </View>
                      </View>
                      
                      {/* Confidence */}
                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-blue-100">Confidence</Text>
                          <Text className="text-white font-bold">6.9</Text>
                        </View>
                        <View className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                          <LinearGradient
                            colors={['#4ade80', '#3b82f6', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-full"
                            style={{ width: '69%' }}
                          />
                        </View>
                      </View>
                      
                      {/* Persuasion */}
                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-blue-100">Persuasion</Text>
                          <Text className="text-white font-bold">8.2</Text>
                        </View>
                        <View className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                          <LinearGradient
                            colors={['#4ade80', '#3b82f6', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-full"
                            style={{ width: '82%' }}
                          />
                        </View>
                      </View>
                    </View>
                    
                    {/* Persona Fit */}
                    <View className="mb-4">
                      <View className="flex-row items-center mb-2">
                        <View className="h-6 w-6 rounded-full bg-green-500 items-center justify-center">
                          <Ionicons name="person" size={14} color="white" />
                        </View>
                        <Text className="text-white font-bold ml-2">
                          Persona Fit:
                        </Text>
                      </View>
                      <Text className="text-blue-100 font-medium ml-8">
                        Trusted Advisor – Motivated, needs polishing in pitch order
                      </Text>
                    </View>
                    
                    {/* Feedback Box */}
                    <View className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-4">
                      <Text className="text-green-200">
                        Great confidence! Try to pause less and add benefits early in your pitch.
                      </Text>
                    </View>
                    
                    {/* Continue Button */}
                    <TouchableOpacity 
                      className="bg-white py-4 rounded-xl flex-row justify-center items-center"
                      onPress={continueToApp}
                    >
                      <Text className="text-[#1a4689] text-center font-bold">Continue</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}