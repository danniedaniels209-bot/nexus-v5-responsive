import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchPosts = useCallback(async ({ page = 1, search = '', tag = '', reset = false } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (tag) params.set('tag', tag);
      const { data } = await api.get(`/posts?${params}`);
      setPosts((prev) => reset ? data.posts : [...prev, ...data.posts]);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    await api.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const likePost = useCallback(async (postId) => {
    const { data } = await api.put(`/posts/${postId}/like`);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: Array(data.likes).fill(null) } : p
      )
    );
    return data;
  }, []);

  return { posts, loading, pagination, fetchPosts, deletePost, likePost };
}
