'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Ticket, 
  BookOpen, 
  Bot, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Menu
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/ai-chat', label: 'AI Chat', icon: Bot },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navLinksContent = (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-indigo-500/10 text-indigo-400' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-muted-foreground'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden border-r border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 md:block ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <Bot className="h-8 w-8 text-indigo-500" />
          {sidebarOpen && <span className="ml-3 text-lg font-bold tracking-tight">SupportGPT</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen ? (
            {navLinksContent}
          ) : (
            <nav className="flex flex-col items-center space-y-4 py-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} title={item.label}>
                  <item.icon className={`h-6 w-6 ${pathname.startsWith(item.href) ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-r border-white/10 bg-background p-0">
                <div className="flex h-16 items-center border-b border-white/10 px-4">
                  <Bot className="h-8 w-8 text-indigo-500" />
                  <span className="ml-3 text-lg font-bold tracking-tight">SupportGPT</span>
                </div>
                {navLinksContent}
              </SheetContent>
            </Sheet>

            {/* Desktop Sidebar Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[url('/noise.png')] bg-repeat p-4 mix-blend-overlay sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
