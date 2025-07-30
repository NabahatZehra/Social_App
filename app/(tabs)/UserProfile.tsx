import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebase';

interface UserProfileProps {
  userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      // Load user data
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
      // Load user's posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const postsSnap = await getDocs(postsQuery);
      setUserPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    loadUserProfile();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.post}>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      ) : null}
      <Text style={styles.timestamp}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {userData.photoURL && (
          <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{userData.name || 'No Name'}</Text>
        <Text style={styles.bio}>{userData.bio || 'No bio'}</Text>
      </View>
      <Text style={styles.sectionTitle}>Posts ({userPosts.length})</Text>
      <FlatList
        data={userPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  post: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  postText: {
    fontSize: 16,
    marginBottom: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
}); 