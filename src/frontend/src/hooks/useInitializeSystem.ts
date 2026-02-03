import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SystemHealth } from '../backend';

export function useInitializeSystem() {
  const { actor, isFetching } = useActor();

  return useQuery<SystemHealth>({
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
        console.error('Failed to fetch system health:', error);
        return {
          initializationComplete: false,
          coursesLoaded: false,
          courseCount: BigInt(0),
          adminAssigned: false,
          systemReady: false,
        };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.systemReady) {
        return false;
      }
      return 2000;
    },
    staleTime: 1000,
  });
}

export function useCoursesAvailable() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['coursesAvailable'],
    queryFn: async () => {
      if (!actor) return false;
      
      try {
        // Backend method not yet implemented
        // const result = await actor.getCourses();
        // const courses = result.__kind__ === 'ok' ? result.ok : [];
        return false;
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

