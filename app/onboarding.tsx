import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type LanguageOption = 'Marathi' | 'Hindi' | 'English' | 'Bengali';
type FinanceExperience = 'Yes' | 'No';
type GenderOption = 'Male' | 'Female' | 'Other';
type OccupationOption = 'Business Owner' | 'Salaried Employee' | 'Freelancer' | 'Student' | 'Retired' | 'Homemaker' | 'Other';

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentFocusedInput, setCurrentFocusedInput] = useState<string | null>(null);
  
  // Modal states
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [occupationModalVisible, setOccupationModalVisible] = useState(false);
  
  const genderOptions: GenderOption[] = ['Male', 'Female', 'Other'];
  const occupationOptions: OccupationOption[] = [
    'Business Owner', 
    'Salaried Employee', 
    'Freelancer', 
    'Student', 
    'Retired', 
    'Homemaker', 
    'Other'
  ];
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    region: '',
    languages: [] as LanguageOption[],
    occupation: '',
    financeExp: 'No' as FinanceExperience,
    expYears: ''
  });
  
  // State to track form completion stage
  const [formCompleted, setFormCompleted] = useState(false);
  // State to track form step (1 or 2)
  const [formStep, setFormStep] = useState(1);
  // State to track keyboard visibility
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation value for smooth keyboard movement
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates.height;
        setKeyboardVisible(true);
        setKeyboardHeight(keyboardHeight);
        
        Animated.timing(keyboardAnim, {
          toValue: keyboardHeight,
          duration: 250,
          useNativeDriver: false,
        }).start();
        
        // Scroll to the focused input after a short delay
        if (currentFocusedInput && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ 
              y: getScrollPositionForField(currentFocusedInput), 
              animated: true 
            });
          }, 100);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        
        Animated.timing(keyboardAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [currentFocusedInput]);

  // Calculate appropriate scroll position for each field
  const getScrollPositionForField = (fieldName: string) => {
    const screenHeight = Dimensions.get('window').height;
    
    const fieldPositions: Record<string, number> = {
      'fullName': 80,
      'age': 160,
      'gender': 240,
      'region': 320,
      'occupation': 120,
      'expYears': 280,
    };

    return fieldPositions[fieldName] || 0;
  };

  const languages: LanguageOption[] = ['Marathi', 'Hindi', 'English', 'Bengali'];

  const toggleLanguage = (lang: LanguageOption) => {
    if (formData.languages.includes(lang)) {
      setFormData({
        ...formData,
        languages: formData.languages.filter(l => l !== lang)
      });
    } else {
      setFormData({
        ...formData,
        languages: [...formData.languages, lang]
      });
    }
  };

  const handleAutoDetect = () => {
    // Mock auto-detection functionality
    setFormData({
      ...formData,
      region: 'Pune – 411001'
    });
  };

  const handleFinanceExpToggle = (value: FinanceExperience) => {
    setFormData({
      ...formData,
      financeExp: value
    });
  };
  
  const handleGenderSelect = (gender: GenderOption) => {
    setFormData({
      ...formData,
      gender
    });
    setGenderModalVisible(false);
  };
  
  const handleOccupationSelect = (occupation: OccupationOption) => {
    setFormData({
      ...formData,
      occupation
    });
    setOccupationModalVisible(false);
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    // If in first step, move to second step
    if (formStep === 1) {
      setFormStep(2);
    } else {
      // If in second step, show AI persona view
      setFormCompleted(true);
    }
  };

  const handleGoBack = () => {
    // If in second step of form, go back to first step
    if (formStep === 2) {
      setFormStep(1);
    } 
    // If in AI persona view, go back to form step 2
    else if (formCompleted) {
      setFormCompleted(false);
    }
  };

  const handleStartJourney = () => {
    // Navigate to the main app tabs
    router.replace('/assessment');
  };

  // Dismiss keyboard when clicking outside inputs
  const handleOutsidePress = () => {
    Keyboard.dismiss();
    setCurrentFocusedInput(null);
  };

  // Generate JSON representation of user data for the prompt
  const generatedPromptJson = `{
  "name": "${formData.fullName}",
  "age": ${formData.age || 0},
  "gender": "${formData.gender}",
  "region": "${formData.region.split('–')[0].trim() || ''}",
  "preferred_languages": ${JSON.stringify(formData.languages)},
  "occupation": "${formData.occupation}",
  "finance_experience": "${formData.expYears || 0} years"
}`;  

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerTitle: "",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'white' },
        headerLeft: () => (
          <View className="flex-row items-center">
            {formCompleted || formStep > 1 ? (
              <TouchableOpacity onPress={handleGoBack} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#04457E" />
              </TouchableOpacity>
            ) : null}
            <Text className="text-[#04457E] text-2xl font-bold">Gromo</Text>
            <Text className="text-[#18FFAA] text-2xl font-bold">+</Text>
          </View>
        )
      }} />
      
      {/* Gender Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={genderModalVisible}
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setGenderModalVisible(false)}
        >
          <View className="bg-white rounded-xl w-4/5 p-4" style={{ maxHeight: '80%' }}>
            <Text className="text-[#04457E] text-lg font-semibold mb-4 text-center">Select Gender</Text>
            {genderOptions.map((gender) => (
              <TouchableOpacity 
                key={gender}
                className="py-3 border-b border-gray-200"
                onPress={() => handleGenderSelect(gender)}
              >
                <Text className="text-center text-gray-800">{gender}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              onPress={() => setGenderModalVisible(false)}
              className="mt-4 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Occupation Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={occupationModalVisible}
        onRequestClose={() => setOccupationModalVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setOccupationModalVisible(false)}
        >
          <View className="bg-white rounded-xl w-4/5 p-4" style={{ maxHeight: '80%' }}>
            <Text className="text-[#04457E] text-lg font-semibold mb-4 text-center">Select Occupation</Text>
            {occupationOptions.map((occupation) => (
              <TouchableOpacity 
                key={occupation}
                className="py-3 border-b border-gray-200"
                onPress={() => handleOccupationSelect(occupation)}
              >
                <Text className="text-center text-gray-800">{occupation}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              onPress={() => setOccupationModalVisible(false)}
              className="mt-4 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleOutsidePress} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            ref={scrollViewRef}
            className="px-6"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: isKeyboardVisible ? keyboardHeight + 100 : 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="pt-6">
              {!formCompleted ? (
                // Form Fields Section
                <>
                  {/* Header */}
                  <View className="mb-8">
                    <Text className="text-[#04457E] text-2xl font-bold mb-2">
                      Let's personalize your journey
                    </Text>
                    <Text className="text-gray-500 text-base">
                      Fill in your basic details to begin.
                    </Text>
                  </View>
                  {/* Form Fields */}
                  {formStep === 1 ? (
                    <View className="space-y-6">
                      {/* Full Name */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-2">Full Name </Text>
                        <TextInput
                          className="border border-gray-300 rounded-lg py-3 px-4 bg-white"
                          value={formData.fullName}
                          onChangeText={(text) => setFormData({...formData, fullName: text})}
                          placeholder="Enter your full name"
                          placeholderTextColor="#9ca3af"
                          onFocus={() => setCurrentFocusedInput('fullName')}
                          onBlur={() => setCurrentFocusedInput(null)}
                        />
                      </View>
                      
                      {/* Age */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-2 mt-3">Age </Text>
                        <TextInput
                          className="border border-gray-300 rounded-lg py-3 px-4 bg-white"
                          value={formData.age}
                          onChangeText={(text) => setFormData({...formData, age: text})}
                          keyboardType="numeric"
                          placeholder="Enter your age"
                          placeholderTextColor="#9ca3af"
                          onFocus={() => setCurrentFocusedInput('age')}
                          onBlur={() => setCurrentFocusedInput(null)}
                        />
                      </View>
                      
                      {/* Gender */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-2 mt-3">Gender </Text>
                        <TouchableOpacity 
                          className="border border-gray-300 rounded-lg py-3 px-4 bg-white flex-row justify-between items-center"
                          onPress={() => setGenderModalVisible(true)}
                        >
                          <Text className={formData.gender ? "text-black" : "text-gray-400"}>
                            {formData.gender || "Select your gender"}
                          </Text>
                          <Ionicons name="chevron-down" size={20} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                        
                      {/* Region/Pin Code */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-2 mt-3">Region / Pin Code</Text>
                        <View className="flex-row items-center">
                          <TextInput
                            className="border border-gray-300 rounded-lg py-3 px-4 bg-white flex-1"
                            value={formData.region}
                            onChangeText={(text) => setFormData({...formData, region: text})}
                            placeholder="Enter your region or pin code"
                            placeholderTextColor="#9ca3af"
                            onFocus={() => setCurrentFocusedInput('region')}
                            onBlur={() => setCurrentFocusedInput(null)}
                          />
                          <TouchableOpacity 
                            className="ml-3 bg-gray-200 rounded-lg px-4 py-3 flex-row items-center"
                            onPress={handleAutoDetect}
                          >
                            <Ionicons name="location" size={16} />
                            <Text className="ml-1 font-medium">Auto</Text>
                          </TouchableOpacity>
                        </View>
                        <Text className="text-gray-400 text-xs mt-1 ml-1">Auto-detect enabled. You may edit if needed.</Text>
                      </View>
                        
                      {/* Language Preferences */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-3 mt-4">
                          Which languages do you prefer for communication with your AI coach?
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-2">
                          {languages.map((lang) => (
                            <TouchableOpacity 
                              key={lang}
                              className={`py-2.5 px-5 rounded-full flex-row items-center ${
                                formData.languages.includes(lang) ? 'bg-[#18FFAA]' : 'bg-gray-100'
                              }`}
                              onPress={() => toggleLanguage(lang)}
                            >
                              {formData.languages.includes(lang) && (
                                <Ionicons name="checkmark" size={16} color="#04457E" className="mr-1" />
                              )}
                              <Text className={formData.languages.includes(lang) ? 'text-[#04457E] font-medium' : 'text-gray-800'}>
                                {lang}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <Text className="text-gray-400 text-xs mt-1">
                          Your preference guides AI's language and voice style.
                        </Text>
                      </View>
                      
                      {/* Continue Button */}
                      <TouchableOpacity 
                        className="bg-[#04457E] py-4 rounded-xl mt-6 shadow-sm"
                        onPress={handleSubmit}
                      >
                        <Text className="text-white text-center font-bold text-lg">Continue</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="space-y-6">
                      {/* Work Background */}
                      <View>
                        <Text className="text-gray-700 font-medium mb-4">Tell us a bit about your work background.</Text>
                        
                        {/* Occupation */}
                        <View className="flex-row items-center justify-between mb-5">
                          <Text className="text-gray-700 font-medium w-1/3">Occupation</Text>
                          <TouchableOpacity 
                            className="border border-gray-300 rounded-lg py-3 px-4 flex-row justify-between items-center flex-1"
                            onPress={() => setOccupationModalVisible(true)}
                          >
                            <Text className={formData.occupation ? "text-black" : "text-gray-400"}>
                              {formData.occupation || "Select occupation"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6b7280" />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Finance Experience */}
                        <View className="flex-row items-center justify-between mb-5">
                          <Text className="text-gray-700 font-medium w-1/3">Finance Exp?</Text>
                          <View className="flex-row flex-1">
                            <TouchableOpacity 
                              className={`rounded-full py-2.5 px-6 mr-3 ${formData.financeExp === 'Yes' ? 'bg-[#18FFAA]' : 'bg-gray-100'}`}
                              onPress={() => handleFinanceExpToggle('Yes')}
                            >
                              <Text className={`text-center ${formData.financeExp === 'Yes' ? 'text-[#04457E] font-medium' : 'text-gray-800'}`}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              className={`rounded-full py-2.5 px-6 ${formData.financeExp === 'No' ? 'bg-[#18FFAA]' : 'bg-gray-100'}`}
                              onPress={() => handleFinanceExpToggle('No')}
                            >
                              <Text className={`text-center ${formData.financeExp === 'No' ? 'text-[#04457E] font-medium' : 'text-gray-800'}`}>No</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        {/* Experience Years */}
                        <View className="flex-row items-center">
                          <Text className="text-gray-700 font-medium w-1/3">Exp. Years</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg py-2.5 px-4 w-24 text-center"
                            value={formData.expYears}
                            onChangeText={(text) => setFormData({...formData, expYears: text})}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#9ca3af"
                            onFocus={() => setCurrentFocusedInput('expYears')}
                            onBlur={() => setCurrentFocusedInput(null)}
                          />
                          <Text className="ml-3 text-gray-600">years</Text>
                        </View>
                      </View>
                      
                      {/* Submit Button */}
                      <TouchableOpacity 
                        className="bg-[#04457E] py-4 rounded-xl mt-6 shadow-sm"
                        onPress={handleSubmit}
                      >
                        <Text className="text-white text-center font-bold text-lg">Submit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                // AI Persona and Profile Summary Section
                <>
                  {/* Assigned AI Persona Card */}
                  <View className="bg-gray-50 rounded-xl p-5 mb-6">
                    <View className="flex-row items-center mb-2">
                      <View className="h-5 w-5 rounded-full bg-[#18FFAA] mr-2" />
                      <Text className="text-[#04457E] text-lg font-bold">Assigned AI Persona</Text>
                    </View>
                    
                    <Text className="text-[#04457E] text-xl font-semibold mb-3">
                      "Confident Seller – Multilingual Urban Male with Experience"
                    </Text>
                    
                    <View className="mb-2 flex-row">
                      <View style={{ width: 20 }}>
                        <Ionicons name="navigate-circle" size={16} color="#04457E" />
                      </View>
                      <Text className="text-black">
                        <Text className="text-[#04457E] font-semibold">Recommended: </Text>
                        Health Insurance, Monthly Plans
                      </Text>
                    </View>
                    
                    <View className="mb-3 flex-row">
                      <View style={{ width: 20 }}>
                        <Ionicons name="volume-medium" size={16} color="#04457E" />
                      </View>
                      <Text className="text-black">
                        <Text className="text-[#04457E] font-semibold">AI Voice Tone: </Text>
                        Friendly, Local Accent (Marathi + Hindi)
                      </Text>
                    </View>
                    
                    <Text className="text-gray-500 text-xs mb-2">Generated Prompt (passed to AI engine):</Text>
                    
                    <View className="bg-white rounded-lg p-3">
                      <Text className="font-mono text-xs text-gray-800">
                        {generatedPromptJson}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Profile Summary Card */}
                  <View className="bg-gray-50 rounded-xl p-5 mb-6">
                    <View className="flex-row items-center mb-4">
                      <Ionicons name="person-outline" size={18} color="#04457E" />
                      <Text className="text-[#04457E] text-lg font-bold ml-2">Profile Summary</Text>
                    </View>
                    
                    {/* Name, Age and Gender */}
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="person" size={16} color="#04457E" />
                      <Text className="text-[#04457E] font-semibold ml-2">{formData.fullName}</Text>
                      <Text className="text-gray-600 ml-2">• {formData.age} • {formData.gender}</Text>
                    </View>
                    
                    {/* Location */}
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="location" size={16} color="#e53e3e" />
                      <Text className="text-gray-700 ml-2">Pune (411001)</Text>
                    </View>
                    
                    {/* Languages */}
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="chatbubbles" size={16} color="#718096" />
                      <Text className="text-gray-700 ml-2">{formData.languages.join(', ')}</Text>
                    </View>
                    
                    {/* Profession */}
                    <View className="flex-row items-center">
                      <FontAwesome5 name="briefcase" size={14} color="#8b5cf6" />
                      <Text className="text-gray-700 ml-2">{formData.occupation || "Not specified"} • {formData.expYears || "0"} Years in Finance</Text>
                    </View>
                  </View>
                  
                  {/* Start Journey Button */}
                  <TouchableOpacity 
                    className="bg-[#18FFAA] py-4 rounded-xl mb-2 flex-row justify-center items-center shadow-sm"
                    onPress={handleStartJourney}
                  >
                    <Ionicons name="rocket" size={20} color="#04457E" />
                    <Text className="text-[#04457E] text-center font-bold ml-2 text-lg">Start My AI Journey</Text>
                  </TouchableOpacity>
                  
                  {/* Go Back Button */}
                  <TouchableOpacity 
                    className="border border-gray-300 py-3 rounded-xl mb-4 flex-row justify-center items-center"
                    onPress={() => setFormCompleted(false)}
                  >
                    <Ionicons name="arrow-back" size={18} color="#6b7280" />
                    <Text className="text-gray-600 text-center font-medium ml-2">Go Back to Form</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}