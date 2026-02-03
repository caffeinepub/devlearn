import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Settings, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useGetExternalApiConfigs, useAddExternalApiConfig, type ExternalApiConfig } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ExternalCertificationConfig() {
  const { data: configs, isLoading } = useGetExternalApiConfigs();
  const addConfig = useAddExternalApiConfig();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<ExternalApiConfig>>({
    name: '',
    endpointUrl: '',
    apiKey: '',
    isActive: true,
    providerType: 'custom_provider',
    supportedCourses: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.endpointUrl || !formData.apiKey) {
      toast.error('Please fill all required fields');
      return;
    }

    const config: ExternalApiConfig = {
      id: `api-${Date.now()}`,
      name: formData.name,
      endpointUrl: formData.endpointUrl,
      apiKey: formData.apiKey,
      isActive: formData.isActive ?? true,
      providerType: formData.providerType ?? 'custom_provider',
      supportedCourses: formData.supportedCourses ?? [],
    };

    await addConfig.mutateAsync(config);
    setShowDialog(false);
    setFormData({
      name: '',
      endpointUrl: '',
      apiKey: '',
      isActive: true,
      providerType: 'custom_provider',
      supportedCourses: [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              External Certification APIs
            </CardTitle>
            <CardDescription>
              Configure external certification and accreditation providers
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add External Certification Provider</DialogTitle>
                <DialogDescription>
                  Configure a new external API for automatic graduate registration
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="providerName">Provider Name *</Label>
                  <Input
                    id="providerName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AWS Certification Center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerType">Provider Type</Label>
                  <Select
                    value={formData.providerType}
                    onValueChange={(value) => setFormData({ ...formData, providerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws_certify">AWS Certification</SelectItem>
                      <SelectItem value="google_courses">Google Courses</SelectItem>
                      <SelectItem value="ibm_cloud">IBM Cloud</SelectItem>
                      <SelectItem value="accreditation_center">Accreditation Center</SelectItem>
                      <SelectItem value="education_vendor">Education Vendor</SelectItem>
                      <SelectItem value="blockchain_certification">Blockchain Certification</SelectItem>
                      <SelectItem value="custom_provider">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpointUrl">API Endpoint URL *</Label>
                  <Input
                    id="endpointUrl"
                    type="url"
                    value={formData.endpointUrl}
                    onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                    placeholder="https://api.provider.com/v1/register"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    API keys are stored securely and never displayed
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    Graduates will be automatically registered with active providers upon course completion
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addConfig.isPending}
                    className="flex-1"
                  >
                    {addConfig.isPending ? 'Adding...' : 'Add Provider'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading configurations...</div>
        ) : configs && configs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{config.providerType}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                    {config.endpointUrl}
                  </TableCell>
                  <TableCell>
                    {config.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <img
              src="/assets/generated/external-api-config-interface.dim_800x600.png"
              alt="External API Configuration"
              className="mx-auto mb-4 w-64 h-48 object-cover rounded-lg opacity-50"
            />
            <p className="text-muted-foreground mb-4">No external providers configured yet</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Provider
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

