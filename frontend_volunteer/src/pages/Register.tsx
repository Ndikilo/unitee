import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, User, Building, Heart, Globe, Phone, MapPin, FileText } from 'lucide-react';

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
      navigate('/login', { state: { message: 'Registration successful! Please check your email to verify your account.' } });
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Organization Type</Label>
                      <select value={orgType} onChange={e => setOrgType(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select type</option>
                        <option value="ngo">NGO / Non-profit</option>
                        <option value="cbo">Community Based Org</option>
                        <option value="government">Government Agency</option>
                        <option value="school">School / University</option>
                        <option value="religious">Religious Organization</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} className="pl-9 h-11" placeholder="+237 6XX XXX XXX" />
                      </div>
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
