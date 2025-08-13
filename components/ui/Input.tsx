import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-dimensions';

export type InputVariant = 'default' | 'outlined' | 'filled';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  variant = 'outlined',
  size = 'medium',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: wp('3%'), // Rounded corners for modern look
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      marginVertical: hp('1%'),
    };

    const sizeStyles = {
      small: {
        minHeight: hp('5%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1%'),
      },
      medium: {
        minHeight: hp('6%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
      },
      large: {
        minHeight: hp('7%'),
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
      },
    };

    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.input,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: colors.input,
        borderWidth: 1.5,
        borderColor: error 
          ? colors.error 
          : isFocused 
            ? colors.inputFocus 
            : colors.inputBorder,
      },
      filled: {
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: colors.text,
      fontSize: wp('4%'),
      fontWeight: '400',
    };

    const sizeStyles = {
      small: {
        fontSize: wp('3.5%'),
      },
      medium: {
        fontSize: wp('4%'),
      },
      large: {
        fontSize: wp('4.5%'),
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View style={getContainerStyles()}>
        {leftIcon && (
          <View style={[styles.icon, styles.leftIcon]}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyles(), inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={[styles.icon, styles.rightIcon]}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
      
      {maxLength && (
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: hp('1%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    marginBottom: hp('0.5%'),
    marginLeft: wp('1%'),
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: wp('2%'),
  },
  rightIcon: {
    marginLeft: wp('2%'),
  },
  error: {
    fontSize: wp('3%'),
    marginTop: hp('0.5%'),
    marginLeft: wp('1%'),
  },
  counter: {
    fontSize: wp('3%'),
    textAlign: 'right',
    marginTop: hp('0.5%'),
  },
});

// Specialized input components for common use cases
export const SearchInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}> = ({ value, onChangeText, placeholder = "Search...", onSearch }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      variant="filled"
      size="medium"
      leftIcon={
        <Text style={{ color: colors.textSecondary, fontSize: wp('4%') }}>🔍</Text>
      }
      rightIcon={value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Text style={{ color: colors.textSecondary, fontSize: wp('4%') }}>✕</Text>
        </TouchableOpacity>
      ) : undefined}
      style={{ marginVertical: hp('1%') }}
    />
  );
};

export const PostInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}> = ({ value, onChangeText, placeholder = "What's on your mind?", maxLength = 280 }) => (
  <Input
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    variant="filled"
    size="large"
    multiline
    numberOfLines={4}
    maxLength={maxLength}
    style={{ marginVertical: hp('1%') }}
  />
);
