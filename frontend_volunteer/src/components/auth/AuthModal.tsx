import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/NewAuthContext';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlobeIcon, ShieldCheckIcon } from '@/components/icons/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  
  // Try to get language context, but provide fallback if not available
  let t = (key: string) => key; // Default fallback function
  try {
    const { t: translateFn } = useLanguage();
    t = translateFn;
  } catch (error) {
    console.log('Language context not available in AuthModal, using fallback');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await login({ email, password });
        onClose();
      } else {
        await register({ name, email, password, role });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl mb-4">
            <GlobeIcon className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? t('nav.signIn') : t('nav.signUp')}
          </h2>
          <p className="text-gray-500 mt-1">
            {mode === 'signin' 
              ? 'Welcome back to UNITEE' 
              : 'Join the volunteer movement'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.role')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'user'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <UsersIcon size={24} className={role === 'user' ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <p className={`font-medium ${role === 'user' ? 'text-blue-700' : 'text-gray-700'}`}>
                    {t('auth.volunteer')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'organizer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <BuildingIcon size={24} className={role === 'organizer' ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <p className={`font-medium ${role === 'organizer' ? 'text-blue-700' : 'text-gray-700'}`}>
                    {t('auth.organizer')}
                  </p>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('common.loading') : (mode === 'signin' ? t('nav.signIn') : t('nav.signUp'))}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-600 font-semibold hover:underline"
            >
              {mode === 'signin' ? t('nav.signUp') : t('nav.signIn')}
            </button>
          </p>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <ShieldCheckIcon size={16} />
          <span>Secure & encrypted</span>
        </div>
      </div>
    </Modal>
  );
};

// Import icons used in this component
import { UsersIcon, BuildingIcon } from '@/components/icons/Icons';

export default AuthModal;
