import { useEffect, useState } from 'react';
import { Link } from '../context/RouterContext';
import { Card, Badge, ProgressBar, Button, Spinner, EmptyState } from './ui';
import { supabase, type Project, type ServiceRequest, type ServiceHistory, type Notification } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban, DollarSign, CheckCircle2, Clock, TrendingUp,
  ArrowRight, Activity, Wrench, Calendar, Users
} from 'lucide-react';

export function DashboardOverview() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [history, setHistory] = useState<ServiceHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [p, r, h, n] = await Promise.all([
          supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('service_history').select('*').eq('user_id', user.id).order('completed_date', { ascending: false }),
          supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false),
        ]);
        setProjects((p.data as Project[]) || []);
        setRequests((r.data as ServiceRequest[]) || []);
        setHistory((h.data as ServiceHistory[]) || []);
        setNotifications((n.data as Notification[]) || []);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const totalRevenue = history.reduce((sum, h) => sum + (h.amount || 0), 0);
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  const stats = [
    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', iconColor: 'text-sky-600', change: '+12%' },
    { label: 'Completed', value: completedProjects, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', change: '+8%' },
    { label: 'Pending Requests', value: pendingRequests, icon: Clock, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', iconColor: 'text-amber-600', change: '+3%' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', iconColor: 'text-violet-600', change: '+24%' },
  ];

  const recentProjects = projects.slice(0, 5);
  const recentActivity = history.slice(0, 4);

  // Build last 6 months revenue data for chart
  const monthlyRevenue = buildMonthlyRevenue(history);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-600 to-accent-600 p-6 sm:p-8 text-white overflow-hidden gradient-animate">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-300/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Welcome back, {firstName}!</h2>
            <p className="text-primary-100">Here's what's happening with your projects today.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/projects"><Button className="bg-white text-primary-700 hover:bg-slate-100" size="sm">View Projects <ArrowRight className="w-4 h-4" /></Button></Link>
              <Link to="/services"><Button className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" size="sm">Browse Services</Button></Link>
            </div>
          </div>
          <div className="hidden sm:flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-primary-100">Total Projects</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold">{history.length}</p>
              <p className="text-xs text-primary-100">Services Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue chart + Recent activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500">Last 6 months performance</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 flex items-center gap-0.5 justify-end">
                <TrendingUp className="w-3 h-3" /> +24% vs last period
              </p>
            </div>
          </div>
          <RevenueChart data={monthlyRevenue} />
        </Card>

        {/* Recent activity */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-5">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-8 h-8" />}
              title="No activity yet"
              description="Completed services will appear here."
            />
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.service_name}</p>
                    <p className="text-xs text-slate-500">{item.client_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.completed_date ? new Date(item.completed_date).toLocaleDateString() : ''}</p>
                  </div>
                  {item.amount && <p className="text-sm font-semibold text-slate-700 flex-shrink-0">${item.amount.toLocaleString()}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent projects + Service requests */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent projects */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-slate-900">Recent Projects</h3>
            <Link to="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-8 h-8" />}
              title="No projects yet"
              description="Create your first project to start tracking installations and services."
              action={<Link to="/projects"><Button size="sm">New Project</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{project.name}</p>
                      <p className="text-xs text-slate-500">{project.client_name} · {project.service_type}</p>
                    </div>
                    <div className="hidden sm:block w-32">
                      <ProgressBar value={project.progress} />
                      <p className="text-xs text-slate-400 mt-1 text-right">{project.progress}%</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick stats sidebar */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-5">Quick Stats</h3>
          <div className="space-y-4">
            <QuickStatRow icon={FolderKanban} label="Total Projects" value={projects.length} color="text-sky-600 bg-sky-50" />
            <QuickStatRow icon={Wrench} label="Service Requests" value={requests.length} color="text-amber-600 bg-amber-50" />
            <QuickStatRow icon={CheckCircle2} label="Completed Jobs" value={history.length} color="text-emerald-600 bg-emerald-50" />
            <QuickStatRow icon={Calendar} label="Pending Tasks" value={pendingRequests} color="text-violet-600 bg-violet-50" />
            <QuickStatRow icon={Users} label="Unread Alerts" value={notifications.length} color="text-red-600 bg-red-50" />
          </div>
        </Card>
      </div>

      {/* Service requests */}
      {requests.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-slate-900">Service Requests</h3>
            <Link to="/services" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-sm font-medium text-slate-900">{req.client_name}</td>
                    <td className="py-3 text-sm text-slate-600">{req.service_name}</td>
                    <td className="py-3 text-sm text-slate-500 hidden sm:table-cell">{req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : '—'}</td>
                    <td className="py-3"><RequestStatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function QuickStatRow({ icon: Icon, label, value, color }: { icon: typeof FolderKanban; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="font-display text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full flex-1 flex items-end relative">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-accent-400 transition-all duration-500 hover:from-primary-600 hover:to-accent-500 relative group-hover:opacity-90"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                ${d.value.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function buildMonthlyRevenue(history: ServiceHistory[]): { month: string; value: number }[] {
  const months: { month: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const value = history
      .filter(h => {
        if (!h.completed_date) return false;
        const date = new Date(h.completed_date);
        return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
      })
      .reduce((sum, h) => sum + (h.amount || 0), 0);
    months.push({ month: monthName, value });
  }
  return months;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string }> = {
    in_progress: { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    pending: { variant: 'warning', label: 'Pending' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    on_hold: { variant: 'default', label: 'On Hold' },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function RequestStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'info', label: 'Confirmed' },
    in_progress: { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
