import React, { useState } from 'react';
import { reportAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetModel: 'User' | 'Opportunity' | 'Community';
  targetName?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetModel,
  targetName
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const reportTypes = {
    User: [
      { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
      { value: 'spam', label: 'Spam' },
      { value: 'harassment', label: 'Harassment' },
      { value: 'fake_profile', label: 'Fake Profile' },
      { value: 'other', label: 'Other' }
    ],
    Opportunity: [
      { value: 'misleading_info', label: 'Misleading Information' },
      { value: 'inappropriate_content', label: 'Inappropriate Content' },
      { value: 'spam', label: 'Spam' },
      { value: 'scam', label: 'Potential Scam' },
      { value: 'other', label: 'Other' }
    ],
    Community: [
      { value: 'inappropriate_content', label: 'Inappropriate Content' },
      { value: 'spam', label: 'Spam' },
      { value: 'misleading_info', label: 'Misleading Information' },
      { value: 'inactive', label: 'Inactive/Abandoned' },
      { value: 'other', label: 'Other' }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await reportAPI.create({
        type: formData.type,
        targetId,
        targetModel,
        reason: formData.reason,
        description: formData.description
      });

      toast({
        title: 'Report Submitted',
        description: 'Thank you for your report. We will review it shortly.',
      });

      setFormData({ type: '', reason: '', description: '' });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {targetModel}
          </DialogTitle>
          <DialogDescription>
            Report {targetName ? `"${targetName}"` : `this ${targetModel.toLowerCase()}`} for inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Report Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes[targetModel].map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Brief Reason *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Brief description of the issue"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.reason.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide more details about the issue..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;