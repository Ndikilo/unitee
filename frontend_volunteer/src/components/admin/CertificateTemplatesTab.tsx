import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Edit, Trash2, Eye, Save, X, FileText, Award,
  CheckCircle, Loader2, Copy, ToggleLeft, ToggleRight
} from 'lucide-react';
import apiRequest from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CertTemplate {
  _id: string;
  name: string;
  type: string;
  title: string;
  description: string;
  bodyText: string;
  signatoryName: string;
  signatoryTitle: string;
  footerNote: string;
  accentColor: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

const CERT_TYPES = [
  { value: 'volunteer_completion', label: 'Volunteer Completion' },
  { value: 'volunteer_passport', label: 'Volunteer Passport' },
  { value: 'achievement_badge', label: 'Achievement Badge' },
  { value: 'hours_milestone', label: 'Hours Milestone' },
  { value: 'skill_certification', label: 'Skill Certification' },
];

const ACCENT_COLORS = [
  { value: '#f97316', label: 'Orange' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#16a34a', label: 'Green' },
  { value: '#7c3aed', label: 'Purple' },
  { value: '#dc2626', label: 'Red' },
  { value: '#0891b2', label: 'Cyan' },
];

const PLACEHOLDER_VARS = [
  { var: '{{recipientName}}', desc: "Volunteer's full name" },
  { var: '{{organizationName}}', desc: 'Issuing organization' },
  { var: '{{opportunityTitle}}', desc: 'Opportunity/event name' },
  { var: '{{hoursCompleted}}', desc: 'Hours volunteered' },
  { var: '{{issuedDate}}', desc: 'Date of issue' },
  { var: '{{certificateId}}', desc: 'Unique certificate ID' },
  { var: '{{skills}}', desc: 'Skills acquired (comma-separated)' },
];

const EMPTY_FORM = {
  name: '',
  type: 'volunteer_completion',
  title: 'Certificate of Volunteer Service',
  description: 'This certifies that {{recipientName}} has successfully completed volunteer service.',
  bodyText: 'This is to certify that {{recipientName}} has demonstrated outstanding commitment and dedication by completing {{hoursCompleted}} hours of volunteer service with {{organizationName}} in the activity "{{opportunityTitle}}".\n\nThis certificate is awarded in recognition of their valuable contribution to the community.',
  signatoryName: 'UNITEE Administrator',
  signatoryTitle: 'Platform Director, UNITEE',
  footerNote: 'This certificate can be verified at unitee.cm/verify/{{certificateId}}',
  accentColor: '#f97316',
  isActive: true,
  isDefault: false,
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CertificateTemplatesTab: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'edit' | 'preview'>('list');
  const [editing, setEditing] = useState<CertTemplate | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [previewData, setPreviewData] = useState<CertTemplate | null>(null);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/certificate-templates');
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch {
      // No templates yet — that's fine
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setView('edit');
  };

  const openEdit = (t: CertTemplate) => {
    setEditing(t);
    setForm({ ...t });
    setView('edit');
  };

  const openPreview = (t: CertTemplate) => {
    setPreviewData(t);
    setView('preview');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: 'Error', description: 'Template name is required', variant: 'destructive' });
    if (!form.title.trim()) return toast({ title: 'Error', description: 'Certificate title is required', variant: 'destructive' });

    try {
      setSaving(true);
      if (editing) {
        await apiRequest(`/admin/certificate-templates/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast({ title: 'Saved', description: 'Template updated' });
      } else {
        await apiRequest('/admin/certificate-templates', { method: 'POST', body: JSON.stringify(form) });
        toast({ title: 'Created', description: 'Template created' });
      }
      await loadTemplates();
      setView('list');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await apiRequest(`/admin/certificate-templates/${id}`, { method: 'DELETE' });
      toast({ title: 'Deleted', description: 'Template removed' });
      loadTemplates();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (t: CertTemplate) => {
    try {
      await apiRequest(`/admin/certificate-templates/${t._id}`, { method: 'PUT', body: JSON.stringify({ ...t, isActive: !t.isActive }) });
      loadTemplates();
    } catch {}
  };

  const handleDuplicate = async (t: CertTemplate) => {
    setEditing(null);
    setForm({ ...t, name: `${t.name} (Copy)`, isDefault: false, _id: undefined });
    setView('edit');
  };

  const sf = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const insertVar = (v: string) => {
    sf('bodyText', form.bodyText + v);
  };

  // ── Preview renderer ──────────────────────────────────────────────────────
  const renderPreview = (t: CertTemplate) => {
    const sample = {
      recipientName: 'Jean-Paul Mbarga',
      organizationName: 'Youth Action Cameroon',
      opportunityTitle: 'Community Health Drive 2026',
      hoursCompleted: '24',
      issuedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      certificateId: 'UNITEE-ABC123-DEF456',
      skills: 'First Aid, Community Outreach',
    };
    const fill = (str: string) => str
      .replace(/\{\{recipientName\}\}/g, sample.recipientName)
      .replace(/\{\{organizationName\}\}/g, sample.organizationName)
      .replace(/\{\{opportunityTitle\}\}/g, sample.opportunityTitle)
      .replace(/\{\{hoursCompleted\}\}/g, sample.hoursCompleted)
      .replace(/\{\{issuedDate\}\}/g, sample.issuedDate)
      .replace(/\{\{certificateId\}\}/g, sample.certificateId)
      .replace(/\{\{skills\}\}/g, sample.skills);

    return (
      <div className="bg-white border-8 rounded-2xl p-10 max-w-3xl mx-auto shadow-2xl relative overflow-hidden"
        style={{ borderColor: t.accentColor }}>
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: t.accentColor }} />

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="UNITEE" className="h-16 mx-auto mb-4 object-contain" />
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: t.accentColor }}>
            UNITEE - Volunteering for Youths
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{fill(t.title)}</h1>
          <p className="text-gray-500 text-sm">{fill(t.description)}</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <Award size={24} style={{ color: t.accentColor }} />
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Body */}
        <div className="text-center text-gray-700 leading-relaxed mb-10 whitespace-pre-line text-sm">
          {fill(t.bodyText)}
        </div>

        {/* Signature */}
        <div className="flex justify-between items-end mt-8">
          <div className="text-center">
            <div className="w-40 border-b-2 border-gray-400 mb-1" />
            <p className="font-semibold text-sm text-gray-800">{t.signatoryName}</p>
            <p className="text-xs text-gray-500">{t.signatoryTitle}</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 border-2 rounded-lg flex items-center justify-center bg-gray-50" style={{ borderColor: t.accentColor }}>
              <span className="text-xs text-gray-400">QR Code</span>
            </div>
          </div>
          <div className="text-center">
            <div className="w-40 border-b-2 border-gray-400 mb-1" />
            <p className="font-semibold text-sm text-gray-800">Date of Issue</p>
            <p className="text-xs text-gray-500">{sample.issuedDate}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
          {fill(t.footerNote)}
        </div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: t.accentColor }} />
      </div>
    );
  };

  // ── PREVIEW VIEW ──────────────────────────────────────────────────────────
  if (view === 'preview' && previewData) {
    return (
      <TabsContent value="cert-templates">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="outline" onClick={() => setView('list')}><X size={16} className="mr-2" />Close Preview</Button>
          <span className="text-sm text-gray-500">Preview: {previewData.name}</span>
        </div>
        <div className="bg-gray-100 p-8 rounded-2xl">
          {renderPreview(previewData)}
        </div>
      </TabsContent>
    );
  }

  // ── EDIT VIEW ─────────────────────────────────────────────────────────────
  if (view === 'edit') {
    return (
      <TabsContent value="cert-templates">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Template' : 'New Certificate Template'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Use {`{{variable}}`} placeholders - they'll be replaced with real data when issued</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('list')} disabled={saving}><X size={16} className="mr-2" />Cancel</Button>
            <Button onClick={() => openPreview({ ...form, _id: editing?._id || 'preview', createdAt: '' })} variant="outline">
              <Eye size={16} className="mr-2" />Preview
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              {editing ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Template Name <span className="text-red-500">*</span></Label>
                    <Input value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. Standard Completion Certificate" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Certificate Type</Label>
                    <select value={form.type} onChange={e => sf('type', e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                      {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Certificate Title <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={e => sf('title', e.target.value)} placeholder="e.g. Certificate of Volunteer Service" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Subtitle / Description</Label>
                  <Input value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Short line below the title" className="h-10" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Certificate Body Text</CardTitle>
                  <span className="text-xs text-gray-400">Click a variable to insert it</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {PLACEHOLDER_VARS.map(v => (
                    <button key={v.var} onClick={() => insertVar(v.var)}
                      title={v.desc}
                      className="px-2 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors font-mono">
                      {v.var}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={form.bodyText}
                  onChange={e => sf('bodyText', e.target.value)}
                  rows={7}
                  placeholder="Write the main body of the certificate. Use {{variable}} placeholders."
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Signatory & Footer</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Signatory Name</Label>
                    <Input value={form.signatoryName} onChange={e => sf('signatoryName', e.target.value)} placeholder="e.g. John Doe" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Signatory Title</Label>
                    <Input value={form.signatoryTitle} onChange={e => sf('signatoryTitle', e.target.value)} placeholder="e.g. Executive Director" className="h-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Footer Note</Label>
                  <Input value={form.footerNote} onChange={e => sf('footerNote', e.target.value)} placeholder="Verification URL or disclaimer" className="h-10" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Settings */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Accent Color</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {ACCENT_COLORS.map(c => (
                    <button key={c.value} onClick={() => sf('accentColor', c.value)}
                      className={`h-10 rounded-lg border-2 transition-all ${form.accentColor === c.value ? 'border-gray-800 scale-105' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">Custom:</Label>
                  <input type="color" value={form.accentColor} onChange={e => sf('accentColor', e.target.value)}
                    className="h-8 w-16 rounded cursor-pointer border border-gray-200" />
                  <span className="text-xs font-mono text-gray-500">{form.accentColor}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active</p>
                    <p className="text-xs text-gray-500">Available for use when issuing</p>
                  </div>
                  <button onClick={() => sf('isActive', !form.isActive)}
                    className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Set as Default</p>
                    <p className="text-xs text-gray-500">Used when no template is specified</p>
                  </div>
                  <button onClick={() => sf('isDefault', !form.isDefault)}
                    className={`w-11 h-6 rounded-full transition-colors ${form.isDefault ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isDefault ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Available Variables</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PLACEHOLDER_VARS.map(v => (
                    <div key={v.var} className="flex items-start gap-2">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 font-mono shrink-0">{v.var}</code>
                      <span className="text-xs text-gray-500">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <TabsContent value="cert-templates">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Certificate Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">Design and manage templates used when issuing certificates</p>
        </div>
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus size={16} className="mr-2" />New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first certificate template to standardize how certificates look when issued to volunteers.</p>
          <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus size={16} className="mr-2" />Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map(t => (
            <div key={t._id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${t.isDefault ? 'border-orange-400' : 'border-gray-100'}`}>
              {/* Color bar */}
              <div className="h-2" style={{ backgroundColor: t.accentColor }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{t.name}</h3>
                      {t.isDefault && <span className="px-1.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded">Default</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{t.title}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                    {CERT_TYPES.find(c => c.value === t.type)?.label || t.type}
                  </span>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{t.bodyText}</p>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Button size="sm" variant="outline" onClick={() => openPreview(t)} className="flex-1">
                    <Eye size={14} className="mr-1" />Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)} className="flex-1">
                    <Edit size={14} className="mr-1" />Edit
                  </Button>
                  <button onClick={() => handleDuplicate(t)} title="Duplicate"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleToggle(t)} title={t.isActive ? 'Deactivate' : 'Activate'}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    {t.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button onClick={() => handleDelete(t._id)} title="Delete"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default CertificateTemplatesTab;
