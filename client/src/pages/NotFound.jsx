import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 32,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: 500, position: 'relative', zIndex: 10 }}>

        <div style={{
          fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(80px, 18vw, 160px)',
          fontWeight: 400, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(34,211,238,0.4) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>404</div>

        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 28, fontWeight: 400,
          color: '#E5E7EB', marginBottom: 14, letterSpacing: '-0.01em' }}>Page not found</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, marginBottom: 36 }}>
          The page you are looking for has drifted into the void. Let us get you back on track.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>Back home</Link>
          <Link to="/explore" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>Explore</Link>
        </div>
      </motion.div>
    </div>
  );
}
