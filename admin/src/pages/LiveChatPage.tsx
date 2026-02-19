import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock, Circle, Loader2, User, RefreshCw, Archive, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Types based on the schema we defined
type ChatSession = {
    id: string;
    user_name: string;
    user_email: string | null;
    status: 'active' | 'closed';
    last_message_at: string;
    created_at: string;
};

type ChatMessage = {
    id: string;
    session_id: string;
    sender_type: 'user' | 'admin';
    content: string;
    is_read: boolean;
    created_at: string;
};

export default function LiveChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load & Realtime for Sessions
    useEffect(() => {
        loadSessions();

        const sessionSubscription = supabase
            .channel('admin_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, (payload) => {
                // Determine action based on event type to be more efficient, 
                // but for simplicity/robustness we just reload list for now or splice
                loadSessions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sessionSubscription);
        };
    }, []);

    // Load Sessions
    const loadSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('status', 'active')
                .order('last_message_at', { ascending: false });

            if (error) {
                // If table doesn't exist, Supabase returns error 404 or 42P01
                if (error.code === '42P01') {
                    throw new Error('Tabela de chat não encontrada. Por favor, execute o script SQL.');
                }
                throw error;
            }
            setSessions(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error loading sessions:', err);
            setError(err.message || 'Erro ao carregar chats.');
        }
        setLoading(false);
    };

    // Load Messages & Realtime for Selected Session
    useEffect(() => {
        if (!selectedSessionId) {
            setMessages([]);
            return;
        }

        loadMessages(selectedSessionId);
        markAsRead(selectedSessionId);

        const messageSubscription = supabase
            .channel(`session_${selectedSessionId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${selectedSessionId}` }, (payload) => {
                const newMsg = payload.new as ChatMessage;
                setMessages(prev => [...prev, newMsg]);
                // If user sent it, mark as read immediately (in UI at least)
                if (newMsg.sender_type === 'user') {
                    markAsRead(selectedSessionId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageSubscription);
        };
    }, [selectedSessionId]);

    const loadMessages = async (id: string) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', id)
            .order('created_at', { ascending: true });

        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('session_id', id)
            .eq('sender_type', 'user');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSessionId) return;
        setSending(true);
        try {
            // 1. Insert message
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: selectedSessionId,
                    sender_type: 'admin',
                    content: newMessage,
                    is_read: true
                });

            if (error) throw error;

            // 2. Update session timestamp
            await supabase
                .from('chat_sessions')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', selectedSessionId);

            setNewMessage('');
        } catch (err) {
            console.error(err);
            alert('Erro ao enviar mensagem.');
        }
        setSending(false);
    };

    const handleCloseSession = async () => {
        if (!selectedSessionId) return;
        if (!confirm('Deseja encerrar este atendimento? O chat sairá desta lista.')) return;

        try {
            await supabase
                .from('chat_sessions')
                .update({ status: 'closed' })
                .eq('id', selectedSessionId);

            setSelectedSessionId(null);
            loadSessions(); // refresh list
        } catch (err) {
            console.error(err);
        }
    };

    // Render Missing Table Error
    if (error && error.includes('Tabela de chat não encontrada')) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-8 bg-amber-50 rounded-xl border border-amber-200">
            <h2 className="text-xl font-bold text-amber-800 mb-2">Configuração Necessária</h2>
            <p className="text-amber-700 mb-4 max-w-lg">
                As tabelas de chat não foram encontradas no Supabase. É necessário executar o script de migração.
            </p>
            <div className="bg-white p-4 rounded-lg border border-amber-200 text-left w-full max-w-2xl overflow-auto text-sm font-mono">
                Por favor, execute o arquivo: <strong>app/admin/supabase/chat_schema.sql</strong>
            </div>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold flex items-center gap-2">
                <RefreshCw size={20} /> Tentar Novamente
            </button>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    const activeSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] overflow-hidden">
            {/* SESSIONS LIST SIDEBAR */}
            <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <MessageCircle size={20} /> Chats Ativos
                    </h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{sessions.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Clock size={40} className="mx-auto mb-2 opacity-50" />
                            <p>Nenhum chat ativo no momento.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => setSelectedSessionId(session.id)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedSessionId === session.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                        {session.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-800 truncate">{session.user_name}</h3>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {new Date(session.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{session.user_email || 'Visitante'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT WINDOW */}
            <div className={`flex-1 flex flex-col ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                {!selectedSessionId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <MessageCircle size={64} className="mb-4 opacity-20" />
                        <p>Selecione um chat para iniciar o atendimento.</p>
                    </div>
                ) : (
                    <>
                        {/* HEADER */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedSessionId(null)} className="md:hidden text-gray-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        {activeSession?.user_name}
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </h3>
                                    <p className="text-xs text-gray-500">{activeSession?.user_email}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseSession} className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm flex items-center gap-2">
                                <Archive size={18} /> Encerrar
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 bg-[url('/chat-bg-pattern.png')]">
                            {messages.map(msg => {
                                const isAdmin = msg.sender_type === 'admin';
                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isAdmin
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] ${isAdmin ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isAdmin && <CheckCheck size={12} className={msg.is_read ? 'text-blue-200' : 'opacity-50'} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua resposta..."
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:scale-105"
                                >
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
