import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NewsDetails() {
    const { id } = useParams();
    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNewsDetails();
        }
    }, [id]);

    const fetchNewsDetails = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setNews(data);
            }
        } catch (err) {
            console.error('Error fetching news details:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-AO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white">
                <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Notícia não encontrada</h2>
                <Link to="/noticias" className="text-[#4A90D9] hover:underline">
                    Voltar às Notícias
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link to="/noticias" className="inline-flex items-center text-gray-500 hover:text-[#4A90D9] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar às Notícias
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex gap-4 mb-4">
                        <span className="bg-blue-50 text-[#4A90D9] px-3 py-1 rounded-full text-xs font-bold">Notícia</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] font-['Montserrat'] mb-6 leading-tight">
                        {news.title}
                    </h1>
                    <div className="flex items-center justify-between border-y border-gray-100 py-4">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(news.created_at)}</span>
                            <span className="flex items-center gap-2"><User className="w-4 h-4" /> {news.author || 'Admin'}</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-2 text-gray-400 hover:text-[#1877F2] transition-colors"><Facebook className="w-5 h-5" /></button>
                            <button className="p-2 text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></button>
                            <button className="p-2 text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Image */}
                {news.image && (
                    <div className="rounded-2xl overflow-hidden shadow-lg mb-10 h-[400px]">
                        <img
                            src={encodeURI(news.image)}
                            alt={news.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Erro+Img';
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none prose-headings:font-['Montserrat'] prose-body:font-['Open_Sans'] prose-img:rounded-xl prose-a:text-[#4A90D9] prose-blockquote:border-[#4A90D9]"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />
            </div>
        </div>
    );
}
