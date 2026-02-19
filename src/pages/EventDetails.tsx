import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Loader2, AlertCircle } from 'lucide-react';
import RegistrationModal from '../components/RegistrationModal';
import { supabase } from '../lib/supabase';

export default function EventDetails() {
    const { id } = useParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [event, setEvent] = useState<any>(null);
    const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
        }
    }, [id]);

    const fetchEventDetails = async (eventId: string) => {
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError('Cliente Supabase não configurado.');
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch Main Event
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (eventError) throw eventError;
            setEvent(eventData);

            // 2. Fetch Related Events (excluding current)
            const { data: relatedData, error: relatedError } = await supabase
                .from('events')
                .select('*')
                .neq('id', eventId)
                .eq('status', 'published') // Only published
                .limit(4);

            if (relatedError) console.warn('Error fetching related events:', relatedError);
            setRelatedEvents(relatedData || []);

        } catch (err: any) {
            console.error('Error fetching event details:', err);
            setError('Não foi possível carregar os detalhes do evento.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f0f7ff]">
                <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#f0f7ff] text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Evento não encontrado</h2>
                <p className="text-gray-600 mb-6">{error || 'O evento que procura não existe ou foi removido.'}</p>
                <Link to="/eventos" className="px-6 py-2 bg-[#4A90D9] text-white rounded-none hover:bg-[#357abd] transition-colors">
                    Voltar aos Eventos
                </Link>
            </div>
        );
    }

    // Prepare gallery images (ensure we have at least 6 for the grid, or handle fewer)
    const gallery = event.gallery_images || [];
    // Fill with cover image if empty/few (optional fallback strategy)
    const displayGallery = gallery.length > 0 ? gallery : Array(6).fill(event.cover_image);

    return (
        <div className="pt-20 min-h-screen bg-white">
            {/* Hero Image */}
            <div className="h-[40vh] relative overflow-hidden">
                <img
                    src={event.cover_image || 'https://via.placeholder.com/1920x600'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <Link to="/eventos" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar aos Eventos
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white font-['Montserrat'] mb-2">{event.title}</h1>
                    <p className="text-xl text-white/90 font-['Open_Sans']">{event.full_name || event.title}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 font-['Montserrat']">Sobre o Evento</h2>
                        <div className="text-gray-600 leading-relaxed font-['Open_Sans'] text-lg whitespace-pre-line">
                            {event.description}
                        </div>
                    </section>

                    {/* Galeria de Momentos */}
                    {gallery.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-['Montserrat'] flex items-center gap-2">
                                Momentos do Evento
                                <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-[#4A90D9] rounded-none">Destaques</span>
                            </h2>
                            {/* Masonry-style Grid - simplified for dynamic length */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 auto-rows-[150px]">
                                {displayGallery.map((img: string, idx: number) => {
                                    // Logic to recreate the "masonry" spans based on index
                                    let className = "group relative overflow-hidden cursor-pointer ";
                                    if (idx === 0) className += "col-span-2 row-span-2"; // Large first image
                                    else if (idx === 3) className += "col-span-2 row-span-1"; // Wide image
                                    else className += "col-span-1 row-span-1"; // Standard

                                    // Limit to 6 items to match layout
                                    if (idx > 5) return null;

                                    return (
                                        <div key={idx} className={className}>
                                            <img src={img} alt={`Momento ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-none" />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-[#f0f7ff] p-6 rounded-none border border-blue-100 sticky top-24 shadow-sm">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 border-b border-blue-200 pb-2">Informações</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center text-[#4A90D9] shadow-sm border border-blue-50">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Data</p>
                                    <p className="font-semibold text-[#1a1a1a]">
                                        {new Date(event.date).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center text-[#4A90D9] shadow-sm border border-blue-50">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Horário</p>
                                    <p className="font-semibold text-[#1a1a1a]">{event.time || 'A definir'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center text-[#4A90D9] shadow-sm border border-blue-50">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Localização</p>
                                    <p className="font-semibold text-[#1a1a1a]">{event.location || 'A definir'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const eventDate = new Date(event.date);
                                const isFinished = eventDate < new Date();
                                if (!isFinished) setIsModalOpen(true);
                            }}
                            disabled={new Date(event.date) < new Date()}
                            className={`w-full py-4 rounded-none font-bold shadow-lg transition-all transform mb-3 uppercase tracking-wide flex items-center justify-center ${new Date(event.date) < new Date()
                                    ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                                    : 'bg-[#4A90D9] hover:bg-[#6BB8E8] text-white shadow-blue-200/50 hover:-translate-y-1'
                                }`}
                        >
                            {new Date(event.date) < new Date() ? (
                                <>
                                    <Clock className="w-5 h-5 mr-2" />
                                    Evento Terminado
                                </>
                            ) : (
                                'Inscrever-se Agora'
                            )}
                        </button>

                        <button className="w-full py-4 bg-white border border-[#4A90D9] text-[#4A90D9] hover:bg-blue-50 rounded-none font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                            <Share2 className="w-4 h-4" />
                            Partilhar Evento
                        </button>
                    </div>

                    {/* Outros Eventos Section (Sidebar position or below?) - Let's put in sidebar or below info */}
                    {relatedEvents.length > 0 && (
                        <div className="bg-white p-6 rounded-none border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Outros Eventos</h3>
                            <div className="space-y-4">
                                {relatedEvents.map(related => (
                                    <Link key={related.id} to={`/eventos/${related.id}`} className="flex gap-4 group">
                                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-gray-100">
                                            <img src={related.cover_image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#4A90D9] line-clamp-2">{related.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(related.date).toLocaleDateString('pt-AO')}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
