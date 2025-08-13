import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-dimensions';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: AvatarSize;
  onPress?: () => void;
  style?: ViewStyle;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  onPress,
  style,
  showOnlineIndicator = false,
  isOnline = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getAvatarSize = () => {
    const sizes = {
      small: wp('8%'),
      medium: wp('12%'),
      large: wp('16%'),
      xlarge: wp('20%'),
    };
    return sizes[size];
  };

  const getFontSize = () => {
    const sizes = {
      small: wp('3%'),
      medium: wp('4%'),
      large: wp('5%'),
      xlarge: wp('6%'),
    };
    return sizes[size];
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = getAvatarSize();
  const fontSize = getFontSize();

  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const onlineIndicatorStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: avatarSize * 0.3,
    height: avatarSize * 0.3,
    borderRadius: (avatarSize * 0.3) / 2,
    backgroundColor: isOnline ? colors.success : colors.textSecondary,
    borderWidth: 2,
    borderColor: colors.background,
  };

  const AvatarComponent = onPress ? TouchableOpacity : View;

  return (
    <AvatarComponent
      style={[avatarStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {source ? (
        <Image
          source={source}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{
            fontSize,
            fontWeight: '600',
            color: colors.buttonText,
          }}
        >
          {name ? getInitials(name) : '?'}
        </Text>
      )}
      
      {showOnlineIndicator && (
        <View style={onlineIndicatorStyle} />
      )}
    </AvatarComponent>
  );
};

// Specialized avatar components
export const UserAvatar: React.FC<{
  user: {
    profilePicture?: string;
    name: string;
    isOnline?: boolean;
  };
  size?: AvatarSize;
  onPress?: () => void;
  showOnlineIndicator?: boolean;
}> = ({ user, size = 'medium', onPress, showOnlineIndicator = false }) => (
  <Avatar
    source={user.profilePicture ? { uri: user.profilePicture } : undefined}
    name={user.name}
    size={size}
    onPress={onPress}
    showOnlineIndicator={showOnlineIndicator}
    isOnline={user.isOnline}
  />
);

export const AvatarGroup: React.FC<{
  users: Array<{
    profilePicture?: string;
    name: string;
  }>;
  maxVisible?: number;
  size?: AvatarSize;
  onPress?: () => void;
}> = ({ users, maxVisible = 3, size = 'small', onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;
  const avatarSize = {
    small: wp('8%'),
    medium: wp('12%'),
    large: wp('16%'),
    xlarge: wp('20%'),
  }[size];

  const GroupComponent = onPress ? TouchableOpacity : View;

  return (
    <GroupComponent
      style={styles.avatarGroup}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {visibleUsers.map((user, index) => (
        <View
          key={index}
          style={[
            styles.groupedAvatar,
            {
              marginLeft: index > 0 ? -avatarSize * 0.3 : 0,
              zIndex: visibleUsers.length - index,
            },
          ]}
        >
          <Avatar
            source={user.profilePicture ? { uri: user.profilePicture } : undefined}
            name={user.name}
            size={size}
            style={{
              borderWidth: 2,
              borderColor: colors.background,
            }}
          />
        </View>
      ))}
      
      {remainingCount > 0 && (
        <View
          style={[
            styles.groupedAvatar,
            {
              marginLeft: -avatarSize * 0.3,
              zIndex: 0,
            },
          ]}
        >
          <View
            style={[
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: colors.textSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.background,
              },
            ]}
          >
            <Text
              style={{
                fontSize: avatarSize * 0.3,
                fontWeight: '600',
                color: colors.background,
              }}
            >
              +{remainingCount}
            </Text>
          </View>
        </View>
      )}
    </GroupComponent>
  );
};

const styles = StyleSheet.create({
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupedAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
