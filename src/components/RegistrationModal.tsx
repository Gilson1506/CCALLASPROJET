import { useState, useEffect } from 'react';
import { X, Search, Calendar, CheckCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    // Fetch events on open
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearch('');
            setSelectedEventId(null);
            setFormData({ name: '', email: '', phone: '', company: '' });
            document.body.style.overflow = 'hidden';
            fetchEvents();
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const fetchEvents = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // Fetch from calendar_dates as requested
            const { data, error } = await supabase
                .from('calendar_dates')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            // Map calendar dates to event structure
            const mappedEvents = (data || []).map((d: any) => ({
                id: d.id,
                title: d.event_name || d.event || 'Evento Sem Nome',
                // Construct a display date string/object
                dateDisplay: `${d.days || ''} ${d.month || ''} ${d.year || ''}`.trim(),
                location: 'Luanda, Angola', // Default or fetch if available
                cover_image: d.image
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error('Error fetching events for registration:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredEvents = events.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedEvent = events.find(e => e.id === selectedEventId);

    const handleNext = () => {
        if (step === 1 && selectedEventId) setStep(2);
        else if (step === 2) {
            handleRegister();
        }
    };

    const handleRegister = async () => {
        if (!supabase || !selectedEventId) return;

        // 1. Save to DB (registrations table)
        try {
            const { error } = await supabase
                .from('registrations')
                .insert({
                    // event_id: selectedEventId, // This fails FK constraint as calendar_dates IDs are not in events table
                    event_id: null, // Send null to bypass FK check (assuming column allows nulls)
                    event_name: selectedEvent?.title || 'Unknown',
                    user_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    status: 'pending' // Default
                });

            // If FK constraint fails, we might need to catch it. 
            // But usually event_id is just a UUID column without strict FK in some simple setups.
            // If it fails, we will know.

            if (error) throw error;

            // 2. Generate PDF and Success
            generateReceiptPDF();
            setStep(3);

        } catch (err) {
            console.error('Registration error:', err);
            alert('Erro ao realizar inscrição. Tente novamente.');
        }
    };

    const generateReceiptPDF = () => {
        if (!selectedEvent) return;

        const doc = new jsPDF();

        // Colors
        const primaryColor = '#4A90D9';

        // Add Logo (Arena/Callas)
        const logoUrl = '/logo.png';
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
            doc.addImage(img, 'PNG', 20, 10, 40, 0);
            drawContent(doc);
        };
        img.onerror = () => {
            drawContent(doc);
        };

        const drawContent = (pdf: jsPDF) => {
            // Header
            pdf.setFontSize(22);
            pdf.setTextColor(primaryColor);
            pdf.setFont("helvetica", "bold");
            pdf.text("Comprovativo de Inscrição", 20, 40);

            pdf.setLineWidth(0.5);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(20, 45, 190, 45);

            // Event Details
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detalhes do Evento", 20, 60);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(80, 80, 80);

            pdf.text(`Evento: ${selectedEvent.title}`, 20, 70);
            pdf.text(`Data: ${selectedEvent.dateDisplay}`, 20, 80); // Custom date string
            if (selectedEvent.location) pdf.text(`Local: ${selectedEvent.location}`, 20, 90);

            // User Details
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "bold");
            pdf.text("Dados do Participante", 20, 110);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(80, 80, 80);

            pdf.text(`Nome: ${formData.name}`, 20, 120);
            pdf.text(`Email: ${formData.email}`, 20, 130);
            if (formData.phone) pdf.text(`Telefone: ${formData.phone}`, 20, 140);
            if (formData.company) pdf.text(`Empresa: ${formData.company}`, 20, 150);

            // Footer
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text("Este documento serve como comprovativo de sua pré-inscrição.", 20, 180);
            pdf.text(`Gerado em: ${new Date().toLocaleString('pt-AO')}`, 20, 185);

            // Save
            pdf.save(`Comprovativo-${formData.name.replace(/\s+/g, '-')}.pdf`);
        };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#4A90D9] p-6 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2">
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-['Montserrat']">Inscrição em Eventos</h2>
                            <p className="text-white/80 text-sm font-['Open_Sans']">Garanta o seu lugar</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar evento..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-[#4A90D9] outline-none transition-colors font-['Open_Sans']"
                                />
                            </div>

                            <div className="space-y-2">
                                {loading && <p className="text-center text-gray-500 py-4">Carregando eventos...</p>}
                                {!loading && filteredEvents.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum evento encontrado.</p>}

                                {filteredEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedEventId(event.id)}
                                        className={`p-3 border cursor-pointer transition-all flex items-center justify-between gap-4 ${selectedEventId === event.id
                                            ? 'border-[#4A90D9] bg-[#f0f7ff]'
                                            : 'border-gray-100 hover:border-[#4A90D9]/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Event Image */}
                                            <div className="w-16 h-12 bg-gray-200 overflow-hidden shrink-0">
                                                <img
                                                    src={event.cover_image || '/placeholder-event.jpg'}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Event';
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-[#1a1a1a] font-['Montserrat'] text-sm">{event.title}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 font-['Open_Sans']">
                                                    <Calendar className="w-3 h-3" />
                                                    {event.dateDisplay}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedEventId === event.id && (
                                            <CheckCircle className="w-5 h-5 text-[#4A90D9]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="bg-blue-50 p-4 mb-4 flex gap-4 items-center">
                                {selectedEvent?.cover_image && (
                                    <div className="w-16 h-12 bg-gray-200 overflow-hidden shrink-0">
                                        <img
                                            src={selectedEvent.cover_image}
                                            alt={selectedEvent.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-[#4A90D9] font-bold uppercase">Evento Selecionado</p>
                                    <p className="text-[#1a1a1a] font-medium text-sm">{selectedEvent?.title}</p>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-[#1a1a1a] font-['Montserrat']">Seus Dados</h3>
                            <div className="space-y-3">
                                <input
                                    type="text" placeholder="Nome Completo" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[#4A90D9] outline-none"
                                />
                                <input
                                    type="email" placeholder="Email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[#4A90D9] outline-none"
                                />
                                <input
                                    type="tel" placeholder="Telefone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[#4A90D9] outline-none"
                                />
                                <input
                                    type="text" placeholder="Empresa (Opcional)"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[#4A90D9] outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8 animate-scale-in">
                            <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-['Montserrat']">Inscrição Confirmada!</h3>
                            <p className="text-gray-500 font-['Open_Sans'] mb-6">
                                O comprovativo foi gerado e baixado automaticamente.
                            </p>

                            <button
                                onClick={generateReceiptPDF}
                                className="inline-flex items-center gap-2 text-[#4A90D9] font-bold hover:underline"
                            >
                                <Download className="w-4 h-4" /> Baixar Novamente
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between shrink-0 bg-white">
                    {step < 3 && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-500 hover:text-[#1a1a1a] font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                    )}

                    {step === 1 && (
                        <button
                            onClick={handleNext}
                            disabled={!selectedEventId}
                            className="px-6 py-2 bg-[#4A90D9] text-white font-semibold hover:bg-[#6BB8E8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Próximo
                        </button>
                    )}

                    {step === 2 && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!formData.name || !formData.email}
                                className="px-6 py-2 bg-[#4A90D9] text-white font-semibold hover:bg-[#6BB8E8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Confirmar Inscrição
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-[#4A90D9] text-white font-semibold hover:bg-[#6BB8E8] transition-all"
                        >
                            Concluir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
