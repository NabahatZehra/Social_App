import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }
    
    return true;
  }

  static async getPushToken() {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Push tokens not supported on web');
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      // Use getDevicePushTokenAsync instead of getExpoPushTokenAsync for better compatibility
      const token = await Notifications.getDevicePushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  static async sendLocalNotification(title: string, body: string, data?: any) {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async sendLikeNotification(postAuthorName: string, postText: string) {
    const title = 'New Like! ❤️';
    const body = `${postAuthorName} liked your post: "${postText.substring(0, 50)}${postText.length > 50 ? '...' : ''}"`;
    
    await this.sendLocalNotification(title, body, {
      type: 'like',
      postText,
    });
  }

  static async sendCommentNotification(commentAuthorName: string, commentText: string, postText: string) {
    const title = 'New Comment! 💬';
    const body = `${commentAuthorName} commented on your post: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`;
    
    await this.sendLocalNotification(title, body, {
      type: 'comment',
      commentText,
      postText,
    });
  }

  static async setupNotificationListeners() {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Notification listeners not supported on web');
      return () => {};
    }

    try {
      // Handle notification received while app is running
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      // Handle notification response (when user taps notification)
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        // Handle navigation based on notification type
        const data = response.notification.request.content.data;
        if (data?.type === 'like' || data?.type === 'comment') {
          // Navigate to the relevant post or profile
          console.log('Navigate to post/profile based on notification');
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
      return () => {};
    }
  }
} 