import { Heart } from 'lucide-react';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';

export default function Footer() {
  const { paymentsDisabled } = usePaymentsStatus();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {paymentsDisabled && (
            <p className="text-xs text-muted-foreground">
              Payments are temporarily disabled. All courses are currently accessible.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            © 2025. Built with{' '}
            <Heart className="inline h-4 w-4 text-destructive fill-destructive" />{' '}
            using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
