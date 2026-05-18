import { lazy, Suspense, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ParticleField = lazy(() => import('../components/3d/ParticleField'));

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const FEATURES = [
  { icon: '💬', title: 'Real-time Chat', body: 'Socket.io-powered messaging with live presence, typing indicators, and instant delivery.', accent: 'purple' },
  { icon: '🌐', title: 'Social Graph', body: 'Follow, discover, and build your professional network with a curated, personalised feed.', accent: 'cyan' },
  { icon: '🔍', title: 'Smart Explore', body: 'Full-text search across posts, users, and tags. Discover trending topics in real time.', accent: 'purple' },
  { icon: '🛡️', title: 'Secure by Default', body: 'JWT + refresh tokens, bcrypt hashing, and role-based access controls on every request.', accent: 'cyan' },
  { icon: '📡', title: 'Live Feed', body: 'Posts, replies, and media with threaded comments. Your content reaches followers instantly.', accent: 'purple' },
  { icon: '⚡', title: 'Sub-50ms Latency', body: 'Edge-optimised infrastructure ensures lightning-fast response regardless of location.', accent: 'cyan' },
];

const STATS = [['10k+', 'Members'], ['98%', 'Uptime'], ['<50ms', 'Latency'], ['6', 'Core features']];

const GlowOrb = memo(({ color, size, x, y, opacity = 0.12 }) => (
  <div style={{
    position: 'absolute',
    left: x, top: y,
    width: size, height: size,
    borderRadius: '50%',
    background: color,
    filter: `blur(${size * 0.4}px)`,
    opacity,
    pointerEvents: 'none',
    animation: 'orb-float 12s ease-in-out infinite',
  }} />
));

// ── HERO MOCKUP ──────────────────────────────────────────────────────────────
const HeroMockup = memo(() => (
  <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
      className="glass-card" style={{ padding: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
        <span style={{ fontSize: 12, color: '#6B7280' }}>nexus.app · live</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {['#EF4444', '#F59E0B', '#10B981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
        </div>
      </div>
      {[
        { name: 'Alex Chen', time: '2m', content: 'Just shipped the new design system 🚀 Glassmorphism is incredible.', likes: 42, comments: 8 },
        { name: 'Sara Kim',  time: '5m', content: 'Real-time collaboration is changing how we build products together.', likes: 28, comments: 14 },
      ].map((p, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 + i * 0.15 }}
          style={{ background: i === 0 ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,${i === 0 ? '0.1' : '0.06'})`, borderRadius: 12, padding: '14px', marginBottom: i === 0 ? 10 : 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: i === 0 ? 'rgba(139,92,246,0.2)' : 'rgba(34,211,238,0.2)', border: `1px solid rgba(${i === 0 ? '139,92,246' : '34,211,238'},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? '#A78BFA' : '#67E8F9' }}>{p.name[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{p.time} ago</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 10 }}>{p.content}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>❤️ {p.likes}</span>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>💬 {p.comments}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
));

export default function Landing() {
  return (
    <div style={{ background: '#0B0B0F', minHeight: '100vh', color: '#E5E7EB', width: '100%', maxWidth: '100vw', position: 'relative', overflow: 'hidden' }}>
      <GlowOrb color="rgba(139,92,246,0.6)" size={600} x="-10%" y="-5%" opacity={0.1} />
      <GlowOrb color="rgba(34,211,238,0.6)"  size={500} x="70%" y="20%" opacity={0.07} />

      <Suspense fallback={null}><div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}><ParticleField count={60} /></div></Suspense>

      {/* ─── HERO ──────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '100vh', maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="hero-grid" style={{ width: '100%', padding: '120px 0 80px' }}>
          <div>
            <motion.div {...fade(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 10px', borderRadius: 99, marginBottom: 36, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#A78BFA', letterSpacing: '0.04em' }}>Platform live · 142 online</span>
            </motion.div>

            <motion.h1 {...fade(0.2)} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(44px, 5.5vw, 78px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.04, marginBottom: 24 }}>
              Where ideas<br /><span className="text-gradient-purple">find each other</span>
            </motion.h1>

            <motion.div {...fade(0.25)} style={{ width: 48, height: 2, background: 'linear-gradient(90deg, #8B5CF6, #22D3EE)', borderRadius: 1, marginBottom: 24 }} />

            <motion.p {...fade(0.3)} style={{ fontSize: 17, color: '#9CA3AF', lineHeight: 1.8, marginBottom: 40, maxWidth: 440 }}>
              Nexus is a premium real-time social platform. Share ideas, engage in live conversations, and connect with a community that thinks the way you do.
            </motion.p>

            <motion.div {...fade(0.4)} className="hero-cta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <Link to="/register" className="btn btn-primary btn-xl">Get started free →</Link>
              <Link to="/explore" className="btn btn-secondary btn-xl">Browse content</Link>
            </motion.div>

            <motion.div {...fade(0.5)} style={{ display: 'flex', gap: 36, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {STATS.map(([val, label]) => (
                <div key={label}>
                  <div className="text-gradient-purple" style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div className="hero-illustration" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
            <HeroMockup />
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="badge badge-accent" style={{ padding: '6px 16px', marginBottom: 16 }}>Core Features</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#E5E7EB', maxWidth: 600, margin: '0 auto' }}>
            Everything your community needs, <em style={{ color: '#6B7280' }}>built in from day one</em>
          </h2>
        </motion.div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: '32px' }}>
              <div style={{ fontSize: 28, marginBottom: 18, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: f.accent === 'purple' ? 'rgba(139,92,246,0.1)' : 'rgba(34,211,238,0.1)', border: `1px solid ${f.accent === 'purple' ? 'rgba(139,92,246,0.25)' : 'rgba(34,211,238,0.25)'}` }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.7 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 24px 120px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass" style={{ padding: '80px 24px', borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, marginBottom: 16, color: '#E5E7EB' }}>Start connecting today</h2>
          <p style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>Join Nexus, publish your first post, and meet a community that gets it.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">Create free account</Link>
            <Link to="/login"    className="btn btn-secondary btn-xl">Sign in</Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 24px', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#A78BFA', fontWeight: 800, fontSize: 13 }}>N</span></div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#E5E7EB' }}>Nexus</span>
        </div>
        <p style={{ fontSize: 12, color: '#4B5563' }}>© {new Date().getFullYear()} Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
}
