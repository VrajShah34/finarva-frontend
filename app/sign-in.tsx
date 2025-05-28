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

type SignInScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SignIn'>;
};

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

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
    
    return isValid;
  };

  const handleSignIn = (): void => {
    if (validateForm()) {
      // Implement your sign in logic here
      console.log('Sign in with:', email, password);
      // Navigate to main app after successful sign in
      // navigation.navigate('Main');
    }
  };

  const navigateToRegister = (): void => {
    navigation.navigate('Register');
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
            <Text className="text-white text-3xl font-bold mb-2">Welcome back!</Text>
            <Text className="text-[#B8C5D9] text-base">Sign in to continue</Text>
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
                  placeholder="Enter your password"
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
            
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-[#1E4B88] font-medium">Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-[#4CAF50] h-14 rounded-xl justify-center items-center shadow-md mb-6"
              onPress={handleSignIn}
            >
              <Text className="text-white text-lg font-bold">Sign In</Text>
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
            <Text className="text-[#536B8E] text-base">Don't have an account? </Text>
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