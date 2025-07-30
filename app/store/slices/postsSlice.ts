import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { arrayRemove, arrayUnion, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Post {
  id: string;
  userId: string;
  userName: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  createdAt: any;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
});

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likes: arrayUnion(userId) });
    return { postId, userId };
  }
);

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likes: arrayRemove(userId) });
    return { postId, userId };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post && !post.likes.includes(userId)) {
          post.likes.push(userId);
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.likes = post.likes.filter(id => id !== userId);
        }
      });
  },
});

export const { setPosts, addPost } = postsSlice.actions;
export default postsSlice.reducer; 