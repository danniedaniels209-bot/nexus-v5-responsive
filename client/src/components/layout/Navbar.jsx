import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../ui/Avatar';

const NAV_LINKS = [
  { to: '/feed',    label: 'Feed',    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/></svg> },
  { to: '/explore', label: 'Explore', icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="1.8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35"/></svg> },
  { to: '/chat',    label: 'Chat',    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z"/></svg> },
];

export default function Navbar() {
  const { user, logout }  = useAuthStore();
  const { unreadCount }   = useSocket() || {};
  const navigate          = useNavigate();
  const location          = useLocation();
  const [mobOpen, setMobOpen]     = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="site-navbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: scrolled ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
      }}>

        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>N</span>
          </div>
          <span className="nav-brand-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#fff' }}>Nexus</span>
        </Link>

        {user && (
          <div className="nav-center" style={{ display: 'flex', gap: 8, flex: 1 }}>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: isActive ? '#fff' : 'var(--text-3)',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                transition: '0.2s',
                position: 'relative'
              })}>
                {icon}{label}
                {label === 'Chat' && unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', border: '2px solid #000' }}/>
                )}
              </NavLink>
            ))}
          </div>
        )}

        <div className="nav-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
             <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Avatar user={user} size={32} />
                   <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                     <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 12, background: '#0B0B0F', border: '1px solid var(--border-mid)', borderRadius: 12, padding: 8, minWidth: 180, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                      <Link to={`/profile/${user.username}`} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: '#fff', fontSize: 13 }}>Profile</Link>
                      <Link to="/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: '#fff', fontSize: 13 }}>Settings</Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}/>
                      <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: 'var(--red)', fontSize: 13 }}>Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          ) : (
            <div className="nav-auth-actions" style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join</Link>
            </div>
          )}

          <button className="nav-mob-toggle" onClick={() => setMobOpen(!mobOpen)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
             <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {mobOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 110 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(280px, 100vw)', background: '#0B0B0F', zIndex: 120, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
               <button onClick={() => setMobOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }}>&times;</button>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {user ? (
                   <>
                     {NAV_LINKS.map(l => (
                       <Link key={l.to} to={l.to} style={{ color: '#fff', fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>{l.icon}{l.label}</Link>
                     ))}
                     <Link to="/settings" style={{ color: '#fff', fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>
                       Settings
                     </Link>
                     <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}/>
                     <button onClick={handleLogout} style={{ color: 'var(--red)', fontSize: 18, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2"/></svg>
                       Logout
                     </button>
                   </>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <Link to="/login" className="btn btn-secondary">Login</Link>
                     <Link to="/register" className="btn btn-primary">Join Nexus</Link>
                   </div>
                 )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
