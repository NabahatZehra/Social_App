import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import app, { db } from '../firebase';
import { useMemoizedCallback } from '../hooks/useMemoizedCallback';
import { NotificationService } from '../services/NotificationService';
import { RealTimeService } from '../services/RealTimeService';

interface Post {
  id: string;
  userId: string;
  userName: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  createdAt: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  posts: Post[];
  postsLoading: boolean;
  error: string | null;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  refreshPosts: () => void;
  setUserOnlineStatus: (isOnline: boolean) => Promise<void>;
  getCommentsForPost: (postId: string) => Comment[];
  clearError: () => void;
  signOut: () => Promise<void>;
  forceClearAuth: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  posts: [],
  postsLoading: true,
  error: null,
  likePost: async () => {},
  unlikePost: async () => {},
  refreshPosts: () => {},
  setUserOnlineStatus: async () => {},
  getCommentsForPost: () => [],
  clearError: () => {},
  signOut: async () => {},
  forceClearAuth: () => {},
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [error, setError] = useState<string | null>(null);

  // Memoized values to prevent unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts]);
  const memoizedComments = useMemo(() => comments, [comments]);

  // Auth state listener
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setError('Authentication error occurred');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await NotificationService.requestPermissions();
        const cleanup = await NotificationService.setupNotificationListeners();
        return cleanup;
      } catch (error) {
        console.error('Notification setup error:', error);
        // Don't set error state for notification issues as they're not critical
      }
    };
    
    setupNotifications();
  }, []);

  // Set user online status
  const setUserOnlineStatus = useCallback(async (isOnline: boolean) => {
    if (!user) return;
    
    try {
      const userStatusRef = doc(db, 'userStatus', user.uid);
      await setDoc(userStatusRef, {
        online: isOnline,
        lastSeen: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
      });
    } catch (error) {
      console.error('Error setting user status:', error);
    }
  }, [user]);

  // Update user status when app becomes active/inactive
  useEffect(() => {
    if (!user) return;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        setUserOnlineStatus(true);
      } else {
        setUserOnlineStatus(false);
      }
    };

    // Set online when user logs in
    setUserOnlineStatus(true);

    // Cleanup when component unmounts
    return () => {
      setUserOnlineStatus(false);
    };
  }, [user, setUserOnlineStatus]);

  // Posts real-time listener using RealTimeService
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);
    setError(null);
    
    const unsubscribe = RealTimeService.subscribeToPosts((postsData) => {
      try {
        setPosts(postsData);
        setPostsLoading(false);
      } catch (error) {
        console.error('Error processing posts:', error);
        setError('Failed to load posts');
        setPostsLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  // Real-time comments listener using RealTimeService
  useEffect(() => {
    if (!user || posts.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    posts.forEach(post => {
      const unsubscribe = RealTimeService.subscribeToPostComments(post.id, (commentsData) => {
        try {
          setComments(prev => ({
            ...prev,
            [post.id]: commentsData,
          }));
        } catch (error) {
          console.error('Error processing comments:', error);
        }
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user, posts]);

  const likePost = useMemoizedCallback(async (postId: string, userId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        await updateDoc(postRef, { likes: arrayUnion(userId) });
        
        // Handle real-time updates and notifications
        await RealTimeService.handleLikeUpdate(
          postId, 
          userId, 
          true, 
          postData.userId, 
          postData.userName, 
          postData.text
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post');
    }
  }, [user]);

  const unlikePost = useMemoizedCallback(async (postId: string, userId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: arrayRemove(userId) });
    } catch (error) {
      console.error('Error unliking post:', error);
      setError('Failed to unlike post');
    }
  }, []);

  const refreshPosts = useCallback(() => {
    setPostsLoading(true);
    setError(null);
  }, []);

  const getCommentsForPost = useCallback((postId: string): Comment[] => {
    return memoizedComments[postId] || [];
  }, [memoizedComments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await setUserOnlineStatus(false);
      const auth = getAuth(app);
      await auth.signOut();
      setUser(null);
      setPosts([]);
      setComments({});
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [setUserOnlineStatus]);

  const forceClearAuth = useCallback(() => {
    setUser(null);
    setPosts([]);
    setComments({});
    setLoading(false);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    posts: memoizedPosts,
    postsLoading,
    error,
    likePost,
    unlikePost,
    refreshPosts,
    setUserOnlineStatus,
    getCommentsForPost,
    clearError,
    signOut,
    forceClearAuth,
  }), [
    user,
    loading,
    memoizedPosts,
    postsLoading,
    error,
    likePost,
    unlikePost,
    refreshPosts,
    setUserOnlineStatus,
    getCommentsForPost,
    clearError,
    signOut,
    forceClearAuth,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 