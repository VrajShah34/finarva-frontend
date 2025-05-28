import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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

// Updated CustomerLead type to align status and leadType
type CustomerLead = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  productType: string;
  status: 'new' | 'active' | 'needs_renewal' | 'converted' | 'ai_processing'; // Aligned with leadType
  leadType: 'new' | 'active' | 'ai_processing'; // Simplified to match status where possible
  needsRenewal: boolean;
  upsellPotential: boolean;
  policyEndDate?: string;
  lastContact?: string;
  dateAdded: string;
  aiCallData?: AICallData;
  activities: {
    description: string;
    date: string;
    icon: string;
    type: 'call' | 'message' | 'email' | 'note' | 'ai_call';
  }[];
  aiSuggestion?: string;
  tags: string[];
  interestScore?: number;
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

  const primaryColor = '#04457E';
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Updated sample lead data to match new types
  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>([
    {
      id: 1,
      name: 'Ajay Sharma',
      phone: '+91 98765 43210',
      email: 'ajay.sharma@email.com',
      productType: 'Term Insurance',
      status: 'active',
      leadType: 'active',
      needsRenewal: false,
      upsellPotential: true,
      policyEndDate: '12 Aug 2024',
      lastContact: '3 days ago',
      dateAdded: '2024-04-15',
      tags: ['High Value', 'Premium'],
      interestScore: 8,
      activities: [
        {
          description: 'You discussed policy features',
          date: '7 May',
          icon: 'chatbubble',
          type: 'message',
        },
        {
          description: 'Follow-up call made',
          date: '9 May',
          icon: 'call',
          type: 'call',
        },
      ],
      aiSuggestion: 'Recommend Health Insurance',
    },
    {
      id: 2,
      name: 'Priya Gupta',
      phone: '+91 87654 32109',
      email: 'priya.gupta@email.com',
      productType: 'Health Insurance',
      status: 'needs_renewal',
      leadType: 'active',
      needsRenewal: true,
      upsellPotential: false,
      policyEndDate: '22 Jun 2024',
      lastContact: 'Yesterday',
      dateAdded: '2024-03-20',
      tags: ['Renewal Due'],
      interestScore: 6,
      activities: [
        {
          description: 'Sent renewal reminder',
          date: '18 May',
          icon: 'chatbubble',
          type: 'message',
        },
      ],
      aiSuggestion: 'Suggest Top-Up Policy',
    },
  ]);

  const filterTabs = [
    { key: 'New Leads', label: 'New Leads', count: customerLeads.filter(l => l.leadType === 'new').length },
    { key: 'Active', label: 'Active', count: customerLeads.filter(l => l.leadType === 'active').length },
    { key: 'AI Processing', label: 'AI Processing', count: customerLeads.filter(l => l.leadType === 'ai_processing').length },
    { key: 'Renewal', label: 'Renewals', count: customerLeads.filter(l => l.needsRenewal).length },
    { key: 'Upsell', label: 'Upsell', count: customerLeads.filter(l => l.upsellPotential).length },
  ];

  // Updated to use consistent leadType values
  const getFilteredLeads = () => {
    switch (activeFilter) {
      case 'New Leads':
        return customerLeads.filter(lead => lead.leadType === 'new');
      case 'Active':
        return customerLeads.filter(lead => lead.leadType === 'active');
      case 'AI Processing':
        return customerLeads.filter(lead => lead.leadType === 'ai_processing');
      case 'Renewal':
        return customerLeads.filter(lead => lead.needsRenewal);
      case 'Upsell':
        return customerLeads.filter(lead => lead.upsellPotential);
      default:
        return customerLeads;
    }
  };

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

  const handleAddContactsAsLeads = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one contact');
      return;
    }

    const newLeads: CustomerLead[] = selectedContacts.map((contact, index) => ({
      id: Math.max(...customerLeads.map(l => l.id)) + index + 1,
      name: contact.name,
      phone: contact.phoneNumbers?.[0]?.number || '',
      email: contact.emails?.[0]?.email || '',
      productType: 'Not Specified',
      status: 'new',
      leadType: 'new',
      needsRenewal: false,
      upsellPotential: false,
      dateAdded: new Date().toISOString().split('T')[0],
      tags: ['From Contacts'],
      activities: [],
      aiSuggestion: 'Schedule AI call within 24 hours',
    }));

    setCustomerLeads(prev => [...prev, ...newLeads]);
    setSelectedContacts([]);
    setShowContactModal(false);
    Alert.alert('Success', `Added ${newLeads.length} contacts as new leads`);
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

    // Update leads to AI processing status
    setCustomerLeads(prev =>
      prev.map(lead => {
        if (selectedLeadsForAI.some(selected => selected.id === lead.id)) {
          return {
            ...lead,
            leadType: 'ai_processing',
            status: 'ai_processing',
            activities: [
              ...lead.activities,
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

    // Simulate AI call processing
    setTimeout(() => {
      setCustomerLeads(prev =>
        prev.map(lead => {
          if (selectedLeadsForAI.some(selected => selected.id === lead.id)) {
            const mockAIData: AICallData = {
              contact: {
                name: lead.name,
                phone: lead.phone || '',
                email: lead.email,
                age: Math.floor(Math.random() * 40) + 25,
                region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
                preferred_language: 'English',
              },
              interest: {
                products: ['home_loan', 'insurance', 'investment'][Math.floor(Math.random() * 3)] === 'home_loan' ? ['home_loan'] : ['insurance'],
                interest_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
                budget_range: '100000-200000',
                urgency_level: ['within_month', 'within_year'][Math.floor(Math.random() * 2)] as 'within_month' | 'within_year',
              },
              notes: `Interested in ${['low-interest home loans', 'comprehensive insurance coverage', 'investment opportunities'][Math.floor(Math.random() * 3)]}.`,
            };

            return {
              ...lead,
              leadType: 'active',
              status: 'active',
              aiCallData: mockAIData,
              productType: mockAIData.interest.products[0] === 'home_loan' ? 'Home Loan' : 'Insurance',
              interestScore: mockAIData.interest.interest_level === 'high' ? 8 : mockAIData.interest.interest_level === 'medium' ? 6 : 4,
              lastContact: 'AI call completed',
              activities: [
                ...lead.activities,
                {
                  description: 'AI call completed successfully',
                  date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                  icon: 'checkmark-circle',
                  type: 'ai_call',
                },
              ],
              aiSuggestion: mockAIData.interest.interest_level === 'high' ? 'High priority - Schedule follow-up within 24 hours' : 'Medium priority - Send product information',
            };
          }
          return lead;
        })
      );

      setProcessingAICalls(false);
      hideAICallBottomSheet();

      Alert.alert(
        'AI Calls Completed! 🎉',
        `Successfully processed ${selectedLeadsForAI.length} leads. Check the analysis in your Active leads tab.`,
        [
          {
            text: 'View Analysis',
            onPress: () => setActiveFilter('Active'),
          },
          { text: 'OK' },
        ]
      );
    }, 3000);
  };

  const addActivity = (leadId: number, activity: Omit<CustomerLead['activities'][0], 'date'>) => {
    setCustomerLeads(prev =>
      prev.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            leadType: 'active',
            status: 'active',
            lastContact: 'Just now',
            activities: [
              ...lead.activities,
              {
                ...activity,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              },
            ],
          };
        }
        return lead;
      })
    );
  };

  const handleCall = (lead: CustomerLead) => {
    if (lead.phone) {
      Linking.openURL(`tel:${lead.phone}`);
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
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^\d]/g, '');
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

  const newLeads = getFilteredLeads().filter(lead => lead.leadType === 'new');
  const hasNewLeads = newLeads.length > 0;

  useEffect(() => {
    StatusBar.setBackgroundColor(primaryColor);
    StatusBar.setBarStyle('light-content');

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
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row px-4 mt-4 space-x-3">
              <TouchableOpacity className="flex-1 rounded-2xl p-4 flex-row items-center" style={{ backgroundColor: primaryColor }} onPress={navigateToBuyLeads}>
                <View className="w-10 h-10 bg-[#18FFAA] rounded-full items-center justify-center mr-3">
                  <Ionicons name="add" size={20} color={primaryColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">Buy Leads</Text>
                  <Text className="text-[#18FFAA] text-xs">AI-matched prospects</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 flex-row items-center bg-[#18FFAA]"
                onPress={() => {
                  setShowContactModal(true);
                  fetchContacts();
                }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
                  <Ionicons name="people" size={20} color="#18FFAA" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm" style={{ color: primaryColor }}>
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
              <View className="mx-4 mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 shadow-lg">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3">
                      <MaterialCommunityIcons name="robot" size={24} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold">AI Cold Calling</Text>
                      <Text className="text-purple-200 text-sm">Auto-screen {newLeads.length} new leads with AI calls</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-white px-4 py-2 rounded-full" onPress={showAICallBottomSheet}>
                    <Text className="text-purple-600 font-bold">Setup</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* AI Assistant Card */}
            <View className="mx-4 mt-4 bg-white p-4 rounded-xl shadow-sm">
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
            </View>

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

            {/* Customer Cards */}
            {getFilteredLeads().map(customer => (
              <View key={customer.id} className="mx-4 mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Customer Header */}
                <View className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: getLeadTypeColor(customer.leadType),
                      }}
                    >
                      {customer.leadType === 'ai_processing' ? (
                        <MaterialCommunityIcons name="robot" size={20} color="#6366F1" />
                      ) : (
                        <Text
                          className="text-lg font-bold"
                          style={{
                            color: getLeadTextColor(customer.leadType),
                          }}
                        >
                          {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </Text>
                      )}
                    </View>
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                          {customer.name}
                        </Text>
                        {customer.interestScore && (
                          <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                            <Text className="text-green-600 text-xs font-bold">Score: {customer.interestScore}/10</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-gray-600 text-sm">{customer.productType}</Text>
                        {customer.phone && (
                          <>
                            <Text className="text-gray-400 mx-1">•</Text>
                            <Text className="text-gray-500 text-sm">{customer.phone}</Text>
                          </>
                        )}
                      </View>
                      {customer.leadType === 'new' && (
                        <Text className="text-orange-600 text-xs font-medium mt-1">Added {new Date(customer.dateAdded).toLocaleDateString()}</Text>
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
                          : customer.status === 'needs_renewal'
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
                            : customer.status === 'needs_renewal'
                            ? 'text-red-600'
                            : customer.upsellPotential
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {customer.status.replace('_', ' ')}
                      </Text>
                    </View>
                    {customer.tags.map((tag, index) => (
                      <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mt-1">
                        <Text className="text-xs text-gray-600">{tag}</Text>
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
                        <Text className="text-sm font-medium text-blue-600">{customer.aiCallData.interest.products.join(', ')}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-600">Urgency</Text>
                        <Text className="text-sm font-medium text-purple-600">{customer.aiCallData.interest.urgency_level.replace('_', ' ')}</Text>
                      </View>
                    </View>
                    {customer.aiCallData.notes && <Text className="text-sm text-gray-700 mt-2 italic">"{customer.aiCallData.notes}"</Text>}
                  </View>
                )}

                {/* Policy Details for Active Leads */}
                {customer.leadType === 'active' && customer.policyEndDate && (
                  <View className="px-4 pb-4 flex-row justify-between border-b border-gray-100">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={16} color="#6b7280" />
                      <View className="ml-2">
                        <Text className="text-xs text-gray-500">Policy End:</Text>
                        <Text className="text-sm font-medium text-gray-800">{customer.policyEndDate}</Text>
                      </View>
                    </View>
                    {customer.lastContact && (
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="#6b7280" />
                        <View className="ml-2">
                          <Text className="text-xs text-gray-500">Last Contact:</Text>
                          <Text className="text-sm font-medium text-gray-800">{customer.lastContact}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Activity Timeline or AI Suggestion */}
                <View className="p-4">
                  {customer.leadType === 'new' ? (
                    <View className="flex-row items-start">
                      <View className="mr-3 mt-1">
                        <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="flash" size={16} color="#8b5cf6" />
                        </View>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-sm">AI Recommendation:</Text>
                        <Text style={{ color: primaryColor }} className="font-medium">
                          {customer.aiSuggestion}
                        </Text>
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
                      {customer.activities.slice(-2).map((activity, index) => (
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
                      {customer.aiSuggestion && (
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
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 ml-1">
                    <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
                    <Text style={{ color: primaryColor }} className="font-medium ml-1 text-sm">
                      Note
                    </Text>
                  </TouchableOpacity>
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
                  disabled={selectedContacts.length === 0}
                >
                  <Text className="text-white font-medium">Add as Leads</Text>
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
                        <Text className="font-medium text-gray-900">{lead.name}</Text>
                        <Text className="text-gray-600 text-sm">{lead.phone}</Text>
                        <Text className="text-gray-500 text-xs">Added: {new Date(lead.dateAdded).toLocaleDateString()}</Text>
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
      </SafeAreaView>
    </>
  );
}