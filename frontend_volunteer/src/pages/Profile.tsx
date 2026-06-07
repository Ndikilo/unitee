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
import BackButton from '@/components/ui/BackButton';
import {
  Edit, Save, X, Award, Clock, Calendar, Heart, Shield, Loader2, Camera, Upload,
  CheckCircle, AlertTriangle, Plus, Building, Globe, Phone, MapPin, Mail, Star,
  Link as LinkIcon
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const ImageUpload: React.FC<{
  value?: string;
  onChange: (b: string) => void;
  shape?: 'circle' | 'rect';
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
}> = ({ value, onChange, shape = 'circle', placeholder = 'Upload', fullWidth, className }) => {
  const ref = useRef<HTMLInputElement>(null);
  const cls = className || (fullWidth ? 'h-36 w-full rounded-2xl' : shape === 'circle' ? 'h-24 w-24 rounded-full' : 'h-20 w-20 rounded-2xl');
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    onChange(await toBase64(file));
  };
  return (
    <div
      onClick={() => ref.current?.click()}
      className={`${cls} relative cursor-pointer group overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-400 transition-colors bg-gray-50 flex items-center justify-center`}
    >
      {value
        ? <img src={value} alt="" className="w-full h-full object-cover" />
        : <div className="flex flex-col items-center gap-1 text-gray-400"><Camera size={20} /><span className="text-xs">{placeholder}</span></div>
      }
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Upload size={20} className="text-white" />
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
};

const TagInput: React.FC<{
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}> = ({ tags, onChange, placeholder, disabled }) => {
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) { onChange([...tags, t]); setVal(''); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
            {t}
            {!disabled && <button onClick={() => onChange(tags.filter((_, j) => j !== i))}><X size={12} /></button>}
          </span>
        ))}
        {!tags.length && <span className="text-sm text-gray-400">None added yet</span>}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            className="h-9 text-sm" />
          <Button type="button" variant="outline" size="sm" onClick={add}><Plus size={14} /></Button>
        </div>
      )}
    </div>
  );
};

const FieldRow: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
      {icon}{label}
    </Label>
    {children}
  </div>
);

const REGIONS = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West'];
const ORG_TYPES = ['NGO / Non-profit', 'Community Based Org', 'Government Agency', 'School / University', 'Religious Organization', 'Other'];

