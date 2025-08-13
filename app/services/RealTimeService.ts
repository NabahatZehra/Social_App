import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationService } from './NotificationService';

export interface RealTimePost {
  id: string;
  userId: string;
  userName: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  createdAt: any;
}

export interface RealTimeComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export class RealTimeService {
  private static listeners: Map<string, () => void> = new Map();

  static subscribeToPosts(callback: (posts: RealTimePost[]) => void) {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RealTimePost[];
      callback(posts);
    }, (error) => {
      console.error('Error listening to posts:', error);
    });

    this.listeners.set('posts', unsubscribe);
    return unsubscribe;
  }

  static subscribeToPostComments(postId: string, callback: (comments: RealTimeComment[]) => void) {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RealTimeComment[];
      callback(comments);
    }, (error) => {
      console.error('Error listening to comments:', error);
    });

    this.listeners.set(`comments_${postId}`, unsubscribe);
    return unsubscribe;
  }

  static subscribeToUserPosts(userId: string, callback: (posts: RealTimePost[]) => void) {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RealTimePost[];
      callback(posts);
    }, (error) => {
      console.error('Error listening to user posts:', error);
    });

    this.listeners.set(`userPosts_${userId}`, unsubscribe);
    return unsubscribe;
  }

  static subscribeToLikes(postId: string, callback: (likes: string[]) => void) {
    const postRef = doc(db, 'posts', postId);
    
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.likes || []);
      }
    }, (error) => {
      console.error('Error listening to likes:', error);
    });

    this.listeners.set(`likes_${postId}`, unsubscribe);
    return unsubscribe;
  }

  static async handleLikeUpdate(postId: string, userId: string, isLiked: boolean, postAuthorId: string, postAuthorName: string, postText: string) {
    // Send notification to post author if someone else liked their post
    if (isLiked && userId !== postAuthorId) {
      await NotificationService.sendLikeNotification(postAuthorName, postText);
    }
  }

  static async handleCommentUpdate(commentAuthorId: string, commentAuthorName: string, commentText: string, postAuthorId: string, postText: string) {
    // Send notification to post author if someone else commented on their post
    if (commentAuthorId !== postAuthorId) {
      await NotificationService.sendCommentNotification(commentAuthorName, commentText, postText);
    }
  }

  static unsubscribeFromAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  static unsubscribeFrom(key: string) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }
}
