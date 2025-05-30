// screens/auth/RegisterScreen.tsx
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
import { apiService, RegisterRequest } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  SignIn: undefined;
  Register: undefined;
  Main: undefined;
};

type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const languages = [
  'English',
  'Hindi',
  'Marathi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi'
];

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    confirmPassword: '',
    languagePreferred: 'English',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '', age: '', password: '', confirmPassword: '' };
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        newErrors.age = 'Age must be between 16 and 100';
        isValid = false;
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const registerData: RegisterRequest = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        age: parseInt(formData.age),
        password: formData.password,
        language_preferred: formData.languagePreferred,
      };
      
      const response = await apiService.register(registerData);

      console.log("Register Response:", response);
      
      if (response.success && response.data) {
        // Store user data and token
        const { token, learner_id, _id } = response.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', _id);
        await AsyncStorage.setItem('learnerId', learner_id);
        
        Alert.alert(
          'Success',
          response.data.message || 'Account created successfully!',
          [
            {
              text: 'Continue',
              onPress: () => router.navigate('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToSignIn = (): void => {
    router.navigate('/sign-in');
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
          <View className="bg-[#1E4B88] py-10 px-6 rounded-b-[30px]">
            <Text className="text-white text-2xl font-bold mb-6">Gromo+</Text>
            <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
            <Text className="text-[#B8C5D9] text-base">Join us today</Text>
          </View>
          
          {/* Form */}
          <View className="px-6 py-8">
            {/* Name Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Full Name</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.name ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="account-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0A0A0"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.name}</Text> : null}
            </View>

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
                />
              </View>
              {errors.email ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.email}</Text> : null}
            </View>

            {/* Phone Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Phone Number</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.phone ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="phone-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#A0A0A0"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.phone}</Text> : null}
            </View>

            {/* Age Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Age</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.age ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="calendar-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your age"
                  placeholderTextColor="#A0A0A0"
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              {errors.age ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.age}</Text> : null}
            </View>

            {/* Language Preference */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Preferred Language</Text>
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-xl border border-[#E1E5EB] h-14 px-4"
                onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Icon name="translate" size={20} color="#536B8E" className="mr-3" />
                <Text className="flex-1 text-base text-[#333]">{formData.languagePreferred}</Text>
                <Icon name={showLanguageDropdown ? "chevron-up" : "chevron-down"} size={20} color="#536B8E" />
              </TouchableOpacity>
              
              {showLanguageDropdown && (
                <View className="bg-white border border-[#E1E5EB] rounded-xl mt-2 max-h-40">
                  <ScrollView>
                    {languages.map((language, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`py-3 px-4 border-b border-[#F0F0F0] ${index === languages.length - 1 ? 'border-b-0' : ''}`}
                        onPress={() => {
                          updateFormData('languagePreferred', language);
                          setShowLanguageDropdown(false);
                        }}
                      >
                        <Text className={`text-base ${formData.languagePreferred === language ? 'text-[#4CAF50] font-medium' : 'text-[#333]'}`}>
                          {language}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Password Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Password</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.password ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="lock-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Create a password"
                  placeholderTextColor="#A0A0A0"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
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
            
            {/* Confirm Password Field */}
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Confirm Password</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${errors.confirmPassword ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="lock-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Confirm your password"
                  placeholderTextColor="#A0A0A0"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="p-2"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#536B8E"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{errors.confirmPassword}</Text> : null}
            </View>
            
            {/* Register Button */}
            <TouchableOpacity 
              className={`h-14 rounded-xl justify-center items-center shadow-md mb-6 mt-8 ${loading ? 'bg-[#A5D6A7]' : 'bg-[#4CAF50]'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-lg font-bold">Register</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Sign In Link */}
          <View className="flex-row justify-center items-center py-6">
            <Text className="text-[#536B8E] text-base">Already have an account? </Text>
            <TouchableOpacity onPress={navigateToSignIn}>
              <Text className="text-[#4CAF50] text-base font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;