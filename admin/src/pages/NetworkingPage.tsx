import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Star, Edit2, X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { getFairs, saveFair, deleteFair as deleteFairApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function NetworkingPage() {
    const [fairs, setFairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [tempFair, setTempFair] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadFairs(); }, []);

    const loadFairs = async () => {
        setLoading(true);
        try { const data = await getFairs(); setFairs(data || []); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleAddNew = () => {
        const newFair = { id: 'new', name: '', full_name: '', description: '', image: '', hover_image: '', sort_order: fairs.length, is_hero_featured: false };
        setTempFair(newFair);
        setEditingId('new');
    };

    const handleEdit = (fair: any) => {
        setTempFair({ ...fair });
        setEditingId(fair.id);
    };

    const handleCancel = () => {
        setEditingId(null);
        setTempFair(null);
    };

    const handleSave = async () => {
        if (!tempFair) return;
        setSaving(true);
        try {
            // Remove 'new' id to trigger insert instead of update
            const fairToSave = { ...tempFair };
            if (fairToSave.id === 'new') {
                delete fairToSave.id;
            }

            await saveFair({ ...fairToSave, fullName: tempFair.full_name });
            await loadFairs(); // Refresh list
            setEditingId(null);
            setTempFair(null);
        } catch (err: any) {
            console.error(err);
            alert(`Erro ao salvar: ${err.message || JSON.stringify(err)}`);
        }
        setSaving(false);
    };

    const handleUpdateTemp = (field: string, value: any) => {
        setTempFair({ ...tempFair, [field]: value });
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try { await deleteFairApi(deleteId); } catch (err) { console.error(err); }
        setFairs(fairs.filter(f => f.id !== deleteId));
        setDeleteId(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando feiras...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Networking e Negócios</h1>
                    <p className="text-gray-500 text-sm">Gerencie as feiras e eventos de networking.</p>
                </div>
                {!editingId && (
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm text-sm">
                        <Plus size={18} />Nossos Momentos
                    </button>
                )}
            </div>

            {/* EDIT FORM */}
            {editingId && tempFair && (
                <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">{editingId === 'new' ? 'Novo Evento' : 'Editar Evento'}</h3>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    checked={!!tempFair.is_hero_featured} onChange={e => handleUpdateTemp('is_hero_featured', e.target.checked)} />
                                <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                    <Star size={14} className={tempFair.is_hero_featured ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} />
                                    Destaque no Hero
                                </span>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sigla / Nome Curto</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    value={tempFair.name || ''} onChange={e => handleUpdateTemp('name', e.target.value)} placeholder="Ex: FMCA" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    value={tempFair.full_name || ''} onChange={e => handleUpdateTemp('full_name', e.target.value)} placeholder="Feira de Moda..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Descrição</label>
                            <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                value={tempFair.description || ''} onChange={e => handleUpdateTemp('description', e.target.value)} placeholder="Descrição da feira..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUpload label="Imagem Principal" value={tempFair.image}
                                onChange={url => handleUpdateTemp('image', url)} placeholder="Upload da imagem" previewHeight="h-40" folder="fairs" />
                            <ImageUpload label="Imagem Hover" value={tempFair.hover_image}
                                onChange={url => handleUpdateTemp('hover_image', url)} placeholder="Upload da imagem hover" previewHeight="h-40" folder="fairs" />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button onClick={handleCancel} className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold shadow-md transition-colors flex justify-center items-center gap-2">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Salvando...' : 'Salvar Evento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIST GRID */}
            {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fairs.map((fair) => (
                        <div key={fair.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
                            {/* Card Image Area (Replicating Fairs.tsx style) */}
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                {fair.image ? (
                                    <>
                                        <img src={fair.image} alt={fair.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(fair)} className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => setDeleteId(fair.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-110 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                {fair.is_hero_featured && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm">
                                        <Star size={14} className="fill-white" />
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 font-['Montserrat'] line-clamp-1">{fair.name}</h3>
                                <p className="text-xs text-blue-600 font-medium mb-2">{fair.full_name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">{fair.description}</p>
                            </div>
                        </div>
                    ))}
                    {fairs.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 mb-4">Nenhuma feira encontrada.</p>
                            <button onClick={handleAddNew} className="text-blue-600 font-medium hover:text-blue-800">+ Criar primeira feira</button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Feira"
                message="Tem certeza que deseja excluir esta feira? Esta ação não pode ser desfeita."
                confirmText="Sim, Excluir"
            />
        </div>
    );
}
