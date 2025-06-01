import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const CallCopilotSuggestions = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState('Waiting for suggestions...');
  const [currentProducts, setCurrentProducts] = useState('Waiting for product recommendations...');
  const [suggestions, setSuggestions] = useState([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  
  // REPLACE THIS WITH YOUR CLOUD TUNNEL URL
  const WEBSOCKET_URL = 'wss://your-ngrok-url.ngrok-free.app';
  // const WEBSOCKET_URL = 'ws://192.168.1.100:8082'; // For local testing

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log(`[${timestamp}] ${message}`);
  };

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
    }
    
    if (parsedData.products) {
      setCurrentProducts(parsedData.products);
    }

    // Add to history
    const newSuggestion = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...parsedData
    };
    
    setSuggestions(prev => [newSuggestion, ...prev.slice(0, 4)]); // Keep last 5
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📞 Call Copilot</Text>
        <Text style={styles.headerSubtitle}>AI Sales Suggestions</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusPanel}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, isConnected && styles.connectedDot]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.connectBtn, isConnected && styles.disabledBtn]} 
            onPress={connect}
            disabled={isConnected}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.disconnectBtn, !isConnected && styles.disabledBtn]} 
            onPress={disconnect}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.startBtn, !isConnected && styles.disabledBtn]} 
            onPress={startListening}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Advice Panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>💬 Current Advice</Text>
          <ScrollView style={styles.adviceScroll} nestedScrollEnabled>
            <Text style={styles.adviceText}>{currentAdvice}</Text>
          </ScrollView>
        </View>

        {/* Current Products Panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>🛍️ Recommended Products</Text>
          <ScrollView style={styles.productsScroll} nestedScrollEnabled>
            <Text style={styles.productsText}>{currentProducts}</Text>
          </ScrollView>
        </View>

        {/* Suggestion History */}
        {suggestions.length > 0 && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>📋 Recent Suggestions</Text>
            {suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.suggestionItem}>
                <Text style={styles.timestamp}>{suggestion.timestamp}</Text>
                {suggestion.advice && (
                  <Text style={styles.suggestionText} numberOfLines={3}>
                    {suggestion.advice.substring(0, 100)}...
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Debug Logs */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>🔧 Connection Logs</Text>
          <ScrollView style={styles.logsScroll} nestedScrollEnabled>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  statusPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    marginRight: 10,
  },
  connectedDot: {
    backgroundColor: '#28a745',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  connectBtn: {
    backgroundColor: '#28a745',
  },
  disconnectBtn: {
    backgroundColor: '#dc3545',
  },
  startBtn: {
    backgroundColor: '#007bff',
  },
  disabledBtn: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 5,
  },
  adviceScroll: {
    maxHeight: 200,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  productsScroll: {
    maxHeight: 200,
  },
  productsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  suggestionItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
  },
  logsScroll: {
    maxHeight: 150,
  },
  logText: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default CallCopilotSuggestions;