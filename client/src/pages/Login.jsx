import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

export default function Login() {
  const { login }  = useAuthStore();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back 👋');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="auth-split" style={{ background: 'var(--bg)', color: 'var(--text-1)', position: 'relative', overflow: 'hidden' }}>
      {/* BG glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(139,92,246,0.1) 0%, transparent 60%)' }} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: 600, height: 600, borderRadius: '50%',
        background: 'rgba(34,211,238,0.05)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Side panel */}
      <div className="auth-panel-side" style={{ borderRight: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, marginBottom: 32,
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(139,92,246,0.2)' }}>
            <svg width="24" height="24" fill="none" stroke="#A78BFA" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 26, fontWeight: 400,
            letterSpacing: '-0.02em', color: '#E5E7EB', marginBottom: 12 }}>
            Pick up where you left off
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 36 }}>
            Your feed, conversations, and connections — all waiting for you.
          </p>
          {[
            'Real-time messaging with typing indicators',
            'Posts, replies, and media sharing',
            'Follow your network, discover new people',
            'Private DMs with live presence',
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" fill="none" stroke="#A78BFA" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.55 }}>{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 56 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))',
              border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#A78BFA', fontWeight: 800, fontSize: 14 }}>N</span>
            </div>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: '#E5E7EB', fontWeight: 400 }}>Nexus</span>
          </Link>

          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 34, fontWeight: 400,
            letterSpacing: '-0.02em', marginBottom: 8, color: '#E5E7EB' }}>Sign in</h1>
          <p style={{ color: '#6B7280', marginBottom: 40, fontSize: 14 }}>Welcome back. Enter your details to continue.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Email address', type: 'email',    key: 'email',    ph: 'you@example.com' },
              { label: 'Password',      type: 'password', key: 'password', ph: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                  marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.ph}
                  required
                  className="input-nexus"
                  style={{ fontSize: 14 }}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ padding: '14px', fontSize: 15, width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)',
                  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
              ) : (
                <>Continue <span style={{ fontSize: 16 }}>→</span></>
              )}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '32px 0' }} />
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
