import { useIsStripeConfigured } from './useQueries';
import { PAYMENTS_BYPASS_ENABLED } from '../config/payments';

export interface PaymentsStatus {
  paymentsDisabled: boolean;
  isLoading: boolean;
  reason: 'bypass' | 'stripe-not-configured' | null;
}

/**
 * Centralized hook to determine if payments are disabled.
 * Payments are disabled if:
 * 1. The bypass flag is enabled (PAYMENTS_BYPASS_ENABLED = true), OR
 * 2. Stripe is not configured on the backend
 */
export function usePaymentsStatus(): PaymentsStatus {
  const { data: stripeConfigured, isLoading } = useIsStripeConfigured();

  // If bypass is enabled, payments are disabled regardless of Stripe config
  if (PAYMENTS_BYPASS_ENABLED) {
    return {
      paymentsDisabled: true,
      isLoading: false,
      reason: 'bypass',
    };
  }

  // While loading, assume payments are disabled to prevent premature checkout
  if (isLoading) {
    return {
      paymentsDisabled: true,
      isLoading: true,
      reason: null,
    };
  }

  // If Stripe is not configured, payments are disabled
  if (!stripeConfigured) {
    return {
      paymentsDisabled: true,
      isLoading: false,
      reason: 'stripe-not-configured',
    };
  }

  // Stripe is configured and bypass is not enabled - payments are enabled
  return {
    paymentsDisabled: false,
    isLoading: false,
    reason: null,
  };
}
