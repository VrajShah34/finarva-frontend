// screens/auth/SignInScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, LoginRequest } from '../services/api';

type RootStackParamList = {
  SignIn: undefined;
  Register: undefined;
  Main: undefined;
};

type SignInScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SignIn'>;
};

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const loginData: LoginRequest = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };
      
      const response = await apiService.login(loginData);
      
      if (response.success && response.data) {
        // Store user data and token
        const { token, learner_id, _id } = response.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', _id);
        await AsyncStorage.setItem('learnerId', learner_id);
        
        Alert.alert(
          'Success',
          'Welcome back!',
          [
            {
              text: 'OK',
              onPress: () => router.navigate('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Sign In Failed', response.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }

    // router.navigate('/(tabs)');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToRegister = (): void => {
    router.navigate('/register');
  };

  const handleForgotPassword = (): void => {
    Alert.alert(
      'Forgot Password',
      'Please contact support for password reset assistance.',
      [
        { text: 'OK' }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <StatusBar backgroundColor="#1E4B88" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-grow" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-[#1E4B88] py-12 px-6 rounded-b-[30px]">
            <Text className="text-white text-2xl font-bold mb-6">Gromo+</Text>
            <Text className="text-white text-3xl font-bold mb-2">Welcome back!</Text>
            <Text className="text-[#B8C5D9] text-base">Sign in to continue</Text>
          </View>
          
          {/* Form */}
          <View className="px-6 py-8">
            {/* Email Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Email</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.email ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="email-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.email}</Text> : null}
            </View>
            
            {/* Password Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Password</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.password ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="lock-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  className="p-2"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#536B8E"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.password}</Text> : null}
            </View>
            
            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6" onPress={handleForgotPassword}>
              <Text className="text-[#1E4B88] font-medium">Forgot Password?</Text>
            </TouchableOpacity>
            
            {/* Sign In Button */}
            <TouchableOpacity 
              className={`h-14 rounded-xl justify-center items-center shadow-md mb-6 ${loading ? 'bg-[#A5D6A7]' : 'bg-[#4CAF50]'}`}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-lg font-bold">Sign In</Text>
              )}
            </TouchableOpacity>
            
            {/* Demo Credentials (Remove in production) */}
            <View className="bg-[#FFF3E0] p-4 rounded-xl mb-6">
              <Text className="text-[#FF9800] text-sm font-medium mb-2">Demo Credentials:</Text>
              <Text className="text-[#666] text-sm">Email: akshay@gmail.com</Text>
              <Text className="text-[#666] text-sm">Password: testpassword123</Text>
            </View>
          </View>
          
          {/* Register Link */}
          <View className="flex-row justify-center items-center py-6">
            <Text className="text-[#536B8E] text-base">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-[#4CAF50] text-base font-bold">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;