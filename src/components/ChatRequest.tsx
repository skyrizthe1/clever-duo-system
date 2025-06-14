
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendChatRequest } from '@/services/api';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';

interface ChatRequestProps {
  receiverId: string;
  receiverName: string;
}

export function ChatRequest({ receiverId, receiverName }: ChatRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const sendRequestMutation = useMutation({
    mutationFn: (msg: string) => sendChatRequest(receiverId, msg),
    onSuccess: () => {
      setIsOpen(false);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chatRequests'] });
    }
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequestMutation.mutate(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <MessageCircle className="h-3 w-3" />
          <span>Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Chat Request</DialogTitle>
          <DialogDescription>
            Send a chat request to {receiverName}. They can accept or decline your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to chat with you..."
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={sendRequestMutation.isPending}
              className="w-full"
            >
              {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
