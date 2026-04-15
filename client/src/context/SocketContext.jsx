import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from './authStore';
import api from '../api/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuthStore();
  const socketRef = useRef(null);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [dmMessages,   setDmMessages]   = useState({}); // { roomId: [msgs] }
  const [typingUsers,  setTypingUsers]  = useState({});
  const [conversations, setConversations] = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);

  // Connect socket
  useEffect(() => {
    if (!token) return;

    // Connect to the base URL of the API (removing /api suffix)
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'https://nexus-v5-responsiv.onrender.com';

    // Use both polling and websocket for maximum compatibility on Render
    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const s = socketRef.current;

    s.on('connect', () => console.log('✅ Connected to chat server'));
    s.on('connect_error', (err) => console.error('❌ Connection error:', err.message));

    s.on('online_users', setOnlineUsers);

    s.on('new_private_message', (msg) => {
      const room = msg.room;
      setDmMessages(prev => ({
        ...prev,
        [room]: [...(prev[room] || []), msg],
      }));

      // Update the conversation list immediately
      setConversations(prev => {
        const otherUser = msg.sender._id === user?.id ? msg.receiver : msg.sender;
        const exists = prev.find(c => c.room === room);

        if (exists) {
          return prev.map(c => c.room === room ? { ...c, lastMsg: msg, unread: msg.sender._id !== user?.id } : c);
        } else {
          return [{ user: otherUser, room, lastMsg: msg, unread: msg.sender._id !== user?.id }, ...prev];
        }
      });

      if (msg.sender?._id !== user?.id) {
        setUnreadCount(n => n + 1);
      }
    });

    s.on('dm_history', ({ room, messages }) => {
      setDmMessages(prev => ({ ...prev, [room]: messages }));
    });

    s.on('user_typing', ({ userId, username, room }) =>
      setTypingUsers(prev => ({ ...prev, [`${room}_${userId}`]: username }))
    );

    s.on('user_stop_typing', ({ userId, room }) =>
      setTypingUsers(prev => { const n = { ...prev }; delete n[`${room}_${userId}`]; return n; })
    );

    return () => s.disconnect();
  }, [token, user?.id]);

  // Load initial conversations from API
  const refreshConversations = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/users/conversations');
      setConversations(data.conversations || []);
      setUnreadCount(data.conversations?.filter(c => c.unread).length || 0);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, [token]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const openDM = useCallback((otherUserId) => {
    const myId = user?.id || user?._id;
    const room = `dm_${[myId, otherUserId].sort().join('_')}`;
    socketRef.current?.emit('join_room', room);
    socketRef.current?.emit('get_dm_history', { room });

    // Mark as read locally
    setConversations(prev => prev.map(c => c.room === room ? { ...c, unread: false } : c));
    return room;
  }, [user]);

  const sendDM = useCallback((receiverId, text) => {
    socketRef.current?.emit('private_message', { receiverId, text });
  }, []);

  const emitTyping     = useCallback((username, room) => { socketRef.current?.emit('typing',      { username, room }); }, []);
  const emitStopTyping = useCallback((room)           => { socketRef.current?.emit('stop_typing', { room }); }, []);

  return (
    <SocketContext.Provider value={{
      onlineUsers, dmMessages, typingUsers, conversations, unreadCount,
      openDM, sendDM, emitTyping, emitStopTyping, refreshConversations,
      socket: socketRef.current,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
