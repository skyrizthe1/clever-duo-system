
-- Add likes table for forum posts
CREATE TABLE public.forum_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Add comments table for forum posts
CREATE TABLE public.forum_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add private chats table
CREATE TABLE public.private_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Add private messages table
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add chat requests table
CREATE TABLE public.chat_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_post_likes
CREATE POLICY "Users can view all likes" ON public.forum_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.forum_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.forum_post_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for forum_post_comments
CREATE POLICY "Users can view all comments" ON public.forum_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.forum_post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own comments" ON public.forum_post_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON public.forum_post_comments FOR DELETE USING (auth.uid() = author_id);

-- RLS policies for private_chats
CREATE POLICY "Users can view their own chats" ON public.private_chats FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create chats" ON public.private_chats FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- RLS policies for private_messages
CREATE POLICY "Users can view messages in their chats" ON public.private_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = chat_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their chats" ON public.private_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = chat_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- RLS policies for chat_requests
CREATE POLICY "Users can view requests they sent or received" ON public.chat_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create requests" ON public.chat_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update requests they received" ON public.chat_requests FOR UPDATE USING (auth.uid() = receiver_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_post_comments_updated_at
  BEFORE UPDATE ON public.forum_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_chats_updated_at
  BEFORE UPDATE ON public.private_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
