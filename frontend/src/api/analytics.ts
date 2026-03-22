import { apiClient } from './client';
import type {
  ApiAnalyticsSummaryResponse,
  ApiHrPerRunAnalytics,
} from './types';

export const getAnalyticsSummary =
  async (): Promise<ApiAnalyticsSummaryResponse> =>
    apiClient<ApiAnalyticsSummaryResponse>('/analytics/summary');

export const getPerRunHeartRateAnalytics = async (
  runId: number
): Promise<{
  summary: ApiAnalyticsSummaryResponse['summary'];
  perRun: ApiHrPerRunAnalytics | null;
}> => {
  const response = await getAnalyticsSummary();
  const perRun =
    response.summary.heart_rate.per_run.find(
      (entry) => entry.run_id === runId
    ) ?? null;
  return {
    summary: response.summary,
    perRun,
  };
};
