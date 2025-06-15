
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createPasswordRecoveryRequest } from '@/services/api';
import { toast } from 'sonner';

interface PasswordRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordRecoveryDialog({ open, onOpenChange }: PasswordRecoveryDialogProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await createPasswordRecoveryRequest(email.trim(), reason.trim() || undefined);
      setEmail('');
      setReason('');
      onOpenChange(false);
    } catch (error) {
      // Error already handled in the API function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Password Recovery</DialogTitle>
          <DialogDescription>
            Submit a request to have your password reset by an administrator. 
            Please provide your email address and a reason for your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for password reset (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need your password reset..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
