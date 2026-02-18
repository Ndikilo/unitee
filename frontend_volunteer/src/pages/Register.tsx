import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [organizationName, setOrganizationName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service');
      return;
    }

    if (!acceptedPrivacy) {
      setError('Please accept the Privacy Policy');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet security requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'organizer' && !organizationName.trim()) {
      setError('Organization name is required for organizers');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        role,
        organizationName: role === 'organizer' ? organizationName : undefined
      });
      
      // Show success message about email verification
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="mr-2"
                  />
                  <span>Volunteer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'organizer'}
                    onChange={() => setRole('organizer')}
                    className="mr-2"
                  />
                  <span>NGO/Community Organizer</span>
                </label>
              </div>
            </div>
            {role === 'organizer' && (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Enter your organization name"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="text-xs space-y-1 mt-2">
                  <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 mr-1 ${passwordValidation.minLength ? '' : 'opacity-30'}`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 mr-1 ${passwordValidation.hasUpper ? '' : 'opacity-30'}`} />
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 mr-1 ${passwordValidation.hasLower ? '' : 'opacity-30'}`} />
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 mr-1 ${passwordValidation.hasNumber ? '' : 'opacity-30'}`} />
                    One number
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 mr-1 ${passwordValidation.hasSpecial ? '' : 'opacity-30'}`} />
                    One special character
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms-of-service" target="_blank" className="text-blue-600 hover:text-blue-500 underline">
                    Terms of Service
                  </Link>
                </label>
              </div>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 rounded"
                  required
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-500 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Need admin access?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin-register')}
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Create admin account
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
