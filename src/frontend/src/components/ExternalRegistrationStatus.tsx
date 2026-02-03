import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { useGetUserExternalRegistrations, type ExternalRegistrationRecord } from '../hooks/useQueries';

export default function ExternalRegistrationStatus() {
  const { data: registrations, isLoading } = useGetUserExternalRegistrations();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Registered</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>External Certifications</CardTitle>
          <CardDescription>Loading your external registration status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>External Certifications</CardTitle>
          <CardDescription>Your external certification registration status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No External Registrations Yet</AlertTitle>
            <AlertDescription>
              Complete a course to be automatically registered with external certification providers
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img
            src="/assets/generated/verified-alumni-badge-transparent.dim_100x100.png"
            alt="Verified Alumni"
            className="h-6 w-6"
          />
          External Certifications
        </CardTitle>
        <CardDescription>
          Your registration status with external certification providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registrations.map((registration, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(registration.status)}
                    <div>
                      <div className="font-semibold">{registration.providerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {registration.courseId}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(registration.status)}
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  Registered: {formatDate(registration.registrationDate)}
                </div>

                {registration.status === 'success' && registration.verificationLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(registration.verificationLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View External Certificate
                  </Button>
                )}

                {registration.status === 'success' && registration.externalRecordId && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    External ID: {registration.externalRecordId}
                  </div>
                )}

                {registration.status === 'failed' && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Registration Failed</AlertTitle>
                    <AlertDescription className="text-xs">
                      {registration.responseData || 'Unable to register with this provider. Please contact support.'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

