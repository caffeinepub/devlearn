import { useGetCallerUserProfile, useGetMyCertificates } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, RefreshCw, LogIn, Award, TrendingUp, Loader2 } from 'lucide-react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ExternalRegistrationStatus from '../components/ExternalRegistrationStatus';
import type { AppState } from '../App';
import type { Certificate } from '../types';

interface UserDashboardProps {
  navigate: (state: AppState) => void;
}

// Skeleton component for dashboard cards
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function UserDashboard({ navigate }: UserDashboardProps) {
  const { identity, login } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, error: profileError, refetch: refetchProfile, isFetched } = useGetCallerUserProfile();
  const { data: certificates, isLoading: certificatesLoading } = useGetMyCertificates();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Calculate certificate analytics for dashboard
  const certificateAnalytics = certificates && Array.isArray(certificates) && certificates.length > 0 ? {
    totalCertificates: certificates.length,
    averageEngagement: Math.round(
      certificates.reduce((sum, cert) => sum + Number(cert.engagementScore), 0) / certificates.length
    ),
    averageQuizScore: Math.round(
      certificates.reduce((sum, cert) => {
        const avgQuiz = cert.quizResults.length > 0
          ? cert.quizResults.reduce((s, q) => s + Number(q.score), 0) / cert.quizResults.length
          : 0;
        return sum + avgQuiz;
      }, 0) / certificates.length
    ),
    averageCodingScore: Math.round(
      certificates.reduce((sum, cert) => {
        const avgCoding = cert.codingChallengeResults.length > 0
          ? cert.codingChallengeResults.reduce((s, c) => s + Number(c.score), 0) / cert.codingChallengeResults.length
          : 0;
        return sum + avgCoding;
      }, 0) / certificates.length
    ),
  } : undefined;

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>You need to log in to access your dashboard.</p>
              <Button onClick={() => login()}>
                Log In
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state - show skeleton
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-64" />
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <Skeleton className="h-6 w-96" />
          </div>

          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Loading your dashboard...</AlertTitle>
            <AlertDescription>
              Please wait while we fetch your data.
            </AlertDescription>
          </Alert>

          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Error state - show error with retry
  if (profileError) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>{profileError.message || 'Failed to load your dashboard data. This might be a temporary issue.'}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetchProfile()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Profile not found after successful fetch - should not happen with auto-creation
  if (!userProfile && isFetched) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>Your profile could not be loaded. Please try refreshing or contact support if the issue persists.</p>
              <Button 
                variant="outline" 
                onClick={() => refetchProfile()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Success - show dashboard with data
  const certArray = certificates && Array.isArray(certificates) ? certificates as Certificate[] : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your progress, engagement, and performance analytics
          </p>
        </div>

        {/* Certificate Performance Summary */}
        {certificatesLoading ? (
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : certArray.length > 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate Performance Summary
              </CardTitle>
              <CardDescription>
                Your earned certificates and performance highlights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Certificates</span>
                    <Badge variant="default">{certArray.length}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Engagement</span>
                    <Badge variant="secondary">
                      {Math.round(
                        certArray.reduce((sum, cert) => sum + Number(cert.engagementScore), 0) / certArray.length
                      )}%
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Latest Achievement</span>
                    <Badge variant="outline">
                      {new Date(Number(certArray[certArray.length - 1].completionDate) / 1000000).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate({ view: 'certificates' })}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View All Certificates
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* External Registration Status */}
        <div className="mb-6">
          <ExternalRegistrationStatus />
        </div>

        {/* Analytics Dashboard - only render if profile exists */}
        {userProfile && (
          <AnalyticsDashboard 
            engagementMetrics={userProfile.engagementMetrics}
            courseProgress={userProfile.courseProgress}
            certificateAnalytics={certificateAnalytics}
          />
        )}
      </div>
    </div>
  );
}
