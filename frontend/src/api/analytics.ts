import { apiClient } from './client';
import type { ApiAnalyticsSummaryResponse } from './types';

export const getAnalyticsSummary = async (): Promise<ApiAnalyticsSummaryResponse> =>
  apiClient<ApiAnalyticsSummaryResponse>('/analytics/summary');
