import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Globe, Phone, Loader2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { getPartners, savePartner as savePartnerApi, deletePartner as deletePartnerApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function PartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', category: '', logo: '', website: '', phone: '', description: '', is_active: true });

    useEffect(() => { loadPartners(); }, []);

    const loadPartners = async () => {
        setLoading(true);
        try { const data = await getPartners(); setPartners(data || []); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const filtered = partners.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async () => {
        if (!formData.name) return;
        setSaving(true);
        try {
            await savePartnerApi({ ...formData, id: editingId || undefined });
            setFormData({ name: '', category: '', logo: '', website: '', phone: '', description: '', is_active: true });
            setShowForm(false);
            setEditingId(null);
            await loadPartners();
        } catch (err) { console.error(err); alert('Erro ao salvar parceiro.'); }
        setSaving(false);
    };

    const handleEdit = (partner: any) => {
        setEditingId(partner.id);
        setFormData({ name: partner.name, category: partner.category || '', logo: partner.logo || '', website: partner.website || '', phone: partner.phone || '', description: partner.description || '', is_active: partner.is_active ?? true });
        setShowForm(true);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deletePartnerApi(deleteId);
            setPartners(partners.filter(p => p.id !== deleteId));
            setDeleteId(null);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Parceiros</h1>
                    <p className="text-gray-500 text-sm">Gerencie parceiros e patrocinadores.</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ name: '', category: '', logo: '', website: '', phone: '', description: '', is_active: true }); setShowForm(!showForm); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm">
                    <Plus size={20} /><span>Novo Parceiro</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">{editingId ? 'Editar' : 'Cadastrar'} Parceiro</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nome do parceiro" className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="">Categoria</option>
                            <option>Telecomunicações</option><option>Financeiro</option><option>Transporte</option><option>Tecnologia</option><option>Outro</option>
                        </select>
                        <ImageUpload label="Logo do Parceiro" value={formData.logo} onChange={url => setFormData({ ...formData, logo: url })} folder="partners" />
                        <div className="space-y-4">
                            <input type="url" placeholder="Website" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                            <input type="tel" placeholder="Telefone" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <input type="text" placeholder="Descrição breve" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar parceiros..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-500">Carregando parceiros...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(partner => (
                        <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-14 h-14 rounded-lg object-cover border" /> : <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><Building2 className="text-gray-400" /></div>}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{partner.name}</h3>
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{partner.category}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${partner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {partner.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{partner.description}</p>
                            <div className="space-y-1 text-xs text-gray-400">
                                {partner.website && <div className="flex items-center gap-2"><Globe size={12} /><span className="truncate">{partner.website}</span></div>}
                                {partner.phone && <div className="flex items-center gap-2"><Phone size={12} /><span>{partner.phone}</span></div>}
                            </div>
                            <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-gray-50">
                                <button onClick={() => handleEdit(partner)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(partner.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Nenhum parceiro encontrado.</div>}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Parceiro"
                message="Tem certeza que deseja excluir este parceiro? Esta ação não pode ser desfeita."
                confirmText="Sim, Excluir"
            />
        </div>
    );
}
