import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Award, LayoutDashboard, User, LogOut, BarChart3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppState, View } from '../App';

interface HeaderProps {
  navigate: (state: AppState) => void;
  currentView: View;
}

export default function Header({ navigate, currentView }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ view: 'home' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
          <button
            onClick={() => navigate({ view: 'home' })}
            className="flex items-center gap-2 font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity min-w-0 flex-shrink-0"
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span className="truncate">DevLearn</span>
          </button>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ view: 'home' })}
              >
                Courses
              </Button>
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ view: 'dashboard' })}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentView === 'certificates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ view: 'certificates' })}
              >
                <Award className="h-4 w-4 mr-2" />
                Certificates
              </Button>
              {isAdmin && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ view: 'admin' })}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {isAuthenticated && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{userProfile.name}</span>
                  {isAdmin && <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">Admin</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ view: 'dashboard' })}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ view: 'certificates' })}>
                  <Award className="h-4 w-4 mr-2" />
                  My Certificates
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ view: 'admin' })}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isAuthenticated && (
            <Button onClick={handleAuth} disabled={disabled} size="sm" className="text-sm">
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
