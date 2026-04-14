import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../context/authStore';
import api from '../api/axios';
import { useIsMobile } from '../hooks/useMediaQuery';

/* ── helpers ── */
const timeAgo = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};
const dmRoom = (a, b) => `dm_${[a, b].sort().join('_')}`;

/* ── Avatar ── */
function Avatar({ user, size = 36, online }) {
  const letter = (user?.username || '?')[0].toUpperCase();
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)',
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
          borderRadius: '50%', background: 'var(--green)',
          border: `2px solid var(--surface)`,
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
        <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)' }}
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
  }, [query]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, fontWeight: 400, color: '#E5E7EB' }}>New Message</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35"/></svg>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search people…" className="input-nexus"
            style={{ paddingLeft: 38, background: 'rgba(255,255,255,0.03)', fontSize: 14 }}/>
        </div>
        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
            </div>
          ) : results.length === 0 && query ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>No users found</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Start typing to find people</div>
          ) : results.map(u => (
            <button key={u._id} onClick={() => onStart(u)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={u} size={38}/>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>@{u.username}</p>
                {u.bio && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{u.bio.slice(0,48)}{u.bio.length > 48 ? '…' : ''}</p>}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function Chat() {
  const { user }   = useAuthStore();
  const { dmMessages, typingUsers, onlineUsers, openDM, sendDM, emitTyping, emitStopTyping } = useSocket();
  const isMobile = useIsMobile(768);
  const [searchParams] = useSearchParams();

  const [activeConvo,  setActiveConvo]  = useState(null); // { user, room }
  const [conversations,setConversations]= useState([]);
  const [input,        setInput]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [newConvo,     setNewConvo]     = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(!isMobile); // auto-hide on mobile
  const [isTyping,     setIsTyping]     = useState(false);
  const [search,       setSearch]       = useState('');
  const bottomRef = useRef();
  const timerRef  = useRef();

  // Load conversations from API on mount
  useEffect(() => {
    if (!user) return;
    api.get('/users/conversations').then(({ data }) => setConversations(data.conversations || [])).catch(() => {});
  }, [user]);

  // Auto-open DM if ?user= param provided
  useEffect(() => {
    const uid = searchParams.get('user');
    if (uid && user) {
      api.get(`/users/id/${uid}`).then(({ data }) => {
        startConvo(data.user);
      }).catch(() => {});
    }
  }, [searchParams, user]);

  const startConvo = useCallback((otherUser) => {
    const room = openDM(otherUser._id);
    setActiveConvo({ user: otherUser, room });
    setNewConvo(false);
    setSidebarOpen(false);
    // Add to conversations list if not present
    setConversations(prev => {
      if (prev.find(c => c.user?._id === otherUser._id)) return prev;
      return [{ user: otherUser, room, lastMsg: null, unread: false }, ...prev];
    });
  }, [openDM]);

  const currentMessages = activeConvo ? (dmMessages[activeConvo.room] || []) : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages.length]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || !activeConvo || sending) return;
    setSending(true);
    sendDM(activeConvo.user._id, input.trim());
    setInput('');
    emitStopTyping(activeConvo.room);
    setConversations(prev => prev.map(c =>
      c.room === activeConvo.room
        ? { ...c, lastMsg: { text: input.trim(), createdAt: new Date(), sender: { _id: user.id, username: user.username } } }
        : c
    ));
    setTimeout(() => setSending(false), 200);
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

  const fmt = d => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="page-bg"/>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 10, padding: 48, borderRadius: 20, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 400 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--purple-soft)', border: '1px solid var(--purple-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="26" height="26" fill="none" stroke="var(--purple)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 24, fontWeight: 400, color: '#E5E7EB', marginBottom: 10 }}>Sign in to message</h2>
        <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 14, lineHeight: 1.65 }}>Send private messages to anyone on Nexus.</p>
        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', padding: '11px 28px' }}>Sign In</Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ background: '#0B0B0F', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans", sans-serif', color: '#E5E7EB', overflow: 'hidden' }}>
      <div className="page-bg"/>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 56, position: 'relative', zIndex: 10 }}>

        {/* ══════════════════════════════
            LEFT: Conversation Sidebar
        ══════════════════════════════ */}
        <div style={{
          width: 300, flexShrink: 0, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', height: '100%',
          background: 'rgba(255,255,255,0.03)',
          // Mobile: absolute overlay
          position: isMobile ? 'absolute' : 'relative',
          zIndex: isMobile ? (sidebarOpen ? 50 : -1) : 'auto',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s ease',
          top: 0, bottom: 0, left: 0,
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, fontWeight: 400, color: '#E5E7EB' }}>Messages</h2>
              <button onClick={() => setNewConvo(true)}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-soft)', border: '1px solid var(--purple-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A78BFA', transition: 'all 0.2s' }}
                title="New message"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,123,80,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--purple-soft)'}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…"
                className="input-nexus" style={{ paddingLeft: 30, fontSize: 13, background: '#0B0B0F', height: 36 }}/>
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvos.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>No messages yet.</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Search for someone to start a conversation.</p>
                <button onClick={() => setNewConvo(true)} className="btn btn-primary" style={{ marginTop: 16, padding: '8px 18px', fontSize: 13 }}>
                  New message
                </button>
              </div>
            ) : filteredConvos.map(convo => {
              const isActive = activeConvo?.room === convo.room;
              const online   = isOnline(convo.user?._id);
              return (
                <button key={convo.room} onClick={() => startConvo(convo.user)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', border: 'none', cursor: 'pointer',
                    background: isActive ? 'var(--purple-soft)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--purple)' : 'transparent'}`,
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--elevated)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar user={convo.user} size={40} online={online}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: convo.unread ? 700 : 500, color: isActive ? 'var(--purple)' : 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{convo.user?.username}
                      </span>
                      {convo.lastMsg && (
                        <span style={{ fontSize: 11, color: '#6B7280', fontFamily: '"DM Mono", monospace', flexShrink: 0, marginLeft: 6 }}>
                          {timeAgo(convo.lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    {convo.lastMsg && (
                      <p style={{ fontSize: 12, color: convo.unread ? 'var(--text-2)' : 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: convo.unread ? 600 : 400 }}>
                        {convo.lastMsg.sender?._id === user.id ? 'You: ' : ''}{convo.lastMsg.text}
                      </p>
                    )}
                  </div>
                  {convo.unread && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT: Message Thread
        ══════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {activeConvo ? (
            <>
              {/* Thread header */}
              <div style={{ padding: '0 20px', height: 64, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(22,19,14,0.9)', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Mobile back */}
                  <button onClick={() => setSidebarOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 6, borderRadius: 8, marginRight: 4 }} className="chat-back-btn">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <Avatar user={activeConvo.user} size={38} online={isOnline(activeConvo.user._id)}/>
                  <div>
                    <Link to={`/profile/${activeConvo.user.username}`}
                      style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--purple)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-1)'}>
                      @{activeConvo.user.username}
                    </Link>
                    <p style={{ fontSize: 11, color: isOnline(activeConvo.user._id) ? 'var(--green)' : 'var(--text-3)', fontFamily: '"DM Mono", monospace', marginTop: 1 }}>
                      {isOnline(activeConvo.user._id) ? '● active now' : 'offline'}
                    </p>
                  </div>
                </div>
                <Link to={`/profile/${activeConvo.user.username}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#9CA3AF', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-2)'; }}>
                  View profile
                </Link>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentMessages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
                    <Avatar user={activeConvo.user} size={64}/>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB', marginTop: 16, marginBottom: 6 }}>@{activeConvo.user.username}</p>
                    {activeConvo.user.bio && <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 280, textAlign: 'center', lineHeight: 1.6 }}>{activeConvo.user.bio}</p>}
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 20 }}>Say hello 👋</p>
                  </div>
                ) : (
                  <>
                    {/* Group messages by date/sender */}
                    {currentMessages.map((msg, i) => {
                      const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                      const prev = currentMessages[i - 1];
                      const sameSender = prev && (prev.sender?._id || prev.sender) === (msg.sender?._id || msg.sender);
                      const closeInTime = prev && (new Date(msg.createdAt) - new Date(prev.createdAt)) < 60000;
                      const showAvatar = !isMe && (!sameSender || !closeInTime);
                      return (
                        <motion.div key={msg._id || i}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', marginTop: sameSender && closeInTime ? 2 : 12 }}>
                          {/* Avatar spacer */}
                          {!isMe && (
                            <div style={{ width: 28, flexShrink: 0 }}>
                              {showAvatar && <Avatar user={msg.sender} size={28}/>}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '65%', gap: 2 }}>
                            {showAvatar && !isMe && (
                              <span style={{ fontSize: 11, color: '#6B7280', paddingLeft: 4, fontFamily: '"DM Mono", monospace' }}>{msg.sender?.username}</span>
                            )}
                            <div style={{
                              padding: '9px 14px',
                              borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
                              ...(isMe
                                ? { background: 'var(--purple)', color: '#fff' }
                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#E5E7EB' }
                              )
                            }}>
                              {msg.text}
                            </div>
                            <span style={{ fontSize: 10, color: '#6B7280', fontFamily: '"DM Mono", monospace', paddingLeft: 4, paddingRight: 4 }}>
                              {fmt(msg.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                    {typingKey.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
                        <div style={{ width: 28, flexShrink: 0 }}><Avatar user={activeConvo.user} size={28}/></div>
                        <TypingDots/>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'rgba(22,19,14,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="text" value={input} onChange={handleInput}
                    placeholder={`Message @${activeConvo.user.username}…`}
                    className="input-nexus" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '10px 18px' }}
                    maxLength={1000}/>
                  <motion.button type="submit" disabled={!input.trim()} whileTap={{ scale: 0.92 }}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                      background: input.trim() ? 'var(--purple)' : 'var(--elevated)',
                      color: input.trim() ? '#fff' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}>
                    {sending
                      ? <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'block' }}/>
                      : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    }
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--purple-soft)', border: '1px solid var(--purple-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="36" height="36" fill="none" stroke="var(--purple)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                </div>
                <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 24, fontWeight: 400, color: '#E5E7EB', marginBottom: 10 }}>Your messages</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>
                  Send private messages to anyone on Nexus. Start a conversation from someone's profile or use the button below.
                </p>
                <button onClick={() => setNewConvo(true)} className="btn btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>
                  Send a message
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {newConvo && <NewConvoModal onClose={() => setNewConvo(false)} onStart={startConvo}/>}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 768px) {
          .chat-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
