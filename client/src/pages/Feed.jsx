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
      <div style={{
        padding: 24, borderRadius: 20,
        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>✍️</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>Share something</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
          Share what's on your mind with your network.
        </p>
        <Link to="/create" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
          Write a post
        </Link>
      </div>

      <div style={{
        padding: 24, borderRadius: 20,
        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>Explore tags</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map(tag => (
            <Link key={tag} to={`/explore?tag=${tag}`} style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              color: 'var(--text-2)', textDecoration: 'none', transition: '0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      <div style={{
        padding: 24, borderRadius: 20,
        background: 'rgba(139,92,246,0.03)', border: '1px solid var(--purple-ring)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>Global Chat</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          Join the community to connect in real time.
        </p>
        <Link to="/chat" style={{
          display: 'block', marginTop: 14, padding: '10px', borderRadius: 10,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
          color: '#A78BFA', textDecoration: 'none', fontSize: 13, fontWeight: 600,
          textAlign: 'center', transition: '0.2s',
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
      const url = tab === 'Following' ? `/posts/following?page=${p}&limit=10` : `/posts?page=${p}&limit=10`;
      const { data } = await api.get(url);
      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.pagination ? p < data.pagination.pages : false);
      if (!reset) setPage(prev => prev + 1);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(true);
  }, [tab]); // eslint-disable-line

  const handleDelete = id => {
    setPosts(p => p.filter(x => x._id !== id));
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)', paddingTop: 80 }}>
      <div className="page-bg" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#E5E7EB' }}>Feed</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>Stay updated with the community.</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            Write a post
          </Link>
        </div>

        <div className="feed-grid">
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', width: 'fit-content' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: '0.2s',
                  background: tab === t ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-3)',
                }}>{t}</button>
              ))}
            </div>

            {loading && page === 1 ? (
              <FeedSkeleton count={3} />
            ) : posts.length === 0 ? (
              <div style={{ padding: '80px 24px', borderRadius: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>📭</p>
                <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Nothing to show</h3>
                <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>Follow people or post something to get started.</p>
                <Link to="/explore" className="btn btn-secondary">Explore trending</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <AnimatePresence>
                  {posts.map((p) => (
                    <PostCard key={p._id} post={p} onUpdate={() => {}} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <div style={{ textAlign: 'center', paddingTop: 20 }}>
                    <button onClick={() => fetchPosts()} className="btn btn-secondary">
                      Load more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="feed-sidebar">
            <div style={{ position: 'sticky', top: 100 }}>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
