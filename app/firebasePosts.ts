import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

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
export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, { likes: arrayUnion(userId) });
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
}

// Fetch comments for a post, ordered by createdAt asc
export async function fetchComments(postId: string) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 