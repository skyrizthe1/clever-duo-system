
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatRequests, getPrivateChats, respondToChatRequest, getCurrentUser } from '@/services/api';
import { PrivateChat } from '@/components/PrivateChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const { data: chatRequests = [] } = useQuery({
    queryKey: ['chatRequests'],
    queryFn: getChatRequests
  });

  const { data: privateChats = [] } = useQuery({
    queryKey: ['privateChats'],
    queryFn: getPrivateChats
  });

  const respondToRequestMutation = useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) => 
      respondToChatRequest(requestId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRequests'] });
      queryClient.invalidateQueries({ queryKey: ['privateChats'] });
    }
  });

  const handleRespondToRequest = (requestId: string, accept: boolean) => {
    respondToRequestMutation.mutate({ requestId, accept });
  };

  const selectedChatData = privateChats.find(chat => chat.id === selectedChat);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Tabs defaultValue="chats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chats">Chats</TabsTrigger>
                <TabsTrigger value="requests">
                  Requests
                  {chatRequests.filter(req => req.receiver_id === currentUser?.id && req.status === 'pending').length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {chatRequests.filter(req => req.receiver_id === currentUser?.id && req.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chats" className="space-y-4">
                {privateChats.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No chats yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Send a chat request from the forum to start chatting!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  privateChats.map(chat => (
                    <Card 
                      key={chat.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedChat === chat.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.other_participant?.avatar_url} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{chat.other_participant?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.updated_at))} ago
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {chatRequests.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No chat requests.</p>
                    </CardContent>
                  </Card>
                ) : (
                  chatRequests.map(request => (
                    <Card key={request.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={
                              request.sender_id === currentUser?.id 
                                ? request.receiver?.avatar_url 
                                : request.sender?.avatar_url
                            } />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">
                                {request.sender_id === currentUser?.id ? (
                                  <>To: {request.receiver?.name}</>
                                ) : (
                                  <>From: {request.sender?.name}</>
                                )}
                              </p>
                              <Badge variant={
                                request.status === 'pending' ? 'default' :
                                request.status === 'accepted' ? 'secondary' : 'destructive'
                              }>
                                {request.status}
                              </Badge>
                            </div>
                            {request.message && (
                              <p className="text-sm text-muted-foreground mb-2">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-3">
                              {formatDistanceToNow(new Date(request.created_at))} ago
                            </p>
                            
                            {request.receiver_id === currentUser?.id && request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRespondToRequest(request.id, true)}
                                  disabled={respondToRequestMutation.isPending}
                                  className="flex items-center space-x-1"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Accept</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRespondToRequest(request.id, false)}
                                  disabled={respondToRequestMutation.isPending}
                                  className="flex items-center space-x-1"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Decline</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-2">
            {selectedChat && selectedChatData && currentUser ? (
              <PrivateChat
                chatId={selectedChat}
                otherParticipant={selectedChatData.other_participant}
                currentUserId={currentUser.id}
              />
            ) : (
              <Card className="h-96">
                <CardContent className="pt-6 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a chat to start messaging</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
