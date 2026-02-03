import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, Code } from 'lucide-react';
import type { EngagementMetrics, CourseProgress } from '../types';

interface AnalyticsDashboardProps {
  engagementMetrics: EngagementMetrics;
  courseProgress: CourseProgress[];
  certificateAnalytics?: {
    totalCertificates: number;
    averageEngagement: number;
    averageQuizScore: number;
    averageCodingScore: number;
  };
}

export default function AnalyticsDashboard({
  engagementMetrics,
  courseProgress,
  certificateAnalytics,
}: AnalyticsDashboardProps) {
  const attentionScore = Number(engagementMetrics.attentionScore);
  const avgQuizScore =
    engagementMetrics.quizTries.length > 0
      ? Math.round(
          engagementMetrics.quizTries.reduce((sum, quiz) => sum + Number(quiz.avgScore), 0) /
            engagementMetrics.quizTries.length
        )
      : 0;
  const avgCodingScore =
    engagementMetrics.codingChallengeAttempts.length > 0
      ? Math.round(
          engagementMetrics.codingChallengeAttempts.reduce((sum, challenge) => sum + Number(challenge.avgScore), 0) /
            engagementMetrics.codingChallengeAttempts.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attentionScore}%</div>
            <Progress value={attentionScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Average</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQuizScore}%</div>
            <Progress value={avgQuizScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coding Average</CardTitle>
            <Code className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCodingScore}%</div>
            <Progress value={avgCodingScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Certificate Analytics */}
      {certificateAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Performance Analytics
            </CardTitle>
            <CardDescription>Aggregated performance across all earned certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Certificates</div>
                <div className="text-2xl font-bold">{certificateAnalytics.totalCertificates}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Avg Engagement</div>
                <div className="text-2xl font-bold">{certificateAnalytics.averageEngagement}%</div>
                <Progress value={certificateAnalytics.averageEngagement} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Avg Quiz Score</div>
                <div className="text-2xl font-bold">{certificateAnalytics.averageQuizScore}%</div>
                <Progress value={certificateAnalytics.averageQuizScore} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Avg Coding Score</div>
                <div className="text-2xl font-bold">{certificateAnalytics.averageCodingScore}%</div>
                <Progress value={certificateAnalytics.averageCodingScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>Your progress across enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          {courseProgress.length > 0 ? (
            <div className="space-y-4">
              {courseProgress.map((progress) => (
                <div key={progress.courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{progress.courseId}</span>
                    <Badge variant="secondary">{Number(progress.progress)}%</Badge>
                  </div>
                  <Progress value={Number(progress.progress)} />
                  <div className="text-xs text-muted-foreground">
                    {Number(progress.completedLessons)} / {Number(progress.totalLessons)} lessons completed
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No courses enrolled yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
