import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { authAPI } from '@/lib/api';

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }
      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed.');
        if (error.expired) setIsExpired(true);
      }
    };
    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendMessage('');
    try {
      await authAPI.resendVerification(resendEmail.trim());
      setResendMessage('A new verification link has been sent to your email.');
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error'   && <XCircle   className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address…'}
            {status === 'success' && 'Your email has been verified!'}
            {status === 'error'   && (isExpired ? 'Verification link expired' : 'Verification failed')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={status === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message}
            </AlertDescription>
          </Alert>

          {/* Expired token — show resend form */}
          {status === 'error' && isExpired && (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-gray-600">Enter your email address to receive a fresh verification link.</p>
              <Input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={e => setResendEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResend()}
              />
              {resendMessage && (
                <p className="text-sm font-medium text-blue-600">{resendMessage}</p>
              )}
              <Button
                onClick={handleResend}
                disabled={resendLoading || !resendEmail.trim()}
                className="w-full gap-2"
              >
                {resendLoading
                  ? <><Loader2 size={15} className="animate-spin" />Sending…</>
                  : <><RefreshCw size={15} />Resend verification email</>}
              </Button>
            </div>
          )}

          {status !== 'loading' && (
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              variant={status === 'success' ? 'default' : 'outline'}
            >
              {status === 'success' ? 'Continue to Login' : 'Back to Login'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;