
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, logout } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, MessageSquare, BookOpen, BarChart3, Sparkles } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-xl border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                ExamPortal
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
              <Link 
                to="/" 
                className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                  isActiveRoute('/') 
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/forum" 
                className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                  isActiveRoute('/forum') 
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Forum</span>
              </Link>
              <Link 
                to="/chat" 
                className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                  isActiveRoute('/chat') 
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Link>
              {currentUser.role === 'student' && (
                <>
                  <Link 
                    to="/my-exams" 
                    className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                      isActiveRoute('/my-exams') 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>My Exams</span>
                  </Link>
                  <Link 
                    to="/results" 
                    className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                      isActiveRoute('/results') 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Results</span>
                  </Link>
                </>
              )}
              {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                <>
                  <Link 
                    to="/exams" 
                    className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                      isActiveRoute('/exams') 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Exams</span>
                  </Link>
                  <Link 
                    to="/questions" 
                    className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                      isActiveRoute('/questions') 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Questions</span>
                  </Link>
                  <Link 
                    to="/grading" 
                    className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                      isActiveRoute('/grading') 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Grading</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-200">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-blue-200" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                    {currentUser.slogan && (
                      <p className="text-xs text-muted-foreground italic">
                        "{currentUser.slogan}"
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
