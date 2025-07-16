import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function BuyLeadsScreen() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(['Filters']);
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);

  // Set status bar effect
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(primaryColor);
      StatusBar.setBarStyle('light-content');
    }
    
    // Load user profile from API
    const loadUserProfile = async () => {
      console.log("Loading user profile from API...");
      setLoading(true);
      try {
        const profileResponse = await apiService.getProfile();
        
        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data.gp;
          console.log('User profile loaded from API:', profile._id);
          setUserProfile(profile);
          
          if (profile._id) {
            fetchRecommendedLeads(profile._id);
          } else {
            console.error('Profile response has no _id field');
            setLoading(false);
            Alert.alert('Error', 'User profile is missing ID information');
          }
        } else {
          console.error('Failed to load profile:', profileResponse.error);
          setLoading(false);
          Alert.alert('Error', profileResponse.error || 'Failed to load user profile');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load user profile. Please try again.');
      }
    };
    
    loadUserProfile();
    
    
    return () => {};
  }, []);
  
  const fetchRecommendedLeads = async (gpId: string) => {
    console.log('Fetching recommended leads for GP ID:', gpId);
    setLoading(true);
    try {
      const response = await apiService.getRecommendedLeads(gpId);
      
      if (response.success && response.data) {
        // Transform API leads to our LeadType format
        const transformedLeads = response.data.recommendations.map(lead => transformLeadData(lead));
        setLeads(transformedLeads);
        setFilteredLeads(transformedLeads); // Also set filtered leads initially
      } else {
        console.error('Failed to fetch recommended leads:', response.error);
        Alert.alert('Error', 'Failed to fetch recommended leads');
        // Set empty leads array
        setLeads([]);
        setFilteredLeads([]); // Also clear filtered leads
      }
    } catch (error) {
      console.error('Error fetching recommended leads:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      setLeads([]);
      setFilteredLeads([]); // Also clear filtered leads
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const toggleFilter = (filter: string) => {
  if (filter === 'Filters') {
    // If clicking the main Filters button
    if (activeFilters.includes('Filters')) {
      // If already active, remove all filters
      setActiveFilters([]);
    } else {
      // If not active, set it as the only filter
      setActiveFilters(['Filters']);
    }
  } else {
    // For other filters
    if (activeFilters.includes(filter)) {
      // Remove this filter
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {

      const newFilters = [...activeFilters.filter(f => f !== 'Filters'), filter];
      setActiveFilters(newFilters);
    }
  }
};

  const handleBack = () => {
    router.push('/my-leads'); // Navigate back to my-leads
  };
  
  const handleBuyLead = (leadId: string) => {
    // Don't allow purchase if user doesn't have enough coins
    const leadCost = Math.max(10, Math.round(filteredLeads.find(lead => lead.id === leadId)?.match || 0) / 10);
    
    if (!userProfile || userProfile.wallet_balance < leadCost) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${leadCost} coins to purchase this lead. Please add more coins to your wallet.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase this lead for ${leadCost} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy Now', 
          onPress: async () => {
            try {
              // Show loading indicator
              setLoading(true);
              
              // Call API to update the lead with current user as buyer
              const updateResponse = await apiService.modifyLead(leadId, {
                action: 'add_buyer',
                buyer_gp_id: userProfile._id
              });
              
              if (updateResponse.success) {
                // Use the new coins/use API to deduct coins
                const coinsResponse = await apiService.useCoins(leadCost);
                
                if (coinsResponse.success) {
                  // Update local user profile with new balance from the response
                  setUserProfile({
                    ...userProfile,
                    wallet_balance: coinsResponse.data?.currentCoins || (userProfile.wallet_balance - leadCost)
                  });
                  
                  // Show success message
                  Alert.alert(
                    'Lead Purchased Successfully!', 
                    'This lead has been added to your leads list. You can view and contact them from My Leads.',
                    [
                      { 
                        text: 'Go to My Leads', 
                        onPress: () => router.push('/my-leads')
                      },
                      {
                        text: 'Continue Browsing',
                        style: 'cancel'
                      }
                    ]
                  );
                  
                  // Remove the purchased lead from the current list
                  const updatedLeads = filteredLeads.filter(lead => lead.id !== leadId);
                  setFilteredLeads(updatedLeads);
                  setLeads(leads.filter(lead => lead.id !== leadId));
                } else {
                  Alert.alert('Error', coinsResponse.error || 'Failed to deduct coins');
                }
              } else {
                Alert.alert('Error', updateResponse.error || 'Failed to purchase lead');
              }
            } catch (error) {
              console.error('Error purchasing lead:', error);
              Alert.alert('Error', 'An unexpected error occurred while purchasing the lead');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleQuerySubmit = () => {
    if (!queryText.trim()) {
      Alert.alert('Please enter a query', 'Enter specific criteria to find matching leads');
      return;
    }
    
    // Store the query in localStorage so the personalized-leads page can access it
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.setItem('lastLeadQuery', queryText).then(() => {
      setShowQueryModal(false);
      setQueryText('');
      router.push('/personalized-leads');
    });
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
            <Text className="text-white text-xl font-bold">Buy Leads</Text>
          </View>
        </View>
        <View className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-gray-600">Loading recommended leads...</Text>
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
            <Text className="text-white text-xl font-bold">Buy Leads</Text>
          </View>
          <View className="flex-row items-center bg-white bg-opacity-20 px-3 py-1.5 rounded-full">
                    <Text style={{ color: "#FFD700", fontSize: 22 }}>🪙</Text>
                    <Text className="text-primary text-xl font-bold ml-2">
                      {userProfile?.wallet_balance || 0}
                    </Text>
                  </View>
        </View>
        
        {/* Content Area */}
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">
            <View className="px-5 py-6">
              {/* Header with avatar - improved spacing */}
              <View className="flex-row items-center mb-6">
                
                <View className="ml-3 flex-1">
                  <Text style={{ color: primaryColor }} className="text-xl font-bold">Buy Leads</Text>
                  <Text className="text-gray-600 text-sm">
                    AI-curated, high-intent prospects selected for you
                  </Text>
                </View>
              </View>
              
              {/* Matching Banner - improved styling */}
              <View style={{ backgroundColor: primaryColor }} className="p-5 rounded-xl mb-6 shadow-sm">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#FFD700" />
                  <Text className="text-white text-lg font-bold ml-1">
                    We found {filteredLeads.length} leads that match your strengths!
                  </Text>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-wrap">
                    <View className="bg-[#3b82f6] bg-opacity-30 py-1.5 px-3 rounded-md flex-row items-center mr-3 mb-2">
                      <MaterialIcons name="language" size={16} color="white" />
                      <Text className="text-white ml-1 font-medium">Hindi</Text>
                    </View>
                    
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
                </View>
                
                <View className="flex-row items-center justify-between mt-4">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="medal" size={24} color="#FFD700" />
                    <Text className="text-white font-bold text-xl ml-1">
                      {filteredLeads.length > 0 ? `${Math.round(filteredLeads.reduce((sum, lead) => sum + lead.match, 0) / filteredLeads.length)}% Match` : '0% Match'}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    className="bg-[#18FFAA] py-2 px-4 rounded-xl shadow-sm"
                    onPress={() => setShowQueryModal(true)}
                  >
                    <View className="items-center">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="account-search" size={18} color={primaryColor} />
                        <Text className="ml-1 font-medium" style={{ color: primaryColor }}>Get Personalized</Text>
                      </View>
                      <Text className="font-medium" style={{ color: primaryColor }}>Leads</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Filters - improved spacing and layout */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingRight: 20 }}
                className="mb-7"
              >
                <TouchableOpacity 
                  className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes('Filters') ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => toggleFilter('Filters')}
                  style={activeFilters.includes('Filters') ? { backgroundColor: primaryColor } : null}
                >
                  <Ionicons 
                    name="funnel" 
                    size={18} 
                    color={activeFilters.includes('Filters') ? "white" : primaryColor} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${activeFilters.includes('Filters') ? 'text-white' : ''}`}
                    style={!activeFilters.includes('Filters') ? { color: primaryColor } : null}
                  >
                    Filters
                  </Text>
                </TouchableOpacity>
                
                {/* Create dynamic filters based on unique states from leads */}
                {Array.from(new Set(leads.map(lead => lead.location))).map(location => (
                  <TouchableOpacity 
                    key={location}
                    className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes(location) ? '' : 'bg-white border border-gray-300'}`}
                    onPress={() => toggleFilter(location)}
                    style={activeFilters.includes(location) ? { backgroundColor: primaryColor } : null}
                  >
                    <Ionicons 
                      name="location" 
                      size={18}
                      color={activeFilters.includes(location) ? "white" : primaryColor} 
                    />
                    <Text 
                      className={`ml-2 font-medium ${activeFilters.includes(location) ? 'text-white' : ''}`}
                      style={!activeFilters.includes(location) ? { color: primaryColor } : null}
                    >
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* Create dynamic filters based on unique product categories */}
                {Array.from(new Set(leads.flatMap(lead => lead.products))).map(product => {
                  const displayProduct = product.charAt(0).toUpperCase() + product.slice(1).replace('_', ' ');
                  return (
                    <TouchableOpacity 
                      key={product}
                      className={`flex-row items-center mr-3 py-2.5 px-5 rounded-full ${activeFilters.includes(product) ? '' : 'bg-white border border-gray-300'}`}
                      onPress={() => toggleFilter(product)}
                      style={activeFilters.includes(product) ? { backgroundColor: primaryColor } : null}
                    >
                      <Ionicons 
                        name={product.includes('credit') ? 'card' : 'shield-checkmark'} 
                        size={18} 
                        color={activeFilters.includes(product) ? "white" : primaryColor} 
                      />
                      <Text 
                        className={`ml-2 font-medium ${activeFilters.includes(product) ? 'text-white' : ''}`}
                        style={!activeFilters.includes(product) ? { color: primaryColor } : null}
                      >
                        {displayProduct}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              {/* No leads message */}
              {filteredLeads.length === 0 && (
                <View className="bg-white rounded-xl p-8 mb-5 items-center justify-center">
                  <MaterialCommunityIcons name="magnify" size={50} color="#d1d5db" />
                  <Text className="text-gray-500 text-lg mt-4 text-center">No matching leads found</Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center">
                    Try adjusting your filters to see more results
                  </Text>
                </View>
              )}
              
              {/* Lead Cards - improved layout and spacing */}
              {filteredLeads.map((lead) => (
                <View key={lead.id} className="bg-white rounded-xl p-5 mb-5 shadow-sm">
                  {/* Lead Header - better spacing */}
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
                  
                  {/* Lead Interest - improved layout */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center flex-wrap flex-1 mr-2">
                      <Ionicons name="chatbubble-ellipses" size={18} color="#6b7280" />
                      <Text className="text-gray-700 ml-2 flex-1">
                        {lead.notes || `${lead.interest} ${lead.category}`}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Lead Stats - improved spacing and badges */}
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
                  
                  {/* Match and Add Button - improved styling */}
                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center pr-2">
                      <MaterialCommunityIcons name="medal" size={20} color="#10b981" />
                      <Text className="text-green-500 font-bold text-base ml-1">
                        Match {lead.match}%
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <TouchableOpacity 
                        className="rounded-l-2xl px-2 py-2.5 flex-row items-center shadow-sm"
                        style={{ backgroundColor: '#4f46e5' }}
                        onPress={() => handleBuyLead(lead.id)}
                      >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-medium ml">
                          Add to My Leads
                        </Text>
                      </TouchableOpacity>
                      
                      <View className="bg-[#3b82f6] rounded-r-2xl py-2.5 px-4 shadow-sm">
                        <Text className="text-white font-bold">🪙{Math.max(10, Math.round(lead.match / 10))}</Text>
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
      
      {/* Query Modal */}
      <Modal
        visible={showQueryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQueryModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-5">
          <View className="bg-white w-full rounded-xl p-5 shadow-xl max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                Find Personalized Leads
              </Text>
              <TouchableOpacity onPress={() => setShowQueryModal(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-600 mb-4">
              Describe what you&apos;re looking for. For example: &quot;Home loan customers in Delhi&quot; or &quot;Credit card leads with high income&quot;
            </Text>
            
            <TextInput
              className="bg-gray-100 p-4 rounded-lg text-gray-800 mb-4"
              placeholder="Enter your search criteria..."
              value={queryText}
              onChangeText={setQueryText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              className="py-3 rounded-lg items-center"
              style={{ backgroundColor: primaryColor }}
              onPress={handleQuerySubmit}
              disabled={isSubmittingQuery}
            >
              {isSubmittingQuery ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium">Search Leads</Text>
              )}
            </TouchableOpacity>
            
            <Text className="text-xs text-gray-500 mt-3 text-center">
              Our AI will find the best matching leads based on your criteria.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}