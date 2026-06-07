import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, User, Building, Heart, Globe, Phone, MapPin, FileText, GraduationCap, Briefcase, Landmark, Cross, Leaf } from 'lucide-react';

const ORG_TYPES = [
  { value: 'ngo',        label: 'NGO / Non-profit',      icon: Heart,          desc: 'Mission-driven, charitable' },
  { value: 'startup',    label: 'Startup / Company',      icon: Briefcase,      desc: 'Private sector, social enterprise' },
  { value: 'school',     label: 'School / University',    icon: GraduationCap,  desc: 'Educational institution' },
  { value: 'cbo',        label: 'Community Based Org',    icon: Leaf,           desc: 'Grassroots, neighborhood-level' },
  { value: 'government', label: 'Government Agency',      icon: Landmark,       desc: 'Public sector, state body' },
  { value: 'health',     label: 'Health Institution',     icon: Cross,          desc: 'Hospital, clinic, health org' },
  { value: 'religious',  label: 'Religious Organization', icon: Building,       desc: 'Faith-based, church, mosque' },
  { value: 'other',      label: 'Other',                  icon: FileText,       desc: 'Doesn\'t fit the above' },
];

const Register: React.FC = () => {
  const [role, setRole] = useState<'user' | 'organizer'>('user');

  // Volunteer fields
  const [name, setName] = useState('');

  // Organizer fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgRegion, setOrgRegion] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (p: string) => ({
    minLength: p.length >= 8,
    hasUpper: /[A-Z]/.test(p),
    hasLower: /[a-z]/.test(p),
    hasNumber: /\d/.test(p),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    get isValid() { return this.minLength && this.hasUpper && this.hasLower && this.hasNumber && this.hasSpecial; }
  });

  const pv = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) return setError('Please accept the Terms of Service');
    if (!acceptedPrivacy) return setError('Please accept the Privacy Policy');
    if (!pv.isValid) return setError('Password does not meet security requirements');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (role === 'organizer' && !orgName.trim()) return setError('Organization name is required');
    if (role === 'organizer' && !orgType) return setError('Please select your organization type');
    if (role === 'organizer' && !contactPersonName.trim()) return setError('Contact person name is required');
    if (role === 'user' && !name.trim()) return setError('Full name is required');

    setLoading(true);
    try {
      await register({
        name: role === 'organizer' ? contactPersonName : name,
        email,
        password,
        confirmPassword,
        role,
        organizationName: role === 'organizer' ? orgName : undefined,
        ...(role === 'organizer' && {
          organizationDescription: orgDescription,
          organizationType: orgType,
          organizationWebsite: orgWebsite,
          organizationPhone: orgPhone,
          organizationCity: orgCity,
          organizationRegion: orgRegion,
        }),
      });
      navigate('/login', { state: { message: 'Account created! Check your email for a verification link. You must verify your email before signing in.' } });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const termsLink = role === 'organizer' ? '/terms-organization' : '/terms-volunteer';
  const privacyLink = role === 'organizer' ? '/privacy-organization' : '/privacy-volunteer';

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-orange-500 via-blue-600 to-green-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="UNITEE" className="h-14 w-14 object-contain" />
            <span className="text-3xl font-bold text-white">UNITEE</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {role === 'organizer' ? 'Register Your Organization' : 'Start Your Volunteer Journey'}
          </h1>
          <p className="text-white/80 text-lg mb-10">
            {role === 'organizer'
              ? 'Connect with passionate youth volunteers ready to support your mission across Cameroon.'
              : 'Join thousands of young people making a real difference in communities across Cameroon.'}
          </p>
          <div className="space-y-4">
            {(role === 'user' ? [
              { icon: Heart, title: 'Find Opportunities', desc: 'Browse verified volunteer opportunities matching your skills' },
              { icon: CheckCircle2, title: 'Track Your Impact', desc: 'Log hours, earn badges and digital certificates' },
              { icon: Globe, title: 'Join Communities', desc: 'Connect with like-minded volunteers and NGOs' },
            ] : [
              { icon: Building, title: 'Post Opportunities', desc: 'Reach hundreds of motivated youth volunteers' },
              { icon: CheckCircle2, title: 'Manage Applications', desc: 'Review and accept volunteers with ease' },
              { icon: FileText, title: 'Issue Certificates', desc: 'Recognize volunteer contributions professionally' },
            ]).map((b, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <b.icon className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold">{b.title}</p>
                  <p className="text-white/70 text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/60 text-sm">© 2026 UNITEE — Volunteering for Youths</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-start justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <img src="/logo.png" alt="UNITEE" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold"><span className="text-orange-500">UNI</span><span className="text-blue-600">TEE</span></span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm mb-6">Join the UNITEE community</p>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button type="button" onClick={() => setRole('user')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${role === 'user' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Heart className={`mb-2 ${role === 'user' ? 'text-orange-500' : 'text-gray-400'}`} size={22} />
                <p className={`font-semibold text-sm ${role === 'user' ? 'text-orange-600' : 'text-gray-700'}`}>Volunteer</p>
                <p className="text-xs text-gray-500 mt-0.5">I want to volunteer</p>
              </button>
              <button type="button" onClick={() => setRole('organizer')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${role === 'organizer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Building className={`mb-2 ${role === 'organizer' ? 'text-blue-600' : 'text-gray-400'}`} size={22} />
                <p className={`font-semibold text-sm ${role === 'organizer' ? 'text-blue-600' : 'text-gray-700'}`}>Organization</p>
                <p className="text-xs text-gray-500 mt-0.5">We recruit volunteers</p>
              </button>
            </div>

            {/* Google sign-up — volunteers only (Google creates a volunteer account) */}
            {role === 'user' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium mb-4"
                  onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/google`; }}
                >
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Button>
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">or fill in your details</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── VOLUNTEER FIELDS ── */}
              {role === 'user' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input value={name} onChange={e => setName(e.target.value)} className="pl-10 h-11" placeholder="e.g. Jean-Paul Mbarga" required />
                  </div>
                </div>
              )}

              {/* ── ORGANIZER FIELDS ── */}
              {role === 'organizer' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">📋 Organization Registration</p>
                    <p>Please provide your official organization details. Your account will be reviewed for verification.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Organization Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="pl-10 h-11" placeholder="e.g. Youth Action Cameroon" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Organization Type <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ORG_TYPES.map(t => {
                        const Icon = t.icon;
                        const selected = orgType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setOrgType(t.value)}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                              selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={18} className={`mt-0.5 flex-shrink-0 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <p className={`text-xs font-semibold leading-tight ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{t.label}</p>
                              <p className="text-xs text-gray-400 leading-tight mt-0.5">{t.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} className="pl-9 h-11" placeholder="+237 6XX XXX XXX" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input value={orgCity} onChange={e => setOrgCity(e.target.value)} className="pl-9 h-11" placeholder="e.g. Douala" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Region</Label>
                      <select value={orgRegion} onChange={e => setOrgRegion(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select region</option>
                        {['Adamawa','Centre','East','Far North','Littoral','North','North West','South','South West','West'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Website (optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Input value={orgWebsite} onChange={e => setOrgWebsite(e.target.value)} className="pl-9 h-11" placeholder="https://yourorg.org" type="url" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Brief Description</Label>
                    <textarea value={orgDescription} onChange={e => setOrgDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3} placeholder="What does your organization do? What is your mission?" />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Person</p>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Your Full Name <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input value={contactPersonName} onChange={e => setContactPersonName(e.target.value)} className="pl-10 h-11" placeholder="Your name as contact person" required />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SHARED FIELDS ── */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11" placeholder="you@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 h-11" placeholder="••••••••" required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && (
                  <div className="grid grid-cols-2 gap-1 text-xs bg-gray-50 p-3 rounded-lg mt-1">
                    {[
                      [pv.minLength, '8+ characters'],
                      [pv.hasUpper, 'Uppercase letter'],
                      [pv.hasLower, 'Lowercase letter'],
                      [pv.hasNumber, 'Number'],
                      [pv.hasSpecial, 'Special character'],
                    ].map(([ok, label], i) => (
                      <div key={i} className={`flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 size={12} className={ok ? '' : 'opacity-30'} />
                        {label as string}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 pr-10 h-11" placeholder="••••••••" required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Terms & Privacy */}
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5 rounded border-gray-300" required />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to={termsLink} target="_blank" className="text-orange-500 hover:text-orange-600 underline font-medium">
                      Terms of Service
                    </Link>
                    {role === 'organizer' && <span className="text-gray-400"> (Organization)</span>}
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptedPrivacy} onChange={e => setAcceptedPrivacy(e.target.checked)} className="mt-0.5 rounded border-gray-300" required />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to={privacyLink} target="_blank" className="text-orange-500 hover:text-orange-600 underline font-medium">
                      Privacy Policy
                    </Link>
                    {role === 'organizer' && <span className="text-gray-400"> (Organization)</span>}
                  </span>
                </label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-semibold text-base">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
