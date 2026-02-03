import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSetStripeConfiguration } from '../hooks/useQueries';

interface StripeConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function StripeConfigDialog({ open, onClose }: StripeConfigDialogProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const setConfig = useSetStripeConfiguration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretKey.trim()) {
      return;
    }

    const allowedCountries = countries.split(',').map(c => c.trim()).filter(c => c);
    
    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      // Only close on success
      onClose();
      // Reset form
      setSecretKey('');
      setCountries('US,CA,GB');
    } catch (error: any) {
      // Error is already logged in the mutation
      // Keep dialog open so user can retry
      console.error('[StripeConfigDialog] Save failed:', error.message);
    }
  };

  const handleCancel = () => {
    // Reset form on cancel
    setSecretKey('');
    setCountries('US,CA,GB');
    setConfig.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Stripe Payment</DialogTitle>
          <DialogDescription>
            Set up Stripe to enable course payments on your platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              required
              disabled={setConfig.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe secret key (starts with sk_test_ or sk_live_)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries</Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="US,CA,GB"
              disabled={setConfig.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of country codes (e.g., US,CA,GB,AU)
            </p>
          </div>

          {setConfig.isError && setConfig.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {setConfig.error.message || 'Failed to save configuration. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={setConfig.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={setConfig.isPending || !secretKey.trim()}
              className="flex-1"
            >
              {setConfig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
