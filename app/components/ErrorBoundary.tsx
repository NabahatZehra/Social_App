import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hp, scale, wp } from '../utils/responsive';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you could send error reports to your analytics service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  message: {
    fontSize: scale(12),
    textAlign: 'center',
    marginBottom: hp(3),
    color: '#666',
    lineHeight: scale(18),
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: scale(8),
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '600',
  },
}); 