
import { MessageCircle, X, Send, Minus, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chat_session_id'));
    const [isLoading, setIsLoading] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<any>(null);

    // Initial Load & Realtime Subscription
    useEffect(() => {
        if (isOpen && sessionId) {
            fetchMessages();
            subscribeToChat();
        }

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [isOpen, sessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const createSession = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({ user_name: 'Visitante Web' })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setSessionId(data.id);
                localStorage.setItem('chat_session_id', data.id);
                return data.id;
            }
        } catch (err) {
            console.error('Error creating chat session:', err);
            return null;
        }
    };

    const fetchMessages = async () => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) {
                const formatted = data.map(m => ({
                    id: m.id,
                    text: m.content,
                    isUser: m.sender_type === 'user',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                // Add welcome message if empty
                if (formatted.length === 0) {
                    setMessages([{ text: 'Olá! Bem-vindo à Arena Eventos. Como posso ajudar?', isUser: false, time: 'Agora' }]);
                } else {
                    setMessages(formatted);
                }
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToChat = () => {
        if (!sessionId) return;

        if (channelRef.current) supabase.removeChannel(channelRef.current);

        const channel = supabase
            .channel(`chat:${sessionId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
                (payload) => {
                    // Only add if it's NOT from us (Admin messages), OR if we need to sync ID (but optimistic UI handles ours)
                    // Actually, for simplicity, we can let optimistic UI handle ours, and this only handles 'admin' sender_type
                    // OR we check if ID already exists in our state (which optimistic doesn't have real ID yet)

                    if (payload.new.sender_type === 'admin') {
                        const newMsg = {
                            id: payload.new.id,
                            text: payload.new.content,
                            isUser: false,
                            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages(prev => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;
    };

    const toggleChat = () => {
        if (!isOpen) {
            setIsOpen(true);
            setIsMinimized(false);
            setTimeout(() => {
                if (chatRef.current) {
                    gsap.fromTo(chatRef.current,
                        { scale: 0.8, opacity: 0, y: 20 },
                        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.2)' }
                    );
                }
            }, 10);
        } else {
            setIsOpen(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // 1. Optimistic UI Update (Local First)
        const tempId = Date.now().toString();
        const optimisticMsg = {
            id: tempId,
            text: inputText,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, optimisticMsg]);
        const textToSend = inputText;
        setInputText(''); // Clear input immediately

        try {
            // 2. Ensure Session Exists
            let currentSessionId = sessionId;
            if (!currentSessionId) {
                currentSessionId = await createSession();
                // If created, we need to subscribe now
                if (currentSessionId) setTimeout(() => subscribeToChat(), 500);
            }

            if (!currentSessionId) throw new Error("Could not create session");

            // 3. Send to Supabase
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: currentSessionId,
                    sender_type: 'user',
                    content: textToSend,
                    is_read: false
                });

            if (error) throw error;

            // 4. Update Session Last Message (Optional, for sorting in Admin)
            await supabase.from('chat_sessions').update({ last_message_at: new Date() }).eq('id', currentSessionId);

        } catch (err) {
            console.error('Error sending message:', err);
            // Rollback or show error state logic here
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: m.text + ' (Falha ao enviar)', isError: true } : m));
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-[#4A90D9] hover:bg-[#6BB8E8]'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className={`fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px] max-h-[80vh]'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-[#4A90D9] p-4 flex items-center justify-between text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="font-bold text-sm">A</span>
                                </div>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${sessionId ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm font-['Montserrat']">Suporte CCALAS Angola</h3>
                                <p className="text-xs text-white/80 font-['Open_Sans']">
                                    {isLoading ? 'Conectando...' : 'Online agora'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="p-1 hover:bg-white/20 rounded-full"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 bg-[#f0f7ff] p-4 overflow-y-auto space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] p-3 rounded-xl text-sm font-['Open_Sans'] ${msg.isUser
                                                ? 'bg-[#4A90D9] text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                                                } ${msg.isError ? 'opacity-70 border-red-500 border' : ''}`}
                                        >
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Escreva sua mensagem..."
                                    className="flex-1 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 outline-none focus:border-[#4A90D9] text-sm font-['Open_Sans']"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-[#4A90D9] text-white rounded-full hover:bg-[#6BB8E8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
