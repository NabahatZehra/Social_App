import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user.photoURL && (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      )}
      <Text style={styles.text}>{user.displayName || 'No Name'}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Button title="Edit Profile" onPress={() => navigation.navigate('ProfileEdit')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
});

export default Profile; 