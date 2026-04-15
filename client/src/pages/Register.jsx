import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

const PERKS = [
  ['🔐', 'End-to-end encrypted messaging'],
  ['⚡', 'Real-time feed & notifications'],
  ['🌐', 'Discover people and trending topics'],
  ['✨', 'Free forever · No hidden fees'],
];

export default function Register() {
  const { register } = useAuthStore();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '', bio: '', dateOfBirth: '', location: '', avatar: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.bio, form.dateOfBirth, form.location, form.avatar);
      toast.success('Welcome to Nexus 🚀');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const pwLen = form.password.length;
  const strength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : 3;
  const strengthColors = ['', '#EF4444', '#F59E0B', '#10B981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="auth-split" style={{ background: 'var(--bg)', color: 'var(--text-1)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(34,211,238,0.06) 0%, transparent 60%)' }} />

      {/* Scrollable container for the form */}
      <div className="auth-panel-form" style={{ position: 'relative', zIndex: 10, overflowY: 'auto', maxHeight: '100vh', padding: '80px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 480 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))',
              border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#A78BFA', fontWeight: 800, fontSize: 14 }}>N</span>
            </div>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: '#E5E7EB' }}>Nexus</span>
          </Link>

          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 34, fontWeight: 400,
            letterSpacing: '-0.02em', marginBottom: 8, color: '#E5E7EB' }}>Create your account</h1>
          <p style={{ color: '#6B7280', marginBottom: 32, fontSize: 14 }}>Join the next generation of social networking.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Username', type: 'text',  key: 'username', ph: 'yourhandle' },
                { label: 'Email',    type: 'email', key: 'email',    ph: 'you@example.com' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                    marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.ph} required className="input-nexus" style={{ fontSize: 14 }} />
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" required className="input-nexus" style={{ fontSize: 14 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Avatar URL</label>
              <input type="url" value={form.avatar}
                onChange={e => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/photo.jpg" className="input-nexus" style={{ fontSize: 14 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                  marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Date of Birth</label>
                <input type="date" value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="input-nexus" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                  marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Location</label>
                <input type="text" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="City, Country" className="input-nexus" style={{ fontSize: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Bio</label>
              <textarea value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..." className="input-nexus" rows="3" style={{ fontSize: 14, resize: 'none' }} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ padding: '14px', fontSize: 15, width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block', margin: '0 auto' }} />
                : <>Create account <span style={{ fontSize: 16 }}>→</span></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, marginTop: 32 }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
