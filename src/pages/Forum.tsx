import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForumCategories, getForumPosts, createForumPost, getCurrentUser } from '@/services/api';
import { PostLikes } from '@/components/PostLikes';
import { PostComments } from '@/components/PostComments';
import { ChatRequest } from '@/components/ChatRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, MessageSquare, Eye, Pin, Lock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Forum = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category_id: '',
  });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: getForumCategories
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts', selectedCategory],
    queryFn: () => getForumPosts(selectedCategory || undefined)
  });

  const createPostMutation = useMutation({
    mutationFn: createForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setIsCreatePostOpen(false);
      setNewPost({ title: '', content: '', category_id: '' });
    }
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    createPostMutation.mutate({
      ...newPost,
      author_id: currentUser.id,
      pinned: false,
      locked: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, ask questions, or start a discussion.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newPost.category_id} onValueChange={(value) => setNewPost(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newPost.title}
                    onChange={handleInputChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={newPost.content}
                    onChange={handleInputChange}
                    placeholder="Write your post content here..."
                    rows={6}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('')}
                >
                  All Posts
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-4">
              {selectedCategoryData && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: selectedCategoryData.color }}
                      />
                      <div>
                        <h2 className="text-xl font-semibold">{selectedCategoryData.name}</h2>
                        {selectedCategoryData.description && (
                          <p className="text-muted-foreground">{selectedCategoryData.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No posts found in this category.</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to start a discussion!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map(post => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {post.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                              {post.locked && <Lock className="h-4 w-4 text-red-500" />}
                              <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                            </div>
                            {currentUser && currentUser.id !== post.author_id && (
                              <ChatRequest 
                                receiverId={post.author_id} 
                                receiverName={post.author_name} 
                              />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>by {post.author_name}</span>
                              <span>{formatDistanceToNow(post.created_at)} ago</span>
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                            {categories.find(cat => cat.id === post.category_id) && (
                              <Badge variant="secondary" className="text-xs">
                                {categories.find(cat => cat.id === post.category_id)?.name}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Post interactions */}
                          <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                            <PostLikes postId={post.id} />
                            <PostComments postId={post.id} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Forum;
