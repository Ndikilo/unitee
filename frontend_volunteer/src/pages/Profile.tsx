import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { Edit, Save, X, Award, Clock, Calendar, Heart, Shield, Loader2, Camera, Upload, CheckCircle, AlertTriangle, Plus, Building } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const toBase64 = (file) =>
  new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

const ImageUpload = ({ value, onChange, shape = 'circle', placeholder = 'Upload', fullWidth }) => {
  const ref = useRef(null);
  const cls = fullWidth ? 'h-36 w-full rounded-2xl' : shape === 'circle' ? 'h-24 w-24 rounded-full' : 'h-20 w-20 rounded-2xl';
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    onChange(await toBase64(file));
  };
  return (
    <div onClick={() => ref.current?.click()} className={`${cls} relative cursor-pointer group overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-400 transition-colors bg-gray-50 flex items-center justify-center`}>
      {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-1 text-gray-400"><Camera size={20} /><span className="text-xs">{placeholder}</span></div>}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload size={20} className="text-white" /></div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
};

const TagInput = ({ tags, onChange, placeholder, disabled }) => {
  const [val, setVal] = useState('');
  const add = () => { const t = val.trim(); if (t && !tags.includes(t)) { onChange([...tags, t]); setVal(''); } };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t, i) => <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">{t}{!disabled && <button onClick={() => onChange(tags.filter((_, j) => j !== i))}><X size={12} /></button>}</span>)}
        {!tags.length && <span className="text-sm text-gray-400">None added yet</span>}
      </div>
      {!disabled && <div className="flex gap-2"><Input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} className="h-9 text-sm" /><Button type="button" variant="outline" size="sm" onClick={add}><Plus size={14} /></Button></div>}
    </div>
  );
};

const setOrg = (setForm, key, val) => setForm(f => ({ ...f, organization: { ...f.organization, [key]: val } }));

