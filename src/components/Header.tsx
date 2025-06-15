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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User, LogOut, Settings, MessageSquare, BookOpen, BarChart3, Sparkles, Moon, Sun } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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
    <TooltipProvider>
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                  ExamPortal
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/" 
                      className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                        isActiveRoute('/') 
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                          : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View your main dashboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/forum" 
                      className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                        isActiveRoute('/forum') 
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                          : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Forum</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Join community discussions</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/chat" 
                      className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                        isActiveRoute('/chat') 
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                          : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Private messaging</p>
                  </TooltipContent>
                </Tooltip>

                {currentUser.role === 'student' && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/my-exams" 
                          className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                            isActiveRoute('/my-exams') 
                              ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                              : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                          }`}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>My Exams</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View and take your assigned exams</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/results" 
                          className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                            isActiveRoute('/results') 
                              ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                              : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                          }`}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Results</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check your exam results</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}

                {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/exams" 
                          className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                            isActiveRoute('/exams') 
                              ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                              : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                          }`}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Exams</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage exams</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/questions" 
                          className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                            isActiveRoute('/questions') 
                              ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                              : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Questions</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage question bank</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/grading" 
                          className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                            isActiveRoute('/grading') 
                              ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                              : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
                          }`}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Grading</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grade student submissions</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="text-white hover:bg-white/10 transition-all duration-200"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {isDarkMode ? 'light' : 'dark'} mode</p>
                </TooltipContent>
              </Tooltip>

              {/* User Avatar with Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-200">
                    <Avatar className="h-10 w-10 ring-2 ring-white/30">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-blue-200 shadow-xl" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-lg">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                      {currentUser.slogan && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{currentUser.slogan}"
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-3 h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
