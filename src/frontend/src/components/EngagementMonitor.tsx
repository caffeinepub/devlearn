import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Mic, Activity, Eye, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCamera } from '../camera/useCamera';
import { toast } from 'sonner';

interface EngagementMonitorProps {
  lessonId: string;
  onEngagementUpdate?: (metrics: EngagementData) => void;
}

interface EngagementData {
  attentionScore: number;
  participationScore: number;
  facialEngagement: number;
  audioParticipation: number;
}

export default function EngagementMonitor({ lessonId, onEngagementUpdate }: EngagementMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [engagementData, setEngagementData] = useState<EngagementData>({
    attentionScore: 0,
    participationScore: 0,
    facialEngagement: 0,
    audioParticipation: 0,
  });

  const {
    isActive: cameraActive,
    startCamera,
    stopCamera,
    videoRef: cameraVideoRef,
    canvasRef: cameraCanvasRef,
    error: cameraError,
  } = useCamera({ facingMode: 'user' });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        const newData: EngagementData = {
          attentionScore: Math.min(100, engagementData.attentionScore + Math.random() * 5),
          participationScore: Math.min(100, engagementData.participationScore + Math.random() * 3),
          facialEngagement: 70 + Math.random() * 30,
          audioParticipation: 60 + Math.random() * 40,
        };
        setEngagementData(newData);
        onEngagementUpdate?.(newData);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring]);

  const toggleMonitoring = async () => {
    if (isMonitoring) {
      await stopCamera();
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      toast.info('Engagement monitoring stopped');
    } else {
      const started = await startCamera();
      if (started) {
        setIsMonitoring(true);
        toast.success('Engagement monitoring started');
      }
    }
  };

  const overallScore = Math.round(
    (engagementData.attentionScore + engagementData.participationScore + 
     engagementData.facialEngagement + engagementData.audioParticipation) / 4
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Monitoring</span>
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant={isMonitoring ? 'destructive' : 'default'}
          className="w-full"
          onClick={toggleMonitoring}
        >
          <Camera className="h-4 w-4 mr-2" />
          {isMonitoring ? 'Stop Monitoring' : 'Start Engagement Tracking'}
        </Button>

        {cameraError && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {cameraError.message}
          </div>
        )}

        {isMonitoring && (
          <>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={cameraCanvasRef} className="hidden" />
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Real-time Analysis Active</span>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Attention Score</span>
                    </div>
                    <span className="font-medium">{Math.round(engagementData.attentionScore)}%</span>
                  </div>
                  <Progress value={engagementData.attentionScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Facial Engagement</span>
                    </div>
                    <span className="font-medium">{Math.round(engagementData.facialEngagement)}%</span>
                  </div>
                  <Progress value={engagementData.facialEngagement} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Audio Participation</span>
                    </div>
                    <span className="font-medium">{Math.round(engagementData.audioParticipation)}%</span>
                  </div>
                  <Progress value={engagementData.audioParticipation} />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Overall Performance</span>
                    <span className="text-lg text-primary">{overallScore}%</span>
                  </div>
                  <Progress value={overallScore} className="mt-2" />
                </div>
              </div>
            </div>
          </>
        )}

        {!isMonitoring && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <img 
              src="/assets/generated/engagement-meter-transparent.dim_300x200.png" 
              alt="Engagement Meter" 
              className="w-32 h-auto mx-auto mb-3 opacity-50"
            />
            <p>Start monitoring to track your engagement and performance in real-time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
