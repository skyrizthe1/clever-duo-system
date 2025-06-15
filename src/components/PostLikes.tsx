
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostLikes, togglePostLike, getCurrentUser } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PostLikesProps {
  postId: string;
}

export function PostLikes({ postId }: PostLikesProps) {
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const { data: likesData = { count: 0, isLiked: false } } = useQuery({
    queryKey: ['postLikes', postId],
    queryFn: () => getPostLikes(postId)
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      // Check authentication before proceeding
      if (!currentUser) {
        toast.error('Please log in to like posts');
        throw new Error('User not authenticated');
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['postLikes', postId] });

      // Snapshot the previous value
      const previousLikesData = queryClient.getQueryData(['postLikes', postId]) || { count: 0, isLiked: false };

      // Optimistically update - toggle the current state
      const newIsLiked = !likesData.isLiked;
      const newCount = newIsLiked ? likesData.count + 1 : likesData.count - 1;
      
      queryClient.setQueryData(['postLikes', postId], {
        count: newCount,
        isLiked: newIsLiked
      });

      // Animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);

      return { previousLikesData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLikesData) {
        queryClient.setQueryData(['postLikes', postId], context.previousLikesData);
      }
      
      // Show error message if not already shown in onMutate
      if (err.message !== 'User not authenticated') {
        toast.error('Failed to update like status');
      }
    },
    onSettled: () => {
      // Always refetch after success or error to sync with server
      queryClient.invalidateQueries({ queryKey: ['postLikes', postId] });
    }
  });

  const handleToggleLike = () => {
    if (!currentUser) {
      toast.error('Please log in to like posts');
      return;
    }
    toggleLikeMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      className={`flex items-center space-x-1 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
        !currentUser ? 'cursor-not-allowed opacity-50' : ''
      }`}
      disabled={!currentUser}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-200 ${
          likesData.isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-500'
        } ${
          isAnimating ? 'scale-125 rotate-12' : 'scale-100'
        }`} 
      />
      <span className={`transition-colors duration-200 ${likesData.isLiked ? 'text-red-600' : 'text-gray-600'}`}>
        {likesData.count}
      </span>
    </Button>
  );
}