const Profile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const isOrg = authUser?.userType === 'organization' || authUser?.role === 'organizer';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await authAPI.getProfile(); setData(d); setForm(d); }
    catch { toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const save = async () => {
    try {
      setSaving(true);
      const payload = isOrg
        ? { accountName: form?.account?.name || form?.name, organization: form?.organization, preferences: form?.preferences }
        : form;
      await authAPI.updateProfile(payload);
      await load();
      if (refreshUser) await refreshUser();
      setEditing(false);
      toast({ title: 'Saved', description: 'Profile updated' });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to save', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sp = (k, v) => setForm(f => ({ ...f, profile: { ...f.profile, [k]: v } }));
  const gf = (k) => editing ? form?.[k] : data?.[k];
  const gp = (k) => editing ? form?.profile?.[k] : data?.profile?.[k];
  const go = (k) => editing ? form?.organization?.[k] : data?.organization?.[k];
  const so = (k, v) => setOrg(setForm, k, v);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></DashboardLayout>;
  if (!data) return <DashboardLayout><Alert><AlertDescription>Failed to load profile.</AlertDescription></Alert></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isOrg ? 'Organization Profile' : 'My Profile'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{isOrg ? 'Manage your organization details' : 'Manage your personal information'}</p>
          </div>
          {!editing
            ? <Button onClick={() => setEditing(true)} className="bg-orange-500 hover:bg-orange-600 text-white"><Edit size={16} className="mr-2" />Edit Profile</Button>
            : <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setForm(data); setEditing(false); }} disabled={saving}><X size={16} className="mr-2" />Cancel</Button>
                <Button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">{saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}Save</Button>
              </div>
          }
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">{isOrg ? 'Organization' : 'Profile'}</TabsTrigger>
            {!isOrg && <TabsTrigger value="stats">Stats & Badges</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {!isOrg && (
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
                <div className="flex items-start gap-6 mb-6">
                  {editing
                    ? <div className="flex flex-col items-center gap-1"><ImageUpload value={form?.profile?.avatar} onChange={b => sp('avatar', b)} shape="circle" placeholder="Photo" /><span className="text-xs text-gray-400">Max 2MB</span></div>
                    : <div className="h-24 w-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200 flex-shrink-0">{data?.profile?.avatar ? <img src={data.profile.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-orange-500">{data?.name?.[0]?.toUpperCase()}</span>}</div>
                  }
                  <div>
                    <p className="text-xl font-bold text-gray-900">{data?.name}</p>
                    <p className="text-sm text-gray-500">{data?.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Volunteer</span>
                      {data?.emailVerified && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={10} />Verified</span>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</Label><Input value={gf('name') || ''} onChange={e => sf('name', e.target.value)} disabled={!editing} className="h-10" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Email</Label><Input value={data?.email} disabled className="h-10 bg-gray-50" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Phone</Label><Input value={gp('phone') || ''} onChange={e => sp('phone', e.target.value)} disabled={!editing} placeholder="+237 6XX XXX XXX" className="h-10" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</Label><Input type="date" value={gp('dateOfBirth') ? new Date(gp('dateOfBirth')).toISOString().split('T')[0] : ''} onChange={e => sp('dateOfBirth', e.target.value)} disabled={!editing} className="h-10" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">City</Label><Input value={gp('city') || ''} onChange={e => sp('city', e.target.value)} disabled={!editing} placeholder="Yaoundé" className="h-10" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Country</Label><Input value={gp('country') || 'Cameroon'} onChange={e => sp('country', e.target.value)} disabled={!editing} className="h-10" /></div>
                </div>
                <div className="mt-4 space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Bio</Label><Textarea value={gp('bio') || ''} onChange={e => sp('bio', e.target.value)} disabled={!editing} placeholder="Tell us about yourself..." rows={3} /></div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Skills & Interests</h2>
                <div className="space-y-5">
                  <div><Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Skills</Label><TagInput tags={editing ? (form?.profile?.skills || []) : (data?.profile?.skills || [])} onChange={t => sp('skills', t)} placeholder="Add a skill" disabled={!editing} /></div>
                  <div><Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Interests</Label><TagInput tags={editing ? (form?.profile?.interests || []) : (data?.profile?.interests || [])} onChange={t => sp('interests', t)} placeholder="Add an interest" disabled={!editing} /></div>
                </div>
              </div>
            </TabsContent>
          )}

          {isOrg && (
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-800">
                  {go('banner') && <img src={go('banner')} alt="banner" className="w-full h-full object-cover" />}
                  {editing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageUpload value={form?.organization?.banner} onChange={b => so('banner', b)} shape="rect" placeholder="Upload Banner" fullWidth />
                    </div>
                  )}
                  {!editing && !go('banner') && <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/40 text-sm">No banner — click Edit to upload</span></div>}
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-10 mb-5">
                    {editing
                      ? <ImageUpload value={form?.organization?.logo} onChange={b => so('logo', b)} shape="rect" placeholder="Logo" />
                      : <div className="h-20 w-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">{go('logo') ? <img src={go('logo')} alt="logo" className="w-full h-full object-contain" /> : <Building size={32} className="text-blue-400" />}</div>
                    }
                    <div className="pb-1">
                      <p className="text-xl font-bold text-gray-900">{go('name') || data?.name}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Organization</span>
                        {data?.verification?.status === 'verified' && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={10} />Verified</span>}
                        {data?.verification?.status === 'pending' && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><AlertTriangle size={10} />Pending Verification</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Organization Name</Label><Input value={go('name') || ''} onChange={e => so('name', e.target.value)} disabled={!editing} className="h-10" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Organization Type</Label>
                      {editing ? <select value={go('type') || ''} onChange={e => so('type', e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select type</option>{['NGO / Non-profit','Community Based Org','Government Agency','School / University','Religious Organization','Other'].map(t => <option key={t} value={t}>{t}</option>)}</select>
                      : <Input value={go('type') || '-'} disabled className="h-10 bg-gray-50" />}
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Contact Person</Label><Input value={gf('name') || ''} onChange={e => sf('name', e.target.value)} disabled={!editing} className="h-10" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Email</Label><Input value={data?.email} disabled className="h-10 bg-gray-50" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Phone</Label><Input value={go('phone') || ''} onChange={e => so('phone', e.target.value)} disabled={!editing} placeholder="+237 6XX XXX XXX" className="h-10" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Website</Label><Input value={go('website') || ''} onChange={e => so('website', e.target.value)} disabled={!editing} placeholder="https://yourorg.org" className="h-10" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">City</Label><Input value={go('city') || ''} onChange={e => so('city', e.target.value)} disabled={!editing} placeholder="Douala" className="h-10" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Region</Label>
                      {editing ? <select value={go('region') || ''} onChange={e => so('region', e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select region</option>{['Adamawa','Centre','East','Far North','Littoral','North','North West','South','South West','West'].map(r => <option key={r} value={r}>{r}</option>)}</select>
                      : <Input value={go('region') || '-'} disabled className="h-10 bg-gray-50" />}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5"><Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label><Textarea value={go('description') || ''} onChange={e => so('description', e.target.value)} disabled={!editing} placeholder="Describe your organization's mission..." rows={4} /></div>
                </div>
              </div>
            </TabsContent>
          )}

          {!isOrg && (
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Hours Volunteered', value: data?.stats?.totalHours || 0, icon: Clock, color: 'text-blue-500' }, { label: 'Events Attended', value: data?.stats?.totalEvents || 0, icon: Calendar, color: 'text-green-500' }, { label: 'People Helped', value: data?.stats?.peopleHelped || 0, icon: Heart, color: 'text-red-500' }].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                    <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                    <s.icon size={40} className={`${s.color} opacity-20`} />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Badges</h2>
                {data?.stats?.badges?.length > 0
                  ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{data.stats.badges.map((b, i) => <div key={i} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100"><span className="text-3xl">{b.icon}</span><div><p className="font-semibold text-gray-900 text-sm">{b.name}</p><p className="text-xs text-gray-500 mt-0.5">{b.description}</p></div></div>)}</div>
                  : <div className="text-center py-12"><Award size={48} className="mx-auto text-gray-200 mb-3" /><p className="text-gray-500">No badges yet</p></div>
                }
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[{ key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' }, { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' }, { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Receive urgent community alerts' }].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                    <Switch checked={editing ? form?.preferences?.[item.key] : data?.preferences?.[item.key]} onCheckedChange={v => setForm(f => ({ ...f, preferences: { ...f.preferences, [item.key]: v } }))} disabled={!editing} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Account Security</h2>
              <Button variant="outline" onClick={() => window.location.href = '/settings'} className="w-full">Change Password</Button>
              <div className="mt-4 flex gap-2 flex-wrap">
                {data?.emailVerified && <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1"><Shield size={12} />Email Verified</span>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
