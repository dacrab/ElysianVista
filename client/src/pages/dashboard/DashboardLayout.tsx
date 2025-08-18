// client/src/pages/dashboard/DashboardLayout.tsx
import PageTransition from '@/components/animation/PageTransition';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, useAuthorization } from '@/contexts/AuthProvider';
import { cn } from '@/lib/utils';

import {
  Bell,
  Building,
  ChevronDown,
  Globe,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile } = useAuthorization();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Overview' },
    { to: '/dashboard/listings', icon: Home, text: 'Listings' },
    { to: '/dashboard/team', icon: Users, text: 'Team' },
    { to: '/dashboard/settings', icon: Settings, text: 'Settings' },
  ];

  const { pathname } = useLocation();

  return (
    <div className="grid min-h-screen w-full bg-gray-100 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden border-r bg-white md:block dark:bg-gray-800">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Building className="h-6 w-6 text-blue-600" />
              <span className="">ElysianVista</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-2">
            <ul className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-50',
                      pathname.startsWith(link.to) &&
                        'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 dark:bg-gray-800">
          <div className="w-full flex-1">{/* Can add a search bar here if needed later */}</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    alt={profile?.username || 'User'}
                  />
                  <AvatarFallback>
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{profile?.username || 'My Account'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-bold">{profile?.username}</div>
                <div className="text-xs text-gray-500">{profile?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Globe className="mr-2 h-4 w-4" />
                <span>View Public Site</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
