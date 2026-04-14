import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import { useSocket } from '../../context/SocketContext';

const NAV_ITEMS = [
  {
    to: '/feed',
    label: 'Feed',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    to: '/explore',
    label: 'Explore',
    icon: (active) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="1.8"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    to: '/create',
    label: 'Post',
    isCreate: true,
    icon: (active) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    to: '/chat',
    label: 'Chat',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z"/>
      </svg>
    ),
  },
  {
    to: null, // profile — dynamic
    label: 'Profile',
    isProfile: true,
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4" strokeWidth="1.8"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { user } = useAuthStore();
  const { unreadCount } = useSocket() || {};
  const location = useLocation();

  // Don't show on landing, login, register
  const hiddenRoutes = ['/', '/login', '/register'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 90,
        height: 64,
        background: 'rgba(11,11,15,0.92)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        // Only show on mobile
      }} className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const to = item.isProfile
            ? user ? `/profile/${user.username}` : '/login'
            : item.to;

          const isActive = item.isProfile
            ? location.pathname.startsWith('/profile')
            : location.pathname === item.to;

          if (item.isCreate) {
            return (
              <NavLink
                key="create"
                to="/create"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(139,92,246,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                    color: '#fff',
                    marginBottom: 2,
                  }}
                >
                  {item.icon(false)}
                </motion.div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={to}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative', minWidth: 48, padding: '6px 4px' }}
            >
              {({ isActive: navActive }) => {
                const active = item.isProfile
                  ? location.pathname.startsWith('/profile')
                  : navActive;

                return (
                  <>
                    {/* Chat badge */}
                    {item.label === 'Chat' && unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: 4, right: 6,
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#8B5CF6',
                        boxShadow: '0 0 8px rgba(139,92,246,0.9)',
                        border: '1.5px solid #0B0B0F',
                      }}/>
                    )}

                    {/* Icon with active indicator */}
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      style={{
                        color: active ? '#A78BFA' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {item.icon(active)}
                      {active && (
                        <motion.div
                          layoutId="bottomNavIndicator"
                          style={{
                            position: 'absolute',
                            bottom: -10,
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: '#8B5CF6',
                            boxShadow: '0 0 8px rgba(139,92,246,0.8)',
                          }}
                          transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                        />
                      )}
                    </motion.div>

                    <span style={{
                      fontSize: 10,
                      fontWeight: active ? 600 : 500,
                      color: active ? '#A78BFA' : '#6B7280',
                      letterSpacing: '0.02em',
                      transition: 'color 0.2s ease',
                    }}>
                      {item.label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom spacer so content doesn't hide behind nav */}
      <div className="bottom-nav-spacer" />
    </>
  );
}
