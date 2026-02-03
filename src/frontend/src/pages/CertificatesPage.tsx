import { useGetMyCertificates } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Award, Download, Eye, LogIn, AlertCircle } from 'lucide-react';
import CertificatePreview from '../components/CertificatePreview';
import type { AppState } from '../App';
import type { Certificate } from '../types';
import { useState } from 'react';

interface CertificatesPageProps {
  navigate: (state: AppState) => void;
}

export default function CertificatesPage({ navigate }: CertificatesPageProps) {
  const { identity, login } = useInternetIdentity();
  const { data: certificates, isLoading, error } = useGetMyCertificates();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

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
              <p>You need to log in to view your certificates.</p>
              <Button onClick={() => login()}>
                Log In
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const certArray = certificates && Array.isArray(certificates) ? certificates as Certificate[] : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Certificates</h1>
          <p className="text-lg text-muted-foreground">
            View and download your earned certificates with performance analytics
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Certificates</AlertTitle>
            <AlertDescription>
              Failed to load your certificates. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : certArray.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certArray.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {cert.courseTitle}
                  </CardTitle>
                  <CardDescription>Completed {formatDate(cert.completionDate)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{Number(cert.engagementScore)}%</div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">
                        {cert.quizResults.length > 0
                          ? Math.round(
                              cert.quizResults.reduce((sum, q) => sum + Number(q.score), 0) /
                                cert.quizResults.length
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground">Quiz Avg</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {cert.codingChallengeResults.length > 0
                          ? Math.round(
                              cert.codingChallengeResults.reduce((sum, c) => sum + Number(c.score), 0) /
                                cert.codingChallengeResults.length
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground">Coding Avg</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedCert(cert)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Certificate Preview</DialogTitle>
                          <DialogDescription>
                            {cert.courseTitle} - Completed {formatDate(cert.completionDate)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <CertificatePreview certificate={cert} userName={cert.userName} />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="default" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary">{cert.quizResults.length} Quizzes</Badge>
                    <Badge variant="secondary">{cert.codingChallengeResults.length} Challenges</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete a course to earn your first certificate with performance analytics
              </p>
              <Button onClick={() => navigate({ view: 'home' })}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

