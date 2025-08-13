import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { hp, scale, wp } from '../utils/responsive';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    marginTop: hp(2),
    fontSize: scale(12),
    color: '#666',
    textAlign: 'center',
  },
});
