import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Calendar, TrendingUp, Users,
    Activity, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getEvents, getRegistrations, getSubscribers, getMessages } from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Dashboard() {
    const [stats, setStats] = useState({ events: 0, registrations: 0, subscribers: 0, messages: 0 });
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [evts, regs, subs, msgs] = await Promise.all([
                getEvents().catch(() => []),
                getRegistrations().catch(() => []),
                getSubscribers().catch(() => []),
                getMessages().catch(() => [])
            ]);
            setEvents(evts || []);
            setStats({
                events: (evts || []).length,
                registrations: (regs || []).length,
                subscribers: (subs || []).length,
                messages: (msgs || []).filter((m: any) => m.status === 'unread').length
            });
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // Group events by category for pie chart
    const categoryMap: Record<string, number> = {};
    events.forEach(e => { const cat = e.category || 'Outro'; categoryMap[cat] = (categoryMap[cat] || 0) + 1; });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Group events by month for charts
    const monthMap: Record<string, { eventos: number; inscritos: number }> = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    events.forEach(e => {
        if (e.date) {
            const d = new Date(e.date);
            const m = months[d.getMonth()];
            if (!monthMap[m]) monthMap[m] = { eventos: 0, inscritos: 0 };
            monthMap[m].eventos++;
        }
    });
    const monthlyData = months.filter(m => monthMap[m]).map(m => ({ name: m, ...monthMap[m] }));

    const statCards = [
        { name: 'Total Eventos', value: stats.events.toString(), icon: Calendar, color: 'bg-blue-500' },
        { name: 'Inscrições', value: stats.registrations.toString(), icon: Users, color: 'bg-purple-500' },
        { name: 'Newsletter', value: stats.subscribers.toString(), icon: TrendingUp, color: 'bg-green-500' },
        { name: 'Msgs Não Lidas', value: stats.messages.toString(), icon: LayoutDashboard, color: 'bg-amber-500' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500">Carregando dashboard...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Visão geral do sistema</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs font-medium">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Eventos por Mês</h2>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Area type="monotone" dataKey="eventos" stroke="#3b82f6" strokeWidth={2} fill="url(#colorInscritos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">Nenhum dado disponível</div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Categorias</h2>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {categoryData.map((_, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">Nenhum dado disponível</div>
                    )}
                </div>
            </div>

            {/* Bar Chart + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Eventos por Mês</h2>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="eventos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">Nenhum dado disponível</div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" />Últimos Eventos
                    </h2>
                    <div className="space-y-3">
                        {events.slice(0, 5).map((event) => (
                            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${event.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700">{event.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{event.date ? new Date(event.date).toLocaleDateString('pt-AO') : ''} – {event.location}</p>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum evento ainda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
