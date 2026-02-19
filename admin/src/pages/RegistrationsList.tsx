import { useState, useEffect } from 'react';
import { Search, Download, Filter, CheckCircle, Clock, XCircle, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { getRegistrations, updateRegistration } from '../services/api';

export default function RegistrationsList() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const data = await getRegistrations();
            setRegistrations(data || []);
        } catch (err) {
            console.error('Error loading registrations:', err);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdating(id);
        try {
            await updateRegistration(id, { status: newStatus });
            // Update local state
            setRegistrations(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Erro ao atualizar status.');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = registrations.filter(r =>
        (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.event_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle size={16} className="text-green-500" />;
            case 'pending': return <Clock size={16} className="text-yellow-500" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return null;
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handleExport = () => {
        const csv = [
            'Nome,Email,Telefone,Evento,Status,Data',
            ...registrations.map(r => `${r.user_name},${r.email},${r.phone},${r.event_name},${r.status},${r.created_at}`)
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'inscritos.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inscritos</h1>
                    <p className="text-gray-500 text-sm">Gerencie inscrições dos eventos.</p>
                </div>
                <button onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm">
                    <Download size={20} /><span>Exportar CSV</span>
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar por nome, email ou evento..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Filter size={18} /><span className="hidden sm:inline">Filtros</span>
                </button>
            </div>

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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrito</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(reg => (
                                    <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{(reg.user_name || '?').charAt(0)}</div>
                                                <span className="font-medium text-gray-800">{reg.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{reg.event_name}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{reg.email}</div>
                                            <div className="text-xs text-gray-400">{reg.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                                {statusIcon(reg.status)} {statusLabel(reg.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{reg.created_at ? new Date(reg.created_at).toLocaleDateString('pt-AO') : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {updating === reg.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : (
                                                    <>
                                                        {reg.status !== 'confirmed' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(reg.id, 'confirmed')}
                                                                title="Aprovar"
                                                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        {reg.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(reg.id, 'cancelled')}
                                                                title="Rejeitar"
                                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                        {reg.status !== 'pending' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(reg.id, 'pending')}
                                                                title="Marcar como Pendente"
                                                                className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                                            >
                                                                <Clock size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhum inscrito encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
