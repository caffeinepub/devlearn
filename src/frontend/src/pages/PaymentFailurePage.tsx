import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { useGetCourse } from '../hooks/useQueries';
import type { AppState } from '../App';

interface PaymentFailurePageProps {
  courseId: string;
  navigate: (state: AppState) => void;
}

export default function PaymentFailurePage({ courseId, navigate }: PaymentFailurePageProps) {
  const { data: course } = useGetCourse(courseId);

  const handleReturnToCourse = () => {
    navigate({ view: 'course', courseId });
  };

  const handleGoHome = () => {
    navigate({ view: 'home' });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>What happened?</AlertTitle>
            <AlertDescription>
              {course 
                ? `The payment for "${course.title}" was cancelled or failed. No charges were made to your account.`
                : 'The payment was cancelled or failed. No charges were made to your account.'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              You can try again or return to browse other courses
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleReturnToCourse} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <Button onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
