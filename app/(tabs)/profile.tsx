import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Animated,
  Dimensions,
  Easing,
  RefreshControl, 
  ScrollView, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, UserProfile } from '../services/api';

const primaryColor = "#04457E";
const { width } = Dimensions.get('window');

// Helper function to generate avatar initials
const getInitials = (name: string): string => {
  if (!name) return 'GP';
  const names = name.trim().split(' ');
  return names.length === 1 
    ? names[0].slice(0, 2).toUpperCase()
    : (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Helper function to generate random color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  if (!name) return colors[0];
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

// Animated Avatar component
const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 96 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={{
        transform: [{ scale: scaleAnim }],
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: getAvatarColor(name),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text style={{ color: 'white', fontSize: size * 0.35, fontWeight: 'bold' }}>
        {getInitials(name)}
      </Text>
    </Animated.View>
  );
};

// Animated Card component
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({ 
  children, 
  delay = 0, 
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], }, style]}>
      {children}
    </Animated.View>
  );
};

// Animated Button component
const AnimatedButton: React.FC<{ 
  children: React.ReactNode; 
  onPress: () => void; 
  style?: any;
  delay?: number;
}> = ({ children, onPress, style, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }, style]}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(-100)).current;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data.gp);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userId', 'learnerId']);
              router.replace('/sign-in');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: primaryColor }}>
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 text-lg">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['right', 'left', 'top']} style={{ flex: 1, backgroundColor: primaryColor }}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View 
        style={{ 
          backgroundColor: primaryColor,
          transform: [{ translateY: headerAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }} 
        className="py-6 px-6 flex-row justify-between items-center"
      >
        <Text className="text-white text-2xl font-bold">Gromo+</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={26} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <View className="bg-gray-50 flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <View className="px-6 py-6">
            <AnimatedCard delay={200}>
              <View className="items-center mb-8">
                <Avatar name={profile?.name || ''} size={100} />
                <Text className="text-2xl font-bold text-primary mb-1">{profile?.name || 'GroMo Partner'}</Text>
                <Text className="text-gray-600 text-lg mb-2">GroMo Partner</Text>
                <View className="bg-white px-4 py-2 rounded-full shadow-sm">
                  <Text className="text-sm text-gray-600">ID: {profile?.learner_id || 'N/A'}</Text>
                </View>
              </View>
            </AnimatedCard>

            <AnimatedCard delay={400} style={{ marginBottom: 20 }}>
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Text className="text-gray-800 font-bold mb-4 text-lg">Profile Information</Text>
                <View className="space-y-4">
                  {[
                    { icon: 'mail', label: 'Email', value: profile?.email },
                    { icon: 'call', label: 'Phone', value: profile?.phone },
                    { icon: 'calendar', label: 'Age', value: profile?.age ? `${profile.age} years` : null },
                    { icon: 'language', label: 'Language', value: profile?.language_preferred },
                  ].map((item, index) => item.value && (
                    <View key={index}>
                      <View className="flex-row justify-between items-center py-2">
                        <View className="flex-row items-center">
                          <Ionicons name="person" size={18} color="#6b7280" />
                          <Text className="text-gray-600 ml-3">{item.label}</Text>
                        </View>
                        <Text className="text-gray-800 font-medium">{item.value}</Text>
                      </View>
                      {index < 3 && <View className="h-px bg-gray-100" />}
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedCard>

            <AnimatedCard delay={600} style={{ marginBottom: 24 }}>
              <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <Text className="text-gray-800 font-bold mb-4 text-lg">Performance Metrics</Text>
                <View className="flex-row justify-between">
                  {[
                    { value: profile?.purchased_lead_ids?.length || 0, label: 'Leads' },
                    { value: profile?.conversation_ids?.length || 0, label: 'Conversations' },
                    { value: `₹${profile?.wallet_balance || 0}`, label: 'Wallet' },
                  ].map((item, index) => (
                    <View key={index} className="items-center flex-1">
                      <View className="bg-white rounded-full p-4 mb-2 shadow-sm">
                        <Text className="text-primary font-bold text-xl">{item.value}</Text>
                      </View>
                      <Text className="text-gray-700 text-sm font-medium">{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedCard>

            <View className="space-y-4 mb-6">
              {[
                { icon: 'people', title: 'Post-Sale Dashboard', color: primaryColor, onPress: () => router.push('/my-leads'), delay: 800 },
                { icon: 'analytics', title: 'AI Call Analysis', color: '#18FFAA', iconBg: primaryColor, textColor: primaryColor, onPress: () => router.push('/ai-call-analysis'), delay: 900 },
                { icon: 'fitness', title: 'AI Practice Arena', color: primaryColor, iconBg: '#18FFAA', onPress: () => router.push('/ai-practice-arena'), delay: 1000 },
              ].map((item, index) => (
                <AnimatedButton
                  key={index}
                  delay={item.delay}
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: item.color,
                    padding: 20,
                    borderRadius: 16,
                    marginBottom: index < 2 ? 12 : 0,
                  }}
                >
                  <View className="flex-row items-center">
                    <View className={`rounded-full p-3 mr-4 ${item.iconBg ? 'bg-' + item.iconBg : 'bg-white'}`}>
                      <Ionicons name="person" size={22} color={item.iconBg ? '#18FFAA' : primaryColor} />
                    </View>
                    <Text className={`font-semibold text-lg ${item.textColor ? 'text-' + item.textColor : 'text-white'}`}>
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={item.textColor || 'white'} />
                </AnimatedButton>
              ))}
            </View>

            <View className="space-y-3 mb-6">
              {[
                { icon: 'card-outline', title: 'Payment Details', delay: 1100 },
                { icon: 'document-text-outline', title: 'My Documents', delay: 1200 },
                { icon: 'settings-outline', title: 'Settings', delay: 1300 },
                { icon: 'help-circle-outline', title: 'Help & Support', delay: 1400 },
              ].map((item, index) => (
                <AnimatedButton
                  key={index}
                  delay={item.delay}
                  onPress={() => {}}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: 18,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#f3f4f6',
                  }}
                >
                  <Ionicons name="person" size={24} color={primaryColor} />
                  <Text className="text-gray-800 ml-4 font-medium flex-1">{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </AnimatedButton>
              ))}
              
              <AnimatedButton
                delay={1500}
                onPress={handleLogout}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fef2f2',
                  padding: 18,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#dc2626" />
                <Text className="text-red-600 ml-4 font-medium">Logout</Text>
              </AnimatedButton>
            </View>

            {profile?.createdAt && (
              <AnimatedCard delay={1600}>
                <View className="bg-white rounded-xl p-4 border border-gray-100">
                  <Text className="text-gray-600 text-sm text-center">
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </AnimatedCard>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}