import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Forum from "./pages/Forum";
import Chat from "./pages/Chat";
import Questions from "./pages/Questions";
import Exams from "./pages/Exams";
import MyExams from "./pages/MyExams";
import Results from "./pages/Results";
import Grading from "./pages/Grading";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/my-exams" element={<MyExams />} />
            <Route path="/results" element={<Results />} />
            <Route path="/grading" element={<Grading />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
