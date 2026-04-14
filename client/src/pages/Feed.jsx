import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PostCard from '../components/ui/PostCard';
import { FeedSkeleton } from '../components/ui/Skeleton';

const TABS = ['Latest', 'Following'];
const TAGS = ['technology','design','ai','javascript','startup','ux','webdev','opensource'];

function Sidebar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Quick-post prompt */}
      <div style={{
        padding: 20, borderRadius: 16,
        background: 'rgba(139,92,246,0.06)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139,92,246,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>✍️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>Share something</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 14, lineHeight: 1.6 }}>
          Share what's on your mind with your network.
        </p>
        <Link to="/create" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '9px 16px', fontSize: 13 }}>
          Write a post
        </Link>
      </div>

      {/* Tags */}
      <div style={{
        padding: 20, borderRadius: 16,
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#6B7280', marginBottom: 14 }}>Explore tags</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {TAGS.map(tag => (
            <Link key={tag} to={`/explore?tag=${tag}`} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#9CA3AF', textDecoration: 'none', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Community card */}
      <div style={{
        padding: 20, borderRadius: 16,
        background: 'rgba(34,211,238,0.04)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(34,211,238,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.8)', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#67E8F9' }}>Community live</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.6 }}>
          Join the global chat to connect with others in real time.
        </p>
        <Link to="/chat" style={{
          display: 'block', marginTop: 12, padding: '8px 14px', borderRadius: 8,
          background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
          color: '#67E8F9', textDecoration: 'none', fontSize: 12, fontWeight: 600,
          textAlign: 'center', transition: 'all 0.2s',
        }}>Open Chat →</Link>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tab,     setTab]     = useState('Latest');

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      const p = reset ? 1 : page;
      const { data } = await api.get(`/posts?page=${p}&limit=10`);
      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setHasMore(p < data.pagination?.pages);
      if (!reset) setPage(prev => prev + 1);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(true);
  }, [tab]); // eslint-disable-line

  const handleDelete = async id => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(p => p.filter(x => x._id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 400, letterSpacing: '-0.02em', color: '#E5E7EB', lineHeight: 1 }}>Feed</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>What's happening in your network</p>
          </div>
          <Link to="/create" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
            + Write a post
          </Link>
        </div>

        <div className="feed-grid" style={{ alignItems: 'flex-start' }}>
          {/* Main column */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 20, padding: 4, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '7px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: tab === t ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: tab === t ? '#A78BFA' : '#6B7280',
                  boxShadow: tab === t ? '0 0 0 1px rgba(139,92,246,0.3)' : 'none',
                }}>{t}</button>
              ))}
            </div>

            {loading ? (
              <FeedSkeleton count={4} />
            ) : posts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '56px 32px', borderRadius: 20, textAlign: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#E5E7EB' }}>Nothing here yet</h3>
                <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 14 }}>Be the first to post something.</p>
                <Link to="/create" className="btn btn-primary">Write a post</Link>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AnimatePresence>
                  {posts.map((p) => (
                    <PostCard key={p._id} post={p} onUpdate={() => fetchPosts(true)} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <button onClick={() => fetchPosts()} className="btn btn-secondary" style={{ padding: '10px 32px' }}>
                      Load more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="feed-sidebar" style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
