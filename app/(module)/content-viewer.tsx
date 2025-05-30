// app/(app)/module/content-viewer.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, ModuleDetailsResponse } from '../services/api';

interface ContentSection {
  title: string;
  content: string;
  icon: string;
  estimatedTime: number;
}

interface StructuredContent {
  introduction: ContentSection;
  keyConcepts: ContentSection;
  practicalExamples: ContentSection;
  risksAndProcess: ContentSection;
}

const ContentViewerScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [moduleData, setModuleData] = useState<ModuleDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 4;

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getModuleDetails(String(moduleId));

        console.log('=== DEBUG: Full API Response ===');
        console.log('Response success:', response.success);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data?.module?.content) {
          console.log('=== DEBUG: Module Content Structure ===');
          console.log('Content type:', typeof response.data.module.content);
          console.log('Content value:', response.data.module.content);
          
          if (typeof response.data.module.content === 'object') {
            console.log('Content keys:', Object.keys(response.data.module.content));
          }
        }

        if (response.success && response.data) {
          setModuleData(response.data);
        } else {
          setError(response.error || 'Failed to load module');
        }
      } catch (err) {
        console.error('Module fetch error:', err);
        setError('Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  // Helper function to check if content is structured
  const isStructuredContent = (content: any): content is StructuredContent => {
    return content && 
           typeof content === 'object' && 
           content.introduction && 
           content.keyConcepts && 
           content.practicalExamples && 
           content.risksAndProcess;
  };

  // Helper function to convert string content to structured format
  const convertLegacyContent = (content: string, title: string): StructuredContent => {
    if (!content || typeof content !== 'string') {
      return createFallbackContent(title);
    }

    // Split content by numbered sections (like "**1. Core Concepts:**")
    const sections = content.split(/\*\*\d+\.\s*/).filter(section => section.trim());
    
    // If no numbered sections found, split by double newlines
    const contentSections = sections.length > 1 ? sections : content.split('\n\n').filter(section => section.trim());
    
    return {
      introduction: {
        title: "Introduction & Overview",
        content: contentSections[0] || `${title}\n\nWelcome to this comprehensive learning module.`,
        icon: "book-outline",
        estimatedTime: 5
      },
      keyConcepts: {
        title: "Key Concepts", 
        content: contentSections[1] || 'Key concepts will be covered here.',
        icon: "lightbulb-outline",
        estimatedTime: 7
      },
      practicalExamples: {
        title: "Practical Applications",
        content: contentSections[2] || 'Practical examples will be shown here.',
        icon: "chart-line", 
        estimatedTime: 5
      },
      risksAndProcess: {
        title: "Implementation & Risk Management",
        content: contentSections[3] || 'Implementation details will be provided here.',
        icon: "shield-outline",
        estimatedTime: 3
      }
    };
  };

  // Fallback content creator
  const createFallbackContent = (title: string): StructuredContent => {
    return {
      introduction: {
        title: "Introduction & Overview",
        content: `${title}\n\nContent will be available here.`,
        icon: "book-outline",
        estimatedTime: 5
      },
      keyConcepts: {
        title: "Key Concepts",
        content: "Content will be available here.",
        icon: "lightbulb-outline", 
        estimatedTime: 7
      },
      practicalExamples: {
        title: "Practical Applications",
        content: "Content will be available here.",
        icon: "chart-line",
        estimatedTime: 5
      },
      risksAndProcess: {
        title: "Implementation & Risk Management", 
        content: "Content will be available here.",
        icon: "shield-outline",
        estimatedTime: 3
      }
    };
  };

  // Simple content processing - handle any format from backend
  const getStructuredContent = (): StructuredContent => {
    const moduleContent = moduleData?.module?.content;
    const moduleTitle = moduleData?.module?.title || 'Learning Module';

    console.log('=== Processing Content ===');
    console.log('Module content type:', typeof moduleContent);
    console.log('Module content:', moduleContent);

    // Check if content is already structured from backend
    if (isStructuredContent(moduleContent)) {
      console.log('Using structured content from backend');
      return {
        introduction: {
          title: moduleContent.introduction.title || "Introduction & Overview",
          content: moduleContent.introduction.content || 'Content will be available here.',
          icon: moduleContent.introduction.icon || "book-outline",
          estimatedTime: moduleContent.introduction.estimatedTime || 5
        },
        keyConcepts: {
          title: moduleContent.keyConcepts.title || "Key Concepts",
          content: moduleContent.keyConcepts.content || 'Content will be available here.',
          icon: moduleContent.keyConcepts.icon || "lightbulb-outline",
          estimatedTime: moduleContent.keyConcepts.estimatedTime || 7
        },
        practicalExamples: {
          title: moduleContent.practicalExamples.title || "Practical Applications",
          content: moduleContent.practicalExamples.content || 'Content will be available here.',
          icon: moduleContent.practicalExamples.icon || "chart-line",
          estimatedTime: moduleContent.practicalExamples.estimatedTime || 5
        },
        risksAndProcess: {
          title: moduleContent.risksAndProcess.title || "Implementation & Risk Management",
          content: moduleContent.risksAndProcess.content || 'Content will be available here.',
          icon: moduleContent.risksAndProcess.icon || "shield-outline",
          estimatedTime: moduleContent.risksAndProcess.estimatedTime || 3
        }
      };
    }

    // Handle string content from backend (like the ETF example)
    if (typeof moduleContent === 'string' && moduleContent.trim()) {
      console.log('Processing string content from backend');
      return convertLegacyContent(moduleContent, moduleTitle);
    }

    // Fallback for any other case
    console.log('Using fallback content');
    return {
      introduction: {
        title: "Introduction & Overview",
        content: `${moduleTitle}\n\nContent will be available here.`,
        icon: "book-outline",
        estimatedTime: 5
      },
      keyConcepts: {
        title: "Key Concepts",
        content: "Content will be available here.",
        icon: "lightbulb-outline",
        estimatedTime: 7
      },
      practicalExamples: {
        title: "Practical Applications",
        content: "Content will be available here.",
        icon: "chart-line",
        estimatedTime: 5
      },
      risksAndProcess: {
        title: "Implementation & Risk Management",
        content: "Content will be available here.",
        icon: "shield-outline",
        estimatedTime: 3
      }
    };
  };

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    } else {
      router.push({
        pathname: '/(module)/video-player',
        params: { moduleId, contentType: 'video_watched' }
      });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Enhanced content renderer to handle bold text and formatting
  const renderFormattedContent = (content: string, colorScheme?: any) => {
    if (!content) {
      return (
        <Text className="text-gray-700 text-base leading-6">
          Content will be available here.
        </Text>
      );
    }

    // Split by lines and display as-is with basic formatting
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Empty line spacing
      if (!trimmedLine) {
        return <View key={index} className="h-3" />;
      }

      // Handle **bold text** formatting
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        return (
          <Text key={index} className="text-gray-800 text-base leading-7 mb-3">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <Text key={partIndex} className="font-bold text-gray-900">
                  {part}
                </Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              )
            )}
          </Text>
        );
      }

      // Handle *italic text* formatting
      if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split('*');
        return (
          <Text key={index} className="text-gray-800 text-base leading-7 mb-3">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <Text key={partIndex} className="italic text-gray-900">
                  {part}
                </Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              )
            )}
          </Text>
        );
      }

      // Basic markdown formatting
      if (trimmedLine.startsWith('# ')) {
        return (
          <Text key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-2 leading-8">
            {trimmedLine.replace('# ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('## ')) {
        return (
          <Text key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-4 leading-7">
            {trimmedLine.replace('## ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('### ')) {
        return (
          <Text key={index} className="text-lg font-medium text-gray-800 mb-2 mt-3 leading-6">
            {trimmedLine.replace('### ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('*   ')) {
        const bulletText = trimmedLine.replace(/^[-•]\s*/, '').replace(/^\*\s*/, '');
        return (
          <View key={index} className="flex-row mb-3 ml-2">
            <View 
              className="w-5 h-5 rounded-full items-center justify-center mr-3 mt-1"
              style={{ 
                backgroundColor: colorScheme?.iconColor || '#1E40AF',
                opacity: 0.8
              }}
            >
              <Text className="text-white text-xs font-bold">•</Text>
            </View>
            <Text className="text-gray-800 flex-1 leading-6">
              {bulletText}
            </Text>
          </View>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <View key={index} className="flex-row mb-3 ml-2">
              <View 
                className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{ 
                  backgroundColor: colorScheme?.iconColor || '#1E40AF',
                  opacity: 0.9
                }}
              >
                <Text className="text-white text-xs font-bold">{match[1]}</Text>
              </View>
              <Text className="text-gray-800 flex-1 leading-6">
                {match[2]}
              </Text>
            </View>
          );
        }
      } else {
        // Regular text line
        return (
          <Text key={index} className="text-gray-800 text-base leading-7 mb-3">
            {trimmedLine}
          </Text>
        );
      }

      return null;
    }).filter(Boolean);
  };

  const renderContentSection = (section: ContentSection, index: number) => {
    if (!section) return null;

    // Define pastel colors directly for content backgrounds
    const sectionColors = [
      {
        contentBg: '#F0F4FF', // Light blue pastel for content
        headerBg: '#E1E8FF',
        iconBg: '#D1DCFF',
        iconColor: '#1E40AF',
        borderColor: '#C7D2FE'
      },
      {
        contentBg: '#F0FDF4', // Light green pastel for content
        headerBg: '#DCFCE7',
        iconBg: '#BBF7D0',
        iconColor: '#059669',
        borderColor: '#A7F3D0'
      },
      {
        contentBg: '#FAF5FF', // Light purple pastel for content
        headerBg: '#F3E8FF',
        iconBg: '#E9D5FF',
        iconColor: '#7C3AED',
        borderColor: '#DDD6FE'
      },
      {
        contentBg: '#FFFBEB', // Light amber pastel for content
        headerBg: '#FEF3C7',
        iconBg: '#FDE68A',
        iconColor: '#D97706',
        borderColor: '#F9E890'
      }
    ];

    const colorScheme = sectionColors[index] || sectionColors[0];

    return (
      <View 
        key={index} 
        className="mb-6 rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: colorScheme.headerBg,
          borderColor: colorScheme.borderColor,
          borderWidth: 1
        }}
      >
        {/* Section Header */}
        <View 
          className="px-4 py-4 border-b" 
          style={{ 
            backgroundColor: colorScheme.headerBg,
            borderBottomColor: colorScheme.borderColor 
          }}
        >
          <View className="flex-row items-center">
            <View 
              className="w-10 h-10 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: colorScheme.iconBg }}
            >
              <Icon name={section.icon || 'book-outline'} size={20} color={colorScheme.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {section.title || `Section ${index + 1}`}
              </Text>
              <Text className="text-sm text-gray-700">
                {section.estimatedTime || 5} min read
              </Text>
            </View>
          </View>
        </View>

        {/* Section Content with pastel background */}
        <View 
          className="px-5 py-5"
          style={{ backgroundColor: colorScheme.contentBg }}
        >
          {renderFormattedContent(section.content || 'Content will be available here.', colorScheme)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <View className="items-center">
          <Icon name="loading" size={40} color="#1E40AF" />
          <Text className="mt-4 text-gray-600 text-lg">Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !moduleData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <Icon name="alert-circle-outline" size={50} color="#EF4444" />
        <Text className="mt-4 text-gray-800 text-lg text-center font-medium">
          {error || 'Failed to load content'}
        </Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const structuredContent = getStructuredContent();
  const contentSections = [
    structuredContent.introduction,
    structuredContent.keyConcepts,
    structuredContent.practicalExamples,
    structuredContent.risksAndProcess
  ];

  return (
     <>
          <StatusBar 
            backgroundColor="white" 
            barStyle="light-content" 
            translucent={Platform.OS === 'android'}
          />
          <SafeAreaView 
            edges={['right', 'left','top']}
            style={{ flex: 1, backgroundColor: "white" }}
          >
      
      {/* Header */}
      <View className="px-4 py-3  flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3 p-1" 
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text className="text-blue-700 text-xl font-bold">
            Gromo<Text className="text-green-600">+</Text>
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Icon name="bookmark-outline" size={24} color="#1E4B88" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Title */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-blue-900 text-xl font-bold">
          {moduleData?.module?.title || 'Loading...'}
        </Text>
        <View className="flex-row items-center mt-2">
          <Icon name="clock-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1 mr-4">
            {moduleData?.module?.estimated_time_min || 20} min
          </Text>
          <Icon name="signal" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1 mr-4">Beginner</Text>
          <Icon name="tag-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1">Learning</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-blue-600">
          <Text className="text-blue-700 font-medium">Content</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Assessment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Content Sections */}
        <View className="px-4 py-6">
          {contentSections.map((section, index) => 
            renderContentSection(section, index)
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Bottom navigation */}
      <View className="px-4 py-4 pb-6 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-lg ${currentSection === 1 ? 'bg-gray-100' : 'bg-gray-100'}`}
            onPress={handlePrevious}
            disabled={currentSection === 1}
          >
            <Text className={`font-medium ${currentSection === 1 ? 'text-gray-400' : 'text-gray-700'}`}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-blue-600 px-6 py-2 rounded-lg flex-row items-center"
            onPress={handleNext}
          >
            <Text className="text-white font-medium mr-2">
              {currentSection === totalSections ? 'Next: Videos' : 'Next'}
            </Text>
            <Icon name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
};

export default ContentViewerScreen;