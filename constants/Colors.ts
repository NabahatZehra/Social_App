/**
 * Modern pastel color palette for Social Connect app
 * Designed with high contrast text and mobile-first accessibility in mind
 */

// Primary pastel colors
const pastelPrimary = '#A8E6CF'; // Soft mint green
const pastelSecondary = '#FFB3BA'; // Soft pink
const pastelAccent = '#BFAFF2'; // Soft lavender
const pastelWarning = '#FFE4B5'; // Soft peach
const pastelInfo = '#B3E5FC'; // Soft sky blue

// High contrast text colors
const darkText = '#2C3E50'; // Deep blue-gray for excellent readability
const lightText = '#F8F9FA'; // Pure white with slight warmth
const mutedText = '#6C757D'; // Medium gray for secondary text

export const Colors = {
  light: {
    // Core colors
    text: darkText,
    textSecondary: mutedText,
    background: '#FEFEFE', // Pure white with warmth
    backgroundSecondary: '#F8F9FA', // Slightly off-white for cards
    
    // Brand colors
    primary: pastelPrimary,
    secondary: pastelSecondary,
    accent: pastelAccent,
    
    // UI elements
    tint: pastelPrimary,
    border: '#E9ECEF',
    shadow: 'rgba(44, 62, 80, 0.1)',
    
    // Interactive elements
    buttonPrimary: pastelPrimary,
    buttonSecondary: pastelSecondary,
    buttonText: darkText,
    
    // Navigation
    tabBackground: '#FFFFFF',
    tabIconDefault: mutedText,
    tabIconSelected: pastelPrimary,
    
    // Status colors
    success: pastelPrimary,
    warning: pastelWarning,
    error: pastelSecondary,
    info: pastelInfo,
    
    // Social features
    like: pastelSecondary,
    comment: pastelInfo,
    share: pastelAccent,
    
    // Cards and surfaces
    card: '#FFFFFF',
    cardBorder: '#F1F3F4',
    input: '#FFFFFF',
    inputBorder: '#E9ECEF',
    inputFocus: pastelPrimary,
  },
  dark: {
    // Core colors
    text: lightText,
    textSecondary: '#B0BEC5',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    
    // Brand colors (slightly muted for dark mode)
    primary: '#7FDBAA', // Darker mint
    secondary: '#FF8A95', // Darker pink
    accent: '#9C88D4', // Darker lavender
    
    // UI elements
    tint: '#7FDBAA',
    border: '#2C2C2E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Interactive elements
    buttonPrimary: '#7FDBAA',
    buttonSecondary: '#FF8A95',
    buttonText: lightText,
    
    // Navigation
    tabBackground: '#1C1C1E',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#7FDBAA',
    
    // Status colors
    success: '#7FDBAA',
    warning: '#FFD60A',
    error: '#FF8A95',
    info: '#64D2FF',
    
    // Social features
    like: '#FF8A95',
    comment: '#64D2FF',
    share: '#9C88D4',
    
    // Cards and surfaces
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
    input: '#1C1C1E',
    inputBorder: '#2C2C2E',
    inputFocus: '#7FDBAA',
  },
};
