import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../context/authStore';
import Avatar from '../components/ui/Avatar';
import { PageSpinner } from '../components/ui/Spinner';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        if (data.success) {
          setPost(data.post);
          setLikes(data.post.likes?.length || 0);

          // Fix 9 — Robust Like check with toString()
          const userId = user?.id || user?._id;
          setLiked(userId ? data.post.likes?.some(lid =>
            lid.toString() === userId.toString()
          ) : false);
        }
      } catch (err) {
        toast.error('Post not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    const prevLiked = liked;
    const prevLikes = likes;
    setLiked(!liked);
    setLikes(l => prevLiked ? l - 1 : l + 1);

    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikes);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setCommenting(true);
    try {
      const { data } = await api.post(`/posts/${id}/comment`, { text: comment });
      setPost((prev) => ({ ...prev, comments: data.comments }));
      setComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PageSpinner /></div>;

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="page-bg"/>
        <div style={{ padding: 48, borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 16 }}>📭</p>
          <h3 style={{ color: 'var(--text-1)', marginBottom: 8 }}>Post not found</h3>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>This post might have been deleted or moved.</p>
          <Link to="/feed" className="btn btn-secondary">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: '#E5E7EB', fontFamily: 'var(--font-main)' }}>
      <div className="page-bg"/>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 20px', position: 'relative', zIndex: 10 }}>

        <Link to="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', textDecoration: 'none', fontSize: 14, marginBottom: 24, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Feed
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px', marginBottom: 24 }}>

          {/* Author info with safety checks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Link to={post.author ? `/profile/${post.author.username}` : '#'}>
              <Avatar user={post.author} size={44} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link to={post.author ? `/profile/${post.author.username}` : '#'} style={{ textDecoration: 'none', color: '#fff', fontWeight: 600, fontSize: 15 }}>
                  {post.author?.username || 'Unknown Author'}
                </Link>
                {post.author?.isVerified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--purple)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Media Rendering */}
          {post.mediaUrl && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: '#000', border: '1px solid var(--border)' }}>
              {post.mediaType === 'video' ? (
                <video src={post.mediaUrl} controls style={{ width: '100%', display: 'block' }} />
              ) : (
                <img src={post.mediaUrl} style={{ width: '100%', maxHeight: 600, objectFit: 'contain', display: 'block' }} alt=""/>
              )}
            </div>
          )}

          {post.title && <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>{post.title}</h1>}
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{post.content}</p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
              {post.tags.map(t => (
                <Link key={t} to={`/explore?tag=${t}`} className="badge badge-accent" style={{ textDecoration: 'none' }}>#{t}</Link>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div style={{ display: 'flex', gap: 24, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer',
              color: liked ? 'var(--red)' : 'var(--text-3)', transition: '0.2s', fontSize: 14, fontWeight: 600
            }}>
              <svg width="22" height="22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              {likes}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 14 }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              {post.views || 0}
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#fff', marginBottom: 24 }}>Comments ({post.comments?.length || 0})</h2>

          {user && (
            <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..."
                style={{ width: '100%', background: '#000', border: '1px solid var(--border-mid)', borderRadius: 14, padding: 16, color: '#fff', fontSize: 14, minHeight: 100, outline: 'none', resize: 'vertical', marginBottom: 12 }}/>
              <button type="submit" disabled={!comment.trim() || commenting} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>
                {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {post.comments?.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 14, padding: '20px 0' }}>No comments yet.</p>
            ) : (
              post.comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <Avatar user={c.user} size={32} />
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Link to={c.user ? `/profile/${c.user.username}` : '#'} style={{ textDecoration: 'none', color: 'var(--purple)', fontWeight: 600, fontSize: 13 }}>
                        @{c.user?.username || 'user'}
                      </Link>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
