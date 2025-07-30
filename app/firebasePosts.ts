import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { NotificationService } from './services/NotificationService';

// Create a new post (text + optional imageUrl)
export async function createPost({ userId, userName, text, imageUrl }: { userId: string; userName: string; text: string; imageUrl?: string }) {
  return await addDoc(collection(db, 'posts'), {
    userId,
    userName,
    text,
    imageUrl: imageUrl || '',
    likes: [],
    createdAt: serverTimestamp(),
  });
}

// Fetch all posts, ordered by createdAt desc
export async function fetchPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Like a post
export async function likePost(postId: string, userId: string, userName: string) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const postData = postSnap.data();
    await updateDoc(postRef, { likes: arrayUnion(userId) });
    
    // Send notification to post author (if not liking own post)
    if (postData.userId !== userId) {
      await NotificationService.sendLikeNotification(userName, postData.text);
    }
  }
}

// Unlike a post
export async function unlikePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, { likes: arrayRemove(userId) });
}

// Add a comment to a post
export async function addComment(postId: string, { userId, userName, text }: { userId: string; userName: string; text: string }) {
  const commentRef = doc(collection(db, 'posts', postId, 'comments'));
  await setDoc(commentRef, {
    userId,
    userName,
    text,
    createdAt: serverTimestamp(),
  });
  
  // Get post data to send notification to post author
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const postData = postSnap.data();
    // Send notification to post author (if not commenting on own post)
    if (postData.userId !== userId) {
      await NotificationService.sendCommentNotification(userName, text, postData.text);
    }
  }
}

// Fetch comments for a post, ordered by createdAt asc
export async function fetchComments(postId: string) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 