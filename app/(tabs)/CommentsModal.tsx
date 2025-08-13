import React, { useCallback, useState } from 'react';
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { addComment } from '../firebasePosts';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export default function CommentsModal({ visible, onClose, postId }: CommentsModalProps) {
  const { user, getCommentsForPost } = useApp();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const comments = getCommentsForPost(postId);

  const handleAddComment = useCallback(async () => {
    if (!text.trim() || !user) return;
    
    try {
      setSubmitting(true);
      await addComment(postId, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        text: text.trim(),
      });
      setText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [text, user, postId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>❌ Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Comments ({comments.length})</Text>
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={useCallback(({ item }: { item: any }) => (
            <View style={styles.comment}>
              <Text style={styles.author}>{item.userName}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <Text style={styles.timestamp}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}</Text>
            </View>
          ), [])}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.submitButton, !text.trim() && styles.disabledButton]} 
            onPress={handleAddComment}
            disabled={submitting || !text.trim()}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '💬 Adding...' : '✨ Add Comment'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#e17055',
    borderRadius: 20,
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  comment: {
    padding: 16,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#74b9ff',
  },
  author: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#2d3436',
    fontSize: 14,
  },
  commentText: {
    color: '#2d3436',
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#74b9ff',
    padding: 12,
    borderRadius: 5,
    shadowColor: '#74b9ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ddd',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});