
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
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
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
