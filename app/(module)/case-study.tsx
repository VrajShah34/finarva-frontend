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
import { apiService, SubmitAnswerResponse } from '../services/api';
import AIAssessmentModal from '../components/AIAssessmentModal';

const CaseStudyScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAIAssessment, setShowAIAssessment] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(145);
  const [moduleData, setModuleData] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<{
    feedback: string;
    score: number | null;
    assessment: string;
  } | null>(null);

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
    return String.fromCharCode(65 + index);
  };

  const handleAIAssessmentComplete = (data?: { feedback: string; score: number | null; assessment: string }) => {
    setShowAIAssessment(false);
    if (data) {
      setCompletionData(data);
      // Auto-navigate back after 3 seconds
      setTimeout(() => {
        router.back();
      }, 3000);
    }
  };

  const handleAIAssessmentClose = () => {
    setShowAIAssessment(false);
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
      
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3 p-1" onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <Text className="text-[#1E4B88] text-xl font-bold">Module Progress</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-2">4 of 4</Text>
          <TouchableOpacity className="mr-4">
            <Icon name="dots-vertical" size={24} color="#1E4B88" />
          </TouchableOpacity>
        </View>
      </View>

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
        <View className="px-4 py-6 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Case Scenario</Text>
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-700 text-base leading-relaxed">{caseScenario.context}</Text>
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

        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-6">{caseScenario.question}</Text>
          <View className="space-y-3">
            {caseScenario.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = hasSubmitted && option === caseScenario.correct_option;
              const isWrong = hasSubmitted && isSelected && !isCorrect;
              
              return (
                <TouchableOpacity
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'bg-green-50 border-green-500' :
                    isWrong ? 'bg-red-50 border-red-500' :
                    isSelected ? 'bg-blue-50 border-[#1E4B88]' : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleOptionSelect(option)}
                  disabled={hasSubmitted}
                >
                  <View className="flex-row items-start">
                    <View 
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isCorrect ? 'bg-green-500' :
                        isWrong ? 'bg-red-500' :
                        isSelected ? 'bg-[#1E4B88]' : 'bg-gray-200'
                      }`}
                    >
                      {hasSubmitted && isCorrect ? (
                        <Icon name="check" size={16} color="white" />
                      ) : hasSubmitted && isWrong ? (
                        <Icon name="close" size={16} color="white" />
                      ) : (
                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                          {getOptionLetter(index)}
                        </Text>
                      )}
                    </View>
                    <Text 
                      className={`flex-1 text-base ${
                        isCorrect ? 'text-green-800' :
                        isWrong ? 'text-red-800' :
                        isSelected ? 'text-[#1E4B88]' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {hasSubmitted && (backendFeedback || caseScenario?.rationale) && !completionData && (
            <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <View className="flex-row items-start mb-2">
                <Icon name="lightbulb-outline" size={20} color="#F59E0B" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Explanation</Text>
              </View>
              <Text className="text-gray-700 text-base leading-relaxed">
                {backendFeedback || caseScenario?.rationale}
              </Text>
            </View>
          )}

          {completionData && (
  <View className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
    <View className="flex-row items-center mb-2">
      <Icon name="check-circle" size={24} color="#10B981" />
      <Text className="text-lg font-bold text-gray-800 ml-2">Module Completed</Text>
    </View>
    <Text className="text-gray-700 text-base font-medium">
      Congratulations, you have completed the module!
    </Text>
    {completionData.score !== null && (
      <Text className="text-gray-700 text-base mt-2">
        Your Score: {completionData.score}
      </Text>
    )}
    {completionData.feedback && (
      <Text className="text-gray-700 text-base mt-2">
        Feedback: {completionData.feedback}
      </Text>
    )}
    {completionData.assessment && (
      <Text className="text-gray-700 text-base mt-2">
        Assessment: {completionData.assessment}
      </Text>
    )}
  </View>
)}

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

      <View className="px-4 py-4 border-t border-gray-200 bg-white">
        {!hasSubmitted ? (
          <>
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
        ) : !completionData && (
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