import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function News() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setNews(data);
            }
        } catch (err) {
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-AO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="pt-24 min-h-screen bg-[#f0f7ff]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] font-['Montserrat'] mb-4">
                        Últimas <span className="gradient-text">Notícias</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto font-['Open_Sans']">
                        Fique por dentro de tudo o que acontece no mundo dos eventos.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Nenhuma notícia publicada ainda.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {news.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row h-full md:h-64">
                                <div className="md:w-2/5 relative overflow-hidden">
                                    <img
                                        src={item.image ? encodeURI(item.image) : 'https://via.placeholder.com/400x300?text=Notícia'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Erro+Img';
                                        }}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A90D9]">
                                        Notícia
                                    </div>
                                </div>
                                <div className="p-6 md:w-3/5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(item.created_at)}</span>
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author || 'Admin'}</span>
                                        </div>
                                        <Link to={`/noticias/${item.id}`}>
                                            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 font-['Montserrat'] group-hover:text-[#4A90D9] transition-colors leading-tight line-clamp-2">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-600 text-sm line-clamp-2 font-['Open_Sans']">
                                            {item.summary}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/noticias/${item.id}`}
                                        className="inline-flex items-center text-[#4A90D9] font-medium text-sm mt-4 hover:underline"
                                    >
                                        Ler artigo completo <ArrowRight className="w-4 h-4 ml-1" />
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
