import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Formik } from 'formik';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Yup from 'yup';
import app from '../firebase';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

const Login = ({ navigation }: any) => {
  const auth = getAuth(app);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            // TODO: Navigate to main app (set auth state)
            alert('Login successful!');
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
            <Button onPress={() => handleSubmit()} title={isSubmitting ? 'Logging in...' : 'Login'} disabled={isSubmitting} />
            <Button title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} />
            <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
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

export default Login; 