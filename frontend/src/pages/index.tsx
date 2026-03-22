import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import LocationStat from '@/components/LocationStat';
import TemplateMap from '@/components/RunMap/TemplateMap';
import RunTable from '@/components/RunTable';
import SVGStat from '@/components/SVGStat';
import YearsStat from '@/components/YearsStat';
import RunMapButtons from '@/components/RunMap/RunMapButtons';
import { FreshnessTrustSignal } from '@/components/FreshnessTrustSignal';
import useActivities from '@/hooks/useActivities';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { useInterval } from '@/hooks/useInterval';
import { IS_CHINESE } from '@/utils/const';
import {
  Activity,
  IViewState,
  geoJsonForRuns,
  getBoundsForGeoData,
  scrollToMap,
  sortDateFunc,
  titleForShow,
  RunIds,
} from '@/utils/utils';
import { useTheme } from '@/hooks/useTheme';
import { useDashboardFilters } from '@/features/dashboard/filters/useDashboardFilters';
import { selectFilteredRuns } from '@/features/dashboard/selectors/selectFilteredRuns';
import { selectKpis } from '@/features/dashboard/selectors/selectKpis';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { EmptyKpiState } from '@/features/dashboard/components/EmptyKpiState';
import { HeartRateTrendPanel } from '@/features/dashboard/components/HeartRateTrendPanel';
import { getAnalyticsSummary } from '@/api/analytics';
import type { ApiHrMethodology, ApiHrTrendAnalytics } from '@/api/types';

export const shouldExitSingleRunFocus = (
  singleRunId: number | null,
  filteredRuns: Activity[]
): boolean => {
  if (singleRunId === null) {
    return false;
  }
  return !filteredRuns.some((run) => run.run_id === singleRunId);
};

