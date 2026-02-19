import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, Loader2, Edit2, X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import FileUpload from '../components/FileUpload';
import { getCalendarDates, saveCalendarDate, deleteCalendarDate as deleteCalApi, getSiteConfig, saveSiteConfig } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function CalendarPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [calendarFile, setCalendarFile] = useState('');
    const [calendarFileName, setCalendarFileName] = useState('');
    const [loading, setLoading] = useState(true);

    // Edit/Save State
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [tempEntry, setTempEntry] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [fileSaving, setFileSaving] = useState(false);
    const [fileSuccess, setFileSuccess] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dates, fileConfig] = await Promise.all([
                getCalendarDates(),
                getSiteConfig('calendar_file')
            ]);
            setEntries(dates || []);
            if (fileConfig) {
                setCalendarFile(fileConfig.url || '');
                setCalendarFileName(fileConfig.name || '');
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSaveFile = async () => {
        if (!calendarFile) return;
        setFileSaving(true);
        try {
            await saveSiteConfig('calendar_file', { url: calendarFile, name: calendarFileName });
            setFileSuccess('Arquivo salvo!');
            setTimeout(() => setFileSuccess(''), 3000);
        } catch (err) { console.error(err); alert('Erro ao salvar arquivo.'); }
        setFileSaving(false);
    };

    const handleAddNew = () => {
        const newEntry = { id: 'new', days: '', month: '', year: '2026', event: '', event_name: '', image: '', sort_order: entries.length };
        setTempEntry(newEntry);
        setEditingId('new');
    };

    const handleEdit = (entry: any) => {
        setTempEntry({ ...entry });
        setEditingId(entry.id);
    };

    const handleCancel = () => {
        setEditingId(null);
        setTempEntry(null);
    };

    const handleUpdateTemp = (field: string, value: any) => {
        setTempEntry({ ...tempEntry, [field]: value });
    };

    const handleSaveEntry = async () => {
        if (!tempEntry) return;
        setSaving(true);
        try {
            await saveCalendarDate({
                ...tempEntry,
                event: tempEntry.event_name || tempEntry.event, // Handle both field names
                sort_order: tempEntry.sort_order ?? 0
            });
            await loadData();
            setEditingId(null);
            setTempEntry(null);
        } catch (err: any) {
            console.error(err);
            alert(`Erro ao salvar: ${err.message || JSON.stringify(err)}`);
        }
        setSaving(false);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try { await deleteCalApi(deleteId); } catch (err) { console.error(err); }
        setEntries(entries.filter(e => e.id !== deleteId));
        setDeleteId(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando calendário...</span>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Calendário</h1>
                    <p className="text-gray-500 text-sm">Gerencie as datas dos eventos e o arquivo PDF.</p>
                </div>
                {!editingId && (
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm text-sm">
                        <Plus size={18} />Nova Data
                    </button>
                )}
            </div>

            {/* Global File Upload */}
            {!editingId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Download size={16} />Arquivo de Download (PDF/Imagem)</h3>
                        <FileUpload label="" value={calendarFile} fileName={calendarFileName}
                            onChange={(url, name) => { setCalendarFile(url); setCalendarFileName(name); }} />
                    </div>
                    <button onClick={handleSaveFile} disabled={fileSaving} className="mb-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors disabled:opacity-50 min-w-[100px]">
                        {fileSaving ? 'Salvando...' : fileSuccess || 'Salvar Arquivo'}
                    </button>
                </div>
            )}

            {/* EDIT FORM */}
            {editingId && tempEntry && (
                <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">{editingId === 'new' ? 'Nova Data' : 'Editar Data'}</h3>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-medium text-gray-700">Dia(s)</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        value={tempEntry.days || ''} onChange={e => handleUpdateTemp('days', e.target.value)} placeholder="20 A 24" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-medium text-gray-700">Mês</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        value={tempEntry.month || ''} onChange={e => handleUpdateTemp('month', e.target.value)} placeholder="MAIO" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700">Ano</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        value={tempEntry.year || ''} onChange={e => handleUpdateTemp('year', e.target.value)} placeholder="2026" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700">Nome do Evento</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        value={tempEntry.event_name || tempEntry.event || ''} onChange={e => handleUpdateTemp('event_name', e.target.value)} placeholder="FMCA" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ImageUpload label="Imagem de Fundo (Card)" value={tempEntry.image || ''}
                                onChange={url => handleUpdateTemp('image', url)} placeholder="Upload da imagem" previewHeight="h-32" folder="calendar" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                        <button onClick={handleCancel} className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSaveEntry} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold shadow-md transition-colors flex justify-center items-center gap-2">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Salvando...' : 'Salvar Data'}
                        </button>
                    </div>
                </div>
            )}

            {/* LIST GRID */}
            {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
                            {/* Card Preview */}
                            <div className="relative h-40 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                                {entry.image ? (
                                    <img src={entry.image} alt={entry.event_name} className="w-full h-full object-cover opacity-90" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30">
                                        <ImageIcon size={40} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleEdit(entry)} className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition-all">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => setDeleteId(entry.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-110 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-900 shadow-sm">
                                    {entry.year}
                                </div>
                            </div>

                            <div className="p-4 text-center">
                                <h4 className="text-xl font-bold text-gray-800 font-['Montserrat']">{entry.month}</h4>
                                <p className="text-sm text-gray-500 font-medium mt-1">{entry.days}</p>
                                <div className="mt-3 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                    {entry.event || entry.event_name}
                                </div>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 mb-4">Nenhuma data cadastrada.</p>
                            <button onClick={handleAddNew} className="text-blue-600 font-medium hover:text-blue-800">+ Adicionar data</button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Data"
                message="Tem certeza que deseja excluir esta data? Esta ação não pode ser desfeita."
                confirmText="Sim, Excluir"
            />
        </div>
    );
}
