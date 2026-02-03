import { useGetCourses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, Video, Code, CheckCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import type { AppState } from '../App';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface HomePageProps {
  navigate: (state: AppState) => void;
}

export default function HomePage({ navigate }: HomePageProps) {
  const { data: courses, isLoading, error, refetch } = useGetCourses();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const showNoCourses = !isLoading && !error && (!courses || courses.length === 0);

  const formatPrice = (priceInCents: bigint) => {
    const dollars = Number(priceInCents) / 100;
    return `$${dollars.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Master Full-Stack Development
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Learn web development, security, blockchain, and AI through interactive video courses with real-time performance tracking
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => {
                if (courses && courses.length > 0) {
                  navigate({ view: 'course', courseId: courses[0].id });
                }
              }}
              disabled={showNoCourses}
            >
              Start Learning
            </Button>
            {isAuthenticated && (
              <Button size="lg" variant="outline" onClick={() => navigate({ view: 'dashboard' })}>
                View Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Video className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Video Lessons</CardTitle>
                <CardDescription>
                  High-quality video content with real-time engagement monitoring and attention tracking
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Code className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Interactive Challenges</CardTitle>
                <CardDescription>
                  Hands-on coding challenges and quizzes with automated evaluation and instant feedback
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Comprehensive analytics dashboard tracking your progress, engagement, and achievements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Available Courses</h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Courses</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load courses. Please try again.</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : showNoCourses ? (
            <Alert className="bg-primary/5 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Courses Loading</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The platform is loading courses. Please wait a moment or refresh the page.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  {isAuthenticated && (
                    <Button variant="outline" size="sm" onClick={() => navigate({ view: 'admin' })}>
                      Go to Admin Dashboard
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses!.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="flex items-center gap-2 flex-1">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {course.title}
                      </CardTitle>
                      {Number(course.price) > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(course.price)}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {course.lessons.length} Lessons
                      </Badge>
                      <Badge variant="secondary">
                        {course.quizzes.length} Quizzes
                      </Badge>
                      <Badge variant="secondary">
                        {course.codingChallenges.length} Challenges
                      </Badge>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate({ view: 'course', courseId: course.id })}
                    >
                      View Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
