
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostLikes, togglePostLike } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PostLikesProps {
  postId: string;
}

export function PostLikes({ postId }: PostLikesProps) {
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);
  const [optimisticLike, setOptimisticLike] = useState<{ isLiked: boolean; count: number } | null>(null);

  const { data: likesData = { count: 0, isLiked: false } } = useQuery({
    queryKey: ['postLikes', postId],
    queryFn: () => getPostLikes(postId)
  });

  const displayData = optimisticLike || likesData;

  const toggleLikeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: () => {
      // Optimistic update
      const newIsLiked = !displayData.isLiked;
      const newCount = newIsLiked ? displayData.count + 1 : displayData.count - 1;
      setOptimisticLike({ isLiked: newIsLiked, count: newCount });
      
      // Immediate animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLikes', postId] });
      setOptimisticLike(null);
    },
    onError: () => {
      // Revert optimistic update on error
      setOptimisticLike(null);
    }
  });

  const handleToggleLike = () => {
    toggleLikeMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      className="flex items-center space-x-1 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-200 ${
          displayData.isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-500'
        } ${
          isAnimating ? 'scale-125 rotate-12' : 'scale-100'
        }`} 
      />
      <span className={`transition-colors duration-200 ${displayData.isLiked ? 'text-red-600' : 'text-gray-600'}`}>
        {displayData.count}
      </span>
    </Button>
  );
}
