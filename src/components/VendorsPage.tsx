import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Select, Textarea, Modal, Spinner, EmptyState, Avatar } from './ui';
import { supabase, type Vendor } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Star, Mail, Phone, MapPin, Trash2, Edit3, Package } from 'lucide-react';

export function VendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', category: 'Equipment Supplier', status: 'active', rating: '4.0', location: '', notes: '' });

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('vendors').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setVendors(data as Vendor[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.name) return;
    if (editing) {
      await supabase.from('vendors').update({
        name: form.name, company: form.company, email: form.email, phone: form.phone,
        category: form.category, status: form.status, rating: parseFloat(form.rating),
        location: form.location, notes: form.notes,
      }).eq('id', editing.id);
      setEditing(null);
    } else {
      await supabase.from('vendors').insert({
        ...form, rating: parseFloat(form.rating), user_id: user.id,
      });
      setShowCreate(false);
    }
    setForm({ name: '', company: '', email: '', phone: '', category: 'Equipment Supplier', status: 'active', rating: '4.0', location: '', notes: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('vendors').delete().eq('id', id);
    fetchData();
  };

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || (v.company || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Vendors</h2>
          <p className="text-slate-500 text-sm mt-1">{vendors.length} vendors in your network</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Vendor</Button>
      </div>

      <Input value={search} onChange={setSearch} placeholder="Search vendors..." icon={<Search className="w-4 h-4" />} />

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Users className="w-8 h-8" />} title="No vendors yet" description="Add vendors and suppliers to manage your network." action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Vendor</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vendor) => (
            <Card key={vendor.id} hover className="p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={vendor.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                    {vendor.company && <p className="text-xs text-slate-500">{vendor.company}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(vendor); setForm({ name: vendor.name, company: vendor.company || '', email: vendor.email || '', phone: vendor.phone || '', category: vendor.category || 'Equipment Supplier', status: vendor.status, rating: vendor.rating.toString(), location: vendor.location || '', notes: vendor.notes || '' }); }} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(vendor.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {vendor.category && <Badge variant="info">{vendor.category}</Badge>}
                {vendor.email && <div className="flex items-center gap-2 text-sm text-slate-500"><Mail className="w-3.5 h-3.5" /> {vendor.email}</div>}
                {vendor.phone && <div className="flex items-center gap-2 text-sm text-slate-500"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</div>}
                {vendor.location && <div className="flex items-center gap-2 text-sm text-slate-500"><MapPin className="w-3.5 h-3.5" /> {vendor.location}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-slate-700">{vendor.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Package className="w-3.5 h-3.5" /> {vendor.total_orders} orders
                </div>
                <Badge variant={vendor.status === 'active' ? 'success' : vendor.status === 'pending' ? 'warning' : 'default'}>{vendor.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal open={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); }} title={editing ? 'Edit Vendor' : 'Add Vendor'}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={[
              { value: 'Equipment Supplier', label: 'Equipment Supplier' },
              { value: 'CCTV Manufacturer', label: 'CCTV Manufacturer' },
              { value: 'Network Hardware', label: 'Network Hardware' },
              { value: 'Software Provider', label: 'Software Provider' },
              { value: 'Cabling', label: 'Cabling' },
              { value: 'Other', label: 'Other' },
            ]} />
            <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
            ]} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <Input label="Rating" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={2} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? 'Save Changes' : 'Add Vendor'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
