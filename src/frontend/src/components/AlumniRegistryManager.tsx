import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Search, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react';
import { useGetAlumniRegistry, type VerifiedAlumniRecord } from '../hooks/useQueries';

export default function AlumniRegistryManager() {
  const { data: alumni, isLoading } = useGetAlumniRegistry();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<VerifiedAlumniRecord | null>(null);

  const filteredAlumni = alumni?.filter((record) => {
    const matchesSearch = searchQuery === '' || 
      record.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || record.courseId === filterCourse;
    const matchesProvider = filterProvider === 'all' || 
      record.externalRegistrations.some(reg => reg.providerName === filterProvider);
    return matchesSearch && matchesCourse && matchesProvider;
  });

  const uniqueCourses = Array.from(new Set(alumni?.map(a => a.courseId) || []));
  const uniqueProviders = Array.from(
    new Set(alumni?.flatMap(a => a.externalRegistrations.map(r => r.providerName)) || [])
  );

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Alumni Registry
        </CardTitle>
        <CardDescription>
          View and manage verified alumni records and external registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by course name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {uniqueCourses.map((courseId) => (
                <SelectItem key={courseId} value={courseId}>
                  {courseId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {uniqueProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading alumni registry...</div>
        ) : filteredAlumni && filteredAlumni.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>External Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlumni.map((record) => (
                <TableRow key={record.certificateId}>
                  <TableCell className="font-medium">{record.courseTitle}</TableCell>
                  <TableCell>{formatDate(record.completionDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        Eng: {Number(record.engagementScore)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Quiz: {Number(record.quizAverage)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.externalRegistrations.length}</Badge>
                  </TableCell>
                  <TableCell>
                    {record.verified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Alumni Record Details</DialogTitle>
                          <DialogDescription>
                            {record.courseTitle} - Completed {formatDate(record.completionDate)}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRecord && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Engagement</div>
                                <div className="text-2xl font-bold">{Number(selectedRecord.engagementScore)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Quiz Average</div>
                                <div className="text-2xl font-bold">{Number(selectedRecord.quizAverage)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Coding Score</div>
                                <div className="text-2xl font-bold">{Number(selectedRecord.codingScore)}%</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3">External Registrations</h4>
                              <div className="space-y-2">
                                {selectedRecord.externalRegistrations.map((reg, idx) => (
                                  <Card key={idx}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">{reg.providerName}</div>
                                        {getStatusBadge(reg.status)}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Registered: {formatDate(reg.registrationDate)}
                                      </div>
                                      {reg.verificationLink && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 h-auto mt-2"
                                          onClick={() => window.open(reg.verificationLink, '_blank')}
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          View External Record
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <img
              src="/assets/generated/alumni-registry-dashboard.dim_1000x700.png"
              alt="Alumni Registry"
              className="mx-auto mb-4 w-96 h-64 object-cover rounded-lg opacity-50"
            />
            <p className="text-muted-foreground mb-2">No alumni records found</p>
            <p className="text-sm text-muted-foreground">
              Alumni records will appear here after course completions and external registrations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

