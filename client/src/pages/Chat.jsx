import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../context/authStore';
import api from '../api/axios';
import { useIsMobile } from '../hooks/useMediaQuery';

/* ── helpers ── */
const timeAgo = d => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

/* ── Avatar ── */
function Avatar({ user, size = 36, online }) {
  const letter = (user?.username || '?')[0].toUpperCase();
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
        fontSize: size * 0.38, color: '#A78BFA', overflow: 'hidden',
      }}>
        {user?.avatar
          ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
          : letter}
      </div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%', background: '#10B981',
          border: `2px solid #0B0B0F`,
        }}/>
      )}
    </div>
  );
}

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', borderRadius: '14px 14px 14px 3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
      {[0,1,2].map(i => (
        <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }}
          animate={{ y: [0,-5,0], opacity: [0.4,1,0.4] }}
          transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15 }}/>
      ))}
    </div>
  );
}

/* ── New Conversation Modal ── */
function NewConvoModal({ onClose, onStart }) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try { const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`); setResults(data.users || []); }
    catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 280);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, fontWeight: 400, color: '#E5E7EB' }}>New Message</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search people…" className="input-nexus"
            style={{ paddingLeft: 12, background: 'rgba(255,255,255,0.03)', fontSize: 14 }}/>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner-mini" style={{ margin: '0 auto' }}/></div>
          ) : results.length === 0 && query ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>No users found</div>
          ) : results.map(u => (
            <button key={u._id} onClick={() => onStart(u)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={u} size={38}/>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>@{u.username}</p>
                {u.bio && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{u.bio.slice(0,48)}</p>}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Chat() {
  const { user }   = useAuthStore();
  const { dmMessages, typingUsers, onlineUsers, conversations, openDM, sendDM, emitTyping, emitStopTyping } = useSocket();
  const isMobile = useIsMobile(768);
  const [searchParams] = useSearchParams();

  const [activeConvo,  setActiveConvo]  = useState(null);
  const [input,        setInput]        = useState('');
  const [newConvo,     setNewConvo]     = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(!isMobile);
  const [isTyping,     setIsTyping]     = useState(false);
  const [search,       setSearch]       = useState('');
  const bottomRef = useRef();
  const timerRef  = useRef();

  useEffect(() => {
    const uid = searchParams.get('user');
    if (uid && user) {
      api.get(`/users/id/${uid}`).then(({ data }) => startConvo(data.user)).catch(() => {});
    }
  }, [searchParams, user]);

  const startConvo = useCallback((otherUser) => {
    const room = openDM(otherUser._id);
    setActiveConvo({ user: otherUser, room });
    setNewConvo(false);
    if (isMobile) setSidebarOpen(false);
  }, [openDM, isMobile]);

  const currentMessages = activeConvo ? (dmMessages[activeConvo.room] || []) : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages.length]);

  const handleSend = e => {
    e.preventDefault();
    if (!input.trim() || !activeConvo) return;
    sendDM(activeConvo.user._id, input.trim());
    setInput('');
    emitStopTyping(activeConvo.room);
  };

  const handleInput = e => {
    setInput(e.target.value);
    if (!isTyping && activeConvo) { setIsTyping(true); emitTyping(user.username, activeConvo.room); }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setIsTyping(false); if (activeConvo) emitStopTyping(activeConvo.room); }, 1500);
  };

  const typingKey = activeConvo ? Object.keys(typingUsers).filter(k => k.startsWith(activeConvo.room) && !k.includes(user?.id)) : [];
  const isOnline  = id => onlineUsers.includes(id);
  const filteredConvos = conversations.filter(c => !search || c.user?.username?.toLowerCase().includes(search.toLowerCase()));

  if (!user) return <div className="h-screen flex items-center justify-center">Please log in.</div>;

  return (
    <div style={{ background: '#0B0B0F', height: '100vh', display: 'flex', flexDirection: 'column', color: '#E5E7EB', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 64, position: 'relative' }}>

        {/* Sidebar */}
        <div style={{
          width: isMobile ? '100%' : 320, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', height: '100%', background: '#0B0B0F',
          position: isMobile ? 'absolute' : 'relative', zIndex: isMobile ? (sidebarOpen ? 50 : -1) : 'auto',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s ease',
        }}>
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 24, fontWeight: 400 }}>Messages</h2>
              <button onClick={() => setNewConvo(true)} className="btn-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats…" className="input-nexus" style={{ height: 38, fontSize: 13 }}/>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvos.map(convo => {
              const active = activeConvo?.room === convo.room;
              return (
                <button key={convo.room} onClick={() => startConvo(convo.user)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', border: 'none',
                    background: active ? 'rgba(139,92,246,0.08)' : 'transparent', textAlign: 'left', cursor: 'pointer',
                    borderLeft: `3px solid ${active ? '#A78BFA' : 'transparent'}`,
                  }}>
                  <Avatar user={convo.user} size={42} online={isOnline(convo.user?._id)}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>@{convo.user?.username}</span>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{timeAgo(convo.lastMsg?.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: convo.unread ? '#E5E7EB' : '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: convo.unread ? 600 : 400 }}>
                      {convo.lastMsg?.text}
                    </p>
                  </div>
                  {convo.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA' }}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0B0B0F' }}>
          {activeConvo ? (
            <>
              <div style={{ padding: '0 20px', height: 64, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#6B7280' }}><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
                <Avatar user={activeConvo.user} size={38} online={isOnline(activeConvo.user._id)}/>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>@{activeConvo.user.username}</h3>
                  <p style={{ fontSize: 11, color: isOnline(activeConvo.user._id) ? '#10B981' : '#6B7280' }}>{isOnline(activeConvo.user._id) ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentMessages.map((msg, i) => {
                  const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                  return (
                    <motion.div key={msg._id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: 14, background: isMe ? '#A78BFA' : 'rgba(255,255,255,0.05)',
                        color: isMe ? '#fff' : '#E5E7EB',
                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: 10, color: '#6B7280', marginTop: 4, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })}
                {typingKey.length > 0 && <TypingDots/>}
                <div ref={bottomRef}/>
              </div>
              <form onSubmit={handleSend} style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={input} onChange={handleInput} placeholder="Type a message…" className="input-nexus" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, paddingLeft: 20 }}/>
                  <button type="submit" disabled={!input.trim()} className="btn-icon" style={{ background: '#A78BFA', color: '#fff', borderRadius: '50%', width: 42, height: 42 }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
              <div>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="40" height="40" fill="none" stroke="#A78BFA" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/></svg>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>Your Messages</h3>
                <p style={{ color: '#6B7280', fontSize: 14 }}>Send private messages to friends on Nexus.</p>
                <button onClick={() => setNewConvo(true)} className="btn btn-primary" style={{ marginTop: 24 }}>New Message</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>{newConvo && <NewConvoModal onClose={() => setNewConvo(false)} onStart={startConvo}/>}</AnimatePresence>
      <style>{`.spinner-mini{width:20px;height:20px;border:2px solid rgba(255,255,255,0.1);border-top-color:#A78BFA;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.btn-icon{width:36px;height:36px;display:flex;alignItems:center;justifyContent:center;border:none;cursor:pointer;border-radius:10px;transition:all 0.2s}`}</style>
    </div>
  );
}
