import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../ui/Avatar';

const NAV_LINKS = [
  { to: '/feed',    label: 'Feed',    icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/></svg> },
  { to: '/explore', label: 'Explore', icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="1.8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35"/></svg> },
  { to: '/chat',    label: 'Chat',    icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z"/></svg> },
  { to: '/create',  label: 'Create',  icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 5v14M5 12h14"/></svg> },
];

export default function Navbar() {
  const { user, logout }  = useAuthStore();
  const { unreadCount }   = useSocket() || {};
  const navigate          = useNavigate();
  const location          = useLocation();
  const [mobOpen, setMobOpen]     = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Detect scroll to add more blur on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: scrolled
          ? 'rgba(11,11,15,0.92)'
          : 'rgba(11,11,15,0.75)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        gap: 0,
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, marginRight: 24 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(34,211,238,0.15) 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(139,92,246,0.2)',
          }}>
            <span style={{ color: '#A78BFA', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em' }}>N</span>
          </div>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 16, color: '#E5E7EB', letterSpacing: '-0.02em' }}>
            Nexus
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div className="nav-center" style={{ display: 'flex', gap: 2, flex: 1 }}>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 8, textDecoration: 'none', fontSize: 13.5, fontWeight: 500,
                color: isActive ? '#A78BFA' : '#9CA3AF',
                background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              })}>
                {icon}
                {label}
                {label === 'Chat' && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#8B5CF6',
                    boxShadow: '0 0 8px rgba(139,92,246,0.8)',
                  }}/>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {!user && <div style={{ flex: 1 }} />}

        {/* Right side */}
        <div className="nav-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '5px 10px 5px 6px', cursor: 'pointer',
                  transition: 'all 0.2s', color: '#E5E7EB',
                }}>
                <Avatar user={user} size={26} />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: '#E5E7EB', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                      padding: 6, minWidth: 180, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                      zIndex: 200,
                    }}>
                    {[
                      { label: 'Profile', to: `/profile/${user.username}`, icon: '👤' },
                      { label: 'Settings', to: '/settings', icon: '⚙️' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                        borderRadius: 8, textDecoration: 'none', color: '#9CA3AF', fontSize: 13.5,
                        transition: 'all 0.15s', fontWeight: 500,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#E5E7EB'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}>
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 6px' }} />
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                      borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#EF4444', fontSize: 13.5, width: '100%', fontWeight: 500, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <span>🚪</span>Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="nav-mob-toggle" onClick={() => setMobOpen(o => !o)} style={{
            display: 'none', width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, cursor: 'pointer', color: '#9CA3AF', transition: 'all 0.2s',
          }}>
            {mobOpen
              ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mob-menu open"
            style={{ paddingTop: 72 }}>
            {user && NAV_LINKS.map(({ to, label, icon }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, textDecoration: 'none', color: '#9CA3AF', fontSize: 16, fontWeight: 500,
                transition: 'all 0.15s',
              }}>
                {icon}{label}
              </Link>
            ))}
            {!user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-lg">Get started free</Link>
              </div>
            )}
            {user && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }}/>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#EF4444', fontSize: 16, fontWeight: 500, width: '100%',
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"/>
                  </svg>
                  Sign out
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: 56 }} />
    </>
  );
}
