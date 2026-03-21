import ActivityList from '@/components/ActivityList';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';
import { useDashboardFilters } from '@/features/dashboard/filters/useDashboardFilters';
import useActivities from '@/hooks/useActivities';

const HomePage = () => {
  // Use the theme hook to get the current theme
  const { theme } = useTheme();
  const { activities } = useActivities();
  const { filters, setDateRange, setActivityType } = useDashboardFilters();

  // Apply theme changes to the document when theme changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    // Set explicit theme attribute
    htmlElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div
      data-testid="summary-route"
      data-current-filter-year={filters.year}
      data-current-filter-activity-type={filters.activityType}
      data-current-filter-city={filters.city}
      data-current-filter-title={filters.title}
    >
      <Helmet>
        {/* Set HTML attributes including theme */}
        <html lang="en" data-theme={theme} />
      </Helmet>
      <ActivityList
        activities={activities}
        filters={filters}
        setDateRange={setDateRange}
        setActivityType={setActivityType}
      />
    </div>
  );
};

export default HomePage;
