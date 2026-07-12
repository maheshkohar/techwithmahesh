import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Select, Textarea, Modal, Spinner, EmptyState } from './ui';
import { supabase, type Service, type ServiceRequest } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Wrench, Plus, Search, Camera, Network, Wifi, Server, Shield, Cpu,
  DollarSign, Clock, Trash2, Edit3
} from 'lucide-react';

const serviceIcons: Record<string, typeof Camera> = {
  'CCTV Installation': Camera,
  'Network Infrastructure': Network,
  'WiFi Solutions': Wifi,
  'Server Setup': Server,
  'Access Control': Shield,
  'IT Consulting': Cpu,
};

export function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [requestService, setRequestService] = useState<string>('');

  const [form, setForm] = useState({ name: '', category: 'CCTV Installation', description: '', price: '', duration_days: '1', status: 'active' });
  const [reqForm, setReqForm] = useState({ client_name: '', client_email: '', client_phone: '', description: '', scheduled_date: '', location: '', amount: '' });

  const fetchData = async () => {
    if (!user) return;
    const [s, r] = await Promise.all([
      supabase.from('services').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setServices(s.data as Service[] || []);
    setRequests(r.data as ServiceRequest[] || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !form.name) return;
    await supabase.from('services').insert({
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      duration_days: parseInt(form.duration_days) || 1,
      user_id: user.id,
    });
    setShowCreate(false);
    setForm({ name: '', category: 'CCTV Installation', description: '', price: '', duration_days: '1', status: 'active' });
    fetchData();
  };

  const handleEdit = async () => {
    if (!editingService) return;
    await supabase.from('services').update({
      name: form.name,
      category: form.category,
      description: form.description,
      price: form.price ? parseFloat(form.price) : null,
      duration_days: parseInt(form.duration_days) || 1,
      status: form.status,
    }).eq('id', editingService.id);
    setEditingService(null);
    setForm({ name: '', category: 'CCTV Installation', description: '', price: '', duration_days: '1', status: 'active' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  const handleRequest = async () => {
    if (!user || !reqForm.client_name) return;
    const service = services.find(s => s.id === requestService);
    await supabase.from('service_requests').insert({
      ...reqForm,
      service_id: requestService || null,
      service_name: service?.name || 'Custom Service',
      amount: reqForm.amount ? parseFloat(reqForm.amount) : null,
      user_id: user.id,
    });
    setShowRequest(false);
    setReqForm({ client_name: '', client_email: '', client_phone: '', description: '', scheduled_date: '', location: '', amount: '' });
    setRequestService('');
    fetchData();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await supabase.from('service_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Services</h2>
          <p className="text-slate-500 text-sm mt-1">{services.length} services · {requests.length} requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRequest(true)}><Wrench className="w-4 h-4" /> New Request</Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Service</Button>
        </div>
      </div>

      {/* Service catalog */}
      <div>
        <div className="mb-4">
          <Input value={search} onChange={setSearch} placeholder="Search services..." icon={<Search className="w-4 h-4" />} />
        </div>
        {filteredServices.length === 0 ? (
          <Card className="p-6">
            <EmptyState icon={<Wrench className="w-8 h-8" />} title="No services yet" description="Add services to your catalog to start receiving requests." action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Service</Button>} />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const Icon = serviceIcons[service.category] || Wrench;
              return (
                <Card key={service.id} hover className="p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingService(service); setForm({ name: service.name, category: service.category, description: service.description || '', price: service.price?.toString() || '', duration_days: service.duration_days.toString(), status: service.status }); }} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(service.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{service.description || 'No description'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                      {service.price && <span className="flex items-center gap-1 font-medium text-slate-900"><DollarSign className="w-3.5 h-3.5" />{service.price.toLocaleString()}</span>}
                      <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" />{service.duration_days}d</span>
                    </div>
                    <Badge variant={service.status === 'active' ? 'success' : 'default'}>{service.status}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Service requests */}
      <div>
        <h3 className="font-display text-lg font-semibold text-slate-900 mb-4">Service Requests</h3>
        {requests.length === 0 ? (
          <Card className="p-6">
            <EmptyState icon={<Wrench className="w-8 h-8" />} title="No requests yet" description="Service requests from clients will appear here." />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{req.client_name}</p>
                        {req.client_email && <p className="text-xs text-slate-500">{req.client_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{req.service_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{req.amount ? `$${req.amount.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3"><RequestStatusBadge status={req.status} /></td>
                      <td className="px-4 py-3">
                        <Select value={req.status} onChange={(v) => updateRequestStatus(req.id, v)} options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'confirmed', label: 'Confirmed' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'cancelled', label: 'Cancelled' },
                        ]} className="w-36" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create service modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Service">
        <div className="space-y-4">
          <Input label="Service Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. 4K Camera Installation" required />
          <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={[
            { value: 'CCTV Installation', label: 'CCTV Installation' },
            { value: 'Network Infrastructure', label: 'Network Infrastructure' },
            { value: 'WiFi Solutions', label: 'WiFi Solutions' },
            { value: 'Server Setup', label: 'Server Setup' },
            { value: 'Access Control', label: 'Access Control' },
            { value: 'IT Consulting', label: 'IT Consulting' },
          ]} />
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Service description..." rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="500" />
            <Input label="Duration (days)" type="number" value={form.duration_days} onChange={(v) => setForm({ ...form, duration_days: v })} placeholder="1" />
          </div>
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'draft', label: 'Draft' },
          ]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name}>Add Service</Button>
          </div>
        </div>
      </Modal>

      {/* Edit service modal */}
      <Modal open={!!editingService} onClose={() => setEditingService(null)} title="Edit Service">
        <div className="space-y-4">
          <Input label="Service Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={[
            { value: 'CCTV Installation', label: 'CCTV Installation' },
            { value: 'Network Infrastructure', label: 'Network Infrastructure' },
            { value: 'WiFi Solutions', label: 'WiFi Solutions' },
            { value: 'Server Setup', label: 'Server Setup' },
            { value: 'Access Control', label: 'Access Control' },
            { value: 'IT Consulting', label: 'IT Consulting' },
          ]} />
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <Input label="Duration (days)" type="number" value={form.duration_days} onChange={(v) => setForm({ ...form, duration_days: v })} />
          </div>
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'draft', label: 'Draft' },
          ]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Request modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="New Service Request">
        <div className="space-y-4">
          <Select label="Service" value={requestService} onChange={setRequestService} options={[{ value: '', label: 'Custom Service' }, ...services.map(s => ({ value: s.id, label: s.name }))]} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={reqForm.client_name} onChange={(v) => setReqForm({ ...reqForm, client_name: v })} required />
            <Input label="Client Email" type="email" value={reqForm.client_email} onChange={(v) => setReqForm({ ...reqForm, client_email: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Phone" value={reqForm.client_phone} onChange={(v) => setReqForm({ ...reqForm, client_phone: v })} />
            <Input label="Scheduled Date" type="date" value={reqForm.scheduled_date} onChange={(v) => setReqForm({ ...reqForm, scheduled_date: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Location" value={reqForm.location} onChange={(v) => setReqForm({ ...reqForm, location: v })} />
            <Input label="Amount ($)" type="number" value={reqForm.amount} onChange={(v) => setReqForm({ ...reqForm, amount: v })} />
          </div>
          <Textarea label="Description" value={reqForm.description} onChange={(v) => setReqForm({ ...reqForm, description: v })} rows={2} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button onClick={handleRequest} disabled={!reqForm.client_name}>Create Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
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
