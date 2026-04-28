import React, { useState } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { Heart, Building, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowLeft, X, MapPin } from 'lucide-react';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

type Step = 'role' | 'form' | 'verify-sent';
type Role = 'volunteer' | 'organizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  /** If provided, skip role selection and go straight to the form */
  initialRole?: Role;
}

const GetStartedModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin, initialRole }) => {
  const [step, setStep] = useState<Step>(initialRole ? 'form' : 'role');
  const [role, setRole] = useState<Role>(initialRole ?? 'volunteer');

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
  const [contactName, setContactName] = useState('');

  // Shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const pv = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    get isValid() { return this.minLength && this.hasUpper && this.hasLower && this.hasNumber; }
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep('form');
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pv.isValid) return setError('Password must be 8+ chars with uppercase, lowercase and a number');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!acceptedTerms) return setError('Please accept the Terms of Service');
    if (role === 'organizer' && !orgName.trim()) return setError('Organization name is required');
    if (role === 'organizer' && !contactName.trim()) return setError('Contact person name is required');

    setLoading(true);
    try {
      await register({
        name: role === 'organizer' ? contactName : name,
        email,
        password,
        confirmPassword,
        role: role === 'volunteer' ? 'user' : 'organizer',
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
      setStep('verify-sent');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(initialRole ? 'form' : 'role');
    setRole(initialRole ?? 'volunteer');
    setName(''); setOrgName(''); setOrgType(''); setOrgDescription('');
    setOrgWebsite(''); setOrgPhone(''); setOrgCity(''); setOrgRegion('');
    setContactName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setAcceptedTerms(false); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  const termsLink = role === 'organizer' ? '/terms-organization' : '/terms-volunteer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        {/* ── STEP 1: Role Selection ─────────────────────────────────── */}
        {step === 'role' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <img src="/logo.png" alt="UNITEE" className="h-12 w-12 object-contain mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Welcome to UNITEE</h2>
              <p className="text-gray-500 mt-1">How would you like to join?</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleRoleSelect('volunteer')}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Heart className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">I'm a Volunteer</p>
                    <p className="text-sm text-gray-500 mt-0.5">Find opportunities, track impact, earn certificates</p>
                  </div>
                  <div className="ml-auto text-gray-300 group-hover:text-orange-400 transition-colors">›</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('organizer')}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Building className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">I represent an Organization</p>
                    <p className="text-sm text-gray-500 mt-0.5">Post opportunities, recruit volunteers, issue certificates</p>
                  </div>
                  <div className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">›</div>
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => { handleClose(); onSwitchToLogin(); }} className="text-blue-600 font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 2: Registration Form ──────────────────────────────── */}
        {step === 'form' && (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              {!initialRole && (
                <button onClick={() => setStep('role')} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'volunteer' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                {role === 'volunteer'
                  ? <Heart className="text-orange-500" size={20} />
                  : <Building className="text-blue-600" size={20} />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {role === 'volunteer' ? 'Create Volunteer Account' : 'Register Organization'}
                </h2>
                <p className="text-xs text-gray-500">Step 2 of 2</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Volunteer: just name */}
              {role === 'volunteer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                      placeholder="e.g. Jean-Paul Mbarga"
                    />
                  </div>
                </div>
              )}

              {/* Organizer fields */}
              {role === 'organizer' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                    <p className="font-semibold mb-0.5">📋 Organization Registration</p>
                    <p>Your account will be reviewed for verification after signup.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g. Youth Action Cameroon" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select value={orgType} onChange={e => setOrgType(e.target.value)}
                        className="w-full py-2.5 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Select</option>
                        <option value="ngo">NGO / Non-profit</option>
                        <option value="cbo">Community Based Org</option>
                        <option value="government">Government Agency</option>
                        <option value="school">School / University</option>
                        <option value="religious">Religious Org</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" value={orgCity} onChange={e => setOrgCity(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Douala" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Contact Person) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} required
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Your full name" />
                    </div>
                  </div>
                </div>
              )}

              {/* Google Sign In — shown above email */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or sign up with email</span></div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="you@example.com" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {[
                      [pv.minLength, '8+ chars'],
                      [pv.hasUpper, 'Uppercase'],
                      [pv.hasLower, 'Lowercase'],
                      [pv.hasNumber, 'Number'],
                    ].map(([ok, label], i) => (
                      <span key={i} className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 size={11} className={ok ? '' : 'opacity-30'} />
                        {label as string}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5 rounded border-gray-300" />
                <span className="text-xs text-gray-600">
                  I agree to the{' '}
                  <a href={termsLink} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href={role === 'organizer' ? '/privacy-organization' : '/privacy-volunteer'} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Privacy Policy</a>
                </span>
              </label>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                  role === 'volunteer'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => { handleClose(); onSwitchToLogin(); }} className="text-blue-600 font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 3: Email Sent ─────────────────────────────────────── */}
        {step === 'verify-sent' && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-1">We sent a verification link to</p>
            <p className="font-semibold text-gray-800 mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to activate your account, then sign in.
            </p>
            <button
              onClick={() => { handleClose(); onSwitchToLogin(); }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Go to Sign In
            </button>
            <button onClick={handleClose} className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-gray-600">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStartedModal;
