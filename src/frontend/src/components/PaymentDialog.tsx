import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';
import type { Course } from '../types';
import { toast } from 'sonner';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course;
}

export default function PaymentDialog({ open, onClose, course }: PaymentDialogProps) {
  const createCheckout = useCreateCheckoutSession();
  const { paymentsDisabled, isLoading: paymentsStatusLoading } = usePaymentsStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (priceInCents: bigint) => {
    const dollars = Number(priceInCents) / 100;
    return `$${dollars.toFixed(2)}`;
  };

  const handlePayment = async () => {
    if (paymentsDisabled) {
      toast.error('Payments are temporarily disabled');
      return;
    }

    setIsProcessing(true);
    try {
      const items = [
        {
          productName: course.title,
          productDescription: course.description,
          priceInCents: course.price,
          quantity: BigInt(1),
          currency: 'USD',
        },
      ];

      const session = await createCheckout.mutateAsync({ items, courseId: course.id });
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {paymentsDisabled 
              ? 'Payments are temporarily disabled'
              : "You'll be redirected to Stripe to complete your payment securely"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {paymentsDisabled && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Payment processing is temporarily disabled. All courses are currently accessible without purchase.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{course.title}</span>
              <Badge variant="default">{formatPrice(course.price)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg">{formatPrice(course.price)}</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              {paymentsDisabled ? 'Close' : 'Cancel'}
            </Button>
            {!paymentsDisabled && (
              <Button 
                onClick={handlePayment} 
                className="flex-1" 
                disabled={isProcessing || paymentsStatusLoading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            )}
          </div>

          {!paymentsDisabled && (
            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
