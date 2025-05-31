import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Platform,
  SafeAreaView as RNSafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiService
} from '../services/api';

const { height: screenHeight } = Dimensions.get('window');

type Contact = {
  id: string;
  name: string;
  phoneNumbers?: Contacts.PhoneNumber[];
  emails?: Contacts.Email[];
};

type AICallData = {
  contact: {
    name: string;
    phone: string;
    email?: string;
    age?: number;
    region?: string;
    preferred_language: string;
  };
  interest: {
    products: string[];
    interest_level: 'low' | 'medium' | 'high';
    budget_range?: string;
    urgency_level: 'no_urgency' | 'within_year' | 'within_month' | 'immediate';
  };
  notes: string;
};

// Updated CustomerLead type to match backend response
// Updated CustomerLead type to match backend response
type CustomerLead = {
  id: string;
  _id: string;
  contact: {
    name: string;
    phone: string;
    email?: string;
    age?: number;
    region?: string;
    preferred_language?: string;
  };
  interest: {
    products: string[];
    interest_level: 'low' | 'medium' | 'high';
    budget_range?: string;
    urgency_level: string;
  };
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  referrer_gp_id: string;
  isSellable: boolean;
  referrer?: {
    _id: string;
    name: string;
    email: string;
  };
  // Frontend display properties
  leadType?: 'new' | 'active' | 'ai_processing';
  needsRenewal?: boolean;
  upsellPotential?: boolean;
  policyEndDate?: string;
  lastContact?: string;
  aiCallData?: AICallData;
  activities?: {
    description: string;
    date: string;
    icon: string;
    type: 'call' | 'message' | 'email' | 'note' | 'ai_call';
  }[];
  aiSuggestion?: string;
  tags?: string[];
  interestScore?: number;
  productType?: string;
  dateAdded?: string;
};

const getLeadTypeColor = (type: 'new' | 'active' | 'ai_processing') => {
  if (type === 'new') return '#FEF3C7';
  if (type === 'ai_processing') return '#E0E7FF';
  return '#E5F3FF';
};



const getLeadTextColor = (type: 'new' | 'active' | 'ai_processing', primaryColor: string = '#04457E'): string => {
  switch (type) {
    case 'new':
      return '#D97706'; // Orange for new leads
    case 'ai_processing':
      return '#6366F1'; // Blue for AI processing
    case 'active':
      return primaryColor; // Default primary color for active leads
    default:
      return primaryColor; // Fallback for unexpected cases
  }
};

// Function to determine the leadType based on status (case-insensitive)
const determineLeadType = (status: string): 'new' | 'active' | 'ai_processing' => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'new':
      return 'new';
    case 'ai_processing':
      return 'ai_processing';
    default:
      return 'active';
  }
};

// Function to format a lead from API to display format


export default function PostSaleDashboardScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('New Leads');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showAICallModal, setShowAICallModal] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchContact, setSearchContact] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedLeadsForAI, setSelectedLeadsForAI] = useState<CustomerLead[]>([]);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [aiCallPrompt, setAICallPrompt] = useState<string>('');
  const [processingAICalls, setProcessingAICalls] = useState<boolean>(false);
  const [processingContacts, setProcessingContacts] = useState<boolean>(false);
  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>([]);
  const [fetchingLeads, setFetchingLeads] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [buttonBgAnim] = useState(new Animated.Value(0));
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
const [showSellLeadModal, setShowSellLeadModal] = useState(false);
const [selectedLeadToSell, setSelectedLeadToSell] = useState<CustomerLead | null>(null);
  


