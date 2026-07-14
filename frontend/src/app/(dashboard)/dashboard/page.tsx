'use client';

import { Users, Ticket, Bot, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Open Tickets',
    value: '12',
    icon: Ticket,
    description: '+2 since last hour',
  },
  {
    title: 'Avg Response Time',
    value: '2.4h',
    icon: Clock,
    description: '-15% from last week',
  },
  {
    title: 'CSAT Score',
    value: '4.8',
    icon: Users,
    description: '+0.1 from last week',
  },
  {
    title: 'AI Deflection Rate',
    value: '64%',
    icon: Bot,
    description: '+4% from last week',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your support metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-white/20 bg-black/20 p-8 text-center backdrop-blur-sm">
        <h2 className="mb-2 text-xl font-semibold">More Analytics Coming Soon</h2>
        <p className="text-muted-foreground">
          Detailed charts and historical data will be implemented in Phase 2.
        </p>
      </div>
    </div>
  );
}
