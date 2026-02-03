import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile as BackendUserProfile } from '../backend';
import type {
  UserProfile,
  Course,
  Certificate,
  CourseProgress,
  Lesson,
  EngagementMetrics,
  CertificateAnalytics,
  ExternalApiConfig,
  ExternalRegistrationRecord,
  VerifiedAlumniRecord,
} from '../types';
import { toast } from 'sonner';

// Re-export types for convenience
export type { ExternalApiConfig, ExternalRegistrationRecord, VerifiedAlumniRecord };

// Helper function to unwrap Result types - handles both old and new Candid variant shapes
function unwrapResult<T>(result: any): T {
  // New Candid shape: { ok: value } or { err: message }
  if (result && typeof result === 'object') {
    if ('ok' in result) {
      return result.ok as T;
    }
    if ('err' in result) {
      throw new Error(result.err);
    }
    // Old shape: { __kind__: 'ok'|'err', ok?: T, err?: string }
    if (result.__kind__ === 'err') {
      throw new Error(result.err || 'Unknown error');
    }
    if (result.__kind__ === 'ok') {
      return result.ok as T;
    }
  }
  throw new Error('Invalid Result type');
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) {
        console.log('[Profile Query] User not authenticated, skipping profile fetch');
        return null;
      }
      
      try {
        console.log('[Profile Query] Fetching user profile...');
        const result = await actor.getCallerUserProfile();
        const profile = unwrapResult<BackendUserProfile>(result);
        console.log('[Profile Query] Profile fetched successfully:', profile.name);
        // Use unknown as intermediate type for safe conversion
        return profile as unknown as UserProfile;
      } catch (error: any) {
        console.error('[Profile Query] Error:', error.message);
        // Surface the error so React Query enters error state
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');
      
      // Verify the profile ID matches the caller
      const callerPrincipal = identity.getPrincipal();
      if (profile.id.toString() !== callerPrincipal.toString()) {
        throw new Error('Profile principal does not match authenticated user');
      }

      console.log('[Profile Save] Saving profile for:', profile.name);
      // Use unknown as intermediate type for safe conversion
      const result = await actor.saveCallerUserProfile(profile as unknown as BackendUserProfile);
      const savedProfile = unwrapResult<BackendUserProfile>(result);
      console.log('[Profile Save] Profile saved successfully');
      return savedProfile as unknown as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      console.error('[Profile Save] Error:', error.message);
      let message = 'Failed to save profile';
      
      // Map specific error messages to user-friendly text
      if (error.message.includes('principal does not match') || error.message.includes('Injected principal')) {
        message = 'Profile data does not match your identity. Please try logging in again.';
      } else if (error.message.includes('Unauthorized')) {
        message = 'You are not authorized to save this profile. Please log in.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    },
  });
}

export function useGetCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getCourses();
        const courses = unwrapResult(result) as Course[];
        return courses;
      } catch (error: any) {
        console.error('[Courses Query] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000,
  });
}

export function useGetCourse(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Course | null>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getCourse(courseId);
        const course = unwrapResult(result) as Course | null;
        return course;
      } catch (error: any) {
        console.error('[Course Query] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!courseId,
    retry: 2,
  });
}

