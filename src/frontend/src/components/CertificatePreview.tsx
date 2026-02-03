import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Calendar, TrendingUp, Target, Code, FileQuestion, Star, Trophy } from 'lucide-react';
import type { Certificate } from '../types';

interface CertificatePreviewProps {
  certificate: Certificate;
  userName: string;
}

export default function CertificatePreview({ certificate, userName }: CertificatePreviewProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const avgQuizScore = certificate.quizResults.length > 0
    ? Math.round(
        certificate.quizResults.reduce((sum, q) => sum + Number(q.score), 0) / certificate.quizResults.length
      )
    : 0;

  const avgCodingScore = certificate.codingChallengeResults.length > 0
    ? Math.round(
        certificate.codingChallengeResults.reduce((sum, c) => sum + Number(c.score), 0) /
          certificate.codingChallengeResults.length
      )
    : 0;

  const overallScore = Math.round((Number(certificate.engagementScore) + avgQuizScore + avgCodingScore) / 3);

  // Dynamic badge generation based on performance
  const getBadgeLevel = (score: number): { label: string; color: string; icon: typeof Trophy } => {
    if (score >= 90) return { label: 'Excellence', color: 'text-yellow-500', icon: Trophy };
    if (score >= 80) return { label: 'Distinguished', color: 'text-purple-500', icon: Star };
    if (score >= 70) return { label: 'Proficient', color: 'text-blue-500', icon: Award };
    return { label: 'Completed', color: 'text-green-500', icon: Award };
  };

  const badge = getBadgeLevel(overallScore);
  const BadgeIcon = badge.icon;

  // Calculate percentile indicators
  const getPercentile = (score: number): number => {
    if (score >= 95) return 99;
    if (score >= 90) return 95;
    if (score >= 85) return 90;
    if (score >= 80) return 85;
    if (score >= 75) return 75;
    if (score >= 70) return 65;
    if (score >= 60) return 50;
    return 35;
  };

  const percentile = getPercentile(overallScore);

  const getPerformanceTier = (score: number): string => {
    if (score >= 90) return 'Top 10%';
    if (score >= 80) return 'Top 20%';
    if (score >= 70) return 'Top 35%';
    return 'Top 50%';
  };

  const performanceTier = getPerformanceTier(overallScore);

  return (
    <div 
      className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg overflow-hidden border-2 border-primary/20"
      style={{
        backgroundImage: 'url(/assets/generated/custom-certificate-template.dim_800x600.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative h-full p-8 flex flex-col">
        {/* Header with Dynamic Badge */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BadgeIcon className={`h-12 w-12 ${badge.color}`} />
            <img 
              src="/assets/generated/performance-badge-transparent.dim_150x150.png" 
              alt="Performance Badge" 
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Certificate of {badge.label}</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="default" className="text-xs">
              {performanceTier}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {percentile}th Percentile
            </Badge>
          </div>
        </div>

        {/* Recipient */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-primary mb-2">{userName}</h2>
          <p className="text-lg text-muted-foreground">has successfully completed</p>
          <h3 className="text-2xl font-semibold mt-2">{certificate.courseTitle}</h3>
        </div>

        {/* Embedded Performance Analytics */}
        <Card className="mb-6 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-semibold">Performance Analytics</span>
              <Badge variant="outline" className="ml-auto">
                Overall: {overallScore}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Number(certificate.engagementScore)}%</div>
                <div className="text-xs text-muted-foreground">Engagement</div>
                <Progress value={Number(certificate.engagementScore)} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{avgQuizScore}%</div>
                <div className="text-xs text-muted-foreground">Quiz Avg</div>
                <Progress value={avgQuizScore} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{avgCodingScore}%</div>
                <div className="text-xs text-muted-foreground">Coding Avg</div>
                <Progress value={avgCodingScore} className="h-1 mt-1" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Overall Performance
                </span>
                <span className="font-medium">{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileQuestion className="h-3 w-3" />
                  Quizzes
                </span>
                <Badge variant="secondary" className="text-xs">{certificate.quizResults.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Challenges
                </span>
                <Badge variant="secondary" className="text-xs">{certificate.codingChallengeResults.length}</Badge>
              </div>
            </div>

            {/* Detailed Results */}
            {certificate.quizResults.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium mb-2">Quiz Results:</div>
                <div className="space-y-1">
                  {certificate.quizResults.slice(0, 3).map((quiz, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="truncate">{quiz.title}</span>
                      <span className="font-medium">{Number(quiz.score)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certificate.codingChallengeResults.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-2">Coding Challenges:</div>
                <div className="space-y-1">
                  {certificate.codingChallengeResults.slice(0, 2).map((challenge, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="truncate">{challenge.title}</span>
                      <span className="font-medium">
                        {Number(challenge.testCasesPassed)}/{Number(challenge.totalTestCases)} passed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formatDate(certificate.completionDate)}</span>
          </div>
          <Badge variant="default" className="gap-1">
            <Award className="h-3 w-3" />
            Verified
          </Badge>
        </div>
      </div>
    </div>
  );
}

