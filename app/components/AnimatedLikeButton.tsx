import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

interface AnimatedLikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedLikeButton({ isLiked, likeCount, onPress, disabled }: AnimatedLikeButtonProps) {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(isLiked ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#666', '#ff4757']
    );
    return {
      color,
    };
  });

  const handlePress = () => {
    if (disabled) return;

    // Animate scale
    scale.value = withSequence(
      withSpring(1.2, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );

    // Animate color
    colorProgress.value = withSpring(isLiked ? 0 : 1, { duration: 300 });

    // Call the actual onPress function
    runOnJS(onPress)();
  };

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.Text style={[styles.text, textAnimatedStyle]}>
        {isLiked ? '❤️' : '🤍'} {likeCount} Like{likeCount !== 1 ? 's' : ''}
      </Animated.Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  text: {
    fontSize: 10,
    fontWeight: '500',
  },
}); 