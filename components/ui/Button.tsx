import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { wp, hp } from '@/app/utils/responsive';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'like' | 'comment';
export type ButtonSize = 'small' | 'medium' | 'large' | 'thumb';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: size === 'thumb' ? wp('12%') : wp('4%'), // Extra rounded for thumb buttons
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };

    // Size configurations optimized for thumb accessibility
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        minHeight: hp('4%'),
      },
      medium: {
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('1.5%'),
        minHeight: hp('5.5%'),
      },
      large: {
        paddingHorizontal: wp('8%'),
        paddingVertical: hp('2%'),
        minHeight: hp('6.5%'),
      },
      // Thumb-optimized size for mobile interaction
      thumb: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
    };

    // Variant color configurations
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? colors.border : colors.buttonPrimary,
      },
      secondary: {
        backgroundColor: disabled ? colors.border : colors.buttonSecondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      like: {
        backgroundColor: disabled ? colors.border : colors.like,
      },
      comment: {
        backgroundColor: disabled ? colors.border : colors.comment,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : sizeStyles[size].width,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      small: {
        fontSize: wp('3.5%'),
      },
      medium: {
        fontSize: wp('4%'),
      },
      large: {
        fontSize: wp('4.5%'),
      },
      thumb: {
        fontSize: wp('3%'),
      },
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: colors.buttonText,
      },
      secondary: {
        color: colors.buttonText,
      },
      outline: {
        color: disabled ? colors.textSecondary : colors.primary,
      },
      ghost: {
        color: disabled ? colors.textSecondary : colors.text,
      },
      like: {
        color: colors.buttonText,
      },
      comment: {
        color: colors.buttonText,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.buttonText} 
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={[styles.icon, { marginRight: size === 'thumb' ? 0 : wp('2%') }]}>
              {icon}
            </View>
          )}
          {size !== 'thumb' && (
            <Text style={[getTextStyles(), textStyle]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <View style={[styles.icon, { marginLeft: size === 'thumb' ? 0 : wp('2%') }]}>
              {icon}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
