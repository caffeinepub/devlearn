import { useGetCourse, useStartCourse, useGetCallerUserProfile } from '../hooks/useQueries';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Play, CheckCircle2, Clock, DollarSign, Lock, Loader2, AlertCircle } from 'lucide-react';
import type { AppState } from '../App';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';
import PaymentDialog from '../components/PaymentDialog';

interface CoursePageProps {
  courseId: string;
  navigate: (state: AppState) => void;
}

export default function CoursePage({ courseId, navigate }: CoursePageProps) {
  const { data: course, isLoading, refetch } = useGetCourse(courseId);
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const { paymentsDisabled } = usePaymentsStatus();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const startCourseMutation = useStartCourse();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const coursePrice = course ? Number(course.price) : 0;
  const isPaidCourse = coursePrice > 0;
  
  // Check if user has purchased this course
  const hasPurchased = userProfile?.purchasedCourses?.includes(courseId) || false;

  const formatPrice = (priceInCents: number) => {
    const dollars = priceInCents / 100;
    return `$${dollars.toFixed(2)}`;
  };

  // When payments are disabled, treat all courses as accessible
  const canAccessContent = paymentsDisabled || !isPaidCourse || hasPurchased;

  const handleStartLesson = async (lessonId: string) => {
    if (!isAuthenticated) {
      return;
    }

    // Ensure course data is loaded and start the course
    try {
      await startCourseMutation.mutateAsync(courseId);
      // After successful course start, navigate to lesson
      navigate({ view: 'lesson', courseId, lessonId });
    } catch (error) {
      console.error('Failed to start course:', error);
      // Error is already handled by the mutation's onError
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>The requested course could not be found. It may not be initialized yet.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'home' })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold">{course.title}</h1>
            {isPaidCourse && !paymentsDisabled && (
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatPrice(coursePrice)}
                </Badge>
                {hasPurchased && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Purchased
                  </Badge>
                )}
                {!hasPurchased && isAuthenticated && (
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    Purchase Course
                  </Button>
                )}
                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground">Login to purchase</p>
                )}
              </div>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{course.description}</p>
          
          {isPaidCourse && !hasPurchased && !paymentsDisabled && (
            <Card className="mt-6 border-primary/50 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <p className="text-sm">
                    This is a paid course. Purchase access to unlock all lessons, quizzes, and coding challenges.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lessons">Lessons ({course.lessons.length})</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({course.quizzes.length})</TabsTrigger>
            <TabsTrigger value="challenges">Coding Challenges ({course.codingChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4">
            {course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">Lesson {index + 1}</Badge>
                          {lesson.isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {!canAccessContent && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <CardTitle className="text-xl">{lesson.title}</CardTitle>
                        <CardDescription className="mt-2">{lesson.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{Number(lesson.duration)} minutes</span>
                      </div>
                      <Button
                        onClick={() => handleStartLesson(lesson.id)}
                        disabled={!canAccessContent || startCourseMutation.isPending}
                      >
                        {startCourseMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : !canAccessContent ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {lesson.isCompleted ? 'Review' : 'Start Lesson'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No lessons available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {course.quizzes.length > 0 ? (
              course.quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{quiz.title}</CardTitle>
                      {!canAccessContent && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{quiz.questions.length} questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button disabled={!canAccessContent}>
                      {!canAccessContent ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : (
                        'Start Quiz'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No quizzes available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            {course.codingChallenges.length > 0 ? (
              course.codingChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{challenge.title}</CardTitle>
                      {!canAccessContent && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button disabled={!canAccessContent}>
                      {!canAccessContent ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : (
                        'Start Challenge'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No coding challenges available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showPaymentDialog && course && !paymentsDisabled && (
        <PaymentDialog
          open={showPaymentDialog}
          course={course}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}
    </div>
  );
}
