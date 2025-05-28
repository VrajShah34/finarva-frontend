import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
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

type RootStackParamList = {
  SignIn: undefined;
  Register: undefined;
  Main: undefined;
};

type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleRegister = (): void => {
    if (validateForm()) {
      // Implement your registration logic here
      console.log('Register with:', email, password);
      // Navigate to main app after successful registration
      // navigation.navigate('Main');
    }
  };

  const navigateToSignIn = (): void => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <StatusBar backgroundColor="#1E4B88" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-grow">
          {/* Header */}
          <View className="bg-[#1E4B88] py-10 px-6 rounded-b-[30px]">
            <Text className="text-white text-2xl font-bold mb-6">Gromo+</Text>
            <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
            <Text className="text-[#B8C5D9] text-base">Join us today</Text>
          </View>
          
          {/* Form */}
          <View className="px-6 py-8">
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Email</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${emailError ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="email-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{emailError}</Text> : null}
            </View>
            
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Password</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${passwordError ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="lock-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Create a password"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={setPassword}
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
              {passwordError ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{passwordError}</Text> : null}
            </View>
            
            <View className="mb-5">
              <Text className="text-base font-medium text-[#1E4B88] mb-2">Confirm Password</Text>
              <View className={`flex-row items-center bg-white rounded-xl border ${confirmPasswordError ? 'border-[#FF5252]' : 'border-[#E1E5EB]'} h-14 px-4`}>
                <Icon name="lock-outline" size={20} color="#536B8E" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-[#333]"
                  placeholder="Confirm your password"
                  placeholderTextColor="#A0A0A0"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
              {confirmPasswordError ? <Text className="text-[#FF5252] text-xs mt-1 ml-1">{confirmPasswordError}</Text> : null}
            </View>
            
            <View className="flex-row items-center mb-6">
              <TouchableOpacity className="w-5 h-5 rounded border border-[#536B8E] mr-2" />
              <Text className="text-[#536B8E] text-sm">
                I agree to the <Text className="text-[#1E4B88] font-medium">Terms & Conditions</Text> and <Text className="text-[#1E4B88] font-medium">Privacy Policy</Text>
              </Text>
            </View>
            
            <TouchableOpacity 
              className="bg-[#4CAF50] h-14 rounded-xl justify-center items-center shadow-md mb-6"
              onPress={handleRegister}
            >
              <Text className="text-white text-lg font-bold">Register</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#E1E5EB]" />
              <Text className="text-[#536B8E] mx-3 font-medium">OR</Text>
              <View className="flex-1 h-[1px] bg-[#E1E5EB]" />
            </View>
            
            <TouchableOpacity className="flex-row bg-white h-14 rounded-xl justify-center items-center border border-[#E1E5EB]">
              <Icon name="google" size={20} color="#1E4B88" />
              <Text className="text-[#1E4B88] text-base font-medium ml-2">Continue with Google</Text>
            </TouchableOpacity>
          </View>
          
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