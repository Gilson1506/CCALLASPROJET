import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { getNewsList, saveNews as saveNewsApi } from '../services/api';

export default function NewsForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '', summary: '', content: '', image: '', author: 'Admin', status: 'draft' as 'draft' | 'published'
    });

    useEffect(() => {
        if (isEditing && id) {
            setLoading(true);
            getNewsList().then(data => {
                const item = (data || []).find((n: any) => n.id === id);
                if (item) setFormData({
                    title: item.title || '',
                    summary: item.summary || '',
                    content: item.content || '',
                    image: item.image || '',
                    author: item.author || 'Admin',
                    status: item.status || 'draft'
                });
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [isEditing, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveNewsApi({ ...formData, id: isEditing ? id : undefined });
            navigate('/noticias');
        } catch (err) {
            console.error('Error saving news:', err);
            alert('Erro ao salvar notícia.');
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate('/noticias')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={20} /><span>Voltar</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Título</label>
                    <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Título da notícia" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Resumo</label>
                    <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                        value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} placeholder="Um breve resumo da notícia" />
                </div>

                <ImageUpload label="Imagem da Notícia" value={formData.image}
                    onChange={url => setFormData({ ...formData, image: url })} placeholder="Upload da imagem principal" previewHeight="h-48" folder="news" />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Conteúdo Completo</label>
                    <textarea rows={8} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                        value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Escreva o conteúdo completo da notícia..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Autor</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                            value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}>
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicado</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/noticias')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancelar</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50">
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        <span>{saving ? 'Salvando...' : 'Salvar Notícia'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
