import { useGetCourse, useUpdateLessonProgress } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import EngagementMonitor from '../components/EngagementMonitor';
import type { AppState } from '../App';
import { toast } from 'sonner';

interface LessonPageProps {
  courseId: string;
  lessonId: string;
  navigate: (state: AppState) => void;
}

export default function LessonPage({ courseId, lessonId, navigate }: LessonPageProps) {
  const { data: course, isLoading } = useGetCourse(courseId);
  const updateProgress = useUpdateLessonProgress();
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const lesson = course?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (lesson) {
      setIsCompleted(lesson.isCompleted);
    }
  }, [lesson]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);

      if (progress >= 90 && !isCompleted) {
        handleCompleteLesson();
      }
    }
  };

  const handleCompleteLesson = async () => {
    if (isCompleted) return;

    try {
      await updateProgress.mutateAsync({
        courseId,
        lessonId,
        isCompleted: true,
      });
      setIsCompleted(true);
      toast.success('Lesson completed!');
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'course', courseId })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Lesson not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access the URL directly from the videoBlob object
  const videoUrl = lesson.videoBlob.url;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ view: 'course', courseId })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={handleVideoTimeUpdate}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                    <p className="text-muted-foreground">{lesson.description}</p>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <EngagementMonitor 
              lessonId={lessonId}
              onEngagementUpdate={(metrics) => {
                console.log('Engagement metrics:', metrics);
              }}
            />

            {!isCompleted && videoProgress >= 90 && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <Button className="w-full" onClick={handleCompleteLesson}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
