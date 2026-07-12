import { useState } from 'react';
import { Card, Button, Input, Avatar, Badge, Spinner } from './ui';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Building, Shield, Save, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName,
      company,
      phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={displayName} src={avatarUrl} size="lg" />
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">{displayName}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge variant="primary" >{profile?.role || 'client'}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="John Doe" icon={<User className="w-4 h-4" />} />
          <Input label="Email" value={user?.email || ''} onChange={() => {}} icon={<Mail className="w-4 h-4" />} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company" value={company} onChange={setCompany} placeholder="Your company" icon={<Building className="w-4 h-4" />} />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" icon={<Phone className="w-4 h-4" />} />
          </div>
          <Input label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size="sm" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
          {saved && <span className="flex items-center gap-1 text-sm text-emerald-600 animate-fade-in"><CheckCircle2 className="w-4 h-4" /> Saved successfully</span>}
        </div>
      </Card>

      {/* Security card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Security</h3>
            <p className="text-sm text-slate-500">Your account is protected with Supabase Auth</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">Password</p>
              <p className="text-xs text-slate-500">Last changed recently</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">Two-Factor Auth</p>
              <p className="text-xs text-slate-500">Not enabled</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-red-200">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <Button variant="danger" size="sm">Delete Account</Button>
      </Card>
    </div>
  );
}
