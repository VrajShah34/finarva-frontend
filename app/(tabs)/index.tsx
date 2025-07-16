import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, UserProfile } from '../services/api';

const primaryColor = "#04457E";
const { width } = Dimensions.get('window');

// Get user's first name
const getUserFirstName = (name: string): string => {
  if (!name) return 'Partner';
  const names = name.trim().split(' ');
  return names[0];
};

// Format number with comma separators (Indian format)
const formatNumberWithCommas = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Hello');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Stats
  const [stats, setStats] = useState({
    activeLeads: 0,
    leadConversions: 0,
    totalEarnings: 0,
    challengesCompleted: 0
  });
  
  // Daily challenge data
  const [dailyChallenge, setDailyChallenge] = useState({
    title: "Maximize Conversions",
    description: "Complete an AI-guided roleplay scenario to improve your financial product explanations.",
    reward: 25,
    progress: 0,
    totalSteps: 5,
    expiresIn: "8 hours"
  });
  
  useEffect(() => {
    // Update time and date
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Format time (12-hour with AM/PM)
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${displayHours}:${minutes} ${ampm}`);
      
      // Format date (e.g., "Monday, June 1")
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
      
      // Set greeting based on time of day
      if (hours < 12) {
        setGreeting('Good morning');
      } else if (hours < 17) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };
    
    updateTimeAndDate();
    const intervalId = setInterval(updateTimeAndDate, 60000);
    
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProfile();
        
        if (response.success && response.data) {
          setProfile(response.data.gp);
          
          // Set stats based on profile data
          setStats({
            activeLeads: response.data.gp.purchased_lead_ids?.length || 0,
            leadConversions: Math.floor(Math.random() * 8) + 2, // Placeholder
            totalEarnings: Math.floor(Math.random() * 5000) + 2000, // Placeholder
            challengesCompleted: Math.floor(Math.random() * 5) + 1 // Placeholder
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
    
    // Run animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Navigate to different screens
  const navigateToMyLeads = () => router.push('/my-leads');
  const navigateToBuyLeads = () => router.push('/buy-leads');
  const navigateToLearn = () => router.push('/learn');
  const navigateToColdCalls = () => router.push('/cold-calls');
  const navigateToAICopilot = () => router.push('/ai-copilot');
  const navigateToChallenge = () => {
    // Update challenge progress
    setDailyChallenge(prev => ({
      ...prev,
      progress: Math.min(prev.progress + 1, prev.totalSteps)
    }));
    
    router.push('/case-study');
  };
  
  if (loading) {
    return (
      <SafeAreaView
        edges={['right', 'left', 'top']}
        style={{ flex: 1, backgroundColor: primaryColor }}
      >
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 text-lg">Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['right', 'left', 'top']}
      style={{ flex: 1, backgroundColor: primaryColor }}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent={true} />
      
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">Gromo+</Text>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity className="bg-white bg-opacity-20 mr-4 p-2 rounded-full">
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-row items-center bg-white bg-opacity-20 px-3 py-1.5 rounded-full">
            <Text style={{ color: "#FFD700", fontSize: 22 }}>🪙</Text>
            <Text className="text-primary text-xl font-bold ml-2">
              {profile?.wallet_balance || 0}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Main Content Area */}
      <ScrollView 
        className="flex-1 bg-gray-50 rounded-t-3xl"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section */}
        <Animated.View 
          className="px-5 pt-6"
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Greeting & Time */}
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-gray-500 text-sm">{currentDate}</Text>
              <Text className="text-2xl font-bold text-gray-800">
                {greeting}, {getUserFirstName(profile?.name || '')}!
              </Text>
            </View>
            <Text className="text-gray-700 text-lg font-medium">{currentTime}</Text>
          </View>
          
          {/* Stats Overview */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mt-4 mb-6"
          >
            {/* Active Leads */}
            <View className="bg-white rounded-xl p-4 shadow-sm mr-4" style={{ width: width * 0.4 }}>
              <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                <MaterialCommunityIcons name="account-multiple" size={20} color={primaryColor} />
              </View>
              <Text className="text-gray-600 text-sm">Active Leads</Text>
              <Text className="text-2xl font-bold text-gray-800">{stats.activeLeads}</Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons name="arrow-up" size={16} color="#10b981" />
                <Text className="text-green-500 text-xs ml-1">+2 this week</Text>
              </View>
            </View>
            
            {/* Conversions */}
            <View className="bg-white rounded-xl p-4 shadow-sm mr-4" style={{ width: width * 0.4 }}>
              <View className="bg-green-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                <MaterialCommunityIcons name="chart-line" size={20} color="#10b981" />
              </View>
              <Text className="text-gray-600 text-sm">Conversions</Text>
              <Text className="text-2xl font-bold text-gray-800">{stats.leadConversions}</Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons name="arrow-up" size={16} color="#10b981" />
                <Text className="text-green-500 text-xs ml-1">3.2% rate</Text>
              </View>
            </View>
            
            {/* Earnings */}
            <View className="bg-white rounded-xl p-4 shadow-sm" style={{ width: width * 0.4 }}>
              <View className="bg-yellow-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                <MaterialCommunityIcons name="currency-inr" size={20} color="#f59e0b" />
              </View>
              <Text className="text-gray-600 text-sm">Total Earnings</Text>
              <Text className="text-2xl font-bold text-gray-800">₹{formatNumberWithCommas(stats.totalEarnings)}</Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons name="arrow-up" size={16} color="#10b981" />
                <Text className="text-green-500 text-xs ml-1">+₹1,200 MTD</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
        
        {/* Daily Challenge Section - Pastel Yellow Background */}
        <Animated.View 
          className="mx-5 mb-6 rounded-xl overflow-hidden shadow-sm"
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
        >
          <View className="p-5" style={{ backgroundColor: '#FFF9C4' }}>
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center">
                <View className="bg-yellow-500 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <MaterialCommunityIcons name="trophy" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-yellow-700 text-xs font-medium">DAILY CHALLENGE</Text>
                  <Text className="text-gray-800 text-lg font-bold">{dailyChallenge.title}</Text>
                </View>
              </View>
              <View className="bg-yellow-200 px-3 py-1 rounded-full">
                <Text className="text-yellow-800 font-medium">+{dailyChallenge.reward} 🪙</Text>
              </View>
            </View>
            
            <Text className="text-gray-700 mb-3">{dailyChallenge.description}</Text>
            
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm">Progress</Text>
                <Text className="text-gray-700 font-medium">{dailyChallenge.progress}/{dailyChallenge.totalSteps}</Text>
              </View>
              <View className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                <View 
                  className="h-2 bg-yellow-500 rounded-full" 
                  style={{ width: `${(dailyChallenge.progress / dailyChallenge.totalSteps) * 100}%` }}
                />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="clock-outline" size={18} color="#D97706" />
                <Text className="text-yellow-700 ml-1">Expires in {dailyChallenge.expiresIn}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-yellow-500 px-4 py-2 rounded-lg"
                onPress={navigateToChallenge}
              >
                <Text className="text-white font-medium">Start Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        
        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Buy Leads */}
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm mb-4"
              style={{ width: '48%' }}
              onPress={navigateToBuyLeads}
            >
              <View className="items-center">
                <View className="bg-purple-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="shopping" size={28} color="#8b5cf6" />
                </View>
                <Text className="text-gray-800 font-bold">Buy Leads</Text>
                <Text className="text-gray-500 text-xs text-center mt-1">Find quality leads</Text>
              </View>
            </TouchableOpacity>
            
            {/* AI Cold Calls */}
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm mb-4"
              style={{ width: '48%' }}
              onPress={navigateToColdCalls}
            >
              <View className="items-center">
                <View className="bg-blue-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="robot" size={28} color="#3b82f6" />
                </View>
                <Text className="text-gray-800 font-bold">AI Cold Calls</Text>
                <Text className="text-gray-500 text-xs text-center mt-1">Automated outreach</Text>
              </View>
            </TouchableOpacity>
            
            {/* My Leads */}
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm mb-4"
              style={{ width: '48%' }}
              onPress={navigateToMyLeads}
            >
              <View className="items-center">
                <View className="bg-green-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="account-group" size={28} color="#10b981" />
                </View>
                <Text className="text-gray-800 font-bold">My Leads</Text>
                <Text className="text-gray-500 text-xs text-center mt-1">Manage your leads</Text>
              </View>
            </TouchableOpacity>
            
            {/* AI Co-pilot */}
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm mb-4"
              style={{ width: '48%' }}
              onPress={navigateToAICopilot}
            >
              <View className="items-center">
                <View className="bg-red-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="headset" size={28} color="#ef4444" />
                </View>
                <Text className="text-gray-800 font-bold">AI Co-pilot</Text>
                <Text className="text-gray-500 text-xs text-center mt-1">Call assistance</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Learning Corner */}
        <View className="px-5 mb-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">Learning Corner</Text>
          <TouchableOpacity 
            className="bg-white rounded-xl overflow-hidden shadow-sm mb-4"
            onPress={navigateToLearn}
          >
            <LinearGradient
              colors={['#1e4b88', '#27649f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-5"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-4">
                  <Text className="text-white text-lg font-bold mb-2">
                    Continue Learning
                  </Text>
                  <Text className="text-blue-100 mb-3">
                    Master financial products & sales techniques
                  </Text>
                  <View className="bg-white/20 self-start px-4 py-1 rounded-full">
                    <Text className="text-white font-medium">Go to Courses</Text>
                  </View>
                </View>
                
                <View className="bg-white/20 p-3 rounded-xl">
                  <MaterialCommunityIcons name="book-open-variant" size={36} color="white" />
                </View>
              </View>
            </LinearGradient>
            
            <View className="p-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Your progress</Text>
                <Text className="text-blue-600 font-medium">38% complete</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View className="h-2 bg-blue-600 rounded-full" style={{ width: '38%' }} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Performance Insights */}
        <View className="px-5 mb-8">
          <Text className="text-gray-800 text-xl font-bold mb-4">Performance Insights</Text>
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={primaryColor} />
              <Text className="text-gray-800 font-bold text-lg ml-2">This Week&apos;s Highlights</Text>
            </View>
            
            <View className="flex-row justify-between mb-5">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-800">3</Text>
                <Text className="text-gray-500 text-xs text-center">Leads Added</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-green-500">2</Text>
                <Text className="text-gray-500 text-xs text-center">Conversions</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-yellow-500">4</Text>
                <Text className="text-gray-500 text-xs text-center">AI Calls</Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-gray-100 py-3 rounded-lg items-center">
              <Text className="text-gray-700 font-medium">View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Latest Announcements */}
        <View className="px-5 mb-10">
          <Text className="text-gray-800 text-xl font-bold mb-4">Latest Updates</Text>
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <View className="flex-row items-start mb-4 pb-4 border-b border-gray-100">
              <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="megaphone" size={20} color={primaryColor} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold mb-1">New AI Features Released!</Text>
                <Text className="text-gray-600 text-sm">Try out the new AI Co-pilot for smart call assistance.</Text>
                <Text className="text-blue-500 text-sm mt-1">2 days ago</Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="gift" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold mb-1">June Incentive Program</Text>
                <Text className="text-gray-600 text-sm">Convert 5 leads this month and earn bonus coins!</Text>
                <Text className="text-blue-500 text-sm mt-1">1 week ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}