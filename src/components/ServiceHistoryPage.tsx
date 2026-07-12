import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Select, Textarea, Modal, Spinner, EmptyState } from './ui';
import { supabase, type ServiceHistory } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { History, Plus, Search, Star, DollarSign, Calendar, Trash2, Award } from 'lucide-react';

export function ServiceHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_name: '', service_name: '', category: 'CCTV Installation', technician: '', completed_date: '', amount: '', rating: '5', notes: '' });

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('service_history').select('*').eq('user_id', user.id).order('completed_date', { ascending: false });
    setHistory(data as ServiceHistory[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async () => {
    if (!user || !form.client_name || !form.service_name) return;
    await supabase.from('service_history').insert({
      ...form,
      amount: form.amount ? parseFloat(form.amount) : null,
      rating: parseInt(form.rating) || null,
      user_id: user.id,
    });
    setShowCreate(false);
    setForm({ client_name: '', service_name: '', category: 'CCTV Installation', technician: '', completed_date: '', amount: '', rating: '5', notes: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('service_history').delete().eq('id', id);
    fetchData();
  };

  const filtered = history.filter(h =>
    h.client_name.toLowerCase().includes(search.toLowerCase()) ||
    h.service_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = history.reduce((sum, h) => sum + (h.amount || 0), 0);
  const avgRating = history.length > 0 ? (history.reduce((sum, h) => sum + (h.rating || 0), 0) / history.length).toFixed(1) : '0.0';

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Service History</h2>
          <p className="text-slate-500 text-sm mt-1">{history.length} completed services</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Record</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
            <span className="text-sm text-slate-500">Total Revenue</span>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Star className="w-5 h-5 text-amber-600" /></div>
            <span className="text-sm text-slate-500">Avg Rating</span>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{avgRating} / 5</p>
        </Card>
        <Card className="p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><Award className="w-5 h-5 text-primary-600" /></div>
            <span className="text-sm text-slate-500">Total Services</span>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{history.length}</p>
        </Card>
      </div>

      {/* Search */}
      <Input value={search} onChange={setSearch} placeholder="Search by client or service..." icon={<Search className="w-4 h-4" />} />

      {/* History list */}
      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<History className="w-8 h-8" />} title="No service history" description="Completed service records will appear here." action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Record</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} hover className="p-5 group">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.service_name}</h3>
                      <p className="text-sm text-slate-500">{item.client_name}{item.technician && ` · Technician: ${item.technician}`}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    {item.category && <Badge variant="info">{item.category}</Badge>}
                    {item.completed_date && <span className="flex items-center gap-1 text-slate-500"><Calendar className="w-3.5 h-3.5" /> {new Date(item.completed_date).toLocaleDateString()}</span>}
                    {item.amount && <span className="flex items-center gap-1 text-slate-700 font-medium"><DollarSign className="w-3.5 h-3.5" /> {item.amount.toLocaleString()}</span>}
                    {item.rating && (
                      <span className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= item.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                      </span>
                    )}
                  </div>
                  {item.notes && <p className="text-sm text-slate-500 mt-2">{item.notes}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Service Record">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={form.client_name} onChange={(v) => setForm({ ...form, client_name: v })} required />
            <Input label="Service Name" value={form.service_name} onChange={(v) => setForm({ ...form, service_name: v })} placeholder="e.g. CCTV Maintenance" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={[
              { value: 'CCTV Installation', label: 'CCTV Installation' },
              { value: 'Network Infrastructure', label: 'Network Infrastructure' },
              { value: 'WiFi Solutions', label: 'WiFi Solutions' },
              { value: 'Server Setup', label: 'Server Setup' },
              { value: 'Access Control', label: 'Access Control' },
              { value: 'IT Consulting', label: 'IT Consulting' },
            ]} />
            <Input label="Technician" value={form.technician} onChange={(v) => setForm({ ...form, technician: v })} placeholder="Tech name" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Completed Date" type="date" value={form.completed_date} onChange={(v) => setForm({ ...form, completed_date: v })} />
            <Input label="Amount ($)" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
            <Select label="Rating" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} options={[
              { value: '5', label: '5 Stars' }, { value: '4', label: '4 Stars' }, { value: '3', label: '3 Stars' }, { value: '2', label: '2 Stars' }, { value: '1', label: '1 Star' },
            ]} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.client_name || !form.service_name}>Add Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
