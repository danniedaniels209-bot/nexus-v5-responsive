import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import PostCard from '../components/ui/PostCard';

const TAGS = [
  {t:'technology',h:98},{t:'ai',h:95},{t:'design',h:88},{t:'javascript',h:85},
  {t:'startup',h:79},{t:'ux',h:74},{t:'opensource',h:68},{t:'webdev',h:72},
  {t:'career',h:62},{t:'productivity',h:58},{t:'python',h:65},{t:'react',h:70},
];

export default function Explore() {
  const [sp] = useSearchParams();
  const [q,    setQ]    = useState(sp.get('search') || '');
  const [tag,  setTag]  = useState(sp.get('tag') || '');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoad] = useState(false);
  const [tab, setTab] = useState('posts');

  const doSearch = useCallback(async () => {
    setLoad(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set('search', q);
      if (tag) p.set('tag', tag);
      const [pr, ur] = await Promise.all([
        api.get(`/posts?${p}&limit=24`),
        q ? api.get(`/users/search?q=${encodeURIComponent(q)}`) : Promise.resolve({ data: { users: [] } }),
      ]);
      setPosts(pr.data.posts);
      setUsers(ur.data.users);
    } catch {}
    setLoad(false);
  }, [q, tag]);

  useEffect(() => { doSearch(); }, [tag]);

  return (
    <div style={{ background: '#0B0B0F', minHeight: '100vh', color: '#E5E7EB', fontFamily: '"DM Sans", sans-serif' }}>
      <div className="page-bg"/>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A78BFA', marginBottom: 10 }}>Discover</p>
          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#E5E7EB' }}>Explore</h1>
        </motion.div>

        {/* Search bar */}
        <form onSubmit={e => { e.preventDefault(); setTag(''); doSearch(); }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', gap: 10, padding: '8px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 10, color: '#6B7280', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search posts, people, ideas…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#E5E7EB', fontFamily: '"DM Sans", sans-serif', fontSize: 15, minWidth: 0 }}/>
            {(q || tag) && (
              <button type="button" onClick={() => { setQ(''); setTag(''); }}
                style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Sans", sans-serif', flexShrink: 0, padding: '0 8px' }}>
                Clear
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 14, flexShrink: 0 }}>Search</button>
          </div>
        </form>

        {/* Tag grid */}
        {!q && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 14 }}>Popular Topics</p>
            <div className="explore-tag-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {TAGS.map(({ t: tg, h }, i) => {
                const active = tag === tg;
                return (
                  <button key={tg} onClick={() => setTag(tg === tag ? '' : tg)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10,
                      background: active ? 'var(--purple-soft)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--purple-ring)' : 'var(--border)'}`,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'var(--elevated)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; } }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--purple)' : 'var(--text-3)', flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: active ? 'var(--purple)' : 'var(--text-2)', flex: 1, fontWeight: active ? 600 : 400 }}>#{tg}</span>
                    <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${h}%` }} transition={{ duration: 1, delay: i * 0.05 }}
                        style={{ height: '100%', borderRadius: 2, background: active ? 'var(--purple)' : 'var(--text-3)', opacity: 0.7 }}/>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab toggle */}
        {(posts.length > 0 || users.length > 0) && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', borderRadius: 10, background: 'rgba(30,26,19,0.6)', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
            {[['posts', posts.length], ['people', users.length]].map(([tb, count]) => count > 0 && (
              <button key={tb} onClick={() => setTab(tb === 'people' ? 'users' : tb)}
                style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: tab === (tb === 'people' ? 'users' : tb) ? 'var(--purple-soft)' : 'transparent',
                  color: tab === (tb === 'people' ? 'users' : tb) ? 'var(--purple)' : 'var(--text-3)' }}>
                {tb.charAt(0).toUpperCase() + tb.slice(1)} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 1s linear infinite' }}/>
          </div>
        ) : tab === 'posts' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.length === 0 && (q || tag) ? (
              <div style={{ textAlign: 'center', padding: '56px 0', color: '#6B7280' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No results found</p>
                <p style={{ fontSize: 13 }}>Try a different search or tag</p>
              </div>
            ) : posts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PostCard post={p}/>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {users.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/profile/${u.username}`}
                  style={{ display: 'block', padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 17, marginBottom: 12 }}>
                    {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : (u.username[0] || 'U').toUpperCase()}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB', marginBottom: 4 }}>@{u.username}</p>
                  {u.bio && <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{u.bio}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
