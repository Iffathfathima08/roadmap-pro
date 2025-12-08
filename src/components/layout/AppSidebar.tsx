import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  Map, 
  Bell, 
  User, 
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/roadmaps', icon: Map, label: 'Roadmaps' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold gradient-text">RoadmapPro</h1>
      </div>

      {user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <div className="flex items-center gap-1 text-xs text-streak">
                <Flame className="w-3 h-3" />
                <span>{user.currentStreak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          const showBadge = to === '/notifications' && unreadCount > 0;
          
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {showBadge && (
                <span className="absolute right-3 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