export function useGetMyCertificates() {
  const { actor, isFetching } = useActor();

  return useQuery<Certificate[]>({
    queryKey: ['myCertificates'],
    queryFn: async (): Promise<Certificate[]> => {
      if (!actor) return [];
      try {
        console.log('[Certificates Query] Fetching certificates...');
        // Backend method not yet implemented
        // const profileResult = await actor.getCallerUserProfile();
        // const profile = unwrapResult(profileResult) as UserProfile;
        // const certificates = profile.earnedCertificates;
        return [];
      } catch (error: any) {
        console.error('[Certificates Query] Error:', error.message);
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
}

export function useGetAllCertificates() {
  const { actor, isFetching } = useActor();

  return useQuery<Certificate[]>({
    queryKey: ['allCertificates'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Backend method not yet implemented
        // const result = await actor.getAllCertificates();
        // return unwrapResult(result) as Certificate[];
        return [];
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        console.error('Failed to fetch all certificates:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCertificateAnalytics(certificateId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CertificateAnalytics | null>({
    queryKey: ['certificateAnalytics', certificateId],
    queryFn: async () => {
      if (!actor || !certificateId) return null;
      try {
        // Backend method not yet implemented
        // const result = await actor.getCertificateAnalytics(certificateId);
        // return unwrapResult(result) as CertificateAnalytics;
        return null;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('not found')) {
          return null;
        }
        console.error('Failed to fetch certificate analytics:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!certificateId,
  });
}

export function useGetUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['userProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Backend method not yet implemented
        // const result = await actor.getUserProfilesSortedByName();
        // return unwrapResult(result) as UserProfile[];
        return [];
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        console.error('Failed to fetch user profiles:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateLessonProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lessonId, isCompleted }: { courseId: string; lessonId: string; isCompleted: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      // const result = await actor.updateLessonProgress(courseId, lessonId, isCompleted);
      // return unwrapResult(result);
      toast.info('Lesson progress tracking will be implemented when backend is ready');
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to update progress';
      toast.error(message);
    },
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: Course) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      // const result = await actor.addCourse(course);
      // return unwrapResult(result);
      toast.info('Course creation will be implemented when backend is ready');
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courseInitStatus'] });
      toast.success('Course added successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to add course';
      toast.error(message);
    },
  });
}

export function useAddLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lesson }: { courseId: string; lesson: Lesson }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      // const result = await actor.addLesson(courseId, lesson);
      // return unwrapResult(result);
      toast.info('Lesson creation will be implemented when backend is ready');
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courseInitStatus'] });
      toast.success('Lesson added successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to add lesson';
      toast.error(message);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEngagementMetrics() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  return {
    data: userProfile?.engagementMetrics || null,
    isLoading,
  };
}

export function useGetPlatformAnalytics() {
  const { data: users } = useGetUserProfiles();
  const { data: certificates } = useGetAllCertificates();
  const { data: courses } = useGetCourses();

  const analytics = {
    totalUsers: users?.length || 0,
    totalCertificates: certificates?.length || 0,
    totalCourses: courses?.length || 0,
    averageEngagement: users && users.length > 0
      ? Math.round(users.reduce((sum, user) => sum + Number(user.engagementMetrics.attentionScore), 0) / users.length)
      : 0,
    completionRate: users && users.length > 0
      ? Math.round((certificates?.length || 0) / users.length * 100)
      : 0,
    topPerformers: users
      ?.sort((a, b) => Number(b.engagementMetrics.attentionScore) - Number(a.engagementMetrics.attentionScore))
      .slice(0, 5) || [],
  };

  return {
    data: analytics,
    isLoading: !users || !certificates || !courses,
  };
}

export function useGetCourseInitializationStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<{ courseCount: number; lessonCount: number } | null>({
    queryKey: ['courseInitStatus'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // Backend method not yet implemented
        // const result = await actor.getCourseInitializationStatus();
        // const [courseCount, lessonCount] = unwrapResult(result) as [bigint, bigint];
        return { courseCount: 0, lessonCount: 0 };
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return null;
        }
        console.error('Failed to fetch initialization status:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Start Course] Calling startCourse for:', courseId);
      // Backend method not yet implemented
      // const result = await actor.startCourse(courseId);
      // const course = unwrapResult(result) as Course;
      toast.info('Course start will be implemented when backend is ready');
      return { id: courseId, title: 'Course', description: '', lessons: [], quizzes: [], codingChallenges: [], price: BigInt(0) } as Course;
    },
    onSuccess: (course) => {
      console.log('[Start Course] Invalidating queries for course:', course.id);
      queryClient.invalidateQueries({ queryKey: ['course', course.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
    },
    onError: (error: Error) => {
      console.error('[Start Course] Error:', error.message);
      const message = error.message || 'Failed to start course';
      toast.error(message);
    },
    retry: 2,
    retryDelay: 1000,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isStripeConfigured();
      } catch (error) {
        console.error('Failed to check Stripe configuration:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        console.log('[Stripe Config] Attempting to save Stripe configuration...');
        await actor.setStripeConfiguration(config);
        console.log('[Stripe Config] Configuration saved successfully');
      } catch (error: any) {
        console.error('[Stripe Config] Backend error:', error.message || error);
        
        // Extract meaningful error message from backend trap or error
        let errorMessage = 'Failed to save Stripe configuration';
        
        if (error.message) {
          const msg = error.message;
          
          // Check for authorization errors
          if (msg.includes('Unauthorized') || msg.includes('Only admins')) {
            errorMessage = 'You do not have admin permissions to configure Stripe. Please contact an administrator.';
          } else if (msg.includes('not authenticated')) {
            errorMessage = 'You must be logged in to configure Stripe.';
          } else {
            // Use the backend error message directly
            errorMessage = msg;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      console.log('[Stripe Config] Invalidating stripeConfigured query');
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configuration saved successfully');
    },
    onError: (error: Error) => {
      // Error is already logged in mutationFn, just ensure it's not swallowed
      console.error('[Stripe Config] Mutation error:', error.message);
      // Don't show toast here - let the component handle it to avoid duplicate toasts
    },
  });
}

export function useUpdateCoursePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, price }: { courseId: string; price: number }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateCoursePrice(courseId, BigInt(price));
      return unwrapResult(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Course price updated successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to update course price';
      toast.error(message);
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ 
      items, 
      courseId 
    }: { 
      items: Array<{ productName: string; productDescription: string; priceInCents: bigint; quantity: bigint; currency: string }>;
      courseId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}#payment-success?courseId=${courseId}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}#payment-failure?courseId=${courseId}`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to create checkout session';
      toast.error(message);
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getStripeSessionStatus(sessionId);
    },
  });
}

export function useFinalizeCoursePurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, stripeSessionId }: { courseId: string; stripeSessionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.finalizeCoursePurchase(courseId, stripeSessionId);
      const profile = unwrapResult<BackendUserProfile>(result);
      return profile as unknown as UserProfile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Purchase completed successfully!');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to finalize purchase';
      toast.error(message);
    },
  });
}

// External Certification Integration Hooks (Placeholder implementations until backend is ready)

export function useGetExternalApiConfigs() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalApiConfig[]>({
    queryKey: ['externalApiConfigs'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExternalApiConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ExternalApiConfig) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      toast.info('External API configuration will be saved once backend is implemented');
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['externalApiConfigs'] });
      toast.success('External API configuration added successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to add external API configuration';
      toast.error(message);
    },
  });
}

export function useGetAlumniRegistry() {
  const { actor, isFetching } = useActor();

  return useQuery<VerifiedAlumniRecord[]>({
    queryKey: ['alumniRegistry'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserExternalRegistrations() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalRegistrationRecord[]>({
    queryKey: ['userExternalRegistrations'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}
