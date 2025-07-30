import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { createPost, likePost, unlikePost } from '../firebasePosts';
import CommentsModal from './CommentsModal';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Real-time updates
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleCreatePost = async () => {
    if (!text.trim() || !user) return;
    setCreating(true);
    await createPost({
      userId: user.uid,
      userName: user.displayName || user.email || 'User',
      text,
      imageUrl: imageUri || '',
    });
    setText('');
    setImageUri(null);
    setCreating(false);
  };

  const handleLike = async (post: any) => {
    if (!user) return;
    if (post.likes && post.likes.includes(user.uid)) {
      await unlikePost(post.id, user.uid);
    } else {
      await likePost(post.id, user.uid);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Real-time updates will auto-refresh
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.post}>
      <Text style={styles.author}>{item.userName}</Text>
      <Text style={styles.content}>{item.text}</Text>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      ) : null}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleLike(item)}>
          <Text style={{ color: item.likes && user && item.likes.includes(user.uid) ? 'blue' : 'gray' }}>
            {item.likes ? item.likes.length : 0} Like{item.likes && item.likes.length !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setSelectedPostId(item.id); setCommentsModalVisible(true); }}>
          <Text style={{ color: 'gray', marginLeft: 16 }}>💬 Comment</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.timestamp}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
          multiline
        />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
        <View style={styles.formButtons}>
          <Button title="Pick Image" onPress={handlePickImage} />
          <Button title={creating ? 'Posting...' : 'Post'} onPress={handleCreatePost} disabled={creating || !text.trim() || !user} />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    padding: 16,
    backgroundColor: '#fff',
  },
  form: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    minHeight: 40,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  post: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    marginBottom: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
}); 