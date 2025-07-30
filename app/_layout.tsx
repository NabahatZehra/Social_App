import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import AppNavigation from './navigation';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppNavigation />
      </AppProvider>
    </ErrorBoundary>
  );
}
