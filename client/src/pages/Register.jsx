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
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
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
      <div style={{ position: 'fixed', top: 0, right: 0, width: 700, height: 700, borderRadius: '50%',
        background: 'rgba(139,92,246,0.06)', filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Side panel */}
      <div className="auth-panel-side" style={{ borderRight: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, marginBottom: 32,
            background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(34,211,238,0.15)' }}>
            <svg width="24" height="24" fill="none" stroke="#67E8F9" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 26, fontWeight: 400,
            letterSpacing: '-0.02em', color: '#E5E7EB', marginBottom: 12 }}>Join the conversation</h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 36 }}>
            Connect, share, and collaborate with a community that gets it.
          </p>
          {PERKS.map(([icon, text], i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
              <span style={{ fontSize: 14, color: '#9CA3AF' }}>{text}</span>
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
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: '#E5E7EB' }}>Nexus</span>
          </Link>

          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 34, fontWeight: 400,
            letterSpacing: '-0.02em', marginBottom: 8, color: '#E5E7EB' }}>Create your account</h1>
          <p style={{ color: '#6B7280', marginBottom: 40, fontSize: 14 }}>Free to join. No credit card required.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Username', type: 'text',  key: 'username', ph: 'yourhandle', minLength: 3 },
              { label: 'Email',    type: 'email', key: 'email',    ph: 'you@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                  marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.ph} required className="input-nexus" style={{ fontSize: 14 }}
                  minLength={f.minLength} />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
                marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" required className="input-nexus" style={{ fontSize: 14 }} />
              {form.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {[1, 2, 3].map(s => (
                      <div key={s} style={{
                        height: 3, flex: 1, borderRadius: 2, transition: 'all 0.3s',
                        background: strength >= s ? strengthColors[strength] : 'rgba(255,255,255,0.08)',
                        boxShadow: strength >= s ? `0 0 6px ${strengthColors[strength]}66` : 'none',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[strength], minWidth: 36, fontWeight: 600 }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ padding: '14px', fontSize: 15, width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
                : <>Create account <span style={{ fontSize: 16 }}>→</span></>
              }
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#4B5563', marginTop: 16, lineHeight: 1.7 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '28px 0' }} />
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
