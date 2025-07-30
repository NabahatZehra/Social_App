import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { hp, wp } from '../utils/responsive';

interface AnimatedCommentButtonProps {
  commentCount: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedCommentButton({ commentCount, onPress, disabled }: AnimatedCommentButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (disabled) return;

    // Bounce animation
    scale.value = withSequence(
      withSpring(0.9, { duration: 100 }),
      withSpring(1.1, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    // Call the actual onPress function
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>
        💬 {commentCount} Comment{commentCount !== 1 ? 's' : ''}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    marginLeft: wp(4),
  },
  text: {
    fontSize: wp(3.5),
    fontWeight: '500',
    color: '#666',
  },
}); 