import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Question = {
  id: number;
  section: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function QuizScreen() {
  const router = useRouter();
  const [showQuizModal, setShowQuizModal] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  const questions: Question[] = [
    // Section 1: Insurance
    {
      id: 1,
      section: 1,
      text: 'What is the main benefit of a term life insurance policy?',
      options: [
        'Large coverage at low premium',
        'Fixed returns',
        'Medical cost coverage',
        'Investment growth'
      ],
      correctAnswer: 0,
      explanation: 'Term plans provide pure protection at low cost.'
    },
    {
      id: 2,
      section: 1,
      text: 'Which insurance offers protection against critical illnesses?',
      options: [
        'Term insurance',
        'Critical illness insurance',
        'Personal accident insurance',
        'Motor insurance'
      ],
      correctAnswer: 1,
      explanation: 'Critical illness insurance provides a lump sum payout if you\'re diagnosed with specific serious conditions.'
    },
    
    // Section 2: Investment
    {
      id: 3,
      section: 2,
      text: 'Which investment typically has the highest potential return over the long term?',
      options: [
        'Fixed deposits',
        'Savings account',
        'Equity investments',
        'Gold'
      ],
      correctAnswer: 2,
      explanation: 'Historically, equity investments have provided the highest returns over long periods despite short-term volatility.'
    },
    {
      id: 4,
      section: 2,
      text: 'What is the primary benefit of diversification in investments?',
      options: [
        'Guaranteed returns',
        'Risk reduction',
        'Tax savings',
        'Higher dividends'
      ],
      correctAnswer: 1,
      explanation: 'Diversification spreads risk across different assets, reducing overall portfolio risk.'
    },
    
    // Section 3: Financial Planning
    {
      id: 5,
      section: 3,
      text: 'What should typically be the first step in financial planning?',
      options: [
        'Investing in mutual funds',
        'Creating an emergency fund',
        'Buying insurance',
        'Planning for retirement'
      ],
      correctAnswer: 1,
      explanation: 'An emergency fund provides financial security and should be established before other investments.'
    },
    {
      id: 6,
      section: 3,
      text: 'What is the recommended size of an emergency fund?',
      options: [
        '1 month of expenses',
        '3-6 months of expenses',
        '1 year of salary',
        'Same as your annual income'
      ],
      correctAnswer: 1,
      explanation: '3-6 months of expenses is generally recommended to handle most financial emergencies.'
    }
  ];

  // Get current question
  const currentQuestion = questions.filter(q => q.section === currentSection)[currentQuestionIndex];
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Timer effect
  useEffect(() => {
    if (showAnswer || showQuizModal) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion, showAnswer, showQuizModal]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (!showQuizModal) {
      setTimeLeft(45);
    }
  }, [currentQuestion, showQuizModal]);

  const handleStartQuiz = () => {
    setShowQuizModal(false);
  };

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    const sectionQuestions = questions.filter(q => q.section === currentSection);
    
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      // Move to next question in current section
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSection < 3) {
      // Move to next section
      setCurrentSection(currentSection + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Quiz completed
      router.replace('/(tabs)/learn');
    }
    
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handleCompleteQuiz = () => {
    // Navigate to the main tabs when user clicks "Complete Quiz"
    router.replace('/(tabs)/learn');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a4689]">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Quiz Introduction Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showQuizModal}
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white w-full rounded-xl p-6">
            <View className="w-16 h-16 rounded-full bg-[#1a4689] self-center mb-4 items-center justify-center">
              <Ionicons name="school" size={32} color="white" />
            </View>
            
            <Text className="text-2xl font-bold text-[#1a4689] text-center mb-2">
              Knowledge Assessment
            </Text>
            
            <Text className="text-gray-700 text-center mb-6">
              Now it's time to take a quick knowledge quiz to help us understand your financial knowledge level and personalize your learning journey!
            </Text>
            
            <Text className="text-gray-700 mb-6">
              This quiz covers:
            </Text>
            
            <View className="mb-6 space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text className="ml-2 text-gray-700">Insurance basics</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text className="ml-2 text-gray-700">Investment concepts</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text className="ml-2 text-gray-700">Financial planning</Text>
              </View>
            </View>
            
            <TouchableOpacity
              className="bg-[#1a4689] py-4 rounded-xl flex-row justify-center items-center"
              onPress={handleStartQuiz}
            >
              <Text className="text-white text-center font-bold mr-2">Start Quiz</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-[#1a4689] px-5 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleBackPress} className="flex-row items-center">
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Knowledge Assessment Quiz
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="volume-medium" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-white text-center mt-2">
            Gauge your knowledge. Let the AI fine-tune your learning.
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View className="flex-row items-center justify-between px-10 py-4 bg-white">
          <View className={`w-10 h-10 rounded-full ${currentSection >= 1 ? 'bg-teal-500' : 'bg-gray-300'} items-center justify-center`}>
            <Text className="text-white font-bold">1</Text>
          </View>
          
          <View className="h-1 flex-1 bg-gray-300 mx-2">
            <View 
              className="h-full bg-teal-500" 
              style={{ width: currentSection > 1 ? '100%' : '0%' }}
            />
          </View>
          
          <View className={`w-10 h-10 rounded-full ${currentSection >= 2 ? 'bg-teal-500' : 'bg-gray-300'} items-center justify-center`}>
            <Text className="text-white font-bold">2</Text>
          </View>
          
          <View className="h-1 flex-1 bg-gray-300 mx-2">
            <View 
              className="h-full bg-teal-500" 
              style={{ width: currentSection > 2 ? '100%' : '0%' }}
            />
          </View>
          
          <View className={`w-10 h-10 rounded-full ${currentSection >= 3 ? 'bg-teal-500' : 'bg-gray-300'} items-center justify-center`}>
            <Text className="text-white font-bold">3</Text>
          </View>
        </View>
        
        <ScrollView className="flex-1 p-4">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            {/* Question Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text className="text-gray-700 ml-2">
                  Q{currentQuestion.id} of 10 - Life Insurance
                </Text>
              </View>
              <Text className="text-[#1a4689] font-bold">
                {formatTime(timeLeft)}
              </Text>
            </View>
            
            {/* Question */}
            <Text className="text-xl font-bold text-[#1a4689] mb-4">
              {currentQuestion.text}
            </Text>
            
            {/* Options */}
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`border rounded-lg p-4 mb-3 flex-row items-center justify-start ${
                  selectedOption === index 
                    ? (index === currentQuestion.correctAnswer 
                        ? 'border-teal-500 bg-white' 
                        : 'border-red-500 bg-white')
                    : 'border-gray-300 bg-gray-50'
                }`}
                onPress={() => handleSelectOption(index)}
              >
                <View className={`w-6 h-6 rounded-full border ${
                  selectedOption === index 
                    ? (index === currentQuestion.correctAnswer 
                        ? 'border-teal-500' 
                        : 'border-red-500')
                    : 'border-gray-300'
                } items-center justify-center mr-3`}>
                  {selectedOption === index && (
                    index === currentQuestion.correctAnswer 
                      ? <Ionicons name="checkmark" size={18} color="#10b981" /> 
                      : <Ionicons name="close" size={18} color="#ef4444" />
                  )}
                </View>
                <Text className={`flex-1 ${
                  selectedOption === index 
                    ? (index === currentQuestion.correctAnswer 
                        ? 'text-teal-600' 
                        : 'text-red-600')
                    : 'text-gray-700'
                }`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Explanation */}
            {showAnswer && (
              <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="ml-2 text-green-800 font-bold">Correct!</Text>
                </View>
                <Text className="text-green-800">
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
            
            {/* Timer and Next Button */}
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row items-center">
                <Ionicons name="timer-outline" size={20} color="#666" />
                <Text className="ml-1 text-gray-500">{formatTime(timeLeft)}</Text>
              </View>
              
              {showAnswer && (
                <TouchableOpacity 
                  className="bg-teal-500 py-3 px-4 rounded-lg flex-row items-center"
                  onPress={handleNextQuestion}
                >
                  <Text className="text-white font-bold mr-2">Next Question</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
        
        {/* Complete Quiz Button at bottom */}
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="bg-[#1a4689] py-4 rounded-xl flex-row justify-center items-center"
            onPress={handleCompleteQuiz}
          >
            <Text className="text-white text-center font-bold mr-2">Complete Quiz</Text>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        {/* <View className="bg-white p-4 flex-row justify-between items-center border-t border-gray-200">
          <View className="flex-row items-center">
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              className="w-10 h-10 rounded-full"
            />
            <View className="ml-2">
              <Text className="font-bold text-gray-800">Rahul Kumar</Text>
              <Text className="text-gray-500 text-sm">GroMo Partner</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <Ionicons name="trophy" size={24} color="#1a4689" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="settings" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View> */}
      </View>
    </SafeAreaView>
  );
}