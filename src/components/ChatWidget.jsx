import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { chatAPI, uploadAPI } from '../services/api';
import { MessageCircle, Send, X, Minimize2, Maximize2, Image, Loader } from 'lucide-react';

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const room = user ? `user_${user._id}` : null;

    // Connect to socket
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const token = localStorage.getItem('token');
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat');
            if (room) {
                newSocket.emit('join_room', room);
            }
        });

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
            if (!isOpen && message.senderRole === 'admin') {
                setUnreadCount((prev) => prev + 1);
            }
        });

        newSocket.on('user_typing', () => {
            setIsTyping(true);
        });

        newSocket.on('user_stop_typing', () => {
            setIsTyping(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user, room]);

    // Load messages when chat opens
    useEffect(() => {
        if (isOpen && room) {
            loadMessages();
        }
    }, [isOpen, room]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const { data } = await chatAPI.getMessages(room);
            setMessages(data);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !room) return;

        socket.emit('send_message', {
            room,
            message: newMessage.trim()
        });

        setNewMessage('');
        socket.emit('stop_typing', { room });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !socket || !room) return;

        setUploading(true);
        try {
            const { data } = await uploadAPI.uploadImage(file);
            socket.emit('send_message', {
                room,
                message: '',
                image: data.url
            });
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket || !room) return;

        socket.emit('typing', { room });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { room });
        }, 1000);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    if (!isAuthenticated || user?.role === 'admin') return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className={`mb-4 glass-card overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[450px]'
                    } w-80 sm:w-96 flex flex-col`}>
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-linear-to-r from-primary to-primary-dark">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-white" />
                            <span className="font-semibold text-white">แชทกับแอดมิน</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            >
                                {isMinimized ? (
                                    <Maximize2 className="w-4 h-4 text-white" />
                                ) : (
                                    <Minimize2 className="w-4 h-4 text-white" />
                                )}
                            </button>
                            <button
                                onClick={toggleChat}
                                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center text-light-muted text-sm py-8">
                                        เริ่มแชทกับเราได้เลย! 👋
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderRole === 'user';
                                        return (
                                            <div
                                                key={msg._id || idx}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                                                    {!isMe && (
                                                        <p className="text-xs text-secondary font-medium mb-1 ml-1">Admin</p>
                                                    )}
                                                    <div
                                                        className={`px-3 py-2 rounded-2xl text-sm ${isMe
                                                            ? 'bg-primary text-white rounded-br-sm'
                                                            : 'bg-dark-lighter text-light rounded-bl-sm'
                                                            }`}
                                                    >
                                                        {msg.image && (
                                                            <img
                                                                src={msg.image}
                                                                alt="รูปภาพ"
                                                                className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-90"
                                                                onClick={() => window.open(msg.image, '_blank')}
                                                            />
                                                        )}
                                                        {msg.message && <p>{msg.message}</p>}
                                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-light-muted/60'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-dark-lighter px-3 py-2 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-light-muted rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-light-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                                <span className="w-2 h-2 bg-light-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
                                <div className="flex gap-2 items-center">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-light-muted hover:text-primary disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Image className="w-5 h-5" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleTyping}
                                        placeholder="พิมพ์ข้อความ..."
                                        className="input flex-1 py-2 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="btn btn-primary p-2 disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className="w-14 h-14 rounded-full bg-linear-to-br from-primary to-accent shadow-lg hover:scale-105 transition-transform flex items-center justify-center relative"
            >
                <MessageCircle className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
