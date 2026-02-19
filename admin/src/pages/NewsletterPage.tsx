import { useState, useEffect } from 'react';
import { Search, Download, Trash2, Mail, Calendar, Users, TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getSubscribers, updateSubscriber, deleteSubscriber as deleteSubApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSubscribers(); }, []);

    const loadSubscribers = async () => {
        setLoading(true);
        try { const data = await getSubscribers(); setSubscribers(data || []); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const filtered = subscribers
        .filter(s => filterStatus === 'all' || s.status === filterStatus)
        .filter(s => (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const activeCount = subscribers.filter(s => s.status === 'active').length;
    const thisWeek = subscribers.filter(s => {
        const d = new Date(s.subscribed_at);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && s.status === 'active';
    }).length;

    const handleExport = () => {
        const csv = [
            'Nome,Email,Data de Inscrição,Status,Origem',
            ...subscribers.map(s => `${s.name},${s.email},${s.subscribed_at},${s.status},${s.source}`)
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'newsletter_subscribers.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSubApi(deleteId);
            setSubscribers(subscribers.filter(s => s.id !== deleteId));
            setDeleteId(null);
        } catch (err) { console.error(err); }
    };

    const toggleStatus = async (id: string) => {
        const sub = subscribers.find(s => s.id === id);
        if (!sub) return;
        const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
        try {
            await updateSubscriber(id, { status: newStatus });
            setSubscribers(subscribers.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } catch (err) { console.error(err); }
    };

    const sourceLabel: Record<string, string> = { site: 'Site', evento: 'Evento', manual: 'Manual' };
    const sourceColor: Record<string, string> = { site: 'bg-blue-50 text-blue-700', evento: 'bg-purple-50 text-purple-700', manual: 'bg-gray-100 text-gray-600' };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Mail size={24} className="text-blue-600" />Newsletter</h1>
                    <p className="text-gray-500 text-sm">Gerencie subscrições da newsletter.</p>
                </div>
                <button onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm">
                    <Download size={20} /><span>Exportar CSV</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-50"><Users className="w-5 h-5 text-blue-600" /></div>
                        <div><p className="text-xs text-gray-500">Total Inscritos</p><p className="text-xl font-bold text-gray-800">{subscribers.length}</p></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-green-50"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                        <div><p className="text-xs text-gray-500">Ativos</p><p className="text-xl font-bold text-gray-800">{activeCount}</p></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-purple-50"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                        <div><p className="text-xs text-gray-500">Esta Semana</p><p className="text-xl font-bold text-gray-800">+{thisWeek}</p></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {[['all', 'Todos'], ['active', 'Ativos'], ['unsubscribed', 'Cancelados']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilterStatus(val)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-500">Carregando inscritos...</span>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inscrito</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Origem</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{(sub.name || '?').charAt(0)}</div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-800">{sub.name}</p>
                                                    <p className="text-xs text-gray-400">{sub.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('pt-AO') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${sourceColor[sub.source] || 'bg-gray-100 text-gray-600'}`}>{sourceLabel[sub.source] || sub.source}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleStatus(sub.id)} className="flex items-center gap-1.5">
                                                {sub.status === 'active'
                                                    ? <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-700 font-medium">Ativo</span></>
                                                    : <><XCircle size={14} className="text-red-400" /><span className="text-xs text-red-500 font-medium">Cancelado</span></>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(sub.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum inscrito encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Remover Inscrito"
                message="Tem certeza que deseja remover este inscrito? Esta ação não pode ser desfeita."
                confirmText="Sim, Remover"
            />
        </div>
    );
}
