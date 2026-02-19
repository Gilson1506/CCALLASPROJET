import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Clock, CheckCircle, XCircle, Archive, Search, Reply, Trash2, Eye, Loader2 } from 'lucide-react';
import { getMessages, updateMessage, deleteMessage as deleteMsgApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function MessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState<string>('all');
    const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadMessages(); }, []);

    const loadMessages = async () => {
        setLoading(true);
        try { const data = await getMessages(); setMessages(data || []); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const filtered = messages
        .filter(m => filterSource === 'all' || m.source === filterSource)
        .filter(m => (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) || (m.message || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const sourceIcon = (source: string) => {
        switch (source) {
            case 'sms': return <MessageCircle size={14} className="text-green-500" />;
            case 'chat': return <MessageCircle size={14} className="text-purple-500" />;
            default: return <Mail size={14} className="text-blue-500" />;
        }
    };

    const sourceLabel = (source: string) => {
        switch (source) { case 'sms': return 'SMS'; case 'chat': return 'Chat'; default: return 'Site'; }
    };

    const statusStyle = (status: string) => {
        switch (status) {
            case 'unread': return 'bg-blue-100 text-blue-700';
            case 'read': return 'bg-gray-100 text-gray-600';
            case 'replied': return 'bg-green-100 text-green-700';
            case 'archived': return 'bg-yellow-100 text-yellow-700';
            default: return '';
        }
    };

    const statusLabel = (status: string) => {
        switch (status) { case 'unread': return 'Não lida'; case 'read': return 'Lida'; case 'replied': return 'Respondida'; case 'archived': return 'Arquivada'; default: return status; }
    };

    const markAs = async (id: string, status: string) => {
        try {
            await updateMessage(id, { status });
            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
            if (selectedMsg?.id === id) setSelectedMsg({ ...selectedMsg, status });
        } catch (err) { console.error(err); }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMsgApi(deleteId);
            setMessages(messages.filter(m => m.id !== deleteId));
            if (selectedMsg?.id === deleteId) setSelectedMsg(null);
            setDeleteId(null);
        } catch (err) { console.error(err); }
    };

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Mail size={24} className="text-blue-600" />Mensagens</h1>
                    <p className="text-gray-500 text-sm">{unreadCount > 0 ? `${unreadCount} mensagen(s) não lida(s)` : 'Todas as mensagens lidas'}</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {[['all', 'Todas'], ['site', 'Site'], ['sms', 'SMS'], ['chat', 'Chat']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilterSource(val)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterSource === val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar mensagens..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-500">Carregando mensagens...</span>
                </div>
            ) : (
                <div className="flex gap-6">
                    {/* Message List */}
                    <div className={`${selectedMsg ? 'w-1/2' : 'w-full'} space-y-2 transition-all`}>
                        {filtered.map(msg => (
                            <div key={msg.id} onClick={() => { setSelectedMsg(msg); if (msg.status === 'unread') markAs(msg.id, 'read'); }}
                                className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${selectedMsg?.id === msg.id ? 'border-blue-300 shadow-md' : 'border-gray-100'} ${msg.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">{(msg.name || '?').charAt(0)}</div>
                                        <div>
                                            <span className={`text-sm ${msg.status === 'unread' ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{msg.name}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {sourceIcon(msg.source)}<span className="text-xs text-gray-400">{sourceLabel(msg.source)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-xs text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleString('pt-AO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        <div className="mt-1"><span className={`text-xs px-1.5 py-0.5 rounded ${statusStyle(msg.status)}`}>{statusLabel(msg.status)}</span></div>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-700 mt-2">{msg.subject}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{msg.message}</p>
                            </div>
                        ))}
                        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Nenhuma mensagem encontrada.</div>}
                    </div>

                    {/* Detail */}
                    {selectedMsg && (
                        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-0 self-start">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">{selectedMsg.subject}</h3>
                                <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="space-y-2 mb-4 text-sm">
                                <p className="text-gray-600"><strong>De:</strong> {selectedMsg.name}</p>
                                {selectedMsg.email && <p className="text-gray-600"><strong>Email:</strong> {selectedMsg.email}</p>}
                                {selectedMsg.phone && <p className="text-gray-600"><strong>Tel:</strong> {selectedMsg.phone}</p>}
                                <p className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12} />{selectedMsg.created_at ? new Date(selectedMsg.created_at).toLocaleString('pt-AO') : ''}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMsg.message}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => markAs(selectedMsg.id, 'replied')} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200"><Reply size={14} />Respondida</button>
                                <button onClick={() => markAs(selectedMsg.id, 'archived')} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs rounded-lg hover:bg-yellow-200"><Archive size={14} />Arquivar</button>
                                <button onClick={() => handleDelete(selectedMsg.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"><Trash2 size={14} />Excluir</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Mensagem"
                message="Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita."
                confirmText="Sim, Excluir"
            />
        </div>
    );
}
