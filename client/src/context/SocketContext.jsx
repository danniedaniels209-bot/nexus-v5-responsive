import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from './authStore';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuthStore();
  const socketRef = useRef(null);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [dmMessages,   setDmMessages]   = useState({}); // { roomId: [msgs] }
  const [typingUsers,  setTypingUsers]  = useState({});
  const [conversations,setConversations]= useState([]); // list of recent DM conversations
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io('/', { auth: { token }, transports: ['websocket'] });
    const s = socketRef.current;

    s.on('online_users', setOnlineUsers);

    // Private message received
    s.on('new_private_message', (msg) => {
      const room = msg.room;
      setDmMessages(prev => ({
        ...prev,
        [room]: [...(prev[room] || []), msg],
      }));
      // bump conversation list
      setConversations(prev => {
        const exists = prev.find(c => c.room === room);
        const updated = { room, lastMsg: msg, unread: true, with: msg.sender };
        if (exists) return prev.map(c => c.room === room ? { ...c, lastMsg: msg, unread: true } : c);
        return [updated, ...prev];
      });
      setUnreadCount(n => n + 1);
    });

    s.on('dm_history', ({ room, messages }) => {
      setDmMessages(prev => ({ ...prev, [room]: messages }));
    });

    s.on('conversations', (convos) => {
      setConversations(convos);
      setUnreadCount(convos.filter(c => c.unread).length);
    });

    s.on('user_typing', ({ userId, username, room }) =>
      setTypingUsers(prev => ({ ...prev, [`${room}_${userId}`]: username }))
    );
    s.on('user_stop_typing', ({ userId, room }) =>
      setTypingUsers(prev => { const n = { ...prev }; delete n[`${room}_${userId}`]; return n; })
    );

    return () => s.disconnect();
  }, [token]);

  const openDM = useCallback((otherUserId) => {
    const myId = user?.id;
    const room = `dm_${[myId, otherUserId].sort().join('_')}`;
    socketRef.current?.emit('join_room', room);
    socketRef.current?.emit('get_dm_history', { room });
    // clear unread
    setConversations(prev => prev.map(c => c.room === room ? { ...c, unread: false } : c));
    setUnreadCount(prev => Math.max(0, prev - 1));
    return room;
  }, [user]);

  const sendDM = useCallback((receiverId, text) => {
    socketRef.current?.emit('private_message', { receiverId, text });
  }, []);

  const emitTyping    = useCallback((username, room) => { socketRef.current?.emit('typing',      { username, room }); }, []);
  const emitStopTyping= useCallback((room)           => { socketRef.current?.emit('stop_typing', { room }); }, []);

  return (
    <SocketContext.Provider value={{
      onlineUsers, dmMessages, typingUsers, conversations, unreadCount,
      openDM, sendDM, emitTyping, emitStopTyping,
      socket: socketRef.current,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
