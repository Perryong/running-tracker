import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/api/activities';
import type { Activity } from '@/utils/utils';

interface UseActivityDetailResult {
  activity: Activity | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

export const useActivityDetail = (runId: number | null): UseActivityDetailResult => {
  const query = useQuery({
    queryKey: ['activity-detail', runId],
    queryFn: async () => {
      const response = await getActivities();
      return response.activities;
    },
    enabled: Number.isInteger(runId) && runId !== null,
    retry: false,
  });

  const activity = useMemo(() => {
    if (!query.data || runId === null) {
      return null;
    }
    return query.data.find((run) => run.run_id === runId) ?? null;
  }, [query.data, runId]);

  return {
    activity,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
