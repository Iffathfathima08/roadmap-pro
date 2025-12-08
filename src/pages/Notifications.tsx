import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, Calendar, Flame, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons = {
  deadline: Calendar,
  streak: Flame,
  achievement: Trophy,
  'goal-complete': Target,
};

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const requestPermission = async () => {
    if ('Notification' in window) {
      await window.Notification.requestPermission();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={requestPermission}>
            Enable Browser Notifications
          </Button>
          {notifications.some(n => !n.read) && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(notification => {
            const Icon = typeIcons[notification.type];
            return (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-xl border flex items-start gap-4 transition-colors',
                  notification.read 
                    ? 'bg-card border-border' 
                    : 'bg-primary/5 border-primary/20'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  notification.read ? 'bg-muted' : 'bg-primary/10'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    notification.read ? 'text-muted-foreground' : 'text-primary'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! Notifications will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
