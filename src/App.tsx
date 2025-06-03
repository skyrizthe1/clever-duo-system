
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { getCurrentUser } from "./services/api";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Questions from "./pages/Questions";
import Exams from "./pages/Exams";
import MyExams from "./pages/MyExams";
import Results from "./pages/Results";
import Grading from "./pages/Grading";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Auth context
const AuthContext = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Ensure user profile exists
          setTimeout(async () => {
            try {
              await getCurrentUser();
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Role-based guard component
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const profile = await getCurrentUser();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error getting user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserRole();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!userProfile) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthContext>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/questions" element={
              <RoleRoute allowedRoles={['admin', 'teacher']}>
                <Questions />
              </RoleRoute>
            } />
            <Route path="/exams" element={
              <RoleRoute allowedRoles={['admin', 'teacher']}>
                <Exams />
              </RoleRoute>
            } />
            <Route path="/my-exams" element={
              <RoleRoute allowedRoles={['student']}>
                <MyExams />
              </RoleRoute>
            } />
            <Route path="/results" element={
              <RoleRoute allowedRoles={['student']}>
                <Results />
              </RoleRoute>
            } />
            <Route path="/grading" element={
              <RoleRoute allowedRoles={['admin', 'teacher']}>
                <Grading />
              </RoleRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContext>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
