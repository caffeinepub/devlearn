import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useInitializeDefaultCourses() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['courseInitStatus'],
    queryFn: async () => {
      if (!actor) return { courseCount: 0, lessonCount: 0 };
      
      try {
        // Backend method not yet implemented
        // const result = await actor.getCourses();
        // const courses = result.__kind__ === 'ok' ? result.ok : [];
        return { courseCount: 0, lessonCount: 0 };
      } catch (error) {
        console.error('Failed to check course initialization:', error);
        return { courseCount: 0, lessonCount: 0 };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

