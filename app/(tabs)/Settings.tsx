import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Settings = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Settings Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Settings; 