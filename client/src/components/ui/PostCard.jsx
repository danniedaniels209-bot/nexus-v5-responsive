import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../context/authStore';
import Avatar from './Avatar';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = (now - d) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuthStore();
  const cardRef   = useRef(null);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id || user?.id));
  const [likes, setLikes] = useState(post.likes?.length ?? 0);
  const [tilt,  setTilt]  = useState({ x: 0, y: 0 });
  const [deleting, setDeleting] = useState(false);

  const isAuthor = (user?._id || user?.id) === (post.author?._id || post.author);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikes(l => next ? l + 1 : l - 1);
    try {
      await api.put(`/posts/${post._id}/like`);
      onUpdate?.();
    } catch {
      setLiked(!next);
      setLikes(l => next ? l - 1 : l + 1);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Delete this post permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post removed');
      onUpdate?.();
    } catch (err) {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px',
        transition: 'all 0.25s ease',
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transformStyle: 'preserve-3d',
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Link to={`/profile/${post.author?.username}`}>
          <Avatar user={post.author} size={38} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>
                {post.author?.username}
              </span>
            </Link>
            {post.author?.isVerified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#A78BFA"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{formatTime(post.createdAt)}</span>
        </div>

        {isAuthor && (
          <button onClick={handleDelete} disabled={deleting} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6,
            borderRadius: 8, transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        )}
      </div>

      <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
        {post.title && <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>{post.title}</h3>}
        <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.75 }}>{post.content}</p>
        {(post.mediaUrl || post.image) && (
          <img src={post.mediaUrl || post.image} style={{ width: '100%', borderRadius: 10, marginTop: 14, maxHeight: 320, objectFit: 'cover' }} alt=""/>
        )}
      </Link>

      <div style={{ display: 'flex', gap: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: 'none', cursor: 'pointer', background: liked ? 'rgba(239,68,68,0.1)' : 'transparent',
          color: liked ? '#EF4444' : '#6B7280', fontSize: 13
        }}>
          <svg width="15" height="15" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          {likes > 0 && likes}
        </button>
        <Link to={`/posts/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', color: '#6B7280', fontSize: 13, textDecoration: 'none' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          {post.comments?.length > 0 && post.comments.length}
        </Link>
      </div>
    </motion.article>
  );
}
