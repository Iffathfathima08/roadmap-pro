import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowLeft, TrendingUp, Users, Target, Map, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get goal completion stats
      const { data: goals } = await supabase
        .from('goals')
        .select('status, created_at');

      // Get user signups over time (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(startOfDay(date), 'yyyy-MM-dd');
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      // Get roadmap usage
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('domain, created_at');

      // Process goal status distribution
      const goalStats = {
        completed: goals?.filter(g => g.status === 'completed').length || 0,
        inProgress: goals?.filter(g => g.status === 'in-progress').length || 0,
        notStarted: goals?.filter(g => g.status === 'not-started').length || 0,
      };

      // Process user signups by day
      const signupsByDay = last7Days.map(date => ({
        date: format(new Date(date), 'MMM d'),
        signups: profiles?.filter(p => p.created_at && format(new Date(p.created_at), 'yyyy-MM-dd') === date).length || 0,
      }));

      // Process roadmap domains
      const domainCounts: Record<string, number> = {};
      roadmaps?.forEach(r => {
        const domain = r.domain || 'Custom';
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });
      const domainData = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));

      return {
        goalStats,
        signupsByDay,
        domainData,
        totalGoals: goals?.length || 0,
        totalRoadmaps: roadmaps?.length || 0,
      };
    },
  });

  const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--muted))'];
  const DOMAIN_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const pieData = analytics ? [
    { name: 'Completed', value: analytics.goalStats.completed },
    { name: 'In Progress', value: analytics.goalStats.inProgress },
    { name: 'Not Started', value: analytics.goalStats.notStarted },
  ] : [];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold font-display">Platform Analytics</h1>
          </div>
          <p className="text-muted-foreground">View platform usage statistics and insights</p>
        </div>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  User Signups (Last 7 Days)
                </CardTitle>
                <CardDescription>New user registrations over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.signupsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  Goal Status Distribution
                </CardTitle>
                <CardDescription>Overview of all goals by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-muted-foreground">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-accent" />
                Roadmaps by Domain
              </CardTitle>
              <CardDescription>Distribution of roadmaps across learning domains</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.domainData && analytics.domainData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.domainData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={150} className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {analytics.domainData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No roadmap data yet</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
