import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

import SuccessModal from '../components/SuccessModal';

export default function ContactPage() {
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        if (!supabase) return;

        try {
            // 1. Fetch Contact Info
            const { data: configData } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'contact_info')
                .single();

            if (configData) setContactInfo(configData.value);

            // 2. Fetch Active Partners
            const { data: partnersData } = await supabase
                .from('partners')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (partnersData) setPartners(partnersData);

        } catch (err) {
            console.error('Error fetching contact data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            console.error('Supabase client not initialized');
            alert('Erro de configuração: Cliente Supabase não inicializado.');
            return;
        }

        if (!formData.name || !formData.email || !formData.message) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender: formData.name,
                    email: formData.email,
                    subject: formData.subject || 'Contato pelo Site',
                    content: formData.message,
                    source: 'site',
                    status: 'unread'
                });

            if (error) throw error;

            setShowSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Erro ao enviar mensagem. Tente novamente.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f0f7ff]">
                <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
            </div>
        );
    }

    const { email, phone, address } = contactInfo || {};

    return (
        <div className="pt-24 min-h-screen bg-[#f0f7ff]">
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Mensagem Enviada!"
                message="Recebemos sua mensagem e entraremos em contato em breve."
            />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] font-['Montserrat'] mb-4">
                        Entre em <span className="gradient-text">Contacto</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto font-['Open_Sans']">
                        Estamos prontos para realizar o seu próximo grande evento. Fale connosco.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Form */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50">
                        <h3 className="text-2xl font-bold mb-6 text-[#1a1a1a] font-['Montserrat']">Envie uma mensagem</h3>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nome <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 outline-none transition-all disabled:opacity-50"
                                        placeholder="Seu nome"
                                        required
                                        disabled={sending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 outline-none transition-all disabled:opacity-50"
                                        placeholder="seu@email.com"
                                        required
                                        disabled={sending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Assunto</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 outline-none transition-all disabled:opacity-50"
                                    placeholder="Como podemos ajudar?"
                                    disabled={sending}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mensagem <span className="text-red-500">*</span></label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 outline-none transition-all resize-none disabled:opacity-50"
                                    placeholder="Descreva o seu projeto..."
                                    required
                                    disabled={sending}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-4 bg-gradient-to-r from-[#4A90D9] to-[#6BB8E8] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-300/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Enviar Mensagem
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info & Map */}
                    <div className="space-y-8">
                        {/* Info Cards */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-50 hover:border-[#89CFF0] transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#4A90D9] mb-4 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-[#1a1a1a] mb-1">Telefone</h4>
                                <p className="text-gray-500 text-sm mb-4">Seg-Sex, 8h às 18h</p>
                                <p className="text-[#4A90D9] font-medium">{phone || '+244 923 000 000'}</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-50 hover:border-[#89CFF0] transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#4A90D9] mb-4 group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-[#1a1a1a] mb-1">Email</h4>
                                <p className="text-gray-500 text-sm mb-4">Resposta em 24h</p>
                                <p className="text-[#4A90D9] font-medium">{email || 'contacto@arena.co.ao'}</p>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white p-2 rounded-3xl shadow-xl border border-blue-50 h-80 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.865570220268!2d13.230722374853033!3d-8.807759392657493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f5c6c9906695%3A0xe5a3c6c192667104!2sArena%20Angola!5e0!3m2!1sen!2sao!4v1709400000000!5m2!1sen!2sao"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <div className="absolute bottom-6 left-6 bg-white py-3 px-4 rounded-xl shadow-lg flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-[#4A90D9]" />
                                <span className="font-medium text-[#1a1a1a] text-sm">{address || 'Luanda, Angola'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partners Section (Requested) */}
                {partners.length > 0 && (
                    <div className="mt-20">
                        <h3 className="text-2xl font-bold text-center mb-10 text-[#1a1a1a] font-['Montserrat']">Nossos Parceiros</h3>
                        <div className="flex flex-wrap justify-center gap-8 items-center">
                            {partners.map(partner => (
                                <div key={partner.id} className="w-32 h-32 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-md transition-shadow" title={partner.name}>
                                    <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
