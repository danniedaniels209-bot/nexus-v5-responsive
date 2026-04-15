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
        setPost(data.post);
        setLikes(data.post.likes?.length || 0);
        setLiked(user ? data.post.likes?.includes(user.id || user._id) : false);
      } catch { toast.error('Post not found'); }
      setLoading(false);
    };
    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;
    const prevLiked = liked;
    const prevLikes = likes;
    setLiked(!liked);
    setLikes(l => liked ? l - 1 : l + 1);
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
    } catch { toast.error('Failed to add comment'); }
    setCommenting(false);
  };

  if (loading) return <PageSpinner />;

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ padding: 48, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
          <p style={{ color: '#6B7280', marginBottom: 20 }}>Post not found</p>
          <Link to="/feed" className="btn btn-secondary">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: '#E5E7EB', fontFamily: '"DM Sans", sans-serif' }}>
      <div className="page-bg"/>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10 }}>

        <Link to="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7280', textDecoration: 'none', fontSize: 14, marginBottom: 24, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#E5E7EB'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Feed
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(20px, 5vw, 40px)', marginBottom: 24 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Link to={`/profile/${post.author?.username}`}>
              <Avatar user={post.author} size={44} />
            </Link>
            <div>
              <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none', color: '#E5E7EB', fontWeight: 600, fontSize: 15, display: 'block' }}>
                {post.author?.username}
              </Link>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {post.mediaUrl && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} style={{ width: '100%', maxHeight: 600, objectFit: 'contain', display: 'block' }} alt=""/>
              ) : post.mediaType === 'video' ? (
                <video src={post.mediaUrl} controls style={{ width: '100%', display: 'block' }} />
              ) : post.mediaType === 'link' ? (
                <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: 20, color: 'var(--purple)', textDecoration: 'none', fontSize: 14 }}>
                  🔗 {post.mediaUrl}
                </a>
              ) : null}
            </div>
          )}

          {post.title && <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: '#E5E7EB', marginBottom: 16, lineHeight: 1.2 }}>{post.title}</h1>}
          <p style={{ fontSize: 16, color: '#9CA3AF', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{post.content}</p>

          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
              {post.tags.map(t => (
                <Link key={t} to={`/explore?tag=${t}`} className="badge badge-accent" style={{ textDecoration: 'none' }}>#{t}</Link>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 20, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer',
              color: liked ? '#EF4444' : '#6B7280', transition: 'all 0.2s', fontSize: 14, fontWeight: 500
            }}>
              <svg width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              {likes}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 14 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              {post.views || 0}
            </div>
          </div>
        </motion.article>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(20px, 5vw, 40px)' }}>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, color: '#E5E7EB', marginBottom: 24 }}>Comments ({post.comments?.length || 0})</h2>

          {user && (
            <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, color: '#E5E7EB', fontSize: 14, minHeight: 100, outline: 'none', resize: 'vertical', marginBottom: 12 }}/>
              <button type="submit" disabled={!comment.trim() || commenting} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 13, opacity: (!comment.trim() || commenting) ? 0.5 : 1 }}>
                {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {post.comments?.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, padding: '20px 0' }}>No comments yet.</p>
            ) : (
              post.comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <Avatar user={c.user} size={32} />
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Link to={`/profile/${c.user?.username}`} style={{ textDecoration: 'none', color: '#A78BFA', fontWeight: 600, fontSize: 13 }}>
                        @{c.user?.username}
                      </Link>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6 }}>{c.text}</p>
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
