import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Loader2, CheckCircle, Lock, Bell, Shield, Trash2, LogOut, Globe, Palette } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import BackButton from '@/components/ui/BackButton';

type Tab = 'security' | 'notifications' | 'privacy' | 'account' | 'branding';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('security');

  // ── Password ──────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    emergencyAlerts: true,
    opportunityUpdates: true,
    communityUpdates: true,
    badgeAlerts: true,
  });

  // ── Privacy ───────────────────────────────────────────────────────────────
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyPrefs, setPrivacyPrefs] = useState({
    showProfileToOrgs: true,
    showHoursPublicly: true,
    showBadgesPublicly: true,
    allowCertVerification: true,
  });

  // ── Branding (org only) ───────────────────────────────────────────────────
  const isOrg = (user as any)?.userType === 'organization' || user?.role === 'organizer';
  const [brandColor, setBrandColor] = useState((user as any)?.organizationBrandColor || '#f97316');
  const [brandLoading, setBrandLoading] = useState(false);

  const handleSaveBranding = async () => {
    setBrandLoading(true);
    try {
      await authAPI.updateProfile({ organizationBrandColor: brandColor });
      toast({ title: 'Brand color saved', description: 'Your PDFs and certificates will now use this colour.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setBrandLoading(false);
    }
  };

  useEffect(() => {
    if (user?.preferences) {
      setNotifPrefs(prev => ({
        ...prev,
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        emergencyAlerts: user.preferences?.emergencyAlerts ?? true,
        opportunityUpdates: user.preferences?.opportunityUpdates ?? true,
        communityUpdates: user.preferences?.communityUpdates ?? true,
        badgeAlerts: user.preferences?.badgeAlerts ?? true,
      }));
      setLanguage((user.preferences?.language as 'en' | 'fr') || 'en');
      if (user.preferences?.privacy) {
        setPrivacyPrefs({
          showProfileToOrgs: user.preferences.privacy.showProfileToOrgs ?? true,
          showHoursPublicly: user.preferences.privacy.showHoursPublicly ?? true,
          showBadgesPublicly: user.preferences.privacy.showBadgesPublicly ?? true,
          allowCertVerification: user.preferences.privacy.allowCertVerification ?? true,
        });
      }
    }
  }, [user]);

  const pv = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    get isValid() { return this.minLength && this.hasUpper && this.hasLower && this.hasNumber && this.hasSpecial; }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!pv.isValid) return setPwError('Password does not meet requirements');
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match');
    if (currentPassword === newPassword) return setPwError('New password must be different');
    setPwLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifLoading(true);
    try {
      await authAPI.updateProfile({ preferences: { ...notifPrefs, language } });
      if (refreshUser) await refreshUser();
      toast({ title: 'Preferences saved', description: 'Your notification settings have been updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save preferences', variant: 'destructive' });
    } finally {
      setNotifLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setPrivacyLoading(true);
    try {
      await authAPI.updateProfile({ preferences: { privacy: privacyPrefs } });
      if (refreshUser) await refreshUser();
      toast({ title: 'Privacy settings saved', description: 'Your privacy preferences have been updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save privacy settings', variant: 'destructive' });
    } finally {
      setPrivacyLoading(false);
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? All your data will be removed. This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete account. Please try again.', variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    ...(isOrg ? [{ id: 'branding' as Tab, label: 'Branding', icon: Palette }] : []),
    { id: 'account', label: 'Account', icon: Trash2 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account security and preferences</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── SECURITY TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock size={18} /> Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.googleId ? (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    Your account uses Google Sign-In. Password management is handled by Google — you cannot set a separate password here.
                  </AlertDescription>
                </Alert>
              ) : pwSuccess ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">Password changed successfully!</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {/* Current */}
                  <div className="space-y-1.5">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input type={showCurrent ? 'text' : 'password'} value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" required disabled={pwLoading} />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New */}
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input type={showNew ? 'text' : 'password'} value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required disabled={pwLoading} />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                        {[
                          [pv.minLength, '8+ characters'],
                          [pv.hasUpper, 'Uppercase letter'],
                          [pv.hasLower, 'Lowercase letter'],
                          [pv.hasNumber, 'Number'],
                          [pv.hasSpecial, 'Special character'],
                        ].map(([ok, label], i) => (
                          <div key={i} className={`flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{ok ? '✓' : '○'}</span>{label as string}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1.5">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required disabled={pwLoading} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  {pwError && <Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-700">{pwError}</AlertDescription></Alert>}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={pwLoading} className="flex-1">Cancel</Button>
                    <Button type="submit" disabled={pwLoading || !pv.isValid || newPassword !== confirmPassword} className="flex-1">
                      {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</> : 'Change Password'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── NOTIFICATIONS TAB ────────────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell size={18} /> Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates and alerts via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text messages for urgent updates' },
                  { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Get notified about urgent community needs' },
                  { key: 'opportunityUpdates', label: 'Opportunity Updates', desc: 'Updates on opportunities you applied for' },
                  { key: 'communityUpdates', label: 'Community Updates', desc: 'News from communities you joined' },
                  { key: 'badgeAlerts', label: 'Badge & Achievement Alerts', desc: 'Get notified when you earn a new badge' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                      onCheckedChange={val => setNotifPrefs(p => ({ ...p, [item.key]: val }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe size={18} /> Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {([{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }] as { value: 'en' | 'fr'; label: string }[]).map(lang => (
                    <button key={lang.value} onClick={() => setLanguage(lang.value)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        language === lang.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveNotifications} disabled={notifLoading} className="w-full">
              {notifLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Preferences'}
            </Button>
          </div>
        )}

        {/* ── PRIVACY TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield size={18} /> Privacy Settings</CardTitle>
                <CardDescription>Control what information is visible to others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {([
                  { key: 'showProfileToOrgs', label: 'Show profile to organizations', desc: 'Organizations can view your profile when you apply' },
                  { key: 'showHoursPublicly', label: 'Show volunteer hours publicly', desc: 'Your total hours are visible on your public profile' },
                  { key: 'showBadgesPublicly', label: 'Show badges publicly', desc: 'Your earned badges are visible to other users' },
                  { key: 'allowCertVerification', label: 'Allow certificate verification', desc: 'Others can verify your certificates using the certificate ID' },
                ] as { key: keyof typeof privacyPrefs; label: string; desc: string }[]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={privacyPrefs[item.key]}
                      onCheckedChange={val => setPrivacyPrefs(p => ({ ...p, [item.key]: val }))}
                    />
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    For full privacy details, see our{' '}
                    <a href="/privacy-volunteer" target="_blank" className="text-blue-600 underline">Privacy Policy</a>.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleSavePrivacy} disabled={privacyLoading} className="w-full">
              {privacyLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Privacy Settings'}
            </Button>
          </div>
        )}

        {/* ── BRANDING TAB (org only) ──────────────────────────────────────── */}
        {activeTab === 'branding' && isOrg && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-500" />
                  Organisation Brand Colour
                </CardTitle>
                <CardDescription>
                  This colour is applied to your impact report PDF and all certificates you issue. Set it to match your organisation's brand — so the report reads as yours, not UNITEE's.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  {/* Native colour picker */}
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="h-12 w-16 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    title="Pick your brand colour"
                  />
                  {/* Hex input */}
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-500">Hex code</Label>
                    <Input
                      value={brandColor}
                      onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBrandColor(v);
                      }}
                      placeholder="#f97316"
                      className="font-mono"
                    />
                  </div>
                  {/* Live preview swatch */}
                  <div className="shrink-0 text-center">
                    <div
                      className="h-12 w-24 rounded-xl border border-gray-200 shadow-inner"
                      style={{ backgroundColor: brandColor }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Preview</p>
                  </div>
                </div>

                {/* Preset colours */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Common presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'UNITEE Orange', hex: '#f97316' },
                      { name: 'MTN Yellow',    hex: '#ffd100' },
                      { name: 'Orange Tel',    hex: '#ff6600' },
                      { name: 'Green',         hex: '#16a34a' },
                      { name: 'Blue',          hex: '#2563eb' },
                      { name: 'Purple',        hex: '#7c3aed' },
                      { name: 'Red',           hex: '#dc2626' },
                      { name: 'Slate',         hex: '#475569' },
                    ].map(({ name, hex }) => (
                      <button
                        key={hex}
                        title={name}
                        onClick={() => setBrandColor(hex)}
                        className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${brandColor === hex ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
                  This colour affects <strong>new</strong> PDFs and certificates generated after saving. Existing downloaded files are not changed.
                </div>

                <Button onClick={handleSaveBranding} disabled={brandLoading}>
                  {brandLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Brand Colour'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── ACCOUNT TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account type</span>
                  <span className="font-medium text-gray-900 capitalize">{user?.role || user?.userType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email verified</span>
                  <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                    {user?.emailVerified ? '✓ Verified' : '⚠ Not verified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2"><LogOut size={18} /> Sign Out</CardTitle>
                <CardDescription>Sign out of your account on this device</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => { logout(); navigate('/'); }}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2"><Trash2 size={18} /> Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all associated data. This cannot be undone.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
                  {deleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : 'Delete My Account'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
