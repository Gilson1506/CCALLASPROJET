import { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-coverflow';
// @ts-ignore
import 'swiper/css/pagination';



const categories = ['Todos', 'Negócios', 'Moda & Beleza', 'Construção', 'Economia', 'Tecnologia'];

export default function Events() {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [activeCategory, searchTerm]); // Re-fetch on filter change

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError('Cliente Supabase não configurado. Verifique as variáveis de ambiente.');
            setLoading(false);
            return;
        }

        try {
            let data: any[] = [];


            // Scenario 1: Search is active -> Use RPC
            if (searchTerm.trim()) {
                // Call the RPC function we defined
                const { data: searchResults, error } = await supabase
                    .rpc('search_site_content', { query_text: searchTerm });

                if (error) throw error;

                // Extract 'events' from the JSON result and map to our format if needed
                // The RPC returns { events: [...], news: [...] }
                // We only want events here.
                const rawEvents = searchResults?.events || [];

                // Map RPC result fields to our component fields if they differ
                // RPC returns: id, title, description, type, date, image, location
                data = rawEvents.map((e: any) => ({
                    id: e.id,
                    name: e.title,
                    fullName: e.title, // RPC might not return full_name, using title fallback
                    date: new Date(e.date).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }),
                    location: e.location || 'Local a definir',
                    category: 'Geral', // RPC didn't return category in my SQL above, I might need to update SQL or just default
                    image: e.image,
                    description: e.description
                }));

            }
            // Scenario 2: No search, just Category filter -> Standard Select
            else {
                let query = supabase
                    .from('events')
                    .select('*')
                    .eq('status', 'published')
                    .order('date', { ascending: true });

                if (activeCategory !== 'Todos') {
                    query = query.eq('category', activeCategory);
                }

                const { data: tableData, error } = await query;
                if (error) throw error;

                data = (tableData || []).map(e => ({
                    id: e.id,
                    name: e.title,
                    fullName: e.title,
                    date: new Date(e.date).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' }),
                    location: e.location,
                    category: e.category,
                    image: e.cover_image,
                    description: e.description
                }));
            }

            setEvents(data);

        } catch (err: any) {
            console.error('Error fetching events:', err);
            setError('Falha ao carregar eventos.');
        } finally {
            setLoading(false);
        }
    };

    const [videos, setVideos] = useState<any[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .not('video_url', 'is', null)
                .neq('video_url', '')
                .order('date', { ascending: false })
                .limit(10); // Limit to recent 10 videos

            if (error) throw error;
            setVideos(data || []);
        } catch (err) {
            console.error("Error fetching videos:", err);
        } finally {
            setLoadingVideos(false);
        }
    };

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="pt-24 min-h-screen bg-[#f0f7ff]">
            {/* Video Carousel Header - Ultra Compact & Autoplay */}
            <div className="bg-[#0a1628] py-2 px-0 overflow-hidden relative">
                <div className="max-w-7xl mx-auto mb-1 px-6 text-center">
                    <h1 className="text-lg md:text-xl font-bold font-['Montserrat'] text-white">Cobertura de Eventos</h1>
                </div>

                {loadingVideos ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Nenhum vídeo disponível no momento.
                    </div>
                ) : (
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{
                            rotate: 30,
                            stretch: 0,
                            depth: 150,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        pagination={false}
                        modules={[EffectCoverflow, Pagination, Autoplay]}
                        className="w-full max-w-5xl mx-auto py-2"
                    >
                        {videos.map((video) => {
                            const videoId = extractYoutubeId(video.video_url);
                            if (!videoId) return null;

                            return (
                                <SwiperSlide key={video.id} className="w-[180px] sm:w-[240px] md:w-[260px] aspect-video">
                                    <div className="w-full h-full bg-black shadow-2xl overflow-hidden border border-white/10 rounded-none relative">
                                        <div className="absolute inset-0 pointer-events-none">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=${videoId}`}
                                                title={video.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            ></iframe>
                                        </div>
                                        <div className="absolute inset-0 bg-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-white text-[10px] truncate">{video.title}</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="flex items-center bg-white rounded-none border border-gray-200 shadow-sm w-full md:w-auto px-4 py-2">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar eventos (RPC)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="outline-none bg-transparent w-full text-sm font-['Open_Sans']"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-none text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-[#4A90D9] text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-transparent hover:border-blue-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-20 text-red-500 gap-2">
                        <AlertCircle /> {error}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>Nenhum evento encontrado.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map(event => (
                            <div key={event.id} className="bg-white rounded-none overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#89CFF0]/20 transition-all duration-300 group border border-blue-50">
                                <div className="relative h-48 overflow-hidden rounded-none">
                                    <img
                                        src={event.image || 'https://via.placeholder.com/800x400?text=Evento'}
                                        alt={event.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                                    />
                                    <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-[#4A90D9] rounded-none">
                                        {event.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#6BB8E8] mb-2 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        {event.date}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 font-['Montserrat'] group-hover:text-[#4A90D9] transition-colors">
                                        {event.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-['Open_Sans']">
                                        {event.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-6">
                                        <MapPin className="w-3 h-3" />
                                        {event.location}
                                    </div>

                                    <Link
                                        to={`/eventos/${event.id}`}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-transparent border border-[#4A90D9] text-[#4A90D9] text-xs font-bold uppercase tracking-wide hover:bg-[#4A90D9] hover:text-white transition-all duration-300 rounded-none w-auto"
                                    >
                                        <span>Ver Detalhes</span>
                                        <ArrowRight className="w-3 h-3 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
