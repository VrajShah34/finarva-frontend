// app/(app)/module/resources.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService, ModuleDetailsResponse } from '../services/api';

const ResourcesScreen = () => {
  const { moduleId, contentType } = useLocalSearchParams();
  const [accessedResources, setAccessedResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ModuleDetailsResponse | null>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getModuleDetails(String(moduleId));
  
        console.log("external resources response", response.data?.module.external_resources);
        
        if (response.success && response.data) {
          setModuleData(response.data);
        } else {
          setError(response.error || 'Failed to load module');
        }
      } catch (err) {
        setError('Failed to load module');
        console.error('Error fetching module data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  // Function to generate resource metadata from URL
  const getResourceMetadata = (url: string, index: number) => {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Enhanced mapping for common financial websites
    const resourceMap: { [key: string]: any } = {
      'sebi.gov.in': {
        title: 'SEBI - Securities and Exchange Board of India',
        description: 'Official regulatory body for securities and commodity market in India',
        type: 'official',
        estimatedTime: '10-15 min read',
        icon: 'bank',
        color: '#1E4B88'
      },
      'rbi.org.in': {
        title: 'RBI - Reserve Bank of India',
        description: 'Central banking institution of India - monetary policy and regulations',
        type: 'official',
        estimatedTime: '12-18 min read',
        icon: 'bank',
        color: '#1E4B88'
      },
      'amfiindia.com': {
        title: 'AMFI - Association of Mutual Funds',
        description: 'Industry body representing Asset Management Companies in India',
        type: 'industry',
        estimatedTime: '8-12 min read',
        icon: 'domain',
        color: '#16A085'
      },
      'nseindia.com': {
        title: 'NSE - National Stock Exchange',
        description: 'Leading stock exchange in India for equity and derivative trading',
        type: 'exchange',
        estimatedTime: '10-15 min read',
        icon: 'chart-line',
        color: '#2E8B57'
      },
      'bseindia.com': {
        title: 'BSE - Bombay Stock Exchange',
        description: 'Asia\'s oldest stock exchange and fastest stock exchange in the world',
        type: 'exchange',
        estimatedTime: '10-15 min read',
        icon: 'chart-line',
        color: '#2E8B57'
      },
      'sec.gov': {
        title: 'SEC - U.S. Securities & Exchange Commission',
        description: 'Federal agency that enforces securities laws and regulates securities industry',
        type: 'international',
        estimatedTime: '15-20 min read',
        icon: 'earth',
        color: '#8E44AD'
      },
      'investopedia.com': {
        title: 'Investopedia',
        description: 'Financial education and investment knowledge resource',
        type: 'educational',
        estimatedTime: '5-10 min read',
        icon: 'school',
        color: '#F39C12'
      },
      'moneycontrol.com': {
        title: 'MoneyControl',
        description: 'Financial news, market data and investment analysis platform',
        type: 'news',
        estimatedTime: '8-12 min read',
        icon: 'newspaper',
        color: '#E67E22'
      }
    };

    // Check if we have specific metadata for this domain
    if (resourceMap[domain]) {
      return {
        id: index + 1,
        url,
        ...resourceMap[domain]
      };
    }

    // Generic fallback for unknown domains
    const genericTitle = domain
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return {
      id: index + 1,
      title: genericTitle,
      description: `External resource: ${domain}`,
      url,
      type: 'external',
      estimatedTime: '5-10 min read',
      icon: 'link',
      color: '#7F8C8D'
    };
  };

  const handleResourcePress = async (url: string) => {
    try {
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        Alert.alert('Invalid URL', 'The resource URL is not properly formatted.');
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        // Mark resource as accessed
        if (!accessedResources.includes(url)) {
          setAccessedResources(prev => [...prev, url]);
        }
      } else {
        Alert.alert('Error', 'Cannot open this URL on your device.');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open the resource. Please try again.');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'official':
        return 'bank';
      case 'industry':
        return 'domain';
      case 'exchange':
        return 'chart-line';
      case 'international':
        return 'earth';
      case 'educational':
        return 'school';
      case 'news':
        return 'newspaper';
      case 'document':
        return 'file-pdf-box';
      case 'tool':
        return 'tools';
      case 'external':
      default:
        return 'link';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'official':
        return '#1E4B88';
      case 'industry':
        return '#16A085';
      case 'exchange':
        return '#2E8B57';
      case 'international':
        return '#8E44AD';
      case 'educational':
        return '#F39C12';
      case 'news':
        return '#E67E22';
      case 'document':
        return '#E74C3C';
      case 'tool':
        return '#9B59B6';
      case 'external':
      default:
        return '#7F8C8D';
    }
  };

  // Process external resources from API
  const processedResources = React.useMemo(() => {
    if (!moduleData?.module?.external_resources) {
      return [];
    }

    return moduleData.module.external_resources.map((url, index) => 
      getResourceMetadata(url, index)
    );
  }, [moduleData?.module?.external_resources]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading resources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white p-3">
        <View className="flex-1 justify-center items-center p-4">
          <Icon name="alert-circle" size={48} color="#E74C3C" />
          <Text className="text-red-600 text-center mb-4 text-lg">{error}</Text>
          <TouchableOpacity 
            className="bg-[#1E4B88] px-6 py-3 rounded-lg"
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            className="mr-3 p-1" 
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#1E4B88" />
          </TouchableOpacity>
          <Text className="text-[#1E4B88] text-lg font-bold flex-1" numberOfLines={1}>
            {moduleData?.module?.title || 'Module Resources'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-2">
            {accessedResources.length}/{processedResources.length}
          </Text>
          <TouchableOpacity className="ml-2">
            <Icon name="dots-vertical" size={24} color="#1E4B88" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Content</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center bg-blue-50 border-b-2 border-[#1E4B88]">
          <Text className="text-[#1E4B88] font-medium">Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-medium">Assessment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Header section */}
        <View className="px-4 py-6 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Additional Resources
          </Text>
          <Text className="text-gray-600 text-base leading-relaxed">
            Explore these curated resources to deepen your understanding of the module content.
          </Text>
          
          {processedResources.length > 0 && (
            <View className="mt-4 bg-white rounded-lg p-3">
              <Text className="text-sm text-gray-600">
                📚 {processedResources.length} external resources available
              </Text>
            </View>
          )}
        </View>

        {/* Progress indicator */}
        {processedResources.length > 0 && (
          <View className="px-4 py-4 bg-white border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-medium">Progress</Text>
              <Text className="text-[#1E4B88] font-bold">
                {accessedResources.length}/{processedResources.length} completed
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full">
              <View 
                className="h-2 bg-[#4DF0A9] rounded-full" 
                style={{ 
                  width: processedResources.length > 0 
                    ? `${(accessedResources.length / processedResources.length) * 100}%` 
                    : '0%' 
                }}
              />
            </View>
          </View>
        )}

        {/* Resources list */}
        <View className="px-4 py-4">
          {processedResources.length > 0 ? (
            processedResources.map((resource) => {
              const isAccessed = accessedResources.includes(resource.url);
              
              return (
                <TouchableOpacity
                  key={resource.id}
                  className={`mb-4 p-4 rounded-lg border ${
                    isAccessed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleResourcePress(resource.url)}
                >
                  <View className="flex-row items-start">
                    <View 
                      className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                      style={{ backgroundColor: `${getResourceColor(resource.type)}20` }}
                    >
                      <Icon 
                        name={getResourceIcon(resource.type)} 
                        size={24} 
                        color={getResourceColor(resource.type)} 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={2}>
                          {resource.title}
                        </Text>
                        {isAccessed && (
                          <View className="bg-[#4DF0A9] rounded-full p-1 ml-2">
                            <Icon name="check" size={12} color="white" />
                          </View>
                        )}
                      </View>
                      
                      <Text className="text-gray-600 text-sm leading-relaxed mb-3" numberOfLines={3}>
                        {resource.description}
                      </Text>
                      
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Icon name="clock-outline" size={14} color="#666" />
                          <Text className="text-gray-500 text-sm ml-1">
                            {resource.estimatedTime}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Text className="text-[#1E4B88] text-sm font-medium mr-2">
                            {isAccessed ? 'Revisit' : 'Open'}
                          </Text>
                          <Icon name="external-link" size={16} color="#1E4B88" />
                        </View>
                      </View>
                      
                      {/* URL preview */}
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <Text className="text-xs text-gray-400" numberOfLines={1}>
                          {resource.url}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            // No resources available
            <View className="bg-gray-50 rounded-lg p-8 items-center">
              <Icon name="link-off" size={48} color="#999" />
              <Text className="text-gray-600 text-lg font-medium mt-4 mb-2">
                No External Resources
              </Text>
              <Text className="text-gray-500 text-center">
                There are no additional resources available for this module at the moment.
              </Text>
            </View>
          )}
        </View>

        {/* Study Tips */}
        {processedResources.length > 0 && (
          <View className="px-4 py-6 bg-gray-50 mx-4 rounded-lg mb-6">
            <View className="flex-row items-center mb-3">
              <Icon name="lightbulb-outline" size={20} color="#F39C12" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Study Tips
              </Text>
            </View>
            <Text className="text-gray-700 text-sm leading-relaxed mb-2">
              • Take notes while reading external resources
            </Text>
            <Text className="text-gray-700 text-sm leading-relaxed mb-2">
              • Cross-reference information with course content
            </Text>
            <Text className="text-gray-700 text-sm leading-relaxed">
              • Bookmark useful websites for future reference
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom navigation */}
      <View className="px-4 py-4 pb-6 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className="bg-gray-100 px-4 py-2 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 font-medium">Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#1E4B88] px-6 py-2 rounded-lg flex-row items-center"
            onPress={() => router.push({
              pathname: '/(module)/case-study',
              params: { moduleId, contentType: 'case_completed' }
            })}
          >
            <Text className="text-white font-bold mr-2">Next: Assessment</Text>
            <Icon name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
};

export default ResourcesScreen;