import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { authAPI } from '@/lib/api';
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface Props {
  open: boolean;
  onComplete: () => void;
}

const PURPOSES = [
  { value: 'volunteering', label: 'Volunteering', desc: 'Give back to my community through service' },
  { value: 'internship', label: 'Internship', desc: 'Gain practical experience in my field' },
  { value: 'community_impact', label: 'Community Impact', desc: 'Drive meaningful social change' },
  { value: 'professional_development', label: 'Professional Development', desc: 'Build skills and grow my network' },
];

const INTERESTS = [
  'Environment', 'Education', 'Healthcare', 'Humanitarian',
  'Social Services', 'Economic Development', 'Arts & Culture',
  'Sports & Recreation', 'Youth Development', 'Animal Welfare',
  'Technology', 'Food & Nutrition',
];

const AVAILABILITY = [
  { key: 'weekends', label: 'Weekends' },
  { key: 'evenings', label: 'Evenings' },
  { key: 'fullTime', label: 'Full-time' },
  { key: 'remote', label: 'Remote only' },
];

const STEPS = ['What brings you here?', 'Your interests', 'When are you available?'];

const OnboardingModal: React.FC<Props> = ({ open, onComplete }) => {
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    weekends: false, evenings: false, fullTime: false, remote: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (val: string) =>
    setInterests(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);

  const toggleAvailability = (key: string) =>
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));

  const canNext = () => {
    if (step === 0) return !!purpose;
    if (step === 1) return interests.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await authAPI.saveOnboarding({ purpose, interests, availability });
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Could not save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <DialogTitle className="text-xl">{STEPS[step]}</DialogTitle>
          <div className="flex gap-1 mt-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-blue-500' : 'bg-gray-200')}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="mt-4 min-h-[240px]">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-3">
              {PURPOSES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPurpose(p.value)}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all',
                    purpose === p.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <p className="font-semibold text-gray-900">{p.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Select all that apply — we'll use these to surface relevant opportunities and communities.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer select-none px-3 py-1.5 text-sm transition-all',
                      interests.includes(interest)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        : 'hover:border-blue-400 hover:text-blue-600',
                    )}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Select when you're typically available to volunteer.</p>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABILITY.map(a => (
                  <button
                    key={a.key}
                    onClick={() => toggleAvailability(a.key)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center font-medium transition-all',
                      availability[a.key]
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700',
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="gap-1 bg-blue-600 hover:bg-blue-700">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <>Get started <Sparkles className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
