
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendMessage } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrivateChatProps {
  chatId: string;
  otherParticipant: {
    name: string;
    avatar_url?: string;
  };
  currentUserId: string;
}

export function PrivateChat({ chatId, otherParticipant, currentUserId }: PrivateChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => getChatMessages(chatId),
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(chatId, content),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-96 bg-white border rounded-lg">
      {/* Chat header */}
      <div className="flex items-center space-x-3 p-4 border-b bg-gray-50 rounded-t-lg">
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherParticipant.avatar_url} alt={otherParticipant.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium">{otherParticipant.name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatDistanceToNow(new Date(message.created_at))} ago
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
