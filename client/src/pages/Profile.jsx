import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../context/authStore';
import PostCard from '../components/ui/PostCard';

function AnimatedCount({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const end = parseInt(value) || 0;
    if (!end) { setN(0); return; }
    const step = Math.ceil(end / 28);
    const id = setInterval(() => { setN(p => { const next = Math.min(p + step, end); if (next >= end) clearInterval(id); return next; }); }, 28);
    return () => clearInterval(id);
  }, [value]);
  return <>{n}</>;
}

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [fl, setFl] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data.user);
        setPosts(data.posts);
        setFollowing(me ? data.user.followers?.some(f => f._id === me.id) : false);
      } catch { toast.error('Profile not found'); }
      setLoading(false);
    })();
  }, [username]);

  const handleFollow = async () => {
    if (!me) return; setFl(true);
    try {
      const { data } = await api.put(`/users/${profile._id}/follow`);
      setFollowing(data.following);
      setProfile(p => ({ ...p, followers: data.following ? [...(p.followers || []), { _id: me.id }] : (p.followers || []).filter(f => f._id !== me.id) }));
    } catch { toast.error('Failed'); }
    setFl(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 1s linear infinite' }}/>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ padding: 48, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>👤</p>
        <p style={{ color: '#6B7280' }}>User not found</p>
      </div>
    </div>
  );

  const isMe = me?.id === profile._id;
  const fc   = profile.followers?.length || 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: '#E5E7EB', fontFamily: '"DM Sans", sans-serif' }}>
      <div className="page-bg"/>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(80px,10vw,96px) clamp(16px,4vw,24px) 80px', position: 'relative', zIndex: 10 }}>

        {/* ── Profile header card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, marginBottom: 32, overflow: 'hidden' }}>

          {/* Cover / banner */}
          <div style={{ height: 120, background: 'linear-gradient(135deg, var(--elevated), var(--overlay))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,123,80,0.12) 0%, transparent 70%)' }}/>
            {/* Geometric accent */}
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.06 }} width="200" height="120" viewBox="0 0 200 120">
              <circle cx="180" cy="20" r="60" fill="var(--purple)"/>
              <circle cx="120" cy="90" r="40" fill="var(--purple)"/>
            </svg>
          </div>

          <div className="profile-header-inner" style={{ padding: 'clamp(0px, 3vw, 0px) clamp(20px,4vw,36px) clamp(24px,4vw,32px)', display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -48, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="avatar" style={{ width: 88, height: 88, fontSize: 32, border: '3px solid var(--surface)' }}>
                {profile.avatar
                  ? <img src={profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                  : profile.username[0].toUpperCase()
                }
              </div>
              {profile.isOnline && <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--surface)' }}/>}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 180, paddingTop: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#E5E7EB' }}>
                  @{profile.username}
                </h1>
                {profile.isOnline && <span className="badge badge-accent">● online</span>}
              </div>
              {profile.bio && <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.65, maxWidth: 480 }}>{profile.bio}</p>}
            </div>

            {/* Actions */}
            <div className="profile-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 48 }}>
              {isMe ? (
                <Link to="/settings" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>Edit profile</Link>
              ) : me ? (
                <>
                  <button onClick={handleFollow} disabled={fl}
                    className={following ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ padding: '8px 20px', fontSize: 13, opacity: fl ? 0.65 : 1 }}>
                    {fl ? '…' : following ? 'Following' : '+ Follow'}
                  </button>
                  <button
                    onClick={() => navigate(`/chat?user=${profile._id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 2H4a1 1 0 00-1 1v14a1 1 0 001 1h3l3 4 3-4h7a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg>
                    Message
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Stats row */}
          <div className="profile-stats" style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '16px clamp(20px,4vw,36px)', gap: 0 }}>
            {[[posts.length, 'posts'], [fc, 'followers'], [profile.following?.length || 0, 'following']].map(([v, l], i) => (
              <div key={l} style={{ textAlign: 'center', padding: '0 clamp(16px,3vw,28px)', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 24, color: '#A78BFA' }}>
                  <AnimatedCount value={v}/>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontWeight: 400, color: '#E5E7EB' }}>Posts</h2>
          <span style={{ fontSize: 12, color: '#6B7280', fontFamily: '"DM Mono", monospace' }}>{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: '48px 32px', borderRadius: 14, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#6B7280', fontSize: 14 }}>{isMe ? "You haven't posted yet." : "No posts yet."}</p>
            {isMe && <Link to="/create" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16, padding: '9px 24px', fontSize: 13 }}>Write your first post</Link>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 16 }}>
            {posts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PostCard post={p}/>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
