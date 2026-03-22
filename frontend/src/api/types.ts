import type { Activity as LegacyActivity } from '@/utils/utils';
import type { components } from './contracts/schema';

export type ApiFreshness = components['schemas']['FreshnessMetadata'];
export type ApiActivity = components['schemas']['Activity'];
export type ApiActivitiesResponse = components['schemas']['ActivitiesResponse'];
export type ApiAnalyticsSummary = components['schemas']['AnalyticsSummary'];
export type ApiAnalyticsSummaryResponse =
  components['schemas']['AnalyticsSummaryResponse'];
export type ApiHrAnalyticsEnvelope =
  components['schemas']['HrAnalyticsEnvelope'];
export type ApiHrMethodology = components['schemas']['HrMethodology'];
export type ApiHrConfidence = components['schemas']['HrConfidence'];
export type ApiHrCoverage = components['schemas']['HrCoverage'];
export type ApiHrPerRunAnalytics = components['schemas']['HrPerRunAnalytics'];
export type ApiHrTrendAnalytics = components['schemas']['HrTrendAnalytics'];
export type ApiHrTrendPoint = components['schemas']['HrTrendPoint'];
export type ApiHrZoneBreakdownEntry =
  components['schemas']['HrZoneBreakdownEntry'];

export const toLegacyActivity = (activity: ApiActivity): LegacyActivity => ({
  run_id: activity.run_id,
  name: activity.name,
  distance: activity.distance,
  moving_time: activity.moving_time,
  type: activity.type,
  subtype: activity.subtype,
  start_date: activity.start_date,
  start_date_local: activity.start_date_local,
  location_country: activity.location_country ?? null,
  summary_polyline: activity.summary_polyline ?? null,
  average_heartrate: activity.average_heartrate ?? null,
  elevation_gain: activity.elevation_gain ?? null,
  average_speed: activity.average_speed,
  streak: activity.streak,
});
