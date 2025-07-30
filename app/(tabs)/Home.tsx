import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AnimatedCommentButton from '../components/AnimatedCommentButton';
import AnimatedLikeButton from '../components/AnimatedLikeButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { createPost } from '../firebasePosts';
import { useDebounce } from '../hooks/useDebounce';
import { hp, scale, wp } from '../utils/responsive';
import CommentsModal from './CommentsModal';

export default function Home() {
  const { user, posts, postsLoading, error, likePost, unlikePost, refreshPosts, getCommentsForPost, clearError } = useApp();
  const navigation = useNavigation();
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
    
    try {
      setCreating(true);
      await createPost({
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        text,
        imageUrl: imageUri || '',
      });
      setText('');
      setImageUri(null);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setCreating(false);
    }
  }, [text, imageUri, user]);

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
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
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
  }, [getCommentsForPost, user, handleLike, navigation]);

  const renderHeader = useCallback(() => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <View style={styles.formButtons}>
        <Button title="Pick Image" onPress={handlePickImage} />
        <Button 
          title={creating ? 'Posting...' : 'Post'} 
          onPress={handleCreatePost} 
          disabled={creating || !text.trim() || !user} 
        />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    margin: wp(4),
    marginBottom: hp(2),
    backgroundColor: '#f9f9f9',
    borderRadius: scale(8),
    padding: wp(3),
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: scale(5),
    padding: wp(2.5),
    marginBottom: hp(1),
    minHeight: hp(5),
    fontSize: scale(14),
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: scale(8),
    marginBottom: hp(1),
    alignSelf: 'center',
  },
  post: {
    backgroundColor: '#f1f1f1',
    borderRadius: scale(8),
    padding: wp(3),
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  author: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
    fontSize: scale(14),
  },
  content: {
    fontSize: scale(14),
    marginBottom: hp(0.5),
  },
  postImage: {
    width: '100%',
    height: hp(25),
    borderRadius: scale(8),
    marginBottom: hp(0.5),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  timestamp: {
    fontSize: scale(10),
    color: '#888',
    marginTop: hp(0.5),
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: scale(14),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  errorText: {
    fontSize: scale(14),
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '600',
  },
}); 