import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, Award, BookOpen, Target, CheckCircle, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types';
import { useGetCourseInitializationStatus } from '../hooks/useQueries';

interface AdminAnalyticsProps {
  totalUsers: number;
  totalCertificates: number;
  totalCourses: number;
  averageEngagement: number;
  completionRate: number;
  topPerformers: UserProfile[];
}

export default function AdminAnalytics({
  totalUsers,
  totalCertificates,
  totalCourses,
  averageEngagement,
  completionRate,
  topPerformers,
}: AdminAnalyticsProps) {
  const { data: initStatus } = useGetCourseInitializationStatus();

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-500' },
    { label: 'Certificates Issued', value: totalCertificates, icon: Award, color: 'text-purple-500' },
    { label: 'Active Courses', value: totalCourses, icon: BookOpen, color: 'text-green-500' },
    { label: 'Avg Engagement', value: `${averageEngagement}%`, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Diagnostic Alert */}
      {initStatus && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Diagnostic</AlertTitle>
          <AlertDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Courses Loaded: {initStatus.courseCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Lessons Available: {initStatus.lessonCount}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Learners</CardTitle>
          <CardDescription>Users with highest engagement and completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Certificates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((user, index) => (
                  <TableRow key={user.id.toString()}>
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{Number(user.engagementMetrics.attentionScore)}%</TableCell>
                    <TableCell>{user.courseProgress.length}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.earnedCertificates.length}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No user data available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

