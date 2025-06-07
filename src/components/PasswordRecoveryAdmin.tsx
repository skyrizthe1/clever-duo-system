
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPasswordRecoveryRequests, processPasswordRecoveryRequest } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { PasswordRecoveryRequest } from '@/services/api';

export function PasswordRecoveryAdmin() {
  const [selectedRequest, setSelectedRequest] = useState<PasswordRecoveryRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['password-recovery-requests'],
    queryFn: getPasswordRecoveryRequests
  });

  const processMutation = useMutation({
    mutationFn: ({ requestId, action, notes }: { requestId: string; action: 'approve' | 'deny'; notes?: string }) =>
      processPasswordRecoveryRequest(requestId, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['password-recovery-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
    },
  });

  const handleViewRequest = (request: PasswordRecoveryRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
  };

  const handleProcessRequest = async (action: 'approve' | 'deny') => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    processMutation.mutate({
      requestId: selectedRequest.id,
      action,
      notes: adminNotes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Password Recovery Requests</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Pending: <span className="font-semibold text-yellow-600">{pendingRequests.length}</span>
          </div>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-700">Pending Requests</CardTitle>
            <CardDescription>These requests require your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user_name}</TableCell>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason || 'No reason provided'}</TableCell>
                    <TableCell>{request.created_at.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processed Requests</CardTitle>
            <CardDescription>Previously handled requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Temp Password</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user_name}</TableCell>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.processed_at?.toLocaleDateString() || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.temporary_password ? '••••••••••••' : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Password Recovery Request Details</DialogTitle>
            <DialogDescription>
              Review and process this password recovery request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">User:</Label>
                  <p>{selectedRequest.user_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email:</Label>
                  <p>{selectedRequest.user_email}</p>
                </div>
                <div>
                  <Label className="font-medium">Status:</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="font-medium">Requested:</Label>
                  <p>{selectedRequest.created_at.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Reason:</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRequest.reason || 'No reason provided'}
                </p>
              </div>

              {selectedRequest.temporary_password && (
                <div>
                  <Label className="font-medium">Temporary Password:</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedRequest.temporary_password}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="adminNotes">Admin Notes:</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                  disabled={selectedRequest.status !== 'pending'}
                />
              </div>
            </div>
          )}
          
          {selectedRequest?.status === 'pending' && (
            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => handleProcessRequest('deny')}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Deny
              </Button>
              <Button
                onClick={() => handleProcessRequest('approve')}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {isProcessing ? 'Processing...' : 'Approve & Reset Password'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