const interpolatedButtonBg = buttonBgAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#8B5CF6', '#D946EF', '#8B5CF6'], 
  });


  const primaryColor = '#04457E';
  

  useEffect(() => {
    StatusBar.setBackgroundColor(primaryColor);
    StatusBar.setBarStyle('light-content');
    
    fetchLeads();

    // Animation for the AI Call Setup button
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: false, // CHANGED FROM true to false
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false, // CHANGED FROM true to false
        }),
      ])
    );

    const bgAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonBgAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false, // This was already false, which is correct for backgroundColor
        }),
        Animated.timing(buttonBgAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false, // This was already false
        }),
      ])
    );
    
    scaleAnimation.start();
    bgAnimation.start();

    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('white');
        StatusBar.setBarStyle('dark-content');
      }
      scaleAnimation.stop();
      bgAnimation.stop();
    };
  }, []);  

  // Updated to fetch leads from API
  const fetchLeads = async () => {
    try {
      setFetchingLeads(true);
      
      // First, get the user profile to get the user ID
      const profileResponse = await apiService.getProfile();
      if (!profileResponse.success || !profileResponse.data) {
        Alert.alert('Error', 'Failed to fetch your profile');
        setFetchingLeads(false);
        return;
      }
      
      setUserProfile(profileResponse.data.gp);
      const userId = profileResponse.data.gp._id;
      
      // Now fetch all leads
      const response = await apiService.getLeads();
      if (!response.success || !response.data) {
        Alert.alert('Error', 'Failed to fetch leads');
        setFetchingLeads(false);
        return;
      }
      
      // Filter leads that belong to the current user
      const myLeads = response.data.leads
        .filter((lead: any) => lead.referrer_gp_id === userId)
        .map(formatLeadForDisplay);
      
      setCustomerLeads(myLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to fetch leads');
    } finally {
      setFetchingLeads(false);
    }
  };

 
const getFilteredLeads = () => {
  switch (activeFilter) {
    case 'New Leads':
      return customerLeads.filter(lead => lead.status.toLowerCase() === 'new');
    case 'Active':
      return customerLeads.filter(lead => lead.status.toLowerCase() === 'active');
    case 'AI Processing':
      return customerLeads.filter(lead => lead.status.toLowerCase() === 'ai_processing');
    case 'Renewal':
      return customerLeads.filter(lead => lead.needsRenewal);
    case 'Upsell':
      return customerLeads.filter(lead => lead.upsellPotential);
    case 'Purchased':
      // Only show leads that:
      // 1. Have isSellable set to true
      // 2. Have a referrer_gp_id that is NOT the current user's ID
      return customerLeads.filter(lead => 
        lead.isSellable && 
        userProfile && 
        lead.referrer_gp_id !== userProfile._id
      );
    default:
      return customerLeads;
  }
};



const filterTabs = [
  { key: 'New Leads', label: 'New Leads', count: customerLeads.filter(l => l.status.toLowerCase() === 'new').length },
  { 
    key: 'Purchased', 
    label: 'Purchased', 
    count: customerLeads.filter(l => 
      l.isSellable && 
      userProfile && 
      l.referrer_gp_id !== userProfile._id
    ).length 
  },
  { key: 'Active', label: 'Active', count: customerLeads.filter(l => l.status.toLowerCase() === 'active').length },
  { key: 'AI Processing', label: 'AI Processing', count: customerLeads.filter(l => l.status.toLowerCase() === 'ai_processing').length },
  { key: 'Renewal', label: 'Renewals', count: customerLeads.filter(l => l.needsRenewal).length },
  { key: 'Upsell', label: 'Upsell', count: customerLeads.filter(l => l.upsellPotential).length },
  
];

  const showAICallBottomSheet = () => {
    setShowAICallModal(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideAICallBottomSheet = () => {
    Animated.spring(slideAnim, {
      toValue: screenHeight,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      setShowAICallModal(false);
      setSelectedLeadsForAI([]);
      setAICallPrompt('');
    });
  };

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        return true;
      } else {
        Alert.alert('Permission Denied', 'Cannot access contacts without permission');
        return false;
      }
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const hasPermission = await requestContactsPermission();
      if (!hasPermission) {
        setLoadingContacts(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (data.length > 0) {
        const formattedContacts: Contact[] = data
          .filter(contact => contact.name && (contact.phoneNumbers?.length || contact.emails?.length))
          .map(contact => ({
            id: contact.id || Math.random().toString(),
            name: contact.name || 'Unknown',
            phoneNumbers: contact.phoneNumbers,
            emails: contact.emails,
          }));
        setContacts(formattedContacts);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch contacts');
      console.log('Contacts error:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleAddContactsAsLeads = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one contact');
      return;
    }

    console.log("Adding")

    setProcessingContacts(true);

    try {
      // Create an array of promises for each contact
      const createLeadPromises = selectedContacts.map(async (contact) => {
        // Format the phone number to meet validation requirements
        let phoneNumber = '';
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          // Remove all non-digit characters except the + sign at the beginning
          phoneNumber = contact.phoneNumbers[0].number || '';
          if (!phoneNumber.startsWith('+')) {
            // Add a + prefix if missing (using Indian country code as default)
            phoneNumber = '+91' + phoneNumber.replace(/\D/g, '');
          } else {
            // Keep the + but remove other non-digits
            phoneNumber = '+' + phoneNumber.substring(1).replace(/\D/g, '');
          }
        }

        // Only include available fields with properly formatted phone
        const leadData = {
          contact: {
            name: contact.name || 'Unknown',
            phone: phoneNumber,
            email: contact.emails?.[0]?.email || undefined,
            // Leave other fields empty as instructed
          },
          interest: {
            // Leave interest fields empty as instructed
          },
          // No notes
        };

        console.log('Creating lead with data:', JSON.stringify(leadData));

        // Call the API to create the lead
        return apiService.createLead(leadData);
      });

      // Wait for all API calls to complete
      const results = await Promise.all(createLeadPromises);
      
      // Count successful and failed operations
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      // Refresh leads after creating new ones
      await fetchLeads();

      // Show appropriate message
      if (failed === 0) {
        Alert.alert('Success', `Added ${successful} contacts as new leads`);
      } else if (successful === 0) {
        Alert.alert('Error', 'Failed to add any contacts as leads. Please try again.');
      } else {
        Alert.alert('Partial Success', `Added ${successful} contacts as leads. Failed to add ${failed} contacts.`);
      }

      // Clear selection and close modal
      setSelectedContacts([]);
      setShowContactModal(false);
    } catch (error) {
      console.error('Error creating leads:', error);
      Alert.alert('Error', 'Failed to add contacts as leads. Please try again.');
    } finally {
      setProcessingContacts(false);
    }
  };

  const handleSelectLeadForAI = (lead: CustomerLead) => {
    const isSelected = selectedLeadsForAI.some(l => l.id === lead.id);
    if (isSelected) {
      setSelectedLeadsForAI(prev => prev.filter(l => l.id !== lead.id));
    } else {
      setSelectedLeadsForAI(prev => [...prev, lead]);
    }
  };

  const scheduleAICalls = async () => {
    if (selectedLeadsForAI.length === 0) {
      Alert.alert('No Selection', 'Please select at least one lead for AI calling');
      return;
    }

    setProcessingAICalls(true);

    try {
      // Prepare the data for the bulk-call API
      const callToData = selectedLeadsForAI.map(lead => ({
        id: lead.id,
        phonenumber: lead.contact.phone
      }));

      const bulkCallPayload = {
        call_to: callToData,
        additional_info: aiCallPrompt || "Standard lead qualification call"
      };

      // Call the API method from the service
      const response = await apiService.scheduleBulkAICalls(bulkCallPayload);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to schedule AI calls');
      }

      // Update leads to AI processing status
      setCustomerLeads(prev =>
        prev.map(lead => {
          if (selectedLeadsForAI.some(selected => selected.id === lead.id)) {
            return {
              ...lead,
              leadType: 'ai_processing',
              status: 'ai_processing',
              activities: [
                ...(lead.activities || []),
                {
                  description: 'AI call scheduled',
                  date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                  icon: 'call',
                  type: 'ai_call',
                },
              ],
            };
          }
          return lead;
        })
      );

      // Hide the modal and show success message
      hideAICallBottomSheet();
      
      Alert.alert(
        'AI Calls Scheduled! 🎉',
        `Successfully scheduled ${selectedLeadsForAI.length} AI calls. You'll see results in the AI Processing tab.`,
        [
          {
            text: 'View Status',
            onPress: () => setActiveFilter('AI Processing'),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error scheduling AI calls:', error);
      Alert.alert(
        'Error',
        'Failed to schedule AI calls. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAICalls(false);
    }
  };

  const formatLeadForDisplay = (lead: any): CustomerLead => {
  const leadType = determineLeadType(lead.status);
  
  // Determine interest score based on interest_level
  let interestScore;
  if (lead.interest?.interest_level === 'high') {
    interestScore = 8;
  } else if (lead.interest?.interest_level === 'medium') {
    interestScore = 6;
  } else if (lead.interest?.interest_level === 'low') {
    interestScore = 4;
  }

  // Format product types for display
  const productType = lead.interest?.products?.map((product: string) => {
    const formatted = product.replace('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }).join(', ') || 'Not Specified';

  // Extract tags from data
  // Update the formatLeadForDisplay function's tags assignment
// Extract tags from data
const tags = [];
if (lead.interest?.interest_level === 'high') tags.push('High Interest');
if (lead.interest?.urgency_level === 'within_month') tags.push('Urgent');

// Update how we determine if a lead is "My Lead" or "Purchased"
if (lead.isSellable) {
  if (userProfile && lead.referrer_gp_id === userProfile._id) {
    // This is my lead that I've put up for sale
    tags.push('For Sale');
  } else {
    // This is a lead I've purchased from someone else
    tags.push('Purchased');
  }
} else if (lead.referrer) {
  tags.push('My Lead');
}

  // Build initial activities
  const activities = [];
  activities.push({
    description: 'Lead created',
    date: new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    icon: 'add-circle',
    type: 'note',
  });

  return {
    ...lead,
    id: lead._id,
    leadType,
    productType,
    needsRenewal: false,
    upsellPotential: lead.interest?.interest_level === 'high',
    lastContact: 'Not contacted yet',
    dateAdded: new Date(lead.createdAt).toISOString().split('T')[0],
    tags: tags,
    activities: activities,
    interestScore,
    aiSuggestion: lead.interest?.interest_level === 'high' 
      ? 'High priority - Schedule follow-up within 24 hours' 
      : lead.interest?.interest_level === 'medium'
        ? 'Medium priority - Send product information'
        : 'Low priority - Add to nurture campaign',
  };
};

  const addActivity = (leadId: string, activity: Omit<NonNullable<CustomerLead['activities']>[number], 'date'>) => {
    setCustomerLeads(prev =>
      prev.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            leadType: 'active' as const,
            status: 'active',
            lastContact: 'Just now',
            activities: [
              ...(lead.activities || []),
              {
                description: activity.description,
                icon: activity.icon,
                type: activity.type,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              },
            ],
          } as CustomerLead;
        }
        return lead;
      })
    );
  };

  const handleCall = (lead: CustomerLead) => {
    if (lead.contact.phone) {
      Linking.openURL(`tel:${lead.contact.phone}`);
      addActivity(lead.id, {
        description: 'Made a call',
        icon: 'call',
        type: 'call',
      });
    } else {
      Alert.alert('No Phone', 'No phone number available for this lead');
    }
  };

  const handleWhatsApp = (lead: CustomerLead) => {
    if (lead.contact.phone) {
      const cleanPhone = lead.contact.phone.replace(/[^\d]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
      addActivity(lead.id, {
        description: 'Sent WhatsApp message',
        icon: 'logo-whatsapp',
        type: 'message',
      });
    } else {
      Alert.alert('No Phone', 'No phone number available for WhatsApp');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchContact.toLowerCase())
  );

  const newLeads = customerLeads.filter(lead => lead.status.toLowerCase() === 'new');
  const hasNewLeads = newLeads.length > 0;

  useEffect(() => {
    StatusBar.setBackgroundColor(primaryColor);
    StatusBar.setBarStyle('light-content');
    
    // Fetch leads when component mounts
    fetchLeads();

    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('white');
        StatusBar.setBarStyle('dark-content');
      }
    };
  }, []);

  const navigateToBuyLeads = () => {
    router.push('/buy-leads');
  };

  const navigateToCallAnalysis = () => {
    router.push('/ai-call-analysis');
  };

  // Loading state
  if (fetchingLeads) {
    return (
      <SafeAreaView 
        edges={['right', 'left','top']} 
        className="flex-1"
        style={{ backgroundColor: primaryColor }}
      >
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" translucent={true} />
        <View className="bg-primary py-5 px-4 flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Gromo+</Text>
        </View>
        <View className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-gray-600 text-lg">Loading your leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Add this function to handle the API call
const sellLead = async (leadId: string) => {
  try {
    const response = await apiService.modifyLead(leadId, {
      isSellable: true
    });

    if (response.success) {
      // Update the lead in the local state
      setCustomerLeads(prev => 
        prev.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              isSellable: true,
              tags: [...(lead.tags?.filter(tag => tag !== 'My Lead') || []), 'Purchased']
            };
          }
          return lead;
        })
      );
      
      // Show success message
      Alert.alert('Success', 'Your lead is now available for sale');
    } else {
      Alert.alert('Error', 'Failed to sell lead. Please try again.');
    }
  } catch (error) {
    console.error('Error selling lead:', error);
    Alert.alert('Error', 'An error occurred while trying to sell this lead');
  } finally {
    setShowSellLeadModal(false);
    setSelectedLeadToSell(null);
  }
};

  return (
    <>
      {/* Status Bar - positioned outside SafeAreaView for proper coloring */}
      <StatusBar 
          backgroundColor={primaryColor} 
          barStyle="light-content" 
          translucent={true}
        />
        
        {/* Using SafeAreaView with edges to prevent content from going under status bar */}
        <SafeAreaView 
          edges={['right', 'left','top']} 
          className="flex-1 bg-gray-50"
          style={{ backgroundColor: primaryColor }}
        >
         
      
      {/* Header */}
      <View className="bg-primary py-5 px-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Gromo+</Text>
       
      </View>
        
        {/* Menu at the top (replacing congratulation banner) */}
        {menuOpen && (
          <View className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-lg py-2 px-1 w-48">
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => setMenuOpen(false)}>
              <Ionicons name="person-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-3 px-4"
              onPress={() => {
                setMenuOpen(false);
                navigateToCallAnalysis();
              }}
            >
              <Ionicons name="analytics-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Call Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={navigateToBuyLeads}>
              <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Buy Leads</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => setMenuOpen(false)}>
              <Ionicons name="settings-outline" size={18} color={primaryColor} />
              <Text className="ml-2 text-gray-700">Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Area */}
        <View className="flex-1 bg-gray-50">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="px-4 pt-4 pb-2">
              <Text className="text-3xl font-bold text-primary">My Leads</Text>
              {userProfile && (
                <Text className="text-gray-500">Welcome back, {userProfile.name}</Text>
              )}
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row px-4 mt-4 space-x-3">
              <TouchableOpacity className="flex-1 rounded-2xl p-4 flex-row items-center" style={{ backgroundColor: primaryColor }} onPress={navigateToBuyLeads}>
                <View className="w-10 h-10 bg-[#18FFAA] rounded-full items-center justify-center mr-3">
                  <Ionicons name="add" size={20} color={primaryColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">Buy Leads</Text>
                  <Text className="text-[#18FFAA] text-xs">AI-matched prospects</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 ml-2 flex-row items-center bg-[#18FFAA]"
                onPress={() => {
                  setShowContactModal(true);
                  fetchContacts();
                }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
                  <Ionicons name="people" size={20} color="#18FFAA" />
                </View>
                <View className="flex-1 b">
                  <Text className="font-bold text-md" style={{ color: primaryColor }}>
                    Add Contacts
                  </Text>
                  <Text className="text-xs" style={{ color: primaryColor }}>
                    From phone book
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* AI Call Automation Card */}
          {hasNewLeads && (
            <View className="mx-4 mt-4 bg-slate-200 rounded-xl p-4 shadow-lg border-e-purple-500">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3">
                    <MaterialCommunityIcons name="robot" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-primary text-lg font-bold">AI Cold Calling</Text>
                    <Text className="text-purple-600 text-sm">Auto-screen {newLeads.length} new leads with AI calls</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={showAICallBottomSheet} activeOpacity={0.8}>
                  <Animated.View
                    style={{
                      backgroundColor: interpolatedButtonBg,
                      transform: [{ scale: buttonScaleAnim }],
                      borderRadius: 9999, 
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 6, 
                    }}
                    
                    className="px-5 py-3 flex-row items-center justify-center" 
                  >
                    <MaterialCommunityIcons 
                      name="robot-excited-outline" // Engaging icon
                      size={20} 
                      color="white" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text className="text-white font-bold text-base">
                      Setup AI Calls
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          )}

            {/* AI Assistant Card */}
            {/* <View className="mx-4 mt-4 bg-white p-4 rounded-xl shadow-sm">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
                  <MaterialCommunityIcons name="robot" size={24} color="#18FFAA" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: primaryColor }} className="text-lg font-bold">
                    AI Assistant
                  </Text>
                  <Text className="text-gray-600 text-sm">Monitors renewals, upsell opportunities & suggests best contact times.</Text>
                </View>
              </View>
            </View> */}

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-6">
              {filterTabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  className={`py-3 px-6 rounded-full mr-3 flex-row items-center ${activeFilter === tab.key ? '' : 'bg-white border border-gray-300'}`}
                  onPress={() => setActiveFilter(tab.key)}
                  style={activeFilter === tab.key ? { backgroundColor: primaryColor } : null}
                >
                  <Text className={`font-medium ${activeFilter === tab.key ? 'text-white' : 'text-gray-700'}`}>{tab.label}</Text>
                  <View className={`ml-2 px-2 py-1 rounded-full ${activeFilter === tab.key ? 'bg-white' : 'bg-gray-200'}`}>
                    <Text className={`text-xs font-bold ${activeFilter === tab.key ? 'text-primary' : 'text-gray-600'}`}>{tab.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* No leads message */}
            {getFilteredLeads().length === 0 && (
              <View className="mx-4 my-10 p-6 bg-white rounded-xl items-center justify-center shadow-sm">
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
                <Text className="text-lg font-medium text-gray-500 mt-4 text-center">No leads found in this category</Text>
                <Text className="text-sm text-gray-400 mt-2 text-center">
                  {activeFilter === 'New Leads' 
                    ? "Import contacts or buy leads to get started" 
                    : `Switch to another category or add more leads`}
                </Text>
                <TouchableOpacity 
                  className="mt-6 py-3 px-6 rounded-lg bg-blue-50"
                  onPress={() => setShowContactModal(true)}
                >
                  <Text className="text-primary font-medium">Add Contacts</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Customer Cards */}
            {getFilteredLeads().map(customer => (
              <View key={customer.id} className="mx-4 mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Customer Header */}
                <View className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: getLeadTypeColor(customer.leadType || 'new'),
                      }}
                    >
                      {customer.leadType === 'ai_processing' ? (
                        <MaterialCommunityIcons name="robot" size={20} color="#6366F1" />
                      ) : (
                        <Text
                          className="text-lg font-bold"
                          style={{
                            color: getLeadTextColor(customer.leadType || 'new'),
                          }}
                        >
                          {customer.contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </Text>
                      )}
                    </View>
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                          {customer.contact.name}
                        </Text>
                        {customer.interestScore && (
                          <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                            <Text className="text-green-600 text-xs font-bold">Score: {customer.interestScore}/10</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-gray-600 text-sm">{customer.productType}</Text>
                        {customer.contact.phone && (
                          <>
                            <Text className="text-gray-400 mx-1">•</Text>
                            <Text className="text-gray-500 text-sm">{customer.contact.phone}</Text>
                          </>
                        )}
                      </View>
                      {customer.leadType === 'new' && (
                        <Text className="text-orange-600 text-xs font-medium mt-1">Added {new Date(customer.createdAt).toLocaleDateString()}</Text>
                      )}
                      {customer.leadType === 'ai_processing' && (
                        <Text className="text-blue-600 text-xs font-medium mt-1">AI call in progress...</Text>
                      )}
                    </View>
                  </View>

                  {/* Status Tags */}
                  <View className="flex-col items-end">
                    <View
                      className={`py-1 px-3 rounded-full mb-1 ${
                        customer.status === 'new'
                          ? 'bg-orange-100'
                          : customer.status === 'ai_processing'
                          ? 'bg-blue-100'
                          : customer.needsRenewal
                          ? 'bg-red-100'
                          : customer.upsellPotential
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          customer.status === 'new'
                            ? 'text-orange-600'
                            : customer.status === 'ai_processing'
                            ? 'text-blue-600'
                            : customer.needsRenewal
                            ? 'text-red-600'
                            : customer.upsellPotential
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {customer.status.replace('_', ' ')}
                      </Text>
                    </View>
                    {customer.tags && customer.tags.map((tag, index) => (
  <View key={index} className={`${tag === 'Purchased' ? 'bg-violet-100' : 'bg-gray-100'} px-2 py-1 rounded-full mt-1`}>
    <Text className={`text-xs ${tag === 'Purchased' ? 'text-violet-600 font-medium' : 'text-gray-600'}`}>{tag}</Text>
  </View>
))}
                  </View>
                </View>

                {/* AI Call Data Display for Active Leads */}
                {customer.aiCallData && (
                  <View className="px-4 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <Text className="text-sm font-semibold text-blue-800 mb-2">AI Call Analysis</Text>
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-xs text-gray-600">Interest Level</Text>
                        <Text
                          className={`text-sm font-medium ${
                            customer.aiCallData.interest.interest_level === 'high' ? 'text-green-600' : customer.aiCallData.interest.interest_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}
                        >
                          {customer.aiCallData.interest.interest_level.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1 mr-2">
                        <Text className="text-xs text-gray-600">Products</Text>
                        <Text className="text-sm font-medium text-blue-600">
                          {customer.aiCallData.interest.products.map(p => p.replace('_', ' ')).join(', ')}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-600">Urgency</Text>
                        <Text className="text-sm font-medium text-purple-600">{customer.aiCallData.interest.urgency_level.replace('_', ' ')}</Text>
                      </View>
                    </View>
                    {customer.aiCallData.notes && <Text className="text-sm text-gray-700 mt-2 italic">"{customer.aiCallData.notes}"</Text>}
                  </View>
                )}

                {/* Interest Info for Leads */}
                {customer.interest && customer.interest.interest_level && !customer.aiCallData && (
                  <View className="px-4 pb-4 bg-gray-50 border-b border-gray-100">
                    <Text className="text-sm font-semibold text-gray-800 mb-2">Lead Information</Text>
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-xs text-gray-600">Interest Level</Text>
                        <Text
                          className={`text-sm font-medium ${
                            customer.interest.interest_level === 'high' ? 'text-green-600' : 
                            customer.interest.interest_level === 'medium' ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}
                        >
                          {customer.interest.interest_level.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1 mr-2">
                        <Text className="text-xs text-gray-600">Products</Text>
                        <Text className="text-sm font-medium text-blue-600">
                          {customer.interest.products.map(p => p.replace('_', ' ')).join(', ')}
                        </Text>
                      </View>
                      {customer.interest.urgency_level && (
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600">Urgency</Text>
                          <Text className="text-sm font-medium text-purple-600">
                            {customer.interest.urgency_level.replace('_', ' ')}
                          </Text>
                        </View>
                      )}
                    </View>
                    {customer.notes && <Text className="text-sm text-gray-700 mt-2 italic">"{customer.notes}"</Text>}
                  </View>
                )}

                {/* Additional Contact Info */}
                {(customer.contact.email || customer.contact.age || customer.contact.region) && (
                  <View className="px-4 pb-4 flex-row justify-between border-b border-gray-100">
                    {customer.contact.email && (
                      <View className="flex-row items-center">
                        <Ionicons name="mail" size={16} color="#6b7280" />
                        <View className="ml-2">
                          <Text className="text-xs text-gray-500">Email:</Text>
                          <Text className="text-sm font-medium text-gray-800">{customer.contact.email}</Text>
                        </View>
                      </View>
                    )}
                    {customer.contact.age && (
                      <View className="flex-row items-center">
                        <Ionicons name="person" size={16} color="#6b7280" />
                        <View className="ml-2">
                          <Text className="text-xs text-gray-500">Age:</Text>
                          <Text className="text-sm font-medium text-gray-800">{customer.contact.age} years</Text>
                        </View>
                      </View>
                    )}
                    {customer.contact.region && (
                      <View className="flex-row items-center">
                        <Ionicons name="location" size={16} color="#6b7280" />
                        <View className="ml-2">
                          <Text className="text-xs text-gray-500">Region:</Text>
                          <Text className="text-sm font-medium text-gray-800">{customer.contact.region}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Activity Timeline or AI Suggestion */}
                <View className="p-4">
                  {customer.leadType === 'new' ? (
                    <View className="flex-row items-start justify-center">
                      <View className="bg-orange-100 px-3 py-2 rounded-lg">
                        <Text className="text-orange-700 text-sm font-medium">New lead - waiting for first contact</Text>
                      </View>
                    </View>
                  ) : customer.leadType === 'ai_processing' ? (
                    <View className="flex-row items-start">
                      <View className="mr-3 mt-1">
                        <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center">
                          <MaterialCommunityIcons name="robot" size={16} color="#3b82f6" />
                        </View>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-sm">AI Status:</Text>
                        <Text className="text-blue-600 font-medium">Call in progress... Est. completion in 5-10 min</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      {customer.activities && customer.activities.slice(-2).map((activity, index) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <View className="mr-3 mt-1">
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center ${
                                activity.type === 'call'
                                  ? 'bg-green-100'
                                  : activity.type === 'message'
                                  ? 'bg-blue-100'
                                  : activity.type === 'email'
                                  ? 'bg-purple-100'
                                  : activity.type === 'ai_call'
                                  ? 'bg-indigo-100'
                                  : 'bg-yellow-100'
                              }`}
                            >
                              <Ionicons
                                name={activity.icon as any}
                                size={16}
                                color={
                                  activity.type === 'call' ? '#10b981' : activity.type === 'message' ? '#3b82f6' : activity.type === 'email' ? '#8b5cf6' : activity.type === 'ai_call' ? '#6366f1' : '#f59e0b'
                                }
                              />
                            </View>
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-800 text-sm">{activity.description}</Text>
                          </View>
                          <Text className="text-gray-500 text-xs">{activity.date}</Text>
                        </View>
                      ))}
                      {customer.status.toLowerCase() !== 'new' && customer.aiSuggestion && (
                        <View className="flex-row items-start mt-2">
                          <View className="mr-3 mt-1">
                            <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center">
                              <Ionicons name="flash" size={16} color="#8b5cf6" />
                            </View>
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-600 text-sm">AI suggests:</Text>
                            <Text style={{ color: primaryColor }} className="font-medium">
                              {customer.aiSuggestion}
                            </Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row p-2 border-t border-gray-100">
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 mr-1" onPress={() => handleWhatsApp(customer)}>
                    <Ionicons name="logo-whatsapp" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1 text-sm">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 bg-[#18FFAA] rounded-lg mx-1" onPress={() => handleCall(customer)}>
                    <Ionicons name="call" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1 text-sm">
                      Call
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Replace Note button with Sell Lead button if not purchased */}
                  {!customer.isSellable ? (
                    <TouchableOpacity 
                      className="flex-1 flex-row items-center justify-center py-3 ml-1"
                      onPress={() => {
                        setSelectedLeadToSell(customer);
                        setShowSellLeadModal(true);
                      }}
                    >
                      <Ionicons name="cash-outline" size={18} color={primaryColor} />
                      <Text style={{ color: primaryColor }} className="font-medium ml-1 text-sm">
                        Sell Lead
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-1 flex-row items-center justify-center py-3 ml-1 opacity-70">
                      <Ionicons name="checkmark-circle" size={18} color={primaryColor} />
                      <Text style={{ color: primaryColor }} className="font-medium ml-1 text-sm">
                        Sold
                      </Text>
                    </View>
                  )}
                </View>

              </View>
            ))}
            <View className="h-20" />
          </ScrollView>
        </View>

        {/* Contact Selection Modal */}
        <Modal visible={showContactModal} animationType="slide" presentationStyle="pageSheet">
          <RNSafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold" style={{ color: primaryColor }}>
                  Select Contacts
                </Text>
                <TouchableOpacity onPress={() => setShowContactModal(false)}>
                  <Ionicons name="close" size={24} color={primaryColor} />
                </TouchableOpacity>
              </View>
              <TextInput className="bg-gray-100 p-3 rounded-lg" placeholder="Search contacts..." value={searchContact} onChangeText={setSearchContact} />
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-gray-600">{selectedContacts.length} selected</Text>
                <TouchableOpacity
  className="px-4 py-2 rounded-lg"
  style={{ backgroundColor: selectedContacts.length > 0 ? primaryColor : '#D1D5DB' }}
  onPress={handleAddContactsAsLeads}
  disabled={selectedContacts.length === 0 || processingContacts}
>
  {processingContacts ? (
    <Text className="text-white font-medium">Adding...</Text>
  ) : (
    <Text className="text-white font-medium">Add as Leads</Text>
  )}
</TouchableOpacity>
              </View>
            </View>
            {loadingContacts ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600">Loading contacts...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedContacts.some(c => c.id === item.id);
                  return (
                    <TouchableOpacity
                      className={`p-4 border-b border-gray-100 flex-row items-center ${isSelected ? 'bg-blue-50' : ''}`}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedContacts(prev => prev.filter(c => c.id !== item.id));
                        } else {
                          setSelectedContacts(prev => [...prev, item]);
                        }
                      }}
                    >
                      <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">{item.name}</Text>
                        {item.phoneNumbers?.[0] && <Text className="text-gray-600 text-sm">{item.phoneNumbers[0].number}</Text>}
                        {item.emails?.[0] && <Text className="text-gray-500 text-sm">{item.emails[0].email}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<View className="p-8 items-center"><Text className="text-gray-500">No contacts found</Text></View>}
              />
            )}
          </RNSafeAreaView>
        </Modal>

        {/* AI Call Bottom Sheet Modal */}
        <Modal visible={showAICallModal} transparent animationType="none">
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: screenHeight * 0.8,
              }}
            >
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold" style={{ color: primaryColor }}>
                    Schedule AI Calls
                  </Text>
                  <TouchableOpacity onPress={hideAICallBottomSheet}>
                    <Ionicons name="close" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-600 mb-4">Select leads for AI cold calling. Our AI will assess their interest and qualify them automatically.</Text>
              </View>
              <ScrollView className="max-h-96">
                {newLeads.map(lead => {
                  const isSelected = selectedLeadsForAI.some(l => l.id === lead.id);
                  return (
                    <TouchableOpacity
                      key={lead.id}
                      className={`p-4 border-b border-gray-100 flex-row items-center ${isSelected ? 'bg-purple-50' : ''}`}
                      onPress={() => handleSelectLeadForAI(lead)}
                    >
                      <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">{lead.contact.name}</Text>
                        <Text className="text-gray-600 text-sm">{lead.contact.phone}</Text>
                        <Text className="text-gray-500 text-xs">Added: {new Date(lead.createdAt).toLocaleDateString()}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View className="p-4 border-t border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-2">Additional Instructions (Optional)</Text>
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg text-sm"
                  placeholder="e.g., Focus on home loan products, mention festive offers..."
                  value={aiCallPrompt}
                  onChangeText={setAICallPrompt}
                  multiline
                  numberOfLines={3}
                />
                <View className="flex-row justify-between items-center mt-4">
                  <Text className="text-gray-600">{selectedLeadsForAI.length} leads selected</Text>
                  <TouchableOpacity
                    className="px-6 py-3 rounded-lg flex-row items-center"
                    style={{ backgroundColor: selectedLeadsForAI.length > 0 ? primaryColor : '#D1D5DB' }}
                    onPress={scheduleAICalls}
                    disabled={selectedLeadsForAI.length === 0 || processingAICalls}
                  >
                    {processingAICalls ? (
                      <>
                        <MaterialCommunityIcons name="loading" size={18} color="white" />
                        <Text className="text-white font-medium ml-2">Processing...</Text>
                      </>
                    ) : (
                      <>
                        <MaterialCommunityIcons name="robot" size={18} color="white" />
                        <Text className="text-white font-medium ml-2">Schedule AI Calls</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 mt-2 text-center">⏱️ AI calls typically complete in 5-10 minutes. You'll be notified when done.</Text>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Sell Lead Confirmation Modal */}
<Modal visible={showSellLeadModal} transparent animationType="fade">
  <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
    <View className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl">
      <View className="items-center mb-4">
        <View className="w-16 h-16 bg-primary bg-opacity-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="cash" size={32} color={primaryColor} />
        </View>
        <Text className="text-xl font-bold text-gray-800">Sell This Lead?</Text>
      </View>
      
      <Text className="text-gray-600 text-center mb-5">
        This lead will be listed for sale in the marketplace. You'll earn commission when another agent purchases it.
      </Text>

      {selectedLeadToSell && (
        <View className="bg-gray-100 p-3 rounded-lg mb-4">
          <Text className="font-bold text-gray-800">{selectedLeadToSell.contact.name}</Text>
          <Text className="text-gray-600">{selectedLeadToSell.contact.phone}</Text>
          <Text className="text-gray-500 text-sm mt-1">
            {selectedLeadToSell.productType || selectedLeadToSell.interest?.products?.join(', ')}
          </Text>
        </View>
      )}
      
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity 
          className="flex-1 py-3 bg-gray-200 rounded-lg mr-2" 
          onPress={() => {
            setShowSellLeadModal(false);
            setSelectedLeadToSell(null);
          }}
        >
          <Text className="text-gray-700 font-medium text-center">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 py-3 bg-primary rounded-lg ml-2 flex-row justify-center items-center" 
          onPress={() => selectedLeadToSell && sellLead(selectedLeadToSell.id)}
        >
          <Ionicons name="checkmark-circle" size={18} color="white" className="mr-1" />
          <Text className="text-white font-medium text-center ml-1">Confirm Sale</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      </SafeAreaView>
    </>
  );

  
}