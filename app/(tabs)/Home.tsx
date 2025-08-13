import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AnimatedCommentButton from '../components/AnimatedCommentButton';
import AnimatedLikeButton from '../components/AnimatedLikeButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { createPost } from '../firebasePosts';
import { useDebounce } from '../hooks/useDebounce';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { hp, scale, wp } from '../utils/responsive';
import CommentsModal from './CommentsModal';

export default function Home() {
  const { user, posts, postsLoading, error, likePost, unlikePost, refreshPosts, getCommentsForPost, clearError } = useApp();
  const router = useRouter();
  const { debounce, throttle, runAfterInteractions } = usePerformanceOptimization();
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Debounce text input to reduce unnecessary re-renders
  const debouncedText = useDebounce(text, 300);

  const handlePickImage = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!text.trim() || !user) return;
    
    // Prevent multiple simultaneous posts
    if (creating) return;
    
    try {
      setCreating(true);
      console.log('Creating post with:', { text, imageUri, user: user.uid });
      
      await createPost({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        text: text.trim(),
        imageUrl: imageUri || '',
      });
      
      console.log('Post created successfully');
      setText('');
      setImageUri(null);
      
      // Refresh posts to show the new post immediately
      await refreshPosts();
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      console.log('Setting creating to false');
      setCreating(false);
    }
    
    // Fallback: Ensure button is always reset after 10 seconds
    setTimeout(() => {
      if (creating) {
        console.log('Fallback: Resetting creating state');
        setCreating(false);
      }
    }, 10000);
  }, [text, imageUri, user, refreshPosts, creating]);

  const handleLike = useCallback(async (post: any) => {
    if (!user) return;
    
    try {
      if (post.likes && post.likes.includes(user.uid)) {
        await unlikePost(post.id, user.uid);
      } else {
        await likePost(post.id, user.uid);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  }, [user, likePost, unlikePost]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    clearError();
    refreshPosts();
    setTimeout(() => setRefreshing(false), 500);
  }, [refreshPosts, clearError]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const comments = getCommentsForPost(item.id);
    const isLiked = item.likes && user && item.likes.includes(user.uid);
    
    return (
      <View style={styles.post}>
        <TouchableOpacity onPress={() => router.push(`/UserProfile?userId=${item.userId}`)}>
          <Text style={styles.author}>{item.userName}</Text>
        </TouchableOpacity>
        <Text style={styles.content}>{item.text}</Text>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        ) : null}
        <View style={styles.actions}>
          <AnimatedLikeButton
            isLiked={isLiked}
            likeCount={item.likes ? item.likes.length : 0}
            onPress={() => handleLike(item)}
          />
          <AnimatedCommentButton
            commentCount={comments.length}
            onPress={() => { setSelectedPostId(item.id); setCommentsModalVisible(true); }}
          />
        </View>
        <Text style={styles.timestamp}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}
        </Text>
      </View>
    );
  }, [getCommentsForPost, user, handleLike, router]);

  const renderHeader = useCallback(() => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        textAlignVertical="top"
        scrollEnabled={false}
      />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.buttonText}>📷 Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.postButton, (creating || !text.trim() || !user) && styles.disabledButton]} 
          onPress={handleCreatePost} 
          disabled={creating || !text.trim() || !user}
        >
          <Text style={styles.postButtonText}>{creating ? 'Posting...' : '✨ Post'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [text, imageUri, creating, user, handlePickImage, handleCreatePost]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const contentContainerStyle = useMemo(() => ({ paddingBottom: 100 }), []);

  // Show error message if there's an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {postsLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={contentContainerStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
      
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        postId={selectedPostId || ''}
      />
    </View>
  );
}

// Modern, colorful styles with better UX
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    margin: wp(4),
    marginBottom: hp(3),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 16,
    padding: scale(16),
    fontSize: scale(16),
    minHeight: hp(10),
    maxHeight: hp(25),
    backgroundColor: '#f8f9fa',
    color: '#333',
    fontFamily: 'System',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(16),
    gap: scale(12),
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#6c5ce7',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  postButton: {
    flex: 1,
    backgroundColor: '#00b894',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ddd',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '600',
  },
  postButtonText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '700',
  },
  previewImage: {
    width: wp(30),
    height: wp(30),
  },
  post: {
    backgroundColor: 'white',
    padding: scale(16),
    marginVertical: scale(6),
    marginHorizontal: scale(8),
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#74b9ff',
  },
  author: {
    fontWeight: '700',
    fontSize: scale(16),
    marginBottom: scale(8),
    color: '#2d3436',
    textDecorationLine: 'underline',
    textDecorationColor: '#74b9ff',
  },
  content: {
    fontSize: scale(14),
    marginBottom: scale(12),
    color: '#333',
    lineHeight: scale(20),
  },
  postImage: {
    width: '100%',
    height: hp(25),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
    paddingTop: hp(1),
  },
  timestamp: {
    fontSize: scale(12),
    color: '#636e72',
    marginTop: scale(8),
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: scale(14),
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6),
  },
  errorText: {
    fontSize: scale(14),
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: scale(20),
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: wp(6),
    minHeight: hp(6),
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: scale(14),
    fontWeight: '600',
  },
}); 