import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, CheckCircle, XCircle, Lock, Clock, Award, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CertificateVerify: React.FC = () => {
  const { id: urlId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [certificateId, setCertificateId] = useState(urlId ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Auto-verify if ID provided in URL
  useEffect(() => {
    if (urlId) verifyCertificate(urlId);
  }, [urlId]);

  const verifyCertificate = async (id = certificateId) => {
    if (!id.trim()) { setError('Please enter a certificate ID'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    setRequiresAuth(false);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/certificates/verify/${id.trim().toUpperCase()}`, { headers });
      const data = await response.json();

      if (response.status === 401) {
        setRequiresAuth(true);
        setError(data.message || 'This certificate requires organisation or admin access to verify.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Certificate not found');
      }

      setResult(data.data);
    } catch (err: any) {
      if (!requiresAuth) setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') verifyCertificate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Certificate Verification</h1>
          <p className="text-gray-600 mb-2">
            Verify the authenticity of UNITEE volunteer certificates.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Volunteer Passports require organisation or admin login to verify.
          </p>

          {/* Search box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={certificateId}
              onChange={e => { setCertificateId(e.target.value); setError(''); setResult(null); setRequiresAuth(false); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter certificate ID (e.g. UNITEE-ABC123…)"
              className="w-full pl-11 pr-28 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
            />
            <button
              onClick={() => verifyCertificate()}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">

          {/* Passport locked */}
          {requiresAuth && (
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-4">
              <Lock size={28} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800 text-lg mb-1">Organisation Access Required</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Volunteer Passports can only be verified by registered organisations or administrators.
                  Please log in with an organisation or admin account to verify this document.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Log in to verify
                </button>
              </div>
            </div>
          )}

          {/* Generic error */}
          {error && !requiresAuth && (
            <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3">
              <XCircle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Verification Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Valid result */}
          {result && (
            <div className="space-y-5">
              {/* Status banner */}
              <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
                result.verification?.isValid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {result.verification?.isValid
                  ? <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
                  : <XCircle size={32} className="text-red-600 flex-shrink-0" />
                }
                <div>
                  <h2 className={`text-xl font-bold ${result.verification?.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {result.verification?.isValid ? 'Certificate Verified ✓' : 'Certificate Invalid ✗'}
                  </h2>
                  <p className={`text-sm ${result.verification?.isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {result.verification?.isValid
                      ? 'This certificate is authentic and was issued by UNITEE.'
                      : 'This certificate could not be verified — it may be tampered or revoked.'}
                  </p>
                </div>
              </div>

              {/* Certificate details */}
              {result.verification?.isValid && result.certificate && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award size={18} className="text-blue-500" /> Certificate Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Certificate ID', value: result.certificate.certificateId },
                      { label: 'Title',           value: result.certificate.title },
                      { label: 'Recipient',       value: result.certificate.recipient?.name },
                      { label: 'Issued by',       value: result.certificate.issuer?.name },
                      { label: 'Date Issued',     value: result.certificate.issuedDate ? new Date(result.certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                      { label: 'Status',          value: result.certificate.status ?? 'active' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="font-medium text-gray-900 capitalize">{value ?? '—'}</p>
                      </div>
                    ))}
                    {result.certificate.metrics?.hoursCompleted > 0 && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-0.5">Hours Completed</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Clock size={13} /> {result.certificate.metrics.hoursCompleted}h
                        </p>
                      </div>
                    )}
                    {result.certificate.opportunity?.title && (
                      <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                        <p className="text-xs text-gray-400 mb-0.5">Related Event</p>
                        <p className="font-medium text-gray-900">{result.certificate.opportunity.title}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                    Verification #{result.certificate.verificationCount} ·{' '}
                    {result.certificate.lastVerified ? `Last checked ${new Date(result.certificate.lastVerified).toLocaleDateString()}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Idle state */}
          {!loading && !result && !error && (
            <div className="text-center py-16 text-gray-400">
              <ShieldCheck size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter a certificate ID above to check its authenticity.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CertificateVerify;
