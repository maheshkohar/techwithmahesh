import { useEffect, useState } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { Card, Badge, Button, Input, Select, Textarea, Modal, ProgressBar, Spinner, EmptyState } from './ui';
import { supabase, type Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, Search, MapPin, DollarSign, Grid3x3, List } from 'lucide-react';

export function ProjectsPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: '', client_name: '', client_email: '', description: '',
    service_type: 'CCTV Installation', status: 'pending', priority: 'medium',
    start_date: '', end_date: '', budget: '', location: '',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setProjects(data as Project[] || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!user || !form.name || !form.client_name) return;
    const { data } = await supabase.from('projects').insert({
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
      user_id: user.id,
    }).select().single();
    if (data) {
      setProjects([data as Project, ...projects]);
      setShowCreate(false);
      setForm({ name: '', client_name: '', client_email: '', description: '', service_type: 'CCTV Installation', status: 'pending', priority: 'medium', start_date: '', end_date: '', budget: '', location: '' });
      navigate(`/projects/${data.id}`);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-slate-500 text-sm mt-1">{projects.length} total projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Project</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input value={search} onChange={setSearch} placeholder="Search projects..." icon={<Search className="w-4 h-4" />} />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} />
        </div>
        <div className="flex rounded-xl border border-slate-300 overflow-hidden">
          <button onClick={() => setView('grid')} className={`px-3 py-2.5 ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}><Grid3x3 className="w-5 h-5" /></button>
          <button onClick={() => setView('list')} className={`px-3 py-2.5 ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}><List className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<FolderKanban className="w-8 h-8" />}
            title="No projects found"
            description={search || statusFilter !== 'all' ? "Try adjusting your filters" : "Create your first project to get started."}
            action={!search && statusFilter === 'all' ? <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Project</Button> : undefined}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card hover className="p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="font-display font-semibold text-slate-900 mb-1 truncate">{project.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{project.client_name}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">{project.service_type}</span>
                    <PriorityBadge priority={project.priority} />
                  </div>
                  {project.location && <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" /> {project.location}</div>}
                  {project.budget && <div className="flex items-center gap-1.5 text-xs text-slate-500"><DollarSign className="w-3.5 h-3.5" /> ${project.budget.toLocaleString()}</div>}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Service</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{project.name}</p>
                          <p className="text-xs text-slate-500 sm:hidden">{project.client_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">{project.client_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{project.service_type}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="w-32">
                        <ProgressBar value={project.progress} />
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Project" size="lg">
        <div className="space-y-4">
          <Input label="Project Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Office CCTV Installation" required />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={form.client_name} onChange={(v) => setForm({ ...form, client_name: v })} placeholder="John Doe" required />
            <Input label="Client Email" type="email" value={form.client_email} onChange={(v) => setForm({ ...form, client_email: v })} placeholder="client@example.com" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Service Type" value={form.service_type} onChange={(v) => setForm({ ...form, service_type: v })} options={[
              { value: 'CCTV Installation', label: 'CCTV Installation' },
              { value: 'Network Infrastructure', label: 'Network Infrastructure' },
              { value: 'WiFi Solutions', label: 'WiFi Solutions' },
              { value: 'Server Setup', label: 'Server Setup' },
              { value: 'Access Control', label: 'Access Control' },
              { value: 'IT Consulting', label: 'IT Consulting' },
            ]} />
            <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Budget ($)" type="number" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="5000" />
            <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="San Francisco, CA" />
          </div>
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Project details..." rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.client_name}>Create Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
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

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'default'; label: string }> = {
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'warning', label: 'Medium' },
    high: { variant: 'error', label: 'High' },
    critical: { variant: 'error', label: 'Critical' },
  };
  const config = map[priority] || map.medium;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
