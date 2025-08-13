import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { useApp } from '../context/AppContext';
import { NotificationService } from '../services/NotificationService';
import { RealTimeService } from '../services/RealTimeService';
import { hp, scale, wp } from '../utils/responsive';

export default function Settings() {
  const { user, signOut } = useApp();
  const [performanceMonitoring, setPerformanceMonitoring] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Signing out user...');
              await signOut();
              console.log('User signed out successfully');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await NotificationService.requestPermissions();
      if (hasPermission) {
        setNotificationsEnabled(true);
      } else {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleRealTimeToggle = (value: boolean) => {
    setRealTimeUpdates(value);
    if (!value) {
      RealTimeService.unsubscribeFromAll();
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully.');
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will reset all app data and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Reset app logic here
            Alert.alert('Success', 'App reset successfully.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{user?.email}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Display Name</Text>
          <Text style={styles.settingValue}>{user?.displayName || 'Not set'}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Performance Monitoring</Text>
          <Switch
            value={performanceMonitoring}
            onValueChange={setPerformanceMonitoring}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Real-time Updates</Text>
          <Switch
            value={realTimeUpdates}
            onValueChange={handleRealTimeToggle}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto Refresh</Text>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
          />
        </View>
        {autoRefresh && (
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Refresh Interval (seconds)</Text>
            <TextInput
              style={styles.input}
              value={refreshInterval}
              onChangeText={setRefreshInterval}
              keyboardType="numeric"
              placeholder="30"
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleResetApp}>
          <Text style={styles.buttonText}>Reset App</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Build</Text>
          <Text style={styles.settingValue}>2024.1</Text>
        </View>
      </View>

      <PerformanceMonitor enabled={performanceMonitoring} showMetrics={performanceMonitoring} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: hp(1),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  sectionTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
    marginBottom: hp(2),
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: scale(12),
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: scale(10),
    color: '#666',
    marginLeft: wp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(4),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    fontSize: scale(10),
    minWidth: wp(15),
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: scale(8),
    marginTop: hp(1),
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    marginTop: hp(1),
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#e17055',
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    borderRadius: 25,
    alignItems: 'center',
    marginTop: hp(3),
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: '700',
  },
});