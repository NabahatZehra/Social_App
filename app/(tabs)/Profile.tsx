import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { hp, scale, wp } from '../utils/responsive';

const Profile = () => {
  const { user, signOut } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePickImage = useCallback(() => {
    launchImageLibrary({ 
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512
    }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setPhotoURL(response.assets[0].uri || '');
      }
    });
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim() || user.email?.split('@')[0] || 'User',
        photoURL: photoURL || null
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim() || user.email?.split('@')[0] || 'User',
        photoURL: photoURL || null,
        updatedAt: new Date()
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      // Reset the form state to reflect the saved changes
      setDisplayName(displayName.trim() || user.email?.split('@')[0] || 'User');
      setPhotoURL(photoURL || '');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [user, displayName, photoURL]);

  const handleCancelEdit = useCallback(() => {
    setDisplayName(user?.displayName || '');
    setPhotoURL(user?.photoURL || '');
    setIsEditing(false);
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }, [signOut]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Not logged in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {(photoURL || user?.photoURL) ? (
            <Image 
              source={{ uri: photoURL || user?.photoURL || '' }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity style={styles.editImageButton} onPress={handlePickImage}>
              <Text style={styles.editImageText}>📷</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.name}>
              {user?.displayName || displayName || user?.email?.split('@')[0] || 'User'}
            </Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              <Text style={styles.buttonText}>
                {isUpdating ? '💾 Saving...' : '✅ Save Changes'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancelEdit}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        )}
        

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: scale(24),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#ddd',
    borderWidth: 4,
    borderColor: '#74b9ff',
  },
  placeholderImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#74b9ff',
  },
  placeholderText: {
    fontSize: scale(24),
    color: '#74b9ff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#74b9ff',
    padding: scale(8),
    borderRadius: scale(8),
  },
  editImageText: {
    fontSize: scale(24),
    color: 'white',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: scale(16),
  },
  name: {
    fontSize: scale(24),
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  email: {
    fontSize: scale(16),
    color: '#636e72',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nameInput: {
    fontSize: scale(22),
    fontWeight: '600',
    color: '#2d3436',
    borderWidth: 2,
    borderColor: '#74b9ff',
    borderRadius: 12,
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    textAlign: 'center',
    minWidth: wp(70),
    backgroundColor: '#f8f9fa',
    marginBottom: scale(8),
  },
  actions: {
    padding: scale(24),
    gap: scale(16),
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(16),
    gap: scale(12),
  },
  button: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: scale(8),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#74b9ff',
    shadowColor: '#74b9ff',
  },
  saveButton: {
    backgroundColor: '#00b894',
    flex: 1,
    marginRight: scale(6),
    shadowColor: '#00b894',
  },
  cancelButton: {
    backgroundColor: '#636e72',
    flex: 1,
    marginLeft: scale(6),
    shadowColor: '#636e72',
  },
  signOutButton: {
    backgroundColor: '#e17055',
    shadowColor: '#e17055',
  },
  buttonText: {
    color: 'white',
    fontSize: scale(16),
    fontWeight: '700',
  },
  actionsSection: {
    backgroundColor: '#fff',
    padding: wp(5),
    alignItems: 'center',
  },
});

export default Profile; 