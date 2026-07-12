import { useState, useEffect, type ReactNode } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, FolderKanban, Wrench, History, CalendarRange,
  Users, Bell, Settings, LogOut, Menu, X, Shield, Search, ChevronDown
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/services', label: 'Services', icon: Wrench },
  { path: '/service-history', label: 'Service History', icon: History },
  { path: '/milestones', label: 'Milestones', icon: CalendarRange },
  { path: '/vendors', label: 'Vendors', icon: Users },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { profile, user, signOut } = useAuth();
  const { path, navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
      setUnreadCount(count || 0);
    })();
  }, [user, path]);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-sm">TechWith Mahesh</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = path === item.path || (item.path !== '/dashboard' && path.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 glass border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display text-lg font-semibold text-slate-900 flex-1">{title}</h1>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <NotificationPreview title="New project assigned" message="CCTV Installation at Tech Corp" time="2m ago" />
                    <NotificationPreview title="Milestone completed" message="Network setup phase 1 done" time="1h ago" />
                    <NotificationPreview title="New service request" message="WiFi installation request from ABC Ltd" time="3h ago" />
                  </div>
                  <Link to="/notifications" onClick={() => setNotifOpen(false)} className="block px-4 py-3 text-center text-sm font-medium text-primary-600 hover:bg-slate-50 border-t border-slate-100">
                    View all notifications
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="w-4 h-4" /> Account Settings
                  </Link>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

function NotificationPreview({ title, message, time }: { title: string; message: string; time: string }) {
  return (
    <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 truncate">{message}</p>
          <p className="text-xs text-slate-400 mt-0.5">{time}</p>
        </div>
      </div>
    </div>
  );
}