const Index = () => {
  const { siteTitle, siteUrl } = useSiteMetadata();
  const { activities, years, cities, runPeriod, thisYear, freshness } = useActivities();
  const {
    filters,
    setYear: setFilterYear,
    setCity: setFilterCity,
    setTitle: setFilterTitle,
  } = useDashboardFilters();
  const [runIndex, setRunIndex] = useState(-1);
  const [title, setTitle] = useState('Running Heatmap');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [animationRuns, setAnimationRuns] = useState<Activity[]>([]);
  const [singleRunId, setSingleRunId] = useState<number | null>(null);
  const [_animationTrigger, setAnimationTrigger] = useState(0);
  const [trendMethodology, setTrendMethodology] = useState<ApiHrMethodology | null>(
    null
  );
  const [trendAnalytics, setTrendAnalytics] = useState<ApiHrTrendAnalytics | null>(null);

  const selectedRunIdRef = useRef<number | null>(null);
  const selectedRunDateRef = useRef<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('run_')) {
      const runId = parseInt(hash.replace('run_', ''), 10);
      if (!isNaN(runId)) {
        setSingleRunId(runId);
      }
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash.startsWith('run_')) {
        const runId = parseInt(newHash.replace('run_', ''), 10);
        if (!isNaN(runId)) {
          setSingleRunId(runId);
        }
      } else {
        setSingleRunId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const runs = useMemo(() => selectFilteredRuns(activities, filters), [activities, filters]);
  const kpis = useMemo(() => selectKpis(runs), [runs]);
  const currentYear = filters.year === 'all' ? 'Total' : filters.year;

  const geoData = useMemo(() => geoJsonForRuns(runs), [runs]);
  const bounds = useMemo(() => getBoundsForGeoData(geoData), [geoData]);

  const [viewState, setViewState] = useState<IViewState>(() => ({
    ...bounds,
  }));
  const [animatedGeoData, setAnimatedGeoData] = useState(geoData);

  useInterval(
    () => {
      if (!isAnimating || currentAnimationIndex >= animationRuns.length) {
        setIsAnimating(false);
        setAnimatedGeoData(geoData);
        return;
      }

      const runsNum = animationRuns.length;
      const sliceNum = runsNum >= 8 ? Math.ceil(runsNum / 8) : 1;
      const nextIndex = Math.min(currentAnimationIndex + sliceNum, runsNum);
      const tempRuns = animationRuns.slice(0, nextIndex);
      setAnimatedGeoData(geoJsonForRuns(tempRuns));
      setCurrentAnimationIndex(nextIndex);

      if (nextIndex >= runsNum) {
        setIsAnimating(false);
        setAnimatedGeoData(geoData);
      }
    },
    isAnimating ? 300 : null
  );

  const startAnimation = useCallback(
    (runsToAnimate: Activity[]) => {
      if (runsToAnimate.length === 0) {
        setAnimatedGeoData(geoData);
        return;
      }
      const sliceNum = runsToAnimate.length >= 8 ? Math.ceil(runsToAnimate.length / 8) : 1;
      setAnimationRuns(runsToAnimate);
      setCurrentAnimationIndex(sliceNum);
      setIsAnimating(true);
    },
    [geoData]
  );

  const clearSingleRunFocusHash = () => {
    if (window.location.hash) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  };

  const changeYear = useCallback(
    (y: string) => {
      if ((viewState.zoom ?? 0) > 3 && bounds) {
        setViewState({ ...bounds });
      }
      scrollToMap();
      setFilterYear(y === 'Total' ? 'all' : y);
      setRunIndex(-1);
      setTitle(`${y} Year Running Heatmap`);
      setSingleRunId(null);
      setIsAnimating(false);
      clearSingleRunFocusHash();
    },
    [viewState.zoom, bounds, setFilterYear]
  );

  const changeCity = useCallback(
    (city: string) => {
      scrollToMap();
      setFilterCity(city === 'Total' ? 'all' : city);
      setRunIndex(-1);
      setTitle(`${city} City Running Heatmap`);
      setSingleRunId(null);
      clearSingleRunFocusHash();
    },
    [setFilterCity]
  );

  const changeTitle = useCallback(
    (titleFilter: string) => {
      scrollToMap();
      setFilterTitle(titleFilter === 'Total' ? 'all' : titleFilter);
      setRunIndex(-1);
      setTitle(`${titleFilter} Title Running Heatmap`);
      setSingleRunId(null);
      clearSingleRunFocusHash();
    },
    [setFilterTitle]
  );

  const setActivity = useCallback((_newRuns: Activity[]) => {
    console.warn('setActivity called but runs are now computed from shared filters');
  }, []);

  const locateActivity = useCallback(
    (runIds: RunIds) => {
      const ids = new Set(runIds);
      const selectedRuns = !runIds.length ? runs : runs.filter((r: any) => ids.has(r.run_id));
      if (!selectedRuns.length) {
        return;
      }

      const lastRun = selectedRuns.sort(sortDateFunc)[0];
      if (!lastRun) {
        return;
      }

      if (runIds.length === 1) {
        const runId = runIds[0];
        const runIdx = runs.findIndex((run) => run.run_id === runId);
        setRunIndex(runIdx);
      } else {
        setRunIndex(-1);
      }

      if (runIds.length === 1) {
        const runId = runIds[0];
        const newHash = `#run_${runId}`;
        if (window.location.hash !== newHash) {
          window.history.pushState(null, '', newHash);
        }
        setSingleRunId(runId);
      } else {
        clearSingleRunFocusHash();
        setSingleRunId(null);
      }

      const selectedGeoData = geoJsonForRuns(selectedRuns);
      const selectedBounds = getBoundsForGeoData(selectedGeoData);
      setIsAnimating(false);
      setAnimatedGeoData(selectedGeoData);

      if (runIds.length === 1) {
        setAnimationTrigger((prev) => prev + 1);
      }

      setViewState({ ...selectedBounds });
      setTitle(titleForShow(lastRun));
      scrollToMap();
    },
    [runs]
  );

  useEffect(() => {
    if (singleRunId !== null && runs.length > 0) {
      const runExists = runs.some((run) => run.run_id === singleRunId);
      if (runExists) {
        locateActivity([singleRunId]);
      } else {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        );
        setSingleRunId(null);
      }
    }
  }, [singleRunId, runs, locateActivity]);

  useEffect(() => {
    if (!shouldExitSingleRunFocus(singleRunId, runs)) {
      return;
    }
    setSingleRunId(null);
    setRunIndex(-1);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, [singleRunId, runs]);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      ...bounds,
    }));
  }, [bounds]);

  useEffect(() => {
    startAnimation(runs);
  }, [runs, startAnimation]);

  useEffect(() => {
    let cancelled = false;
    void getAnalyticsSummary()
      .then((response) => {
        if (!cancelled) {
          setTrendMethodology(response.summary.heart_rate.methodology);
          setTrendAnalytics(response.summary.heart_rate.trend);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrendMethodology(null);
          setTrendAnalytics(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentYear !== 'Total') {
      return;
    }

    const svgStat = document.getElementById('svgStat');
    if (!svgStat) {
      return;
    }

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() !== 'path') {
        return;
      }

      const descEl = target.querySelector('desc');
      if (descEl) {
        const runId = Number(descEl.innerHTML);
        if (!runId) {
          return;
        }
        if (selectedRunIdRef.current === runId) {
          selectedRunIdRef.current = null;
          locateActivity(runs.map((r) => r.run_id));
        } else {
          selectedRunIdRef.current = runId;
          locateActivity([runId]);
        }
        return;
      }

      const titleEl = target.querySelector('title');
      if (!titleEl) {
        return;
      }

      const [runDate] = titleEl.innerHTML.match(/\d{4}-\d{1,2}-\d{1,2}/) || [`${+thisYear + 1}`];
      const runIDsOnDate = runs
        .filter((r) => r.start_date_local.slice(0, 10) === runDate)
        .map((r) => r.run_id);

      if (!runIDsOnDate.length) {
        return;
      }

      if (selectedRunDateRef.current === runDate) {
        selectedRunDateRef.current = null;
        locateActivity(runs.map((r) => r.run_id));
      } else {
        selectedRunDateRef.current = runDate;
        locateActivity(runIDsOnDate);
      }
    };

    svgStat.addEventListener('click', handleClick);
    return () => svgStat.removeEventListener('click', handleClick);
  }, [currentYear, runs, locateActivity, thisYear]);

  const { theme } = useTheme();

  return (
    <Layout>
      <Helmet>
        <html lang="en" data-theme={theme} />
      </Helmet>
      <div className="w-full lg:w-1/3">
        <h1 className="my-12 mt-6 text-5xl font-extrabold italic">
          <a href={siteUrl}>{siteTitle}</a>
        </h1>
        <div className="mb-8">
          <RunMapButtons changeYear={changeYear} thisYear={currentYear} years={years} />
        </div>
        <FreshnessTrustSignal freshness={freshness} />
        {(viewState.zoom ?? 0) <= 3 && IS_CHINESE ? (
          <LocationStat
            year={currentYear}
            years={years}
            cities={cities}
            runPeriod={runPeriod}
            activities={runs}
            changeYear={changeYear}
            changeCity={changeCity}
            changeTitle={changeTitle}
          />
        ) : (
          <YearsStat
            year={currentYear}
            years={years}
            activities={runs}
            onClick={changeYear}
          />
        )}
      </div>
      <div className="w-full lg:w-2/3" id="map-container">
        {runs.length === 0 ? <EmptyKpiState /> : <KpiCards kpis={kpis} />}
        {trendMethodology && trendAnalytics ? (
          <HeartRateTrendPanel trend={trendAnalytics} methodology={trendMethodology} />
        ) : null}
        <TemplateMap title={title} geoData={animatedGeoData} />
        {currentYear === 'Total' ? (
          <SVGStat />
        ) : (
          <RunTable
            runs={runs}
            setActivity={setActivity}
            setRunIndex={setRunIndex}
          />
        )}
      </div>
      {import.meta.env.VERCEL && <Analytics />}
    </Layout>
  );
};

export default Index;
