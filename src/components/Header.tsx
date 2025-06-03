
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { logout, getCurrentUser, UserRole } from '@/services/api';
import { Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(fetchUser, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    fetchUser();

    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Define navigation items based on user role
  const getNavItems = (role?: UserRole) => {
    const items = [
      { name: 'Dashboard', path: '/' },
    ];
    
    // Add role-specific navigation items
    if (role === 'admin' || role === 'teacher') {
      items.push({ name: 'Questions', path: '/questions' });
      items.push({ name: 'Exams', path: '/exams' });
      items.push({ name: 'Grading', path: '/grading' });
    }
    
    if (role === 'student') {
      items.push({ name: 'My Exams', path: '/my-exams' });
      items.push({ name: 'Results', path: '/results' });
    }
    
    return items;
  };
  
  const navItems = getNavItems(user?.role);
  
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 flex h-14 items-center">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-background border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">E</span>
            </div>
            <span className="hidden md:block">Exam Portal</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActiveLink(item.path) 
                    ? 'text-primary font-bold'
                    : 'hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name ? getInitials(user.name) : '?'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-6" onClick={() => setIsMenuOpen(false)}>
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">E</span>
                </div>
                <span>Exam Portal</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-2 text-lg font-medium ${
                      isActiveLink(item.path) ? 'text-primary' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user && (
                  <Button variant="ghost" className="justify-start px-2" onClick={handleLogout}>
                    Log out
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
