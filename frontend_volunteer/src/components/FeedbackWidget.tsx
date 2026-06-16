import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/NewAuthContext';
import { feedbackAPI } from '@/lib/api';

type FeedbackType = 'bug' | 'suggestion' | 'question' | 'other';

const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { value: 'question', label: 'Question', emoji: '❓' },
  { value: 'other', label: 'Other', emoji: '💬' },
];

const FeedbackWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpen = () => {
    setEmail(user?.email || '');
    setSubmitted(false);
    setMessage('');
    setType('suggestion');
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      await feedbackAPI.submit({
        type,
        message: message.trim(),
        email: email.trim(),
        page: window.location.pathname,
      }, isAuthenticated);
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2500);
    } catch {
      // fail silently — widget should never crash the page
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        aria-label="Send feedback"
      >
        <MessageSquare size={18} />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-full sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-16 sm:mb-0">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-orange-50">
              <div>
                <p className="font-semibold text-gray-900">Share Feedback</p>
                <p className="text-xs text-gray-500 mt-0.5">Help us improve UNITEE</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <CheckCircle size={48} className="text-green-500 mb-3" />
                <p className="font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your feedback has been received.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">

                {/* Type selector */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Type</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium border-2 transition-all ${
                          type === t.value
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                        }`}
                      >
                        <span className="text-lg">{t.emoji}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Message</p>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe what you experienced or what you'd like to see..."
                    rows={4}
                    maxLength={2000}
                    className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{message.length}/2000</p>
                </div>

                {/* Email (pre-filled if logged in) */}
                {!isAuthenticated && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Email (optional)</p>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="So we can follow up with you"
                      className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" />Sending...</>
                  ) : (
                    <><Send size={16} />Send Feedback</>
                  )}
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
