
import React, { useState, useEffect } from 'react';
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

  const { data: likesData = { count: 0, isLiked: false } } = useQuery({
    queryKey: ['postLikes', postId],
    queryFn: () => getPostLikes(postId)
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onSuccess: (isLiked) => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      queryClient.invalidateQueries({ queryKey: ['postLikes', postId] });
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
      disabled={toggleLikeMutation.isPending}
      className="flex items-center space-x-1 hover:bg-red-50 hover:text-red-600"
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-300 ${
          likesData.isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-500'
        } ${
          isAnimating ? 'scale-125' : 'scale-100'
        }`} 
      />
      <span className={likesData.isLiked ? 'text-red-600' : 'text-gray-600'}>
        {likesData.count}
      </span>
    </Button>
  );
}
