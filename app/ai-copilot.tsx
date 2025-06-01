import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const IntegratedAICopilotScreen = () => {
  // WebSocket functionality states
  const [isConnected, setIsConnected] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState('Waiting for suggestions...');
  const [currentProducts, setCurrentProducts] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  
  // Animation value for highlighting new suggestions
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Call states
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallStarting, setIsCallStarting] = useState(false);
  
  // Get params
  const params = useLocalSearchParams();
  const leadName = params.leadName as string || 'Lead';
  const phoneNumber = params.phoneNumber as string || '';
  
  // Timer reference
  const timerRef = useRef(null);
  
  // WebSocket reference
  const ws = useRef(null);
  
  // REPLACE THIS WITH YOUR CLOUD TUNNEL URL
  const WEBSOCKET_URL = 'wss://shadow-wallpapers-happens-succeed.trycloudflare.com';
  
  // Lead data
  const currentLead = {
    name: leadName || 'Ramesh Pawar',
    age: 38,
    gender: 'Male',
    location: 'Pune',
    languages: ['Hindi', 'Marathi'],
    preference: 'Prefers Female Advisor',
    leadScore: 89,
    interestedIn: 'Health Insurance',
    avgPremium: '₹8k'
  };
  
  // Next leads
  const nextLeads = [
    {
      name: 'Sunita Joshi',
      location: 'Mumbai',
      language: 'Hindi',
      leadScore: 87,
      product: 'Term Life'
    },
    {
      name: 'Imran Shaikh',
      location: 'Nagpur',
      language: 'Marathi',
      leadScore: 81,
      product: 'Health'
    },
    {
      name: 'Priya Sinh',
      location: 'Pune',
      language: 'Hindi',
      leadScore: 79,
      product: 'Health'
    }
  ];

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // WebSocket connection logging
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Start call function - initiates the call via API
  const startCall = async () => {
    if (isCallActive || isCallStarting) return;
    
    setIsCallStarting(true);
    addLog('Starting call...');
    console.log('Starting call with number:',  '+919819506717');
    
    try {
      const response = await fetch('https://1e1c-14-194-2-90.ngrok-free.app/start-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phoneNumber || '+919373365368' 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Call started successfully');
        setIsCallActive(true);
        
        // Start the timer
        timerRef.current = setInterval(() => {
          setCallDuration(prevDuration => prevDuration + 1);
        }, 1000);
        
        // Connect to WebSocket for suggestions
        connect();
      } else {
        throw new Error(data.error || 'Failed to start call');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Call start failed: ${errorMessage}`);
      Alert.alert('Call Error', `Could not start call: ${errorMessage}`);
    } finally {
      setIsCallStarting(false);
    }
  };

  // End call function
  const endCall = async () => {
    if (!isCallActive) return;
    
    addLog('Ending call...');
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Close WebSocket
    disconnect();
    
    // Reset states
    setIsCallActive(false);
    setCallDuration(0);
    
    // TODO: Add API call to end call if needed
    addLog('✅ Call ended');
  };

  // WebSocket connection functions
  const connect = () => {
    try {
      ws.current = new WebSocket(WEBSOCKET_URL);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        addLog('✅ Connected to suggestion WebSocket');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog('📨 Received suggestion');
          
          if (data.suggestion) {
            handleNewSuggestion(data.suggestion);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addLog('❌ Error parsing message: ' + errorMessage);
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        addLog('🔌 WebSocket connection closed');
      };
      
      ws.current.onerror = (error) => {
        setIsConnected(false);
        addLog('❌ WebSocket error occurred');
        Alert.alert('Connection Error', 'Failed to connect to suggestions server');
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('❌ Connection failed: ' + errorMessage);
      Alert.alert('Error', 'Could not establish connection');
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
    }
  };

  const startListening = () => {
    if (ws.current && isConnected) {
      const message = { action: 'start' };
      ws.current.send(JSON.stringify(message));
      addLog('🎯 Started listening for suggestions');
    }
  };

  // Function to animate highlight effect for new suggestions
  const animateHighlight = () => {
    highlightAnim.setValue(0);
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Update handleNewSuggestion function for better product parsing
  const handleNewSuggestion = (suggestionData) => {
    let parsedData;
    
    try {
      // Handle if suggestionData is a string or object
      parsedData = typeof suggestionData === 'string' 
        ? JSON.parse(suggestionData) 
        : suggestionData;
    } catch (e) {
      parsedData = { advice: suggestionData };
    }

    // Update current displays
    if (parsedData.advice) {
      setCurrentAdvice(parsedData.advice);
      animateHighlight(); // Animate when new advice arrives
    }
    
    if (parsedData.products) {
      // Improved product parsing logic
      let processedProducts = [];
      
      if (typeof parsedData.products === 'string') {
        const productsText = parsedData.products;
        setCurrentProducts(productsText);
        
        // Enhanced parser - handles multiple formats
        // First try splitting by common delimiters
        const candidateProducts = productsText
          .split(/[,;]/)
          .map(item => item.trim())
          .filter(item => item && item.length > 2);
        
        if (candidateProducts.length > 0) {
          // Further process to clean up any remaining periods and bullets
          processedProducts = candidateProducts.map(prod => 
            prod.replace(/^[-•.\d]+\s*/, '').replace(/\.$/, '')
          );
        } else {
          // If no delimiters found, try to identify product names with bullets or numbers
          const bulletMatch = productsText.match(/[-•]?\s*([A-Za-z\s]+)/g);
          if (bulletMatch && bulletMatch.length > 0) {
            processedProducts = bulletMatch.map(match => 
              match.replace(/^[-•.\d]+\s*/, '').trim()
            ).filter(item => item.length > 2);
          } else {
            // As a last resort, use the whole text as one product
            processedProducts = [productsText];
          }
        }
      } else if (Array.isArray(parsedData.products)) {
        // If it's already an array, just clean up each item
        processedProducts = parsedData.products.map(prod => 
          typeof prod === 'string' ? prod.trim() : String(prod)
        );
        setCurrentProducts(processedProducts.join(', '));
      }
      
      // Set the processed products
      setProductsList(processedProducts);
    }

    // Add to history - now we add it to the bottom instead of top
    const newSuggestion = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...parsedData
    };
    
    setSuggestions(prev => [...prev.slice(-(4-1)), newSuggestion]); // Keep last 4 excluding current
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Product card colors for variety
  const productCardColors = [
    { bg: '#e8f5e9', border: '#4CAF50', text: '#1b5e20' },
    { bg: '#e3f2fd', border: '#2196F3', text: '#0d47a1' },
    { bg: '#fff3e0', border: '#FF9800', text: '#e65100' },
    { bg: '#f3e5f5', border: '#9C27B0', text: '#4a148c' },
  ];

  // Interpolate highlight color for animation
  const highlightBackground = highlightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(76, 175, 80, 0.1)', 'rgba(76, 175, 80, 0.3)', 'rgba(76, 175, 80, 0.1)'],
  });

  // Render AI suggestions with fixed current suggestion
  const renderAISuggestions = () => {
    return (
      <>
        {/* Current (Latest) Suggestion - Fixed Position */}
        <Animated.View 
          style={[
            styles.currentSuggestion,
            { backgroundColor: highlightBackground }
          ]}
        >
          <View style={styles.suggestionHeader}>
            <Icon name="lightbulb-on" size={20} color="#4CAF50" />
            <Text style={styles.currentSuggestionLabel}>Current Suggestion</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
          
          <Text style={styles.currentSuggestionText}>
            {currentAdvice}
          </Text>
          
          <Text style={styles.timestampText}>
            {new Date().toLocaleTimeString()}
          </Text>
        </Animated.View>

        {/* Improved Product Flashcards */}
        {productsList.length > 0 && (
          <View style={styles.productsContainer}>
            <View style={styles.productsHeaderRow}>
              <Icon name="package-variant" size={18} color="#1E4B88" />
              <Text style={styles.productsHeader}>Recommended Products</Text>
            </View>
            
            <View style={styles.productsGrid}>
              {productsList.map((product, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.productCard, 
                    { 
                      backgroundColor: productCardColors[index % productCardColors.length].bg,
                      borderColor: productCardColors[index % productCardColors.length].border 
                    }
                  ]}
                >
                  <View style={styles.productIconContainer}>
                    <Icon 
                      name={getProductIcon(product)} 
                      size={24} 
                      color={productCardColors[index % productCardColors.length].text} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.productCardText,
                      { color: productCardColors[index % productCardColors.length].text }
                    ]}
                    numberOfLines={2}
                  >
                    {product}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Previous Suggestions History - Below the fixed current suggestion */}
        <View style={styles.previousSuggestionsContainer}>
          <Text style={styles.previousSuggestionsLabel}>Previous Suggestions</Text>
          
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.previousSuggestion}>
                <Text style={styles.previousSuggestionText}>
                  {suggestion.advice || suggestion.products || 'No content'}
                </Text>
                <Text style={styles.previousTimestampText}>{suggestion.timestamp}</Text>
              </View>
            )))
          : (
            <Text style={styles.noSuggestionsText}>No previous suggestions yet</Text>
          )}
        </View>
      </>
    );
  };

  // Add this helper function to choose icons based on product names
  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    
    if (name.includes('health') || name.includes('medical')) {
      return 'medical-bag';
    } else if (name.includes('life') || name.includes('term')) {
      return 'shield-account';
    } else if (name.includes('car') || name.includes('auto') || name.includes('motor')) {
      return 'car';
    } else if (name.includes('home') || name.includes('property')) {
      return 'home';
    } else if (name.includes('travel')) {
      return 'airplane';
    } else if (name.includes('investment') || name.includes('mutual') || name.includes('fund')) {
      return 'chart-line';
    } else if (name.includes('pension') || name.includes('retire')) {
      return 'cash-multiple';
    } else if (name.includes('child') || name.includes('education')) {
      return 'school';
    } else {
      return 'shield-check'; // Default insurance icon
    }
  };

  return (
    <>
      <StatusBar 
        backgroundColor="#1E4B88" 
        barStyle="light-content" 
        translucent={true}
      />
      
      <SafeAreaView 
        style={{ flex: 1, backgroundColor: "#1E4B88" }}
        edges={['right', 'left', 'top']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
          <ScrollView style={{ flex: 1 }}>
            {/* Smart Call Assistant Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Smart Call Assistant</Text>
                <Text style={styles.headerSubtitle}>Let AI guide your conversation</Text>
              </View>
              
              {/* Connection Status */}
              <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, isConnected && styles.connectedDot]} />
                <Text style={styles.statusText}>
                  {isCallActive 
                    ? (isConnected ? 'Connected' : 'Call Active') 
                    : 'Ready'}
                </Text>
              </View>
            </View>
            
            {/* Connection Controls - Only show when call is active */}
            {isCallActive && (
              <View style={styles.controlPanel}>
                <TouchableOpacity 
                  style={[styles.controlButton, styles.connectBtn, isConnected && styles.disabledBtn]} 
                  onPress={connect}
                  disabled={isConnected}
                >
                  <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.controlButton, styles.disconnectBtn, !isConnected && styles.disabledBtn]} 
                  onPress={disconnect}
                  disabled={!isConnected}
                >
                  <Text style={styles.buttonText}>Disconnect</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.controlButton, styles.startBtn, !isConnected && styles.disabledBtn]} 
                  onPress={startListening}
                  disabled={!isConnected}
                >
                  <Text style={styles.buttonText}>Start Listening</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Current Customer Card */}
            <View style={styles.leadCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{currentLead.name.charAt(0)}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.leadName}>{currentLead.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="map-marker" size={16} color="#4CAF50" />
                    <Text style={styles.leadDetail}>{currentLead.location}</Text>
                    <Icon name="fire" size={16} color="#FF9800" style={{ marginLeft: 12 }} />
                    <Text style={styles.leadDetail}>{currentLead.leadScore}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <Text style={styles.leadDetail}>Age: {currentLead.age}</Text>
                  <Text style={{ color: '#9ca3af', marginHorizontal: 8 }}>|</Text>
                  <Text style={styles.leadDetail}>{currentLead.gender}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <Icon name="translate" size={16} color="#2196F3" />
                  <Text style={[styles.leadDetail, { marginLeft: 4 }]}>
                    {currentLead.languages.join(', ')}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                    <Icon name="account-supervisor" size={16} color="#9C27B0" />
                    <Text style={[styles.leadDetail, { marginLeft: 4 }]}>{currentLead.preference}</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                  <Text style={styles.leadHighlight}>Interested: {currentLead.interestedIn}</Text>
                  <Text style={styles.leadHighlight}>Avg. Premium: {currentLead.avgPremium}</Text>
                </View>
              </View>
            </View>
            
            {/* AI Suggestions Section - Only show when call is active */}
            {isCallActive ? (
              <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="robot" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>AI Suggestions</Text>
                  </View>
                </View>
                
                {aiSuggestionsEnabled ? (
                  renderAISuggestions()
                ) : (
                  <View style={styles.disabledMessage}>
                    <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                      AI Suggestions are disabled. Turn on to receive real-time advice.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.preCallMessage}>
                <Icon name="phone-in-talk" size={48} color="#1E4B88" />
                <Text style={styles.preCallTitle}>Ready to Start Call</Text>
                <Text style={styles.preCallInstructions}>
                  Click the "Start Call" button below to begin your conversation with {currentLead.name}.
                  AI suggestions will appear here during the call.
                </Text>
              </View>
            )}
            
            {/* Debug Logs */}
            {logs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔧 Connection Logs</Text>
                <View style={styles.logsContainer}>
                  {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>{log}</Text>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Call Control Footer */}
        <View style={styles.callControls}>
          {isCallActive ? (
            <>
              {/* Show microphone button only when call is active */}
              <TouchableOpacity style={styles.micButton}>
                <Icon name="microphone" size={28} color="white" />
              </TouchableOpacity>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>Duration</Text>
              </View>
              
              <TouchableOpacity style={styles.hangupButton} onPress={endCall}>
                <Icon name="phone-hangup" size={28} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            /* Show start call button when call is not active */
            <TouchableOpacity 
              style={styles.startCallButton} 
              onPress={startCall}
              disabled={isCallStarting}
            >
              {isCallStarting ? (
                <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
              ) : (
                <Icon name="phone-outgoing" size={24} color="white" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.startCallText}>
                {isCallStarting ? 'Starting Call...' : 'Start Call'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

// Updated styles including the new components
const styles = StyleSheet.create({
  // Keep existing styles
  header: {
    backgroundColor: '#1E4B88',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
    marginRight: 6,
  },
  connectedDot: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  connectBtn: {
    backgroundColor: '#4CAF50',
  },
  disconnectBtn: {
    backgroundColor: '#dc3545',
  },
  startBtn: {
    backgroundColor: '#1E4B88',
  },
  disabledBtn: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  leadCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E4B88',
  },
  leadName: {
    color: '#1E4B88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leadDetail: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  leadHighlight: {
    color: '#1E4B88',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1E4B88',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledMessage: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  
  // Current suggestion styles (keep)
  currentSuggestion: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentSuggestionLabel: {
    color: '#1E4B88',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentSuggestionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2c3e50',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  
  // Updated styles for products
  productsContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E4B88',
    marginLeft: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4, // Compensate for card margins
  },
  productCard: {
    width: '48%', // Two cards per row with space between
    borderRadius: 12,
    padding: 12,
    margin: 4,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Previous suggestions styles (keep)
  previousSuggestionsContainer: {
    marginTop: 8,
  },
  previousSuggestionsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  previousSuggestion: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1E4B88',
  },
  previousSuggestionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  previousTimestampText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  noSuggestionsText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  
  // Keep other existing styles
  logsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    maxHeight: 150,
  },
  logText: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E4B88',
  },
  hangupButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // New styles for pre-call state
  preCallMessage: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  preCallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E4B88',
    marginTop: 16,
    marginBottom: 8,
  },
  preCallInstructions: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  startCallButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  startCallText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IntegratedAICopilotScreen;