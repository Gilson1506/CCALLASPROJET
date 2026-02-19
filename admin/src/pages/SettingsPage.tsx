import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Globe, Facebook, Instagram, Twitter, Youtube, Loader2 } from 'lucide-react';
import { getSiteConfig, saveSiteConfig } from '../services/api';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'contact' | 'about'>('contact');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [contactInfo, setContactInfo] = useState({
        phone: '', email: '', address: '', website: '', facebook: '', instagram: '', twitter: '', youtube: '',
    });

    const [aboutInfo, setAboutInfo] = useState({
        title: '', subtitle: '', description: '', mission: '', vision: '', foundedYear: '', teamSize: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [contact, about] = await Promise.all([
                getSiteConfig('contact_info'),
                getSiteConfig('about_info')
            ]);
            if (contact) setContactInfo(contact);
            if (about) setAboutInfo(about);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveContact = async () => {
        setSaving(true);
        try {
            await saveSiteConfig('contact_info', contactInfo);
            showToast('Contactos salvos com sucesso!');
        } catch (err) { console.error(err); showToast('Erro ao salvar.', 'error'); }
        setSaving(false);
    };

    const handleSaveAbout = async () => {
        setSaving(true);
        try {
            await saveSiteConfig('about_info', aboutInfo);
            showToast('Informações "Sobre Nós" salvas com sucesso!');
        } catch (err) { console.error(err); showToast('Erro ao salvar.', 'error'); }
        setSaving(false);
    };

    const tabs = [
        { id: 'contact' as const, label: 'Contactos' },
        { id: 'about' as const, label: 'Sobre Nós' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando configurações...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 relative">
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 z-50 transition-all duration-300 animate-in slide-in-from-right-10 fade-in ${toast.type === 'success' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                    {toast.type === 'success' ? <div className="p-1 bg-white/20 rounded-full"><Save size={16} /></div> : null}
                    {toast.message}
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
                <p className="text-gray-500 text-sm">Gerencie informações do site.</p>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'contact' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">Informações de Contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Phone size={14} />Telefone</label>
                            <input type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Mail size={14} />Email</label>
                            <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin size={14} />Endereço</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={contactInfo.address} onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Globe size={14} />Website</label>
                            <input type="url" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={contactInfo.website} onChange={e => setContactInfo({ ...contactInfo, website: e.target.value })} />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Redes Sociais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4" />
                                <input type="url" placeholder="URL do Facebook" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                    value={contactInfo.facebook} onChange={e => setContactInfo({ ...contactInfo, facebook: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600 w-4 h-4" />
                                <input type="url" placeholder="URL do Instagram" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                    value={contactInfo.instagram} onChange={e => setContactInfo({ ...contactInfo, instagram: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4" />
                                <input type="url" placeholder="URL do Twitter/X" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                    value={contactInfo.twitter} onChange={e => setContactInfo({ ...contactInfo, twitter: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 w-4 h-4" />
                                <input type="url" placeholder="URL do YouTube" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                    value={contactInfo.youtube} onChange={e => setContactInfo({ ...contactInfo, youtube: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button onClick={handleSaveContact} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}<span>{saving ? 'Salvando...' : 'Salvar Contactos'}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">Sobre Nós</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={aboutInfo.title} onChange={e => setAboutInfo({ ...aboutInfo, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Slogan / Subtítulo</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={aboutInfo.subtitle} onChange={e => setAboutInfo({ ...aboutInfo, subtitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ano de Fundação</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={aboutInfo.foundedYear} onChange={e => setAboutInfo({ ...aboutInfo, foundedYear: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tamanho da Equipa</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={aboutInfo.teamSize} onChange={e => setAboutInfo({ ...aboutInfo, teamSize: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição da Empresa</label>
                        <textarea rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                            value={aboutInfo.description} onChange={e => setAboutInfo({ ...aboutInfo, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Missão</label>
                        <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                            value={aboutInfo.mission} onChange={e => setAboutInfo({ ...aboutInfo, mission: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Visão</label>
                        <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                            value={aboutInfo.vision} onChange={e => setAboutInfo({ ...aboutInfo, vision: e.target.value })} />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button onClick={handleSaveAbout} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}<span>{saving ? 'Salvando...' : 'Salvar Sobre Nós'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
