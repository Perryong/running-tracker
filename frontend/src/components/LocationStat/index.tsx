import YearStat from '@/components/YearStat';
import {
  LOCATION_INFO_MESSAGE_FIRST,
  LOCATION_INFO_MESSAGE_SECOND,
} from '@/utils/const';
import CitiesStat from './CitiesStat';
import LocationSummary from './LocationSummary';
import PeriodStat from './PeriodStat';

interface ILocationStatProps {
  year: string;
  years: string[];
  cities: Record<string, number>;
  runPeriod: Record<string, number>;
  activities: Activity[];
  changeYear: (year: string) => void;
  changeCity: (city: string) => void;
  changeTitle: (title: string) => void;
}

const LocationStat = ({
  year,
  years,
  cities,
  runPeriod,
  activities,
  changeYear,
  changeCity,
  changeTitle,
}: ILocationStatProps) => (
  <div className="w-full pb-16 lg:w-full lg:pr-16">
    <section className="pb-0">
      <p className="leading-relaxed">
        {LOCATION_INFO_MESSAGE_FIRST}
        .
        <br />
        {LOCATION_INFO_MESSAGE_SECOND}
        .
        <br />
        <br />
        Yesterday you said tomorrow.
      </p>
    </section>
    <hr />
    <LocationSummary />
    <CitiesStat cities={cities} onClick={changeCity} />
    <PeriodStat runPeriod={runPeriod} onClick={changeTitle} />
    <YearStat
      year={year}
      years={years}
      activities={activities}
      onClick={changeYear}
    />
  </div>
);

export default LocationStat;
import type { Activity } from '@/utils/utils';
