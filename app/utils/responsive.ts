import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

export const wp = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

export const scale = (size: number) => {
  return (screenWidth / baseWidth) * size;
};

export const verticalScale = (size: number) => {
  return (screenHeight / baseHeight) * size;
};

export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
}; 