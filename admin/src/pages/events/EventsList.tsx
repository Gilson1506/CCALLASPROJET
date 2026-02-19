import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, MapPin,
    Calendar as CalendarIcon, Edit, Trash2, Eye, Star, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent as deleteEventApi } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function EventsList() {
    const [events, setEvents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await getEvents();
            setEvents(data || []);
        } catch (err) {
            console.error('Error loading events:', err);
        }
        setLoading(false);
    };

    const filteredEvents = events.filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteEventApi(deleteId);
            setEvents(events.filter(e => e.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Eventos</h1>
                    <p className="text-gray-500 text-sm">Gerencie todos os eventos, feiras e exposições.</p>
                </div>
                <button
                    onClick={() => navigate('/eventos/novo')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                    <Plus size={20} />
                    <span>Novo Evento</span>
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text" placeholder="Buscar eventos..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Filter size={18} /><span className="hidden sm:inline">Filtros</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-500">Carregando eventos...</span>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data & Local</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Destaque</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {event.cover_image && <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mt-1">{event.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-2"><CalendarIcon size={14} /><span>{event.date ? new Date(event.date).toLocaleDateString('pt-AO') : '-'}</span></div>
                                                <div className="flex items-center gap-2"><MapPin size={14} /><span>{event.location}</span></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {event.status === 'published' ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {event.is_featured ? (
                                                <span className="flex items-center gap-1 text-amber-500 text-sm font-medium bg-amber-50 px-2 py-1 rounded w-fit">
                                                    <Star size={14} fill="currentColor" />Home
                                                </span>
                                            ) : <span className="text-gray-400 text-sm">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Visualizar"><Eye size={18} /></button>
                                                <button onClick={() => navigate(`/eventos/${event.id}`)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEvents.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum evento encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
