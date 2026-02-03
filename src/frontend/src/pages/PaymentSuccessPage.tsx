import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useFinalizeCoursePurchase, useGetCourse } from '../hooks/useQueries';
import type { AppState } from '../App';

interface PaymentSuccessPageProps {
  courseId: string;
  sessionId: string;
  navigate: (state: AppState) => void;
}

export default function PaymentSuccessPage({ courseId, sessionId, navigate }: PaymentSuccessPageProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const finalizePurchase = useFinalizeCoursePurchase();
  const { data: course } = useGetCourse(courseId);

  useEffect(() => {
    const finalize = async () => {
      try {
        await finalizePurchase.mutateAsync({ courseId, stripeSessionId: sessionId });
        setStatus('success');
      } catch (error: any) {
        console.error('Failed to finalize purchase:', error);
        setStatus('error');
      }
    };

    finalize();
  }, [courseId, sessionId]);

  const handleGoToCourse = () => {
    navigate({ view: 'course', courseId });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
              <CardTitle>Processing Your Purchase</CardTitle>
              <CardDescription>
                Please wait while we finalize your course access...
              </CardDescription>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>
                Your purchase has been completed successfully
              </CardDescription>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <CardTitle>Purchase Finalization Failed</CardTitle>
              <CardDescription>
                There was an issue finalizing your purchase
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Course Unlocked</AlertTitle>
                <AlertDescription className="text-green-800">
                  {course ? `You now have full access to "${course.title}"` : 'You now have full access to this course'}
                </AlertDescription>
              </Alert>
              <Button onClick={handleGoToCourse} className="w-full" size="lg">
                Go to Course
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {finalizePurchase.error?.message || 'An unexpected error occurred. Please contact support if the issue persists.'}
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button onClick={handleGoToCourse} variant="outline" className="flex-1">
                  Go to Course
                </Button>
                <Button onClick={() => navigate({ view: 'home' })} className="flex-1">
                  Go Home
                </Button>
              </div>
            </>
          )}
          {status === 'processing' && (
            <div className="text-center text-sm text-muted-foreground">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
