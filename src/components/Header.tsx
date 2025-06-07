
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { User, LogOut, Settings, MessageSquare, BookOpen, BarChart3, GraduationCap } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
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

  return (
    <header className="relative z-20">
      <div className="modern-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">ExamPortal</span>
              </Link>
              <nav className="hidden lg:flex space-x-8">
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors flex items-center space-x-2 font-medium"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/forum" 
                  className="text-foreground hover:text-primary transition-colors flex items-center space-x-2 font-medium"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Forum</span>
                </Link>
                {currentUser.role === 'student' && (
                  <>
                    <Link 
                      to="/my-exams" 
                      className="text-foreground hover:text-primary transition-colors flex items-center space-x-2 font-medium"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>My Exams</span>
                    </Link>
                    <Link 
                      to="/results" 
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Results
                    </Link>
                  </>
                )}
                {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                  <>
                    <Link 
                      to="/exams" 
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Exams
                    </Link>
                    <Link 
                      to="/questions" 
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Questions
                    </Link>
                    <Link 
                      to="/grading" 
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Grading
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-accent/50">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-lg border-white/20" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-foreground">{currentUser.name}</p>
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
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
