import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Map, Target, BarChart3, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, goalsRes, roadmapsRes, templatesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('goals').select('id', { count: 'exact', head: true }),
        supabase.from('roadmaps').select('id', { count: 'exact', head: true }),
        supabase.from('predefined_roadmaps').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalGoals: goalsRes.count || 0,
        totalRoadmaps: roadmapsRes.count || 0,
        totalTemplates: templatesRes.count || 0,
      };
    },
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
    { title: 'Goals Created', value: stats?.totalGoals || 0, icon: Target, color: 'text-success' },
    { title: 'User Roadmaps', value: stats?.totalRoadmaps || 0, icon: Map, color: 'text-accent' },
    { title: 'Templates', value: stats?.totalTemplates || 0, icon: BarChart3, color: 'text-warning' },
  ];

  const adminLinks = [
    { to: '/admin/users', label: 'Manage Users', description: 'View and manage user accounts and roles', icon: Users },
    { to: '/admin/roadmaps', label: 'Roadmap Templates', description: 'Create and manage predefined learning roadmaps', icon: Map },
    { to: '/admin/analytics', label: 'Platform Analytics', description: 'View platform usage statistics and reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage users, roadmaps, and platform settings</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color }) => (
          <Card key={title} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`w-5 h-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-display">
                {isLoading ? '...' : value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {adminLinks.map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
