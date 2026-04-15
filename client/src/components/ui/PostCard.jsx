import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuthStore();
  const cardRef   = useRef(null);
  const [liked, setLiked] = useState(post.likes?.includes(user?.id || user?._id));
  const [likes, setLikes] = useState(post.likes?.length ?? 0);
  const [tilt,  setTilt]  = useState({ x: 0, y: 0 });
  const [deleting, setDeleting] = useState(false);

  const isAuthor = (user?._id || user?.id) === (post.author?._id || post.author);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 4;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -4;
    setTilt({ x, y });
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to like'); return; }
    const next = !liked;
    setLiked(next);
    setLikes(l => next ? l + 1 : l - 1);
    try {
      await api.put(`/posts/${post._id}/like`);
    } catch {
      setLiked(!next);
      setLikes(l => next ? l - 1 : l + 1);
    }
  };

  const handleDeleteClick = async (e) => {
    e.preventDefault();
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post removed');
      onDelete?.(post._id);
    } catch (err) {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
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
        opacity: deleting ? 0.5 : 1,
        position: 'relative'
      }}
    >
      {/* Author Header */}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--purple)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            )}
            {post.isRepost && (
              <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" style={{ display: 'none' }} /><path d="M17 17H7V14L3 18L7 22V19H19V13H17V17M7 7H17V10L21 6L17 2V5H5V11H7V7Z" /></svg>
                reposted
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{formatTime(post.createdAt)}</span>
        </div>

        {isAuthor && (
          <button onClick={handleDeleteClick} disabled={deleting} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6,
            borderRadius: 8, transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        )}
      </div>

      <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
        {post.title && <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>{post.title}</h3>}
        <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{post.content}</p>

        {/* Media Rendering */}
        {post.mediaUrl && (
          <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
            {post.mediaType === 'image' ? (
              <img src={post.mediaUrl} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} alt="" />
            ) : post.mediaType === 'video' ? (
              <video src={post.mediaUrl} style={{ width: '100%' }} controls onClick={e => e.preventDefault()} />
            ) : post.mediaType === 'link' ? (
              <div style={{ padding: 12, fontSize: 13, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                {post.mediaUrl}
              </div>
            ) : null}
          </div>
        )}

        {/* Repost content */}
        {post.isRepost && post.originalPost && (
          <div style={{ marginTop: 14, padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Avatar user={post.originalPost.author} size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>@{post.originalPost.author?.username}</span>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{post.originalPost.content}</p>
          </div>
        )}
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {post.tags.map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--purple)', background: 'var(--purple-soft)', padding: '2px 8px', borderRadius: 6 }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: 'none', cursor: 'pointer', background: liked ? 'rgba(239,68,68,0.1)' : 'transparent',
          color: liked ? 'var(--red)' : 'var(--text-3)', fontSize: 13, transition: 'all 0.2s'
        }}>
          <svg width="15" height="15" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          {likes > 0 && likes}
        </button>
        <Link to={`/posts/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', color: 'var(--text-3)', fontSize: 13, textDecoration: 'none', borderRadius: 8 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          {post.comments?.length > 0 && post.comments.length}
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          {post.views || 0}
        </div>
      </div>
    </motion.article>
  );
}
