import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNewsList, deleteNews as deleteNewsApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function NewsList() {
    const [news, setNews] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await getNewsList();
            setNews(data || []);
        } catch (err) {
            console.error('Error loading news:', err);
        }
        setLoading(false);
    };

    const filtered = news.filter(n =>
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteNewsApi(deleteId);
            setNews(news.filter(n => n.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error('Error deleting news:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notícias</h1>
                    <p className="text-gray-500 text-sm">Gerencie artigos e publicações.</p>
                </div>
                <button onClick={() => navigate('/noticias/nova')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm">
                    <Plus size={20} /><span>Nova Notícia</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar notícias..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-500">Carregando notícias...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 overflow-hidden">
                                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar size={12} />
                                    <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('pt-AO') : '-'}</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye size={16} /></button>
                                    <button onClick={() => navigate(`/noticias/${item.id}`)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">Nenhuma notícia encontrada.</div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Notícia"
                message="Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita."
                confirmText="Sim, Excluir"
            />
        </div>
    );
}
