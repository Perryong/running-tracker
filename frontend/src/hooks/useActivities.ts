import { useEffect, useMemo, useState } from 'react';
import { locationForRun, titleForRun } from '@/utils/utils';
import type { Activity } from '@/utils/utils';
import activities from '@data/activities.json';
import { getActivities } from '@/api/activities';
import type { ApiFreshness } from '@/api/types';

const STATIC_FRESHNESS: ApiFreshness = {
  last_sync_at: '',
  completeness: 'unavailable',
};

interface ActivitiesHookData {
  activities: Activity[];
  years: string[];
  countries: string[];
  provinces: string[];
  cities: Record<string, number>;
  runPeriod: Record<string, number>;
  thisYear: string;
  freshness: ApiFreshness;
}

// standardize country names for consistency between mapbox and activities data
const standardizeCountryName = (country: string): string => {
  if (country.includes('美利坚合众国')) {
    return '美国';
  }
  if (country.includes('英国')) {
    return '英国';
  }
  if (country.includes('印度尼西亚')) {
    return '印度尼西亚';
  } else {
    return country;
  }
};

const processActivities = (
  runs: Activity[],
  freshness: ApiFreshness
): ActivitiesHookData => {
  const cities: Record<string, number> = {};
  const runPeriod: Record<string, number> = {};
  const provinces: Set<string> = new Set();
  const countries: Set<string> = new Set();
  const years: Set<string> = new Set();

  runs.forEach((run) => {
    const location = locationForRun(run);

    const periodName = titleForRun(run);
    if (periodName) {
      runPeriod[periodName] = runPeriod[periodName]
        ? runPeriod[periodName] + 1
        : 1;
    }

    const { city, province, country } = location;
    // drop only one char city
    if (city.length > 1) {
      cities[city] = cities[city] ? cities[city] + run.distance : run.distance;
    }
    if (province) provinces.add(province);
    if (country) countries.add(standardizeCountryName(country));
    const year = run.start_date_local.slice(0, 4);
    years.add(year);
  });

  const yearsArray = [...years].sort().reverse();
  const thisYear = yearsArray[0] || '';

  return {
    activities: runs,
    years: yearsArray,
    countries: [...countries],
    provinces: [...provinces],
    cities,
    runPeriod,
    thisYear,
    freshness,
  };
};

const USE_TYPED_API = import.meta.env.VITE_USE_TYPED_API !== 'false';

const useActivities = () => {
  const [runs, setRuns] = useState<Activity[]>(activities);
  const [freshness, setFreshness] = useState<ApiFreshness>(STATIC_FRESHNESS);

  useEffect(() => {
    if (!USE_TYPED_API) {
      setRuns(activities);
      setFreshness(STATIC_FRESHNESS);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        const response = await getActivities();
        if (!mounted) {
          return;
        }
        setRuns(response.activities);
        setFreshness(response.freshness);
      } catch {
        if (!mounted) {
          return;
        }
        setRuns(activities);
        setFreshness(STATIC_FRESHNESS);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const processedData = useMemo(
    () => processActivities(runs, freshness),
    [runs, freshness]
  );

  return processedData;
};

export default useActivities;
