
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostComments, createPostComment } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  // Always fetch comment count
  const { data: commentCount = 0 } = useQuery({
    queryKey: ['postCommentCount', postId],
    queryFn: async () => {
      const comments = await getPostComments(postId);
      return comments.length;
    }
  });

  // Only fetch full comments when expanded
  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => getPostComments(postId),
    enabled: isExpanded
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createPostComment(postId, content),
    onSuccess: () => {
      setNewComment('');
      // Invalidate both the comments and comment count
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['postCommentCount', postId] });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1 hover:bg-blue-50 hover:text-blue-600"
      >
        <MessageSquare className="h-4 w-4" />
        <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
      </Button>

      {isExpanded && (
        <div className="space-y-4 border-l-2 border-gray-100 pl-4">
          {/* New comment form */}
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="resize-none"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="flex items-center space-x-1"
            >
              <Send className="h-3 w-3" />
              <span>{createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}</span>
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm">{comment.author_name}</p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
