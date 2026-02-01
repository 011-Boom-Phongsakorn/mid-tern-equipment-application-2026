import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatAPI, uploadAPI } from '../../services/api';
import { MessageCircle, Send, ArrowLeft, Image, Loader } from 'lucide-react';

const AdminChat = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // Connect to socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Admin connected to chat');
        });

        newSocket.on('receive_message', (message) => {
            if (message.room === selectedRoom) {
                setMessages((prev) => [...prev, message]);
            }
            // Update room list
            setRooms((prev) =>
                prev.map((r) =>
                    r._id === message.room
                        ? { ...r, lastMessage: message.message || '📷 รูปภาพ', lastMessageTime: message.createdAt }
                        : r
                )
            );
        });

        newSocket.on('new_message_notification', () => {
            // Refresh rooms list to update unread count
            fetchRooms();
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
    }, [selectedRoom]);

    // Fetch rooms on mount
    useEffect(() => {
        fetchRooms();
    }, []);

    // Load messages when room selected
    useEffect(() => {
        if (selectedRoom && socket) {
            socket.emit('join_room', selectedRoom);
            loadMessages();
        }
    }, [selectedRoom, socket]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchRooms = async () => {
        try {
            const { data } = await chatAPI.getRooms();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const { data } = await chatAPI.getMessages(selectedRoom);
            setMessages(data);
            await chatAPI.markAsRead(selectedRoom);
            fetchRooms(); // Refresh to update unread count
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !selectedRoom) return;

        socket.emit('send_message', {
            room: selectedRoom,
            message: newMessage.trim()
        });

        setNewMessage('');
        socket.emit('stop_typing', { room: selectedRoom });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !socket || !selectedRoom) return;

        setUploading(true);
        try {
            const { data } = await uploadAPI.uploadImage(file);
            socket.emit('send_message', {
                room: selectedRoom,
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

        if (!socket || !selectedRoom) return;

        socket.emit('typing', { room: selectedRoom });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { room: selectedRoom });
        }, 1000);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner w-10 h-10"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-light">แชทกับลูกค้า</h2>
                <p className="text-light-muted">ตอบกลับข้อความจากผู้ใช้</p>
            </div>

            <div className="glass-card overflow-hidden flex h-[calc(100vh-16rem)]">
                {/* Room List */}
                <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'
                    }`}>
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-light flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            ห้องแชท ({rooms.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 ? (
                            <div className="p-8 text-center text-light-muted">
                                ยังไม่มีข้อความ
                            </div>
                        ) : (
                            rooms.map((room) => (
                                <button
                                    key={room._id}
                                    onClick={() => setSelectedRoom(room._id)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${selectedRoom === room._id ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-white">
                                            {room.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-light text-sm truncate">
                                                {room.user?.name || 'Unknown'}
                                            </p>
                                            {room.unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-error rounded-full text-white text-xs flex items-center justify-center font-bold">
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-light-muted text-xs truncate">{room.lastMessage}</p>
                                        <p className="text-light-muted/60 text-[10px] mt-1">
                                            {formatDate(room.lastMessageTime)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${selectedRoom ? 'flex' : 'hidden md:flex'
                    }`}>
                    {selectedRoom ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedRoom(null)}
                                    className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {rooms.find(r => r._id === selectedRoom)?.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-light text-sm">
                                        {rooms.find(r => r._id === selectedRoom)?.user?.name || 'Unknown'}
                                    </p>
                                    <p className="text-light-muted text-xs">
                                        {rooms.find(r => r._id === selectedRoom)?.user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderRole === 'admin';
                                    return (
                                        <div
                                            key={msg._id || idx}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                                                {!isMe && (
                                                    <p className="text-xs text-primary-light font-medium mb-1 ml-1">
                                                        {msg.senderName}
                                                    </p>
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
                                                        {formatTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
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
                                        className="input flex-1"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="btn btn-primary disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-light-muted">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>เลือกห้องแชทเพื่อเริ่มสนทนา</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
