import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { wp, hp } from '@/app/utils/responsive';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'medium',
  margin = 'small',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: wp('4%'), // Generous rounded corners
      overflow: 'hidden',
    };

    // Generous padding for clean, spacious design
    const paddingStyles = {
      none: {},
      small: {
        padding: wp('3%'),
      },
      medium: {
        padding: wp('5%'), // Extra generous padding
      },
      large: {
        padding: wp('7%'),
      },
    };

    // Generous margins for white space
    const marginStyles = {
      none: {},
      small: {
        marginVertical: hp('1%'),
        marginHorizontal: wp('2%'),
      },
      medium: {
        marginVertical: hp('1.5%'),
        marginHorizontal: wp('4%'),
      },
      large: {
        marginVertical: hp('2%'),
        marginHorizontal: wp('6%'),
      },
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      },
      elevated: {
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...variantStyles[variant],
    };
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyles(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </CardComponent>
  );
};

// Specialized card components for common use cases
export const PostCard: React.FC<{ children: React.ReactNode; onPress?: () => void; style?: ViewStyle }> = ({
  children,
  onPress,
  style,
}) => (
  <Card
    variant="elevated"
    padding="large"
    margin="medium"
    onPress={onPress}
    style={style}
  >
    {children}
  </Card>
);

export const ProfileCard: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <Card
    variant="elevated"
    padding="large"
    margin="medium"
    style={style}
  >
    {children}
  </Card>
);

export const CommentCard: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <Card
    variant="outlined"
    padding="medium"
    margin="small"
    style={[{ marginLeft: wp(8) }, style]} // Indent comments
  >
    {children}
  </Card>
);
