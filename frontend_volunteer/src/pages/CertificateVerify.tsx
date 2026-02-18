import React, { useState } from 'react';
import { SearchIcon, ShieldCheckIcon, CheckIcon, XIcon } from '@/components/icons/Icons';

const CertificateVerify: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${certificateId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Certificate not found');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon size={32} className="text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-xl text-gray-600 mb-8">
            Verify the authenticity of UNITEE volunteer certificates
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID (e.g., UNITEE-ABC123-DEF456)"
                className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <button
                onClick={verifyCertificate}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XIcon size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Verification Failed</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border-2 ${
                result.verification.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-4">
                  {result.verification.isValid ? (
                    <CheckIcon size={32} className="text-green-600" />
                  ) : (
                    <XIcon size={32} className="text-red-600" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      result.verification.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.verification.isValid ? 'Certificate Verified ✓' : 'Certificate Invalid ✗'}
                    </h2>
                    <p className={`${
                      result.verification.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.verification.isValid 
                        ? 'This certificate is authentic and verified by UNITEE'
                        : 'This certificate could not be verified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {result.verification.isValid && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">ID:</span> {result.certificate.certificateId}</p>
                    <p><span className="font-medium">Title:</span> {result.certificate.title}</p>
                    <p><span className="font-medium">Recipient:</span> {result.certificate.recipient.name}</p>
                    <p><span className="font-medium">Issued by:</span> {result.certificate.issuer.name}</p>
                    <p><span className="font-medium">Date:</span> {new Date(result.certificate.issuedDate).toLocaleDateString()}</p>
                    {result.certificate.metrics.hoursCompleted > 0 && (
                      <p><span className="font-medium">Hours:</span> {result.certificate.metrics.hoursCompleted}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CertificateVerify;