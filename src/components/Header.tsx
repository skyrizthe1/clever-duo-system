
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
import { User, LogOut, Settings, MessageSquare, BookOpen, BarChart3, Sparkles, Circle } from 'lucide-react';

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
    <header className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 shadow-2xl border-b border-blue-500/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-2">
          <div className="flex items-center space-x-10">
            <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-3 hover:scale-105 transition-all duration-300 group">
              <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                <Sparkles className="h-7 w-7 text-yellow-300" />
              </div>
              <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent text-3xl font-extrabold">
                ExamPortal
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-2 bg-white/15 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-lg">
              <Link 
                to="/" 
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                  isActiveRoute('/') 
                    ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                    : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
                {isActiveRoute('/') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
              </Link>
              
              <Link 
                to="/forum" 
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                  isActiveRoute('/forum') 
                    ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                    : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Forum</span>
                {isActiveRoute('/forum') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
              </Link>
              
              <Link 
                to="/chat" 
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                  isActiveRoute('/chat') 
                    ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                    : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
                {isActiveRoute('/chat') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
              </Link>

              {/* Role-specific navigation items with same enhanced styling */}
              {currentUser.role === 'student' && (
                <>
                  <Link 
                    to="/my-exams" 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                      isActiveRoute('/my-exams') 
                        ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                        : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>My Exams</span>
                    {isActiveRoute('/my-exams') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                  </Link>
                  <Link 
                    to="/results" 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                      isActiveRoute('/results') 
                        ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                        : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Results</span>
                    {isActiveRoute('/results') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                  </Link>
                </>
              )}
              {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                <>
                  <Link 
                    to="/exams" 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                      isActiveRoute('/exams') 
                        ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                        : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Exams</span>
                    {isActiveRoute('/exams') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                  </Link>
                  <Link 
                    to="/questions" 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                      isActiveRoute('/questions') 
                        ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                        : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Questions</span>
                    {isActiveRoute('/questions') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                  </Link>
                  <Link 
                    to="/grading" 
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold text-sm relative group ${
                      isActiveRoute('/grading') 
                        ? 'bg-white text-blue-700 shadow-xl transform scale-105 ring-2 ring-white/50' 
                        : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Grading</span>
                    {isActiveRoute('/grading') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-white/15 transition-all duration-300 ring-2 ring-white/20 hover:ring-white/40">
                  <Avatar className="h-12 w-12 ring-2 ring-white/40 hover:ring-white/60 transition-all duration-300">
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                      {getInitials(currentUser.name || currentUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center">
                    <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                    <Circle className="absolute h-4 w-4 animate-ping fill-green-400 text-green-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-md border-blue-200 shadow-2xl rounded-2xl p-2" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {getInitials(currentUser.name || currentUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-gray-900">{currentUser.name || currentUser.email}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                      {currentUser.role}
                    </p>
                    {currentUser.slogan && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        "{currentUser.slogan}"
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/profile" className="flex items-center p-3 hover:bg-blue-50 transition-colors duration-200">
                    <User className="mr-3 h-5 w-5 text-blue-600" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/profile" className="flex items-center p-3 hover:bg-blue-50 transition-colors duration-200">
                    <Settings className="mr-3 h-5 w-5 text-blue-600" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-3 hover:bg-red-50 transition-colors duration-200">
                  <LogOut className="mr-3 h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
