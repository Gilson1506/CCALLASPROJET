import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, CalendarDays, Newspaper, Users, Settings,
    LogOut, Menu, X, Handshake, MessageCircle, Mail, Briefcase, BookOpen,
    Bell, UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Simple Pop Sound (Base64 MP3)
const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA//////////////////////////////////////////////////////////////////uQZAAABAAAAAAAAAAAAAAJAAJA////////////////////////////////////////////////////////////////';
// Note: This matches a silent MP3 header for structure; in real app use a valid file or shorter base64. 
// For demo purposes I will assume a "beep" is desired. 
// A short base64 beep:
const BEEP_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'; // Very short dummy

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState<{ id: number, title: string, message: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        checkUser();
        setupRealtimeSubscription();
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple pop sound
        audioRef.current.volume = 0.5;
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
            setUserEmail(user.email);
            // Check if in admin_users
            const { data, error } = await supabase.from('admin_users').select('email').eq('email', user.email).single();
            if (data) setIsAdmin(true);
            else console.warn('User not in admin_users table:', user.email);
        }
    };

    const setupRealtimeSubscription = () => {
        const channel = supabase
            .channel('admin-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'registrations' },
                (payload) => {
                    handleNewNotification({
                        type: 'registration',
                        title: 'Nova Inscrição!',
                        message: `${payload.new.user_name} inscreveu-se em ${payload.new.event_name}`,
                        time: new Date()
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    handleNewNotification({
                        type: 'message',
                        title: 'Nova Mensagem!',
                        message: `De: ${payload.new.name} - ${payload.new.subject}`,
                        time: new Date()
                    });
                }
            )
            .subscribe((status) => {
                console.log('Realtime Subscription Status:', status);
                if (status === 'CHANNEL_ERROR') {
                    console.error('Falha na conexão Realtime. Verifique se o Realtime está ativado no Supabase para as tabelas registrations e messages.');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleNewNotification = (notif: any) => {
        const newNotif = { id: Date.now(), ...notif, read: false };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show Toast
        setToast({ id: Date.now(), title: notif.title, message: notif.message });
        setTimeout(() => setToast(null), 5000); // Hide after 5s

        // Play Sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed first):", e));
        }
    };

    const markAllRead = () => {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            markAllRead();
        }
    };

    // ... menuItems ...
    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Eventos', path: '/eventos', icon: Calendar },
        { name: 'Calendário', path: '/calendario', icon: CalendarDays },
        { name: 'Notícias', path: '/noticias', icon: Newspaper },
        { name: 'Newsletter', path: '/newsletter', icon: BookOpen },
        { name: 'Inscritos', path: '/inscritos', icon: Users },
        { name: 'Parceiros', path: '/parceiros', icon: Handshake },
        { name: 'Networking', path: '/networking', icon: Briefcase },
        { name: 'Chat ao Vivo', path: '/chat', icon: MessageCircle },
        { name: 'Mensagens', path: '/mensagens', icon: Mail },
        { name: 'Configurações', path: '/config', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('admin_auth');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-[100] bg-white rounded-lg shadow-xl border-l-4 border-blue-500 p-4 animate-slide-in-right max-w-sm flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                        <Bell className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{toast.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 h-6 w-6"><X size={16} /></button>
                </div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between h-16 px-6 bg-[#1e293b]">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Arena Eventos" className="h-8 w-auto" />
                        <span className="text-sm font-bold text-blue-400">Admin</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-[#0f172a]">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-sm">
                        <LogOut size={18} /><span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm z-40 relative">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-[#0f172a]">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">

                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={toggleNotifications}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown/Modal */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden text-left animate-fade-in z-50">
                                    <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-semibold text-gray-700 text-sm">Notificações</h3>
                                        <button onClick={() => setNotifications([])} className="text-xs text-blue-500 hover:underline">Limpar tudo</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-sm">
                                                Nenhuma notificação recente.
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className="p-3 border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 p-1.5 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${notif.type === 'registration' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {notif.type === 'registration' ? <UserPlus size={14} /> : <Mail size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mb-1">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-400">{notif.time.toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 text-center border-t border-gray-50 bg-gray-50">
                                        <Link to="/inscritos" onClick={() => setShowNotifications(false)} className="text-xs text-blue-600 font-medium hover:underline block">Ver Inscritos</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <span className="text-sm font-semibold text-gray-700">{userEmail || 'Carregando...'}</span>
                            <span className={`text-xs ${isAdmin ? 'text-green-600' : 'text-red-500 font-bold'}`}>
                                {isAdmin ? 'Super Admin' : 'Não Autorizado (Verifique SQL)'}
                            </span>
                        </div>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm ${isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                            {userEmail ? (userEmail[0] + userEmail[1]).toUpperCase() : 'AD'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}
        </div>
    );
}
