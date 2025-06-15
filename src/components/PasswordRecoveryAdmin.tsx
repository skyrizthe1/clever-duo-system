
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPasswordRecoveryRequest } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface PasswordRecoveryAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PasswordRecoveryRequest {
  id: string;
  user_name: string;
  user_email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
}

export function PasswordRecoveryAdmin({ open, onOpenChange }: PasswordRecoveryAdminProps) {
  const [selectedRequest, setSelectedRequest] = useState<PasswordRecoveryRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockRequests: PasswordRecoveryRequest[] = [
    {
      id: '1',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      reason: 'Forgot password after long absence',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_name: 'Jane Smith',
      user_email: 'jane@example.com',
      reason: 'Account locked due to multiple failed attempts',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      processed_at: new Date().toISOString(),
      admin_notes: 'Verified identity via email'
    }
  ];

  const { data: requests = mockRequests, isLoading } = useQuery({
    queryKey: ['passwordRecoveryRequests'],
    queryFn: async () => {
      // This would normally fetch from the API
      return mockRequests;
    },
    enabled: open
  });

  const handleProcessRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would call the API
      toast.success(`Request ${action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['passwordRecoveryRequests'] });
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to process request:', error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Password Recovery Management
          </DialogTitle>
          <DialogDescription>
            Review and process password recovery requests from users
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Requests ({pendingRequests.length})
            </h3>
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No pending requests
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {request.user_name}
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {request.user_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3 mt-1" />
                        <span className="line-clamp-2">{request.reason}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleProcessRequest(request.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProcessRequest(request.id, 'reject')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Processed Requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Processed ({processedRequests.length})
            </h3>
            {processedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No processed requests
                </CardContent>
              </Card>
            ) : (
              processedRequests.slice(0, 5).map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {request.user_name}
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {request.user_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        Processed: {request.processed_at ? new Date(request.processed_at).toLocaleDateString() : 'N/A'}
                      </div>
                      {request.admin_notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MessageSquare className="h-3 w-3 mt-1" />
                          <span className="line-clamp-2">{request.admin_notes}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
