import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigation from './navigation';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}
