import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Formik } from 'formik';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Yup from 'yup';
import app from '../firebase';

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

const SignUp = ({ navigation }: any) => {
  const auth = getAuth(app);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={SignUpSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            // TODO: Save name to user profile or Firestore
            navigation.navigate('Login');
          } catch (error: any) {
            setErrors({ email: error.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {errors.name && touched.name && <Text style={styles.error}>{errors.name}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}
            <Button onPress={() => handleSubmit()} title={isSubmitting ? 'Signing Up...' : 'Sign Up'} disabled={isSubmitting} />
            <Button title="Already have an account? Login" onPress={() => navigation.navigate('Login')} />
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
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
});

export default SignUp; 