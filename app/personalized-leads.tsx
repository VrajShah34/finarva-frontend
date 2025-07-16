import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, RecommendedLead } from './services/api';

// Define primary color as a constant
const primaryColor = "#04457E";

type LeadType = {
  id: string;
  name: string;
  age: number;
  location: string;
  interest: string;
  interestScore: number;
  match: number;
  language: string;
  advisorGender: string;
  category: string;
  premium: number;
  avatarColor: string;
  occupation: string;
  income: string;
  products: string[];
  notes: string;
};

export default function PersonalizedLeadsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the query from localStorage
    const fetchQueryAndLeads = async () => {
      setLoading(true);
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const savedQuery = await AsyncStorage.getItem('lastLeadQuery');
        
        if (!savedQuery) {
          setError('No search query found. Please go back and try again.');
          setLoading(false);
          return;
        }
        
        setQuery(savedQuery);
        
        // Fetch leads based on the query
        const response = await apiService.getQueryRecommendedLeads(savedQuery);
        
        if (response.success && response.data) {
          // Transform API leads to our LeadType format
          const transformedLeads = response.data.recommendations.map(lead => transformLeadData(lead));
          setLeads(transformedLeads);
        } else {
          console.error('Failed to fetch query-based leads:', response.error);
          setError(response.error || 'Failed to fetch leads');
          setLeads([]);
        }
      } catch (error) {
        console.error('Error in personalized leads:', error);
        setError('An unexpected error occurred. Please try again.');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueryAndLeads();
  }, []);
  
  const transformLeadData = (apiLead: RecommendedLead): LeadType => {
    // Generate a color based on the lead ID to ensure consistency
    const getAvatarColor = (id: string) => {
      const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    // Calculate interest score based on interest_level
    let interestScore = 60;
    if (apiLead.interest.interest_level === 'high') {
      interestScore = 90;
    } else if (apiLead.interest.interest_level === 'medium') {
      interestScore = 75;
    } else if (apiLead.interest.interest_level === 'low') {
      interestScore = 60;
    }
    
    // Format product category for display
    const primaryProduct = apiLead.interest.products?.[0] || '';
    const formattedCategory = primaryProduct
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Calculate premium based on interest level and income
    let premium = 5000;
    const incomeMap: Record<string, number> = {
      '1-2 LPA': 5000,
      '2-4 LPA': 8000,
      '4-6 LPA': 10000,
      '6-8 LPA': 12000,
      '8-10 LPA': 15000,
      '10-15 LPA': 20000,
      '15+ LPA': 25000
    };
    
    if (apiLead.personal_data?.income) {
      premium = incomeMap[apiLead.personal_data.income] || 10000;
    }
    
    // Calculate match percentage based on score
    const matchPercentage = Math.round(apiLead.score * 100);
    
    return {
      id: apiLead._id,
      name: apiLead.contact.name,
      age: apiLead.personal_data?.age || 30,
      location: apiLead.personal_data?.state || 'India',
      interest: 'Wants to learn more about',
      interestScore: interestScore,
      match: matchPercentage,
      language: 'Hindi', 
      advisorGender: 'Any',
      category: formattedCategory,
      premium: premium,
      avatarColor: getAvatarColor(apiLead._id),
      occupation: apiLead.personal_data?.occupation || 'Professional',
      income: apiLead.personal_data?.income || '6-8 LPA',
      products: apiLead.interest.products || [],
      notes: apiLead.notes || ''
    };
  };
  
  const handleBack = () => {
    router.push('/buy-leads'); // Navigate back to buy-leads
  };
  
  const handleBuyLead = (leadId: string) => {
    Alert.alert(
      'Confirm Purchase',
      'Are you sure you want to purchase this lead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy Now', 
          onPress: () => {
            // Here you would implement the actual purchase API call
            Alert.alert('Success', 'Lead purchased successfully!');
          }
        }
      ]
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <SafeAreaView 
        edges={['right', 'left','top']}
        style={{ flex: 1, backgroundColor: primaryColor }}
      >
        <StatusBar 
          backgroundColor={primaryColor} 
          barStyle="light-content" 
          translucent={Platform.OS === 'android'}
        />
        <View className="py-5 px-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Personalized Leads</Text>
          </View>
        </View>
        <View className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-gray-600">Searching for leads...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <>
      <StatusBar 
        backgroundColor={primaryColor} 
        barStyle="light-content" 
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView 
        edges={['right', 'left','top']}
        style={{ flex: 1, backgroundColor: primaryColor }}
      >
        {/* Header */}
        <View style={{ backgroundColor: primaryColor }} className="py-5 px-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Personalized Leads</Text>
          </View>
        </View>
        
        {/* Content Area */}
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">
            <View className="px-5 py-6">
              {/* Search query indicator */}
              <View className="mb-6">
                <Text style={{ color: primaryColor }} className="text-xl font-bold">Personalized Results</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-600 text-sm">
                    Search: 
                  </Text>
                  <Text className="text-gray-800 text-sm font-medium ml-1">
                    "                    &quot;{query}&quot;"
                  </Text>
                </View>
              </View>
              
              {/* Results Summary */}
              <View style={{ backgroundColor: primaryColor }} className="p-5 rounded-xl mb-6 shadow-sm">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="text-search" size={22} color="#FFD700" />
                  <Text className="text-white text-lg font-bold ml-1">
                    We found {leads.length} leads matching your search!
                  </Text>
                </View>
                
                {leads.length > 0 && (
                  <View className="flex-row items-center flex-wrap">
                    {Array.from(new Set(leads.map(lead => lead.location))).slice(0, 2).map(location => (
                      <View key={location} className="bg-[#3b82f6] bg-opacity-30 py-1.5 px-3 rounded-md flex-row items-center mr-3 mb-2">
                        <Ionicons name="location" size={16} color="white" />
                        <Text className="text-white ml-1 font-medium">{location}</Text>
                      </View>
                    ))}
                    
                    <View className="bg-[#3b82f6] bg-opacity-30 py-1.5 px-3 rounded-md flex-row items-center mb-2">
                      <MaterialCommunityIcons name="tag-multiple" size={16} color="white" />
                      <Text className="text-white ml-1 font-medium">
                        {Array.from(new Set(leads.flatMap(lead => lead.products)))
                          .slice(0, 2)
                          .map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('_', ' '))
                          .join(', ')}
                      </Text>
                    </View>
                  </View>
                )}
                
                {leads.length > 0 ? (
                  <View className="flex-row items-center mt-3">
                    <MaterialCommunityIcons name="medal" size={20} color="#FFD700" />
                    <Text className="text-white font-medium ml-1">
                      Average match score: {Math.round(leads.reduce((sum, lead) => sum + lead.match, 0) / leads.length)}%
                    </Text>
                  </View>
                ) : null}
              </View>
              
              {/* Error state */}
              {error && (
                <View className="bg-white rounded-xl p-8 mb-5 items-center justify-center">
                  <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#f87171" />
                  <Text className="text-gray-800 text-lg mt-4 text-center font-medium">Error</Text>
                  <Text className="text-gray-600 text-base mt-2 text-center">
                    {error}
                  </Text>
                  <TouchableOpacity 
                    className="mt-6 px-6 py-3 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                    onPress={handleBack}
                  >
                    <Text className="text-white font-medium">Go Back</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* No leads message */}
              {!error && leads.length === 0 && (
                <View className="bg-white rounded-xl p-8 mb-5 items-center justify-center">
                  <MaterialCommunityIcons name="magnify" size={50} color="#d1d5db" />
                  <Text className="text-gray-500 text-lg mt-4 text-center">No matching leads found</Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center">
                    Try a different search query with more general terms
                  </Text>
                  <TouchableOpacity 
                    className="mt-6 px-6 py-3 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                    onPress={handleBack}
                  >
                    <Text className="text-white font-medium">Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Lead Cards - same format as buy-leads */}
              {leads.map((lead) => (
                <View key={lead.id} className="bg-white rounded-xl p-5 mb-5 shadow-sm">
                  {/* Lead Header */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: lead.avatarColor }}
                      >
                        <Text className="text-white font-bold">{lead.name.charAt(0)}</Text>
                      </View>
                      <View className="ml-3">
                        <View className="flex-row items-center">
                          <Text className="font-bold text-gray-800 text-base">{lead.name}</Text>
                          <Text className="text-gray-500 ml-2">({lead.age} yrs)</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="location" size={12} color="#f87171" />
                          <Text className="text-gray-500 text-sm ml-1">{lead.location}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View 
                      className="px-3 py-1.5 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <Text 
                        className="font-medium"
                        style={{ 
                          color: '#8b5cf6'
                        }}
                      >
                        {lead.category}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Lead Interest */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center flex-wrap flex-1 mr-2">
                      <Ionicons name="chatbubble-ellipses" size={18} color="#6b7280" />
                      <Text className="text-gray-700 ml-2 flex-1">
                        {lead.notes || `${lead.interest} ${lead.category}`}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Lead Stats */}
                  <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
                    <View className="flex-row flex-wrap">
                      <View className="bg-green-100 px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-green-600 text-xs font-bold">
                          Interest Score: {lead.interestScore}
                        </Text>
                      </View>
                      
                      <View className="bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center mr-2 mb-2">
                        <MaterialIcons name="language" size={12} color="#3b82f6" />
                        <Text className="text-blue-500 text-xs font-medium ml-1">
                          {lead.language}
                        </Text>
                      </View>
                      
                      <View className="bg-purple-50 rounded-full px-3 py-1.5 flex-row items-center mb-2">
                        <Ionicons name="person" size={12} color="#8b5cf6" />
                        <Text className="text-purple-600 text-xs font-medium ml-1">
                          {lead.occupation}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-2">
                    <View>
                      <Text className="text-xs text-gray-500">Income:</Text>
                      <Text className="text-green-600 font-bold text-base">
                        {lead.income}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-xs text-gray-500">Avg Premium:</Text>
                      <Text className="text-green-600 font-bold text-base">
                        ₹{(lead.premium/1000).toFixed(0)}k
                      </Text>
                    </View>
                  </View>
                  
                  {/* Match and Add Button */}
                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center pr-2">
                      <MaterialCommunityIcons name="medal" size={20} color="#10b981" />
                      <Text className="text-green-500 font-bold text-base ml-1">
                        Match {lead.match}%
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <TouchableOpacity 
                        className="rounded-l-2xl px-5 py-2.5 flex-row items-center shadow-sm"
                        style={{ backgroundColor: '#4f46e5' }}
                        onPress={() => handleBuyLead(lead.id)}
                      >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-medium ml-1">
                          Add to My Leads
                        </Text>
                      </TouchableOpacity>
                      
                      <View className="bg-[#3b82f6] rounded-r-2xl py-2.5 px-4 shadow-sm">
                        <Text className="text-white font-bold">₹{Math.max(10, Math.round(lead.match / 10))}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              
              <View className="h-20" />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}