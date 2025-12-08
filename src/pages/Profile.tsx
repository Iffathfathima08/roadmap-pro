import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeDisplay } from '@/components/dashboard/BadgeDisplay';
import { useToast } from '@/hooks/use-toast';
import { User, Flame, Trophy, Target } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ displayName });
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings</p>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.displayName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-streak mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{user.currentStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">{user.longestStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-success mb-1">
                <Target className="w-5 h-5" />
                <span className="text-2xl font-bold">{user.totalGoalsCompleted}</span>
              </div>
              <p className="text-xs text-muted-foreground">Goals Done</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Earned Badges</h2>
          <BadgeDisplay earnedBadges={user.badges} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
