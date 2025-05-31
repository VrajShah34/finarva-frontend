import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#04457E', // Fixed: use actual color instead of 'primary'
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 80
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Home</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="my-leads"
        options={{
          title: 'Leads',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-friends" size={22} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Leads</Text>
          ),
        }}
      />

      {/* Add buy-leads as a hidden tab */}
      <Tabs.Screen
        name="buy-leads"
        options={{
          title: 'Buy Leads',
          headerShown: false,
          href: null, // This hides it from the tab bar
        }}
      />
      
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Learn</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="phone-alt" size={22} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Calls</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={24} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}