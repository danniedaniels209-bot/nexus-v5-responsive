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
        if (data.success) {
          setProfile(data.user);
          setPosts(data.posts || []);
          const myId = (me?.id || me?._id)?.toString();
          setFollowing(myId ? data.user.followers?.some(f => (f._id || f).toString() === myId) : false);
        }
      } catch (err) {
        toast.error('Profile not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [username, me]);

  const handleFollow = async () => {
    if (!me) return toast.error('Login to follow');
    setFl(true);
    try {
      const { data } = await api.put(`/users/${profile._id}/follow`);
      setFollowing(data.following);
      const myId = (me?.id || me?._id);
      setProfile(p => ({
        ...p,
        followers: data.following
          ? [...(p.followers || []), { _id: myId }]
          : (p.followers || []).filter(f => (f._id || f).toString() !== myId.toString())
      }));
    } catch { toast.error('Failed to update follow status'); }
    setFl(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 1s linear infinite' }}/>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="page-bg"/>
      <div style={{ padding: 48, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>👤</p>
        <p style={{ color: '#6B7280' }}>User not found</p>
        <Link to="/feed" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Feed</Link>
      </div>
    </div>
  );

  const isMe = (me?.id || me?._id)?.toString() === profile._id?.toString();
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
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.1) 0%, transparent 70%)' }}/>
          </div>

          <div style={{ padding: '0 clamp(16px,4vw,36px) 24px', display: 'flex', flexDirection: 'column', gap: 20, marginTop: -40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="avatar" style={{ width: 88, height: 88, fontSize: 32, border: '4px solid #000' }}>
                  {profile.avatar
                    ? <img src={profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                    : profile.username[0].toUpperCase()
                  }
                </div>
                {profile.isOnline && <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', border: '2px solid #000' }}/>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                {isMe ? (
                  <Link to="/settings" className="btn btn-secondary btn-sm">Edit profile</Link>
                ) : me ? (
                  <>
                    <button onClick={handleFollow} disabled={fl} className={following ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"} style={{ opacity: fl ? 0.65 : 1 }}>
                      {fl ? '…' : following ? 'Following' : 'Follow'}
                    </button>
                    <button onClick={() => navigate(`/chat?user=${profile._id}`)} className="btn btn-secondary btn-sm">Message</button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 400 }}>@{profile.username}</h1>
                {profile.isVerified && (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--purple)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                )}
              </div>
              {profile.bio && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 520 }}>{profile.bio}</p>}

              <div style={{ display: 'flex', gap: 16, marginTop: 12, color: 'var(--text-3)', fontSize: 12 }}>
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.dateOfBirth && <span>🎂 {new Date(profile.dateOfBirth).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '16px clamp(16px,4vw,36px)' }}>
            {[[posts.length, 'posts'], [fc, 'followers'], [profile.following?.length || 0, 'following']].map(([v, l], i) => (
              <div key={l} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--purple)' }}><AnimatedCount value={v}/></div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feed section */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 20 }}>Posts</h2>

        {posts.length === 0 ? (
          <div style={{ padding: '64px 24px', borderRadius: 20, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-3)' }}>{isMe ? "You haven't posted yet." : "No posts yet."}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: 20 }}>
            {posts.map(p => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
