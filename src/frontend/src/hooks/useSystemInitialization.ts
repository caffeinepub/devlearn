import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { SystemHealth } from '../backend';
import type { Course } from '../types';

export function useSystemInitialization() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const initQuery = useQuery({
    queryKey: ['systemInitialization'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        // Backend method not yet implemented
        // await actor.systemIdempotentInitialize();
        console.log('[System Init] Backend initialization method not yet implemented');
        return { success: true };
      } catch (error: any) {
        console.error('[System Init] Error:', error);
        if (error.message?.includes('already authenticated')) {
          return { success: true };
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: 3,
    retryDelay: 1000,
    staleTime: Infinity,
  });

  const healthQuery = useQuery<SystemHealth>({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      if (!actor) {
        return {
          initializationComplete: false,
          coursesLoaded: false,
          courseCount: BigInt(0),
          adminAssigned: false,
          systemReady: false,
        };
      }

      try {
        const health = await actor.getSystemHealth();
        return health;
      } catch (error) {
        console.error('[System Health] Error:', error);
        return {
          initializationComplete: false,
          coursesLoaded: false,
          courseCount: BigInt(0),
          adminAssigned: false,
          systemReady: false,
        };
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.systemReady) {
        return false;
      }
      return 2000;
    },
    staleTime: 1000,
  });

  const coursesQuery = useQuery<Course[]>({
    queryKey: ['coursesCheck'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Backend method not yet implemented
        // const result = await actor.getCourses();
        // return result.__kind__ === 'ok' ? result.ok : [];
        return [];
      } catch (error) {
        console.error('[Courses Check] Error:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && healthQuery.data?.systemReady === true,
  });

  const isInitializing = initQuery.isLoading || healthQuery.isLoading;
  const isReady = healthQuery.data?.systemReady === true;

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ['systemInitialization'] });
    queryClient.invalidateQueries({ queryKey: ['systemHealth'] });
    queryClient.invalidateQueries({ queryKey: ['coursesCheck'] });
  };

  return {
    isInitializing,
    isReady,
    systemReady: isReady,
    health: healthQuery.data,
    systemHealth: healthQuery.data,
    courses: coursesQuery.data,
    error: initQuery.error || healthQuery.error,
    initError: initQuery.error || healthQuery.error,
    retry,
  };
}

