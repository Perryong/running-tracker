import { useMemo } from 'react';
import YearStat from '@/components/YearStat';
import { INFO_MESSAGE } from '@/utils/const';
import type { Activity } from '@/utils/utils';

const YearsStat = ({
  year,
  years,
  activities,
  onClick,
}: {
  year: string;
  years: string[];
  activities: Activity[];
  onClick: (_year: string) => void;
}) => {
  // Memoize the years array calculation
  const yearsArrayUpdate = useMemo(() => {
    // make sure the year click on front
    let updatedYears = years.slice();
    updatedYears = updatedYears.filter((x) => x !== year);
    updatedYears.unshift(year);
    return updatedYears;
  }, [years, year]);

  const infoMessage = useMemo(() => {
    return INFO_MESSAGE(years.length, year);
  }, [years.length, year]);

  // for short solution need to refactor
  return (
    <div className="w-full pb-16 pr-16 lg:w-full lg:pr-16">
      <section className="pb-0">
        <p className="leading-relaxed">
          {infoMessage}
          <br />
        </p>
      </section>
      <hr />
      {yearsArrayUpdate.map((yearItem) => (
        <YearStat
          key={yearItem}
          year={yearItem}
          years={years}
          activities={activities}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default YearsStat;
