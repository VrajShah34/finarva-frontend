// app/(app)/module/case-study.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { dummyModuleData } from '../services/dummyData';
import AIAssessmentModal from '../components/AIAssessmentModal';
import { apiService, SubmitAnswerResponse } from '../services/api';

const CaseStudyScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAIAssessment, setShowAIAssessment] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(145); // 2:25 in seconds
  const [moduleData, setModuleData] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);

  const caseScenario = moduleData?.module?.case_scenario;

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const response = await apiService.getModuleDetails(String(moduleId));
        if (response.success && response.data) {
          setModuleData(response.data);
        }
      } catch (error) {
        console.error('Error fetching module:', error);
      }
    };

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  const handleOptionSelect = (option: string) => {
    if (!hasSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || submitLoading) {
      Alert.alert('Error', 'Please select an option before submitting.');
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await apiService.submitAnswer(String(moduleId), selectedOption);
      
      if (response.success && response.data) {
        setHasSubmitted(true);
        setConversationId(response.data.conversation_id);
        setInitialQuestion(response.data.initial_question);
        setBackendFeedback(response.data.progress.feedback || null);
        
        console.log('Case study submission response:', {
          conversationId: response.data.conversation_id,
          initialQuestion: response.data.initial_question,
          feedback: response.data.progress.feedback
        });
        
        // Show AI assessment after delay
        setTimeout(() => {
          setShowAIAssessment(true);
        }, 2000);
      } else {
        Alert.alert('Error', response.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const isCorrectAnswer = selectedOption === caseScenario?.correct_option;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const handleAIAssessmentComplete = () => {
    setShowAIAssessment(false);
    // Reset conversation state
    setConversationId(null);
    setInitialQuestion(null);
    router.back(); // Return to course details
  };

  const handleAIAssessmentClose = () => {
    setShowAIAssessment(false);
    // Keep conversation state in case user wants to reopen
  };

  if (!caseScenario) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">No case scenario available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3 p-1" 
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <Text className="text-[#1E4B88] text-xl font-bold">
            Module Progress
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-2">4 of 4</Text>
          <TouchableOpacity className="mr-4">
            <Icon name="dots-vertical" size={24} color="#1E4B88" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-[#1E4B88]">
          <Text className="text-[#1E4B88] font-medium">Assessment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Case Scenario Header */}
        <View className="px-4 py-6 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Case Scenario
          </Text>
          
          {/* Patient info card */}
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-700 text-base leading-relaxed">
              {caseScenario.context}
            </Text>
            
            {/* Additional details */}
            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm text-gray-700 mb-1">
                <Text className="font-medium">Vitals:</Text> BP 165/95, HR 92, RR 18, O2 98%
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                <Text className="font-medium">History:</Text> HTN, acute MI 2018
              </Text>
              <Text className="text-sm text-gray-700">
                <Text className="font-medium">Lab results:</Text> Troponin is 0.12 ng/mL (normal range 0.04 ng/mL)
              </Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-6">
            {caseScenario.question}
          </Text>

          {/* Options */}
          <View className="space-y-3">
            {caseScenario.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = hasSubmitted && option === caseScenario.correct_option;
              const isWrong = hasSubmitted && isSelected && !isCorrect;
              
              return (
                <TouchableOpacity
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-500'
                      : isWrong
                      ? 'bg-red-50 border-red-500'
                      : isSelected
                      ? 'bg-blue-50 border-[#1E4B88]'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleOptionSelect(option)}
                  disabled={hasSubmitted}
                >
                  <View className="flex-row items-start">
                    <View 
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isCorrect
                          ? 'bg-green-500'
                          : isWrong
                          ? 'bg-red-500'
                          : isSelected
                          ? 'bg-[#1E4B88]'
                          : 'bg-gray-200'
                      }`}
                    >
                      {hasSubmitted && isCorrect ? (
                        <Icon name="check" size={16} color="white" />
                      ) : hasSubmitted && isWrong ? (
                        <Icon name="close" size={16} color="white" />
                      ) : (
                        <Text 
                          className={`font-bold ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {getOptionLetter(index)}
                        </Text>
                      )}
                    </View>
                    <Text 
                      className={`flex-1 text-base ${
                        isCorrect
                          ? 'text-green-800'
                          : isWrong
                          ? 'text-red-800'
                          : isSelected
                          ? 'text-[#1E4B88]'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation (shown after submission) */}
          {hasSubmitted && (backendFeedback || caseScenario?.rationale) && (
            <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <View className="flex-row items-start mb-2">
                <Icon name="lightbulb-outline" size={20} color="#F59E0B" />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Explanation
                </Text>
              </View>
              <Text className="text-gray-700 text-base leading-relaxed">
                {backendFeedback || caseScenario?.rationale}
              </Text>
            </View>
          )}

          {/* Question info */}
          <View className="mt-6 flex-row justify-between items-center">
            <Text className="text-gray-500 text-sm">Question 1 of 1</Text>
            <View className="flex-row items-center">
              <Icon name="clock-outline" size={16} color="#666" />
              <Text className="text-gray-500 text-sm ml-1">
                {formatTime(timeRemaining)} remaining
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom section */}
      <View className="px-4 py-4 border-t border-gray-200 bg-white">
        {!hasSubmitted ? (
          <>
            {/* Submit button */}
            <TouchableOpacity 
              className={`w-full py-4 rounded-lg items-center mb-4 ${
                selectedOption && !submitLoading ? 'bg-[#1E4B88]' : 'bg-gray-300'
              }`}
              onPress={handleSubmit}
              disabled={!selectedOption || submitLoading}
            >
              <Text className={`font-bold text-lg ${
                selectedOption && !submitLoading ? 'text-white' : 'text-gray-500'
              }`}>
                {submitLoading ? 'Submitting...' : 'Submit Answer'}
              </Text>
            </TouchableOpacity>

            {/* Confidence slider */}
            <View className="items-center">
              <Text className="text-gray-600 text-sm mb-2">Confidence</Text>
              <View className="flex-row items-center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    className={`w-6 h-6 rounded-full mx-1 ${
                      level <= confidence ? 'bg-[#4DF0A9]' : 'bg-gray-200'
                    }`}
                    onPress={() => setConfidence(level)}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <TouchableOpacity 
            className="w-full bg-[#4DF0A9] py-4 rounded-lg items-center"
            onPress={() => setShowAIAssessment(true)}
          >
            <Text className="text-[#1E4B88] font-bold text-lg">
              Continue to AI Assessment
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI Assessment Modal */}
      <AIAssessmentModal
        visible={showAIAssessment}
        conversationId={conversationId}
        initialQuestion={initialQuestion}
        onComplete={handleAIAssessmentComplete}
        onClose={handleAIAssessmentClose}
      />
    </SafeAreaView>
  );
};

export default CaseStudyScreen;