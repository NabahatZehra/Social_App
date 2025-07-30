import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  bio: Yup.string().max(150, 'Bio is too long'),
});

const ProfileEdit = () => {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({ name: '', bio: '' });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setInitialValues({ name: data.name || '', bio: data.bio || '' });
        setImageUri(data.photoURL || null);
      } else {
        setInitialValues({ name: user.displayName || '', bio: '' });
        setImageUri(user.photoURL || null);
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleSave = async (values: { name: string; bio: string }) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: values.name,
        bio: values.bio,
        photoURL: imageUri || '',
        email: user.email,
      });
      Alert.alert('Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={ProfileSchema}
        onSubmit={handleSave}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <Button title="Pick Profile Picture" onPress={pickImage} />
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {errors.name && touched.name && <Text style={styles.error}>{errors.name}</Text>}
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Bio"
              onChangeText={handleChange('bio')}
              onBlur={handleBlur('bio')}
              value={values.bio}
              multiline
              maxLength={150}
            />
            {errors.bio && touched.bio && <Text style={styles.error}>{errors.bio}</Text>}
            <Button onPress={() => handleSubmit()} title={isSubmitting ? 'Saving...' : 'Save'} disabled={isSubmitting} />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default ProfileEdit; 