import React, { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const handleAddComment = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    await addComment(postId, {
      userId: user.uid,
      userName: user.displayName || user.email || 'User',
      text,
    });
    setText('');
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Comments ({comments.length})</Text>
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.author}>{item.userName}</Text>
              <Text>{item.text}</Text>
              <Text style={styles.timestamp}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={text}
            onChangeText={setText}
            editable={!submitting}
          />
          <Button title={submitting ? 'Posting...' : 'Post'} onPress={handleAddComment} disabled={submitting || !text.trim() || !user} />
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
    marginBottom: 8,
  },
  closeText: {
    color: 'blue',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  comment: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
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
}); 