
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
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => getChatMessages(chatId),
    refetchInterval: 5000, // Reduced from 3000ms to 5000ms for better performance
  });

  // Combine real messages with optimistic messages
  const displayMessages = [...messages, ...optimisticMessages];

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(chatId, content),
    onMutate: (content) => {
      // Add optimistic message immediately
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        isOptimistic: true
      };
      setOptimisticMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
    },
    onSuccess: () => {
      // Clear optimistic messages and refresh real data
      setOptimisticMessages([]);
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
    },
    onError: () => {
      // Remove failed optimistic message
      setOptimisticMessages([]);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  return (
    <div className="flex flex-col h-96 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl">
      {/* Chat header with gradient */}
      <div className="flex items-center space-x-3 p-4 border-b border-white/20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-t-xl">
        <Avatar className="h-8 w-8 ring-2 ring-white/30">
          <AvatarImage src={otherParticipant.avatar_url} alt={otherParticipant.name} />
          <AvatarFallback className="bg-white/20 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-white">{otherParticipant.name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-white/50 to-blue-50/30">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                message.sender_id === currentUserId
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-800 border border-white/30 shadow-md'
              } ${message.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
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

      {/* Message input with gradient */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-gradient-to-r from-white/60 to-blue-50/40 rounded-b-xl">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/80 border-white/30 focus:border-blue-400 focus:ring-blue-200"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
