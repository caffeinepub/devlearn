import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Zap, CheckCircle, XCircle, Award, Eye } from 'lucide-react';
import CertificatePreview from './CertificatePreview';
import type { Certificate } from '../types';

interface TestingModePanelProps {
  onClose: () => void;
}

export default function TestingModePanel({ onClose }: TestingModePanelProps) {
  const [testResults, setTestResults] = useState<{ type: string; success: boolean; message: string }[]>([]);
  const [mockCertificate, setMockCertificate] = useState<Certificate | null>(null);

  const generateMockCertificate = (): Certificate => {
    const now = BigInt(Date.now() * 1000000);
    return {
      id: `test-cert-${Date.now()}`,
      userId: { toText: () => 'test-user' } as any,
      courseId: 'test-course',
      courseTitle: 'Test Course - Full-Stack Development',
      userName: 'Test User',
      completionDate: now,
      engagementScore: BigInt(85),
      quizResults: [
        { quizId: 'q1', title: 'HTML Basics', score: BigInt(90), totalQuestions: BigInt(10) },
        { quizId: 'q2', title: 'CSS Fundamentals', score: BigInt(85), totalQuestions: BigInt(8) },
        { quizId: 'q3', title: 'JavaScript Core', score: BigInt(88), totalQuestions: BigInt(12) },
      ],
      codingChallengeResults: [
        { challengeId: 'c1', title: 'Build a Form', score: BigInt(92), testCasesPassed: BigInt(9), totalTestCases: BigInt(10) },
        { challengeId: 'c2', title: 'API Integration', score: BigInt(87), testCasesPassed: BigInt(8), totalTestCases: BigInt(10) },
      ],
    };
  };

  const runEngagementTest = () => {
    const mockEngagement = Math.floor(Math.random() * 30) + 70;
    setTestResults((prev) => [
      ...prev,
      {
        type: 'Engagement Tracking',
        success: true,
        message: `Mock engagement score: ${mockEngagement}%`,
      },
    ]);
  };

  const runQuizTest = () => {
    const mockScore = Math.floor(Math.random() * 20) + 80;
    setTestResults((prev) => [
      ...prev,
      {
        type: 'Quiz Scoring',
        success: true,
        message: `Mock quiz score: ${mockScore}%`,
      },
    ]);
  };

  const runCertificateTest = () => {
    const cert = generateMockCertificate();
    setMockCertificate(cert);
    setTestResults((prev) => [
      ...prev,
      {
        type: 'Certificate Generation',
        success: true,
        message: 'Mock certificate generated with performance metrics',
      },
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
    setMockCertificate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Testing Mode</h1>
          <p className="text-muted-foreground">
            Validate engagement tracking, scoring, and certificate generation
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertTitle>Testing Environment</AlertTitle>
        <AlertDescription>
          This mode generates mock data for validation. No real user data is affected.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Tracking Test</CardTitle>
              <CardDescription>Simulate video engagement and attention scoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runEngagementTest}>
                <Zap className="h-4 w-4 mr-2" />
                Run Engagement Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Scoring Test</CardTitle>
              <CardDescription>Validate quiz and coding challenge scoring algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runQuizTest}>
                <Zap className="h-4 w-4 mr-2" />
                Run Quiz Scoring Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Generation Test</CardTitle>
              <CardDescription>
                Generate mock certificates with performance analytics and badges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={runCertificateTest}>
                  <Award className="h-4 w-4 mr-2" />
                  Generate Test Certificate
                </Button>
                {mockCertificate && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Certificate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                        <DialogDescription>
                          Mock certificate with embedded performance analytics
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <CertificatePreview certificate={mockCertificate} userName="Test User" />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Test Results</CardTitle>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.type}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

