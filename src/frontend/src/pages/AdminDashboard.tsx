import { useGetUserProfiles, useGetAllCertificates, useAddCourse, useAddLesson, useGetPlatformAnalytics, useUpdateCoursePrice, useGetCourses } from '../hooks/useQueries';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Upload, Zap, Award, Eye, CreditCard, DollarSign, AlertCircle, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import AdminAnalytics from '../components/AdminAnalytics';
import TestingModePanel from '../components/TestingModePanel';
import CertificatePreview from '../components/CertificatePreview';
import StripeConfigDialog from '../components/StripeConfigDialog';
import ExternalCertificationConfig from '../components/ExternalCertificationConfig';
import AlumniRegistryManager from '../components/AlumniRegistryManager';
import type { AppState } from '../App';
import type { Certificate } from '../types';
import { toast } from 'sonner';

interface AdminDashboardProps {
  navigate: (state: AppState) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { data: users, isLoading: usersLoading } = useGetUserProfiles();
  const { data: certificates, isLoading: certsLoading } = useGetAllCertificates();
  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformAnalytics();
  const { data: courses } = useGetCourses();
  const { paymentsDisabled } = usePaymentsStatus();
  const addCourse = useAddCourse();
  const addLesson = useAddLesson();
  const updatePrice = useUpdateCoursePrice();

  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showTestingMode, setShowTestingMode] = useState(false);
  const [showStripeConfig, setShowStripeConfig] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [selectedCourseForPrice, setSelectedCourseForPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [courseForm, setCourseForm] = useState({ id: '', title: '', description: '', price: '' });
  const [lessonForm, setLessonForm] = useState({
    courseId: '',
    id: '',
    title: '',
    description: '',
    duration: '',
    videoFile: null as File | null,
  });

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.id || !courseForm.title) return;

    const priceInCents = courseForm.price ? Math.round(parseFloat(courseForm.price) * 100) : 0;

    const course = {
      id: courseForm.id,
      title: courseForm.title,
      description: courseForm.description,
      lessons: [],
      quizzes: [],
      codingChallenges: [],
      price: BigInt(priceInCents),
    };

    await addCourse.mutateAsync(course);
    setShowCourseDialog(false);
    setCourseForm({ id: '', title: '', description: '', price: '' });
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.courseId || !lessonForm.id || !lessonForm.title) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const videoBlob = {
        id: lessonForm.videoFile ? `video-${lessonForm.id}` : 'video-placeholder',
        url: lessonForm.videoFile 
          ? URL.createObjectURL(lessonForm.videoFile) 
          : '/assets/generated/video-placeholder.dim_400x300.png',
      };

      const lesson = {
        id: lessonForm.id,
        title: lessonForm.title,
        description: lessonForm.description,
        videoBlob,
        duration: BigInt(lessonForm.duration || 0),
        isCompleted: false,
      };

      await addLesson.mutateAsync({ courseId: lessonForm.courseId, lesson });
      setShowLessonDialog(false);
      setLessonForm({ courseId: '', id: '', title: '', description: '', duration: '', videoFile: null });
    } catch (error) {
      console.error('Failed to add lesson:', error);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForPrice || !newPrice) return;

    const priceInCents = Math.round(parseFloat(newPrice) * 100);
    await updatePrice.mutateAsync({ courseId: selectedCourseForPrice, price: priceInCents });
    setShowPriceDialog(false);
    setSelectedCourseForPrice(null);
    setNewPrice('');
  };

  const formatPrice = (priceInCents: bigint) => {
    const dollars = Number(priceInCents) / 100;
    return `$${dollars.toFixed(2)}`;
  };

  if (showTestingMode) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <TestingModePanel onClose={() => setShowTestingMode(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Manage courses, view analytics, and oversee the platform
            </p>
          </div>
          <Button onClick={() => setShowTestingMode(true)} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Testing Mode
          </Button>
        </div>

        {/* Stripe Configuration Alert - hidden when payments disabled */}
        {!paymentsDisabled && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment System Not Configured</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Configure Stripe to enable course payments</span>
              <Button variant="outline" size="sm" onClick={() => setShowStripeConfig(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Configure Stripe
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Payments Disabled Notice */}
        {paymentsDisabled && (
          <Alert className="mb-6 border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payments Temporarily Disabled</AlertTitle>
            <AlertDescription>
              Payment processing is currently disabled. All courses are accessible without purchase.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="external">External Certification</TabsTrigger>
            <TabsTrigger value="alumni">Alumni Registry</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            {analyticsLoading ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
                <Skeleton className="h-96" />
              </div>
            ) : (
              <AdminAnalytics
                totalUsers={analytics.totalUsers}
                totalCertificates={analytics.totalCertificates}
                totalCourses={analytics.totalCourses}
                averageEngagement={analytics.averageEngagement}
                completionRate={analytics.completionRate}
                topPerformers={analytics.topPerformers}
              />
            )}
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>View and manage platform users with performance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Certificates</TableHead>
                        <TableHead>Assessments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id.toString()}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{Number(user.engagementMetrics.attentionScore)}%</TableCell>
                          <TableCell>{user.courseProgress.length}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.earnedCertificates.length}</Badge>
                          </TableCell>
                          <TableCell>{user.assessmentHistory.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No users yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Management</CardTitle>
                <CardDescription>View all issued certificates with performance analytics and preview</CardDescription>
              </CardHeader>
              <CardContent>
                {certsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : certificates && certificates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.userName}</TableCell>
                          <TableCell>{cert.courseTitle}</TableCell>
                          <TableCell>
                            {new Date(Number(cert.completionDate) / 1000000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{Number(cert.engagementScore)}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setPreviewCert(cert)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Certificate Preview</DialogTitle>
                                  <DialogDescription>
                                    Certificate for {cert.userName} - {cert.courseTitle}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                  <CertificatePreview certificate={cert} userName={cert.userName} />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No certificates issued yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>Create and manage courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                        <DialogDescription>Add a new course to the platform</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddCourse} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="courseId">Course ID</Label>
                          <Input
                            id="courseId"
                            value={courseForm.id}
                            onChange={(e) => setCourseForm({ ...courseForm, id: e.target.value })}
                            placeholder="e.g., fullstack-101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseTitle">Title</Label>
                          <Input
                            id="courseTitle"
                            value={courseForm.title}
                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                            placeholder="Course title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseDesc">Description</Label>
                          <Textarea
                            id="courseDesc"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                            placeholder="Course description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coursePrice">Price (USD)</Label>
                          <Input
                            id="coursePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={courseForm.price}
                            onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                            placeholder="49.99"
                          />
                          <p className="text-xs text-muted-foreground">Leave empty or 0 for free courses</p>
                        </div>
                        <Button type="submit" disabled={addCourse.isPending}>
                          {addCourse.isPending ? 'Creating...' : 'Create Course'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lesson Management</CardTitle>
                  <CardDescription>Add lessons to courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Add New Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>Upload a video lesson to a course</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddLesson} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="lessonCourseId">Course ID</Label>
                          <Input
                            id="lessonCourseId"
                            value={lessonForm.courseId}
                            onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}
                            placeholder="e.g., fullstack-101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lessonId">Lesson ID</Label>
                          <Input
                            id="lessonId"
                            value={lessonForm.id}
                            onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })}
                            placeholder="e.g., lesson-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lessonTitle">Title</Label>
                          <Input
                            id="lessonTitle"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            placeholder="Lesson title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lessonDesc">Description</Label>
                          <Textarea
                            id="lessonDesc"
                            value={lessonForm.description}
                            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                            placeholder="Lesson description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                          <Input
                            id="lessonDuration"
                            type="number"
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="videoFile">Video File (optional)</Label>
                          <Input
                            id="videoFile"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setLessonForm({ ...lessonForm, videoFile: e.target.files?.[0] || null })}
                          />
                          <p className="text-xs text-muted-foreground">
                            If no file is selected, a placeholder video will be used
                          </p>
                        </div>
                        <Button type="submit" disabled={addLesson.isPending}>
                          {addLesson.isPending ? 'Adding Lesson...' : 'Add Lesson'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Pricing</CardTitle>
                    <CardDescription>Manage course prices and payment settings</CardDescription>
                  </div>
                  {!paymentsDisabled && (
                    <Button variant="outline" size="sm" onClick={() => setShowStripeConfig(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Stripe Config
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {courses && courses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>
                            <Badge variant={Number(course.price) > 0 ? 'default' : 'secondary'}>
                              {Number(course.price) > 0 ? formatPrice(course.price) : 'Free'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {paymentsDisabled ? (
                              <Badge variant="outline" className="text-muted-foreground">Payments Disabled</Badge>
                            ) : Number(course.price) > 0 ? (
                              <Badge variant="outline" className="text-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline">Free Course</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCourseForPrice(course.id);
                                setNewPrice((Number(course.price) / 100).toFixed(2));
                                setShowPriceDialog(true);
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Update Price
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No courses available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external">
            <ExternalCertificationConfig />
          </TabsContent>

          <TabsContent value="alumni">
            <AlumniRegistryManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Stripe Configuration Dialog */}
      <StripeConfigDialog open={showStripeConfig} onClose={() => setShowStripeConfig(false)} />

      {/* Price Update Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Course Price</DialogTitle>
            <DialogDescription>
              Set a new price for this course
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePrice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPrice">Price (USD)</Label>
              <Input
                id="newPrice"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="49.99"
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 to make the course free
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPriceDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePrice.isPending}
                className="flex-1"
              >
                {updatePrice.isPending ? 'Updating...' : 'Update Price'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
