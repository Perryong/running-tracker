import { apiClient } from './client';
import type { ApiActivitiesResponse, ApiFreshness } from './types';
import { toLegacyActivity } from './types';
import type { Activity } from '@/utils/utils';

export interface ActivitiesResult {
  activities: Activity[];
  freshness: ApiFreshness;
}

export const getActivities = async (): Promise<ActivitiesResult> => {
  const response = await apiClient<ApiActivitiesResponse>('/activities');

  return {
    activities: response.items.map((item) => toLegacyActivity(item)),
    freshness: response.freshness,
  };
};