const Profile: React.FC = () => {
  const { user: authUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const isOrg = authUser?.role === 'organizer';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const d = await authAPI.getProfile();
      setData(d);
      setForm(d);
    } catch {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const payload = isOrg
        ? {
            name: form?.name,
            organizationName: form?.organizationName,
            organizationDescription: form?.organizationDescription,
            organizationType: form?.organizationType,
            organizationPhone: form?.organizationPhone,
            organizationWebsite: form?.organizationWebsite,
            organizationCity: form?.organizationCity,
            organizationRegion: form?.organizationRegion,
            organizationLogo: form?.organizationLogo,
            organizationBanner: form?.organizationBanner,
            preferences: form?.preferences,
          }
        : form;
      await authAPI.updateProfile(payload);
      await load();
      if (refreshUser) await refreshUser();
      setEditing(false);
      toast({ title: 'Saved', description: 'Profile updated successfully' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const sf = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const sp = (k: string, v: any) => setForm((f: any) => ({ ...f, profile: { ...f.profile, [k]: v } }));
  const gf = (k: string) => editing ? form?.[k] : data?.[k];
  const gp = (k: string) => editing ? form?.profile?.[k] : data?.profile?.[k];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout>
      <Alert><AlertDescription>Failed to load profile.</AlertDescription></Alert>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <BackButton />
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOrg ? 'Organization Profile' : 'My Profile'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isOrg ? 'Manage your organization details and public presence' : 'Manage your personal information and preferences'}
            </p>
          </div>
          {!editing
            ? <Button onClick={() => setEditing(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Edit size={15} />Edit Profile
              </Button>
            : <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setForm(data); setEditing(false); }} disabled={saving}>
                  <X size={15} className="mr-1" />Cancel
                </Button>
                <Button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Changes
                </Button>
              </div>
          }
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">{isOrg ? 'Organization' : 'Profile'}</TabsTrigger>
            {!isOrg && <TabsTrigger value="stats">Stats & Badges</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── VOLUNTEER PROFILE ───────────────────────────────────────── */}
          {!isOrg && (
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
                <div className="flex items-start gap-6 mb-6">
                  {editing
                    ? <div className="flex flex-col items-center gap-1">
                        <ImageUpload value={form?.profile?.avatar} onChange={b => sp('avatar', b)} shape="circle" placeholder="Photo" />
                        <span className="text-xs text-gray-400">Max 2MB</span>
                      </div>
                    : <div className="h-24 w-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200 flex-shrink-0">
                        {data?.profile?.avatar
                          ? <img src={data.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                          : <span className="text-3xl font-bold text-orange-500">{data?.name?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                  }
                  <div>
                    <p className="text-xl font-bold text-gray-900">{data?.name}</p>
                    <p className="text-sm text-gray-500">{data?.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Volunteer</span>
                      {data?.emailVerified && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle size={10} />Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Full Name">
                    <Input value={gf('name') || ''} onChange={e => sf('name', e.target.value)} disabled={!editing} className="h-10" />
                  </FieldRow>
                  <FieldRow label="Email">
                    <Input value={data?.email} disabled className="h-10 bg-gray-50" />
                  </FieldRow>
                  <FieldRow label="Phone" icon={<Phone size={12} />}>
                    <Input value={gp('phone') || ''} onChange={e => sp('phone', e.target.value)} disabled={!editing} placeholder="+237 6XX XXX XXX" className="h-10" />
                  </FieldRow>
                  <FieldRow label="Date of Birth">
                    <Input type="date" value={gp('dateOfBirth') ? new Date(gp('dateOfBirth')).toISOString().split('T')[0] : ''}
                      onChange={e => sp('dateOfBirth', e.target.value)} disabled={!editing} className="h-10" />
                  </FieldRow>
                  <FieldRow label="City" icon={<MapPin size={12} />}>
                    <Input value={gp('city') || ''} onChange={e => sp('city', e.target.value)} disabled={!editing} placeholder="Yaoundé" className="h-10" />
                  </FieldRow>
                  <FieldRow label="Country">
                    <Input value={gp('country') || 'Cameroon'} onChange={e => sp('country', e.target.value)} disabled={!editing} className="h-10" />
                  </FieldRow>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Bio</Label>
                  <Textarea value={gp('bio') || ''} onChange={e => sp('bio', e.target.value)} disabled={!editing}
                    placeholder="Tell us about yourself..." rows={3} />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Skills & Interests</h2>
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Skills</Label>
                    <TagInput tags={editing ? (form?.profile?.skills || []) : (data?.profile?.skills || [])}
                      onChange={t => sp('skills', t)} placeholder="Add a skill" disabled={!editing} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Interests</Label>
                    <TagInput tags={editing ? (form?.profile?.interests || []) : (data?.profile?.interests || [])}
                      onChange={t => sp('interests', t)} placeholder="Add an interest" disabled={!editing} />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* ── ORGANIZATION PROFILE ────────────────────────────────────── */}
          {isOrg && (
            <TabsContent value="profile" className="space-y-6">

              {/* Hero card: banner + logo */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="relative h-44 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
                  {(editing ? form?.organizationBanner : data?.organizationBanner)
                    ? <img src={editing ? form.organizationBanner : data.organizationBanner} alt="banner" className="w-full h-full object-cover" />
                    : (!editing && <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Building size={80} className="text-white" />
                      </div>)
                  }
                  {editing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <ImageUpload
                        value={form?.organizationBanner}
                        onChange={b => sf('organizationBanner', b)}
                        shape="rect"
                        placeholder="Click to upload banner (1200×300 recommended)"
                        className="h-full w-full rounded-none border-0"
                      />
                    </div>
                  )}
                  {!editing && (
                    <div className="absolute top-3 right-3">
                      {data?.organizationVerificationStatus === 'verified'
                        ? <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <CheckCircle size={12} />Verified Organization
                          </span>
                        : data?.organizationVerificationStatus === 'pending'
                        ? <span className="px-3 py-1 bg-yellow-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <AlertTriangle size={12} />Pending Verification
                          </span>
                        : null
                      }
                    </div>
                  )}
                </div>

                {/* Logo + org name strip */}
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-5 -mt-10 mb-5">
                    {editing
                      ? <div className="flex-shrink-0">
                          <ImageUpload
                            value={form?.organizationLogo}
                            onChange={b => sf('organizationLogo', b)}
                            shape="rect"
                            placeholder="Logo"
                            className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg"
                          />
                        </div>
                      : <div className="h-20 w-20 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {data?.organizationLogo
                            ? <img src={data.organizationLogo} alt="logo" className="w-full h-full object-contain" />
                            : <Building size={32} className="text-blue-300" />
                          }
                        </div>
                    }
                    <div className="pb-1 min-w-0">
                      <p className="text-xl font-bold text-gray-900 truncate">
                        {data?.organizationName || data?.name || 'Your Organization'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {data?.organizationType && (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {data.organizationType}
                          </span>
                        )}
                        {data?.organizationCity && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                            <MapPin size={10} />{data.organizationCity}
                            {data?.organizationRegion ? `, ${data.organizationRegion}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Mission & Description</Label>
                    {editing
                      ? <Textarea value={form?.organizationDescription || ''} onChange={e => sf('organizationDescription', e.target.value)}
                          placeholder="Describe your organization's mission and the impact you create..." rows={4} />
                      : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {data?.organizationDescription || <span className="text-gray-400 italic">No description yet — click Edit to add one.</span>}
                        </p>
                    }
                  </div>

                  {/* Two-column grid of fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow label="Organization Name" icon={<Building size={12} />}>
                      <Input value={gf('organizationName') || ''} onChange={e => sf('organizationName', e.target.value)} disabled={!editing} className="h-10" />
                    </FieldRow>

                    <FieldRow label="Organization Type">
                      {editing
                        ? <select value={form?.organizationType || ''}
                            onChange={e => sf('organizationType', e.target.value)}
                            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select type</option>
                            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        : <Input value={data?.organizationType || '—'} disabled className="h-10 bg-gray-50" />
                      }
                    </FieldRow>

                    <FieldRow label="Contact Person">
                      <Input value={gf('name') || ''} onChange={e => sf('name', e.target.value)} disabled={!editing} placeholder="Full name" className="h-10" />
                    </FieldRow>

                    <FieldRow label="Email Address" icon={<Mail size={12} />}>
                      <Input value={data?.email} disabled className="h-10 bg-gray-50" />
                    </FieldRow>

                    <FieldRow label="Phone" icon={<Phone size={12} />}>
                      <Input value={gf('organizationPhone') || ''} onChange={e => sf('organizationPhone', e.target.value)}
                        disabled={!editing} placeholder="+237 6XX XXX XXX" className="h-10" />
                    </FieldRow>

                    <FieldRow label="Website" icon={<Globe size={12} />}>
                      <Input value={gf('organizationWebsite') || ''} onChange={e => sf('organizationWebsite', e.target.value)}
                        disabled={!editing} placeholder="https://yourorg.org" className="h-10" />
                    </FieldRow>

                    <FieldRow label="City" icon={<MapPin size={12} />}>
                      <Input value={gf('organizationCity') || ''} onChange={e => sf('organizationCity', e.target.value)}
                        disabled={!editing} placeholder="Douala" className="h-10" />
                    </FieldRow>

                    <FieldRow label="Region">
                      {editing
                        ? <select value={form?.organizationRegion || ''}
                            onChange={e => sf('organizationRegion', e.target.value)}
                            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select region</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        : <Input value={data?.organizationRegion || '—'} disabled className="h-10 bg-gray-50" />
                      }
                    </FieldRow>
                  </div>
                </div>
              </div>

              {/* Verification status info card */}
              {!editing && (
                <div className={`rounded-2xl border p-5 flex items-start gap-4 ${
                  data?.organizationVerificationStatus === 'verified'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`mt-0.5 p-2 rounded-xl ${
                    data?.organizationVerificationStatus === 'verified' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {data?.organizationVerificationStatus === 'verified'
                      ? <Shield size={20} className="text-green-600" />
                      : <AlertTriangle size={20} className="text-amber-600" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {data?.organizationVerificationStatus === 'verified'
                        ? 'Verified Organization'
                        : 'Verification Pending'
                      }
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {data?.organizationVerificationStatus === 'verified'
                        ? 'Your organization has been verified. A verified badge is shown on your profile and opportunities.'
                        : 'Your organization is awaiting admin verification. This helps build trust with volunteers.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {/* ── VOLUNTEER STATS ─────────────────────────────────────────── */}
          {!isOrg && (
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Hours Volunteered', value: data?.stats?.totalHours || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Events Attended', value: data?.stats?.totalEvents || 0, icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
                  { label: 'People Helped', value: data?.stats?.peopleHelped || 0, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border border-gray-100 p-5`}>
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon size={20} className={s.color} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Badges & Achievements</h2>
                {data?.stats?.badges?.length > 0
                  ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.stats.badges.map((b: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <span className="text-3xl">{b.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                            <p className="text-xs text-orange-500 mt-1">Earned {new Date(b.earnedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  : <div className="text-center py-12">
                      <Award size={48} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-gray-500">No badges yet — start volunteering to earn them!</p>
                    </div>
                }
              </div>
            </TabsContent>
          )}

          {/* ── SETTINGS ────────────────────────────────────────────────── */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates and alerts via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                  { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Be notified of urgent community alerts' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={editing ? form?.preferences?.[item.key] : data?.preferences?.[item.key]}
                      onCheckedChange={v => setForm((f: any) => ({ ...f, preferences: { ...f.preferences, [item.key]: v } }))}
                      disabled={!editing}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Account Security</h2>
              <Button variant="outline" onClick={() => window.location.href = '/settings'} className="w-full">
                Change Password
              </Button>
              <div className="mt-4 flex gap-2 flex-wrap">
                {data?.emailVerified && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    <Shield size={12} />Email Verified
                  </span>
                )}
                {data?.isVerified && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Shield size={12} />Account Verified
                  </span>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
