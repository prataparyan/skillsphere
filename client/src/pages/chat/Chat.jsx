import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

let socket;

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [receiverName, setReceiverName] = useState('User');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('join', user._id || user.id);

    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${userId}`);
        setMessages(data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('sendMessage', {
      senderId: user._id || user.id,
      receiverId: userId,
      content: input,
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">SkillSphere</Link>
        <Link to="/dashboard" className="text-gray-600 text-sm hover:text-gray-900">Dashboard</Link>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Chat</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '60vh' }}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</div>
            ) : (
              messages.map((msg, i) => {
                const isMe = (msg.sender?._id || msg.sender) === (user._id || user.id);
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;