// app/components/AIAssessmentModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, ChatbotResponse } from '../services/api';

interface AIAssessmentModalProps {
  visible: boolean;
  conversationId: string | null;
  initialQuestion: string | null;
  onComplete: (completionData?: { feedback: string; score: number | null; assessment: string }) => void;
  onClose: () => void;
}

interface ConversationMessage {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const { width, height } = Dimensions.get('window');

export default function AIAssessmentModal({ 
  visible, 
  conversationId, 
  initialQuestion,
  onComplete, 
  onClose 
}: AIAssessmentModalProps) {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [waveAnimation] = useState(new Animated.Value(0));
  const [voiceLevel] = useState(new Animated.Value(0));
  const [isCompleted, setIsCompleted] = useState(false);
  const [waitingForFirstResponse, setWaitingForFirstResponse] = useState(true);

  console.log("=== AI Assessment Modal Debug ===");
  console.log("visible:", visible);
  console.log("conversationId:", conversationId);
  console.log("initialQuestion:", initialQuestion);
  console.log("conversation length:", conversation.length);
  console.log("waitingForFirstResponse:", waitingForFirstResponse);
  console.log("isCompleted:", isCompleted);

  // Initialize conversation when modal opens
  useEffect(() => {
    console.log("=== Effect: Modal Initialization ===");
    console.log("visible:", visible, "initialQuestion exists:", !!initialQuestion);
    
    if (visible && initialQuestion && conversation.length === 0) {
      console.log("Initializing conversation with:", initialQuestion);
      
      const initialMessage: ConversationMessage = {
        id: `ai_initial_${Date.now()}`,
        type: 'ai',
        text: initialQuestion,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setConversation([initialMessage]);
      setWaitingForFirstResponse(true);
      setIsCompleted(false);
      console.log("Initial conversation set");
    }
  }, [visible, initialQuestion]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      console.log("Modal closed - resetting state");
      setConversation([]);
      setCurrentResponse('');
      setIsAIThinking(false);
      setIsCompleted(false);
      setWaitingForFirstResponse(true);
    }
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      startVoiceAnimation();
    } else {
      stopVoiceAnimation();
    }
  }, [isRecording]);

  const startVoiceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(voiceLevel, {
          toValue: Math.random(),
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const stopVoiceAnimation = () => {
    waveAnimation.stopAnimation();
    voiceLevel.stopAnimation();
    voiceLevel.setValue(0);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
  };

const handleSendResponse = async () => {
  if (!currentResponse.trim() || !conversationId || isAIThinking) {
    console.log("Cannot send response:", {
      hasResponse: !!currentResponse.trim(),
      hasConversationId: !!conversationId,
      isThinking: isAIThinking
    });
    return;
  }
  
  console.log("=== Sending Response ===");
  console.log("conversationId:", conversationId);
  console.log("response:", currentResponse);
  
  const userMessage: ConversationMessage = {
    id: `user_${Date.now()}`,
    type: 'user',
    text: currentResponse,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
  
  setConversation(prev => {
    console.log("Adding user message to conversation");
    return [...prev, userMessage];
  });
  
  const userResponseText = currentResponse;
  setCurrentResponse('');
  setIsAIThinking(true);
  setWaitingForFirstResponse(false);

  try {
    console.log("Calling submitChatbotResponse API...");
    const response = await apiService.submitChatbotResponse(conversationId, userResponseText);
    
    console.log("=== API Response ===");
    console.log("success:", response.success);
    console.log("response data:", JSON.stringify(response.data, null, 2));
    
    if (response.success && response.data) {
      const { 
        bot_response, 
        next_question, 
        is_completed, 
        final_score, 
        assessment, 
        feedback, 
        current_score, 
        progress,
        message,
        evaluation,
        interaction_count 
      } = response.data;
      
      console.log("Bot response:", bot_response);
      console.log("Next question:", next_question);
      console.log("Is completed:", is_completed);
      console.log("Final score:", final_score);
      console.log("Assessment:", assessment);
      console.log("Feedback (top-level):", feedback);
      console.log("Current score:", current_score);
      console.log("Progress feedback:", progress?.feedback);
      console.log("Progress status:", progress?.status);
      console.log("Evaluation:", evaluation);
      console.log("Interaction count:", interaction_count);
      
      if (bot_response || next_question) {
        const aiMessage: ConversationMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          text: bot_response || next_question || '',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setConversation(prev => {
          console.log("Adding AI message to conversation");
          return [...prev, aiMessage];
        });
      }
      
      const totalResponses = getTotalResponses();
      console.log("Total user responses:", totalResponses);
      
      const isModuleCompleted = progress?.status === "completed" || totalResponses >= 3 || is_completed || interaction_count >= 3;
      
      if (isModuleCompleted) {
        console.log("Completing assessment");
        setIsCompleted(true);
        
        const completionFeedback = progress?.feedback || feedback || message || "No feedback provided.";
        const score = final_score !== undefined ? final_score : (current_score !== undefined ? current_score : null);
        
        const completionData = {
          feedback: completionFeedback,
          score,
          assessment: assessment || "No assessment provided."
        };
        
        setTimeout(() => {
          console.log("Closing modal and passing completion data");
          onComplete(completionData);
        }, 1000);
      } else if (!bot_response && !next_question && !isModuleCompleted) {
        console.warn("No bot_response or next_question received");
        const warningMessage: ConversationMessage = {
          id: `warning_${Date.now()}`,
          type: 'ai',
          text: 'No further questions received. Please try submitting again or contact support.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setConversation(prev => [...prev, warningMessage]);
      }
    } else {
      console.error("API Error:", response.error || response.message);
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        text: response.error || response.message || 'Sorry, there was an error processing your response. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, errorMessage]);
    }
  } catch (error) {
    console.error('=== Network Error ===', error);
    const errorMessage: ConversationMessage = {
      id: `error_${Date.now()}`,
      type: 'ai',
      text: 'Sorry, there was a network error. Please check your connection and try again.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setConversation(prev => [...prev, errorMessage]);
  } finally {
    setIsAIThinking(false);
  }
};
  const renderVoiceWave = () => {
    const waves = Array.from({ length: 5 }, (_, index) => {
      const animatedHeight = waveAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 30 + Math.random() * 20],
      });

      return (
        <Animated.View
          key={index}
          style={{
            width: 4,
            height: animatedHeight,
            backgroundColor: '#4DF0A9',
            marginHorizontal: 2,
            borderRadius: 2,
          }}
        />
      );
    });

    return (
      <View className="flex-row items-center justify-center">
        {waves}
      </View>
    );
  };

  const getQuestionNumber = () => {
    const aiMessages = conversation.filter(msg => 
      msg.type === 'ai' && !msg.text.includes('completed the assessment')
    );
    return aiMessages.length;
  };

  const getTotalResponses = () => {
    return conversation.filter(msg => msg.type === 'user').length;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-900">
        {/* Header */}
        <View className="pt-12 pb-4 px-4 flex-row justify-between items-center bg-gray-900">
          <Text className="text-white text-lg font-bold">
            AI Assessment
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Submit Case Study Button */}
        <View className="px-4 pb-4">
          <TouchableOpacity className="bg-[#1E4B88] py-3 px-6 rounded-lg">
            <Text className="text-white font-bold text-center">
              Submit Case Study
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Assessment Card */}
        <View className="flex-1 bg-white rounded-t-3xl">
          {/* AI Assessment Header */}
          <View className="px-4 py-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-gray-800">
                AI Follow-up Assessment
              </Text>
              <TouchableOpacity>
                <Icon name="volume-high" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-sm text-gray-600">
              {getTotalResponses() > 0 
                ? `Response ${getTotalResponses()} • ${isCompleted ? 'Completed' : 'In Progress'}`
                : 'Ready to start • In Progress'
              }
            </Text>
            
            {/* Progress indicator */}
            <View className="mt-3 flex-row items-center">
              <View className="flex-1 h-1 bg-gray-200 rounded-full">
                <View 
                  className="h-1 bg-[#1E4B88] rounded-full"
                  style={{ 
                    width: isCompleted ? '100%' : `${Math.min((getTotalResponses() / 5) * 100, 90)}%` 
                  }}
                />
              </View>
              {isCompleted && (
                <Icon name="check-circle" size={16} color="#4DF0A9" className="ml-2" />
              )}
            </View>
          </View>

          <ScrollView 
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            ref={(ref) => {
              // Auto-scroll to bottom when new messages are added
              if (ref && conversation.length > 0) {
                setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
              }
            }}
          >
            {/* Conversation Messages */}
            <View className="py-6">
              {conversation.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-gray-500">Loading conversation...</Text>
                </View>
              ) : (
                conversation.map((message) => (
                  <View key={message.id} className="mb-4">
                    {message.type === 'ai' ? (
                      /* AI Message */
                      <View className="flex-row items-start">
                        <View className="relative">
                          <Image
                            source={{ uri: 'https://via.placeholder.com/40x40' }}
                            className="w-10 h-10 rounded-full"
                          />
                          <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#4DF0A9] rounded-full border-2 border-white" />
                        </View>
                        <View className="flex-1 ml-3">
                          <View className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
                            <Text className="text-gray-800 text-base leading-relaxed">
                              {message.text}
                            </Text>
                          </View>
                          <Text className="text-gray-500 text-xs mt-1">
                            {message.timestamp}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      /* User Message */
                      <View className="flex-row items-end justify-end">
                        <View className="max-w-[80%]">
                          <View className="bg-[#1E4B88] rounded-2xl rounded-br-md p-3">
                            <Text className="text-white text-base">
                              {message.text}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-end mt-1">
                            <Text className="text-gray-500 text-xs mr-2">
                              {message.timestamp}
                            </Text>
                            <Image
                              source={{ uri: 'https://via.placeholder.com/16x16' }}
                              className="w-4 h-4 rounded-full"
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              )}

              {/* AI Thinking Indicator */}
              {isAIThinking && (
                <View className="flex-row items-start mb-4">
                  <Image
                    source={{ uri: 'https://via.placeholder.com/40x40' }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="flex-1 ml-3">
                    <View className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
                      <View className="flex-row items-center">
                        {renderVoiceWave()}
                        <Text className="text-gray-600 ml-3">AI is thinking...</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Response Input Area */}
          {!isCompleted && (
            <View className="px-4 py-4 border-t border-gray-200">
              <View className="flex-row items-end">
                <View className="flex-1 mr-3">
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3 max-h-24"
                    placeholder="Type your response..."
                    multiline
                    value={currentResponse}
                    onChangeText={setCurrentResponse}
                    style={{ minHeight: 44 }}
                    editable={!isAIThinking}
                  />
                  <Text className="text-gray-400 text-xs mt-1 text-right">
                    {currentResponse.length}/500
                  </Text>
                </View>
                
                <TouchableOpacity
                  className="w-12 h-12 bg-[#4DF0A9] rounded-full items-center justify-center mr-2"
                  onPress={handleToggleRecording}
                  disabled={isAIThinking}
                >
                  <Icon 
                    name={isRecording ? "stop" : "microphone"} 
                    size={24} 
                    color="#1E4B88" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    currentResponse.trim() && !isAIThinking 
                      ? 'bg-[#1E4B88]' 
                      : 'bg-gray-300'
                  }`}
                  onPress={handleSendResponse}
                  disabled={!currentResponse.trim() || isAIThinking}
                >
                  <Icon 
                    name="send" 
                    size={24} 
                    color={currentResponse.trim() && !isAIThinking ? "white" : "#666"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Voice Recording Indicator */}
              {isRecording && (
                <View className="mt-3 items-center">
                  <Text className="text-gray-600 text-sm mb-2">Recording...</Text>
                  <View className="flex-row items-center">
                    {renderVoiceWave()}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Completion Actions */}
          {isCompleted && (
            <View className="px-4 py-4 border-t border-gray-200">
              <TouchableOpacity
                className="w-full bg-[#4DF0A9] py-4 rounded-lg items-center"
                onPress={() => onComplete()}
              >
                <Text className="text-[#1E4B88] font-bold text-lg">
                  Complete Assessment
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}