import { useEffect, useState } from 'react';
import { Card, Button, Spinner, EmptyState } from './ui';
import { supabase, type Notification } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setNotifications(data as Notification[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchData();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    fetchData();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    fetchData();
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  const typeIcons = {
    info: { icon: Info, color: 'text-sky-500', bg: 'bg-sky-100' },
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-slate-500 text-sm mt-1">{unreadCount} unread · {notifications.length} total</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-slate-300 overflow-hidden">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-primary-50 text-primary-600' : 'text-slate-500'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-2 text-sm font-medium ${filter === 'unread' ? 'bg-primary-50 text-primary-600' : 'text-slate-500'}`}>Unread</button>
          </div>
          {unreadCount > 0 && <Button variant="outline" onClick={markAllAsRead}><CheckCheck className="w-4 h-4" /> Mark all read</Button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description={filter === 'unread' ? "You're all caught up!" : "Notifications will appear here."} />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const config = typeIcons[notif.type] || typeIcons.info;
            const Icon = config.icon;
            return (
              <Card key={notif.id} hover className={`p-4 group ${!notif.is_read ? 'border-primary-200 bg-primary-50/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                      </div>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">{new Date(notif.created_at).toLocaleString()}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && <button onClick={() => markAsRead(notif.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark read</button>}
                        <button onClick={() => deleteNotification(notif.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
