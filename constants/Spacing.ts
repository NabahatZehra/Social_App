import { 
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-dimensions';

/**
 * Consistent spacing system for Social Connect app
 * Based on 8pt grid system with responsive dimensions for mobile-first design
 */

export const Spacing = {
  // Base spacing units (responsive)
  xs: wp('1%'),    // 4pt equivalent
  sm: wp('2%'),    // 8pt equivalent  
  md: wp('4%'),    // 16pt equivalent
  lg: wp('6%'),    // 24pt equivalent
  xl: wp('8%'),    // 32pt equivalent
  xxl: wp('12%'),  // 48pt equivalent

  // Vertical spacing
  vertical: {
    xs: hp('0.5%'),
    sm: hp('1%'),
    md: hp('2%'),
    lg: hp('3%'),
    xl: hp('4%'),
    xxl: hp('6%'),
  },

  // Component-specific spacing
  component: {
    // Padding for cards and containers
    cardPadding: wp('5%'),
    containerPadding: wp('4%'),
    
    // Margins for layout
    screenMargin: wp('4%'),
    sectionMargin: hp('3%'),
    
    // Button spacing
    buttonPadding: {
      horizontal: wp('6%'),
      vertical: hp('1.5%'),
    },
    
    // Input spacing
    inputPadding: {
      horizontal: wp('4%'),
      vertical: hp('1.5%'),
    },
    
    // List item spacing
    listItemPadding: wp('4%'),
    listItemMargin: hp('1%'),
    
    // Avatar spacing
    avatarMargin: wp('2%'),
    
    // Icon spacing
    iconMargin: wp('2%'),
  },

  // Layout spacing for different screen sections
  layout: {
    // Header spacing
    headerPadding: {
      horizontal: wp('4%'),
      vertical: hp('2%'),
    },
    
    // Content spacing
    contentPadding: {
      horizontal: wp('4%'),
      vertical: hp('2%'),
    },
    
    // Footer/Tab bar spacing
    tabBarPadding: {
      horizontal: wp('2%'),
      vertical: hp('1%'),
    },
    
    // Modal spacing
    modalPadding: {
      horizontal: wp('6%'),
      vertical: hp('3%'),
    },
  },

  // Thumb-friendly touch target sizes (minimum 44pt)
  touchTarget: {
    small: wp('10%'),   // 40pt equivalent
    medium: wp('12%'),  // 48pt equivalent (recommended minimum)
    large: wp('14%'),   // 56pt equivalent
  },

  // Border radius for consistent rounded corners
  borderRadius: {
    xs: wp('1%'),
    sm: wp('2%'),
    md: wp('3%'),
    lg: wp('4%'),
    xl: wp('6%'),
    full: wp('50%'), // For circular elements
  },
};

// Utility functions for common spacing patterns
export const SpacingUtils = {
  // Get consistent padding for containers
  getContainerPadding: () => ({
    paddingHorizontal: Spacing.component.containerPadding,
    paddingVertical: Spacing.vertical.md,
  }),

  // Get consistent margin for sections
  getSectionMargin: () => ({
    marginVertical: Spacing.component.sectionMargin,
  }),

  // Get thumb-friendly button dimensions
  getThumbButtonStyle: () => ({
    minWidth: Spacing.touchTarget.medium,
    minHeight: Spacing.touchTarget.medium,
    borderRadius: Spacing.borderRadius.lg,
  }),

  // Get card styling with generous white space
  getCardStyle: () => ({
    padding: Spacing.component.cardPadding,
    marginVertical: Spacing.vertical.md,
    marginHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
  }),

  // Get list item styling
  getListItemStyle: () => ({
    paddingHorizontal: Spacing.component.listItemPadding,
    paddingVertical: Spacing.vertical.md,
    marginVertical: Spacing.component.listItemMargin,
  }),
};
