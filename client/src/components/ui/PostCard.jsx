import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  // ── 3D tilt on hover ────────────────────────────────────────────────────────
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
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none' }}>
          <Avatar user={post.author} size={38} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB', display: 'block' }}>
              {post.author?.username}
            </span>
          </Link>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{formatTime(post.createdAt)}</span>
        </div>
        {/* Tags */}
        {post.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px',
            borderRadius: 99, background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA',
          }}>#{tag}</span>
        ))}
      </div>

      {/* Content */}
      <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
        {post.title && (
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB', marginBottom: 8, lineHeight: 1.4 }}>
            {post.title}
          </h3>
        )}
        <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.75, display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content}
        </p>
        {post.image && (
          <img
            src={post.image}
            alt=""
            style={{ width: '100%', borderRadius: 10, marginTop: 14, maxHeight: 280, objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.07)' }}
          />
        )}
      </Link>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
        {/* Like */}
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: 'none', cursor: user ? 'pointer' : 'default', transition: 'all 0.2s',
          background: liked ? 'rgba(239,68,68,0.12)' : 'transparent',
          color: liked ? '#EF4444' : '#6B7280', fontSize: 13, fontWeight: 500,
        }}>
          <svg width="15" height="15" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {likes > 0 && likes}
        </button>

        {/* Comment */}
        <Link to={`/posts/${post._id}`} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, textDecoration: 'none', transition: 'all 0.2s',
          color: '#6B7280', fontSize: 13, fontWeight: 500,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#E5E7EB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          {post.comments?.length > 0 && post.comments.length}
        </Link>

        {/* Share */}
        <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/posts/${post._id}`)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          background: 'transparent', color: '#6B7280', fontSize: 13, fontWeight: 500, marginLeft: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#E5E7EB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>
      </div>
    </motion.article>
  );
}
