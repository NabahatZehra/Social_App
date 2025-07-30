import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Formik } from 'formik';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Yup from 'yup';
import app from '../firebase';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPassword = ({ navigation }: any) => {
  const auth = getAuth(app);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await sendPasswordResetEmail(auth, values.email);
            alert('Password reset link sent to ' + values.email);
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
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}
            <Button onPress={() => handleSubmit()} title={isSubmitting ? 'Sending...' : 'Send Reset Link'} disabled={isSubmitting} />
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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

export default ForgotPassword; 