import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Video, Plus, X, GripVertical, Loader2 } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { getEvent, saveEvent as saveEventApi } from '../../services/api';

export default function EventForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '', date: '', location: '', category: '',
        description: '', cover_image: '', video_url: '',
        is_featured: false, status: 'draft' as 'draft' | 'published',
        gallery_images: [] as string[]
    });

    useEffect(() => {
        if (isEditing && id) {
            setLoading(true);
            getEvent(id).then(event => {
                if (event) setFormData({
                    title: event.title || '',
                    date: event.date || '',
                    location: event.location || '',
                    category: event.category || '',
                    description: event.description || '',
                    cover_image: event.cover_image || '',
                    video_url: event.video_url || '',
                    is_featured: event.is_featured || false,
                    status: event.status || 'draft',
                    gallery_images: event.gallery_images || []
                });
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [isEditing, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveEventApi({ ...formData, id: isEditing ? id : undefined });
            navigate('/eventos');
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Erro ao salvar evento. Verifique a consola.');
        }
        setSaving(false);
    };

    const addGalleryImage = () => {
        setFormData({ ...formData, gallery_images: [...formData.gallery_images, ''] });
    };

    const updateGalleryImage = (index: number, url: string) => {
        const gallery = [...formData.gallery_images];
        gallery[index] = url;
        setFormData({ ...formData, gallery_images: gallery });
    };

    const removeGalleryImage = (index: number) => {
        setFormData({ ...formData, gallery_images: formData.gallery_images.filter((_, i) => i !== index) });
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando evento...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate('/eventos')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={20} /><span>Voltar</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Título do Evento</label>
                        <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Filda 2026" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Categoria</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="">Selecione...</option>
                            <option value="Feira">Feira</option>
                            <option value="Exposição">Exposição</option>
                            <option value="Moda">Moda</option>
                            <option value="Festival">Festival</option>
                            <option value="Corporativo">Corporativo</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Data do Evento</label>
                        <input required type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.date ? formData.date.split('T')[0] : ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Localização</label>
                        <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: Baía de Luanda" />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Imagem de Capa</h3>
                    <ImageUpload label="Capa do Evento" value={formData.cover_image}
                        onChange={url => setFormData({ ...formData, cover_image: url })} placeholder="Upload da imagem principal do evento" previewHeight="h-56" folder="events" />
                </div>

                <div className="space-y-2 pt-6 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span>URL do Vídeo (YouTube/Vimeo)</span><span className="text-xs text-gray-400 font-normal">Opcional</span>
                    </label>
                    <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="url" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                            value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Galeria de Fotos</h3>
                        <button type="button" onClick={addGalleryImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                            <Plus size={16} />Adicionar Foto
                        </button>
                    </div>
                    {formData.gallery_images.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">Nenhuma foto na galeria.</p>
                            <button type="button" onClick={addGalleryImage} className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">+ Adicionar primeira foto</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.gallery_images.map((img, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <GripVertical size={16} className="mt-3 text-gray-300 flex-shrink-0" />
                                    <div className="flex-1">
                                        <ImageUpload label={`Foto ${idx + 1}`} value={img}
                                            onChange={url => updateGalleryImage(idx, url)} placeholder={`Foto ${idx + 1}`} previewHeight="h-32" folder="events/gallery" />
                                    </div>
                                    <button type="button" onClick={() => removeGalleryImage(idx)} className="mt-6 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 pt-6 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-700">Descrição Detalhada</label>
                    <textarea rows={6} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva o evento..." />
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100 bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                        <div>
                            <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Destaque na Home</span>
                            <span className="block text-xs text-gray-500">Exibir no carrossel principal da página inicial.</span>
                        </div>
                    </label>
                    <div className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700">Status</span>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={formData.status === 'draft'} onChange={() => setFormData({ ...formData, status: 'draft' })} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-600">Rascunho</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={formData.status === 'published'} onChange={() => setFormData({ ...formData, status: 'published' })} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-600">Publicado</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/eventos')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancelar</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50">
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        <span>{saving ? 'Salvando...' : 'Salvar Evento'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
