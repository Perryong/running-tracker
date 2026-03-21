import {
  formatPace,
  titleForRun,
  formatRunTime,
  Activity,
} from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './style.module.css';

interface IRunRowProperties {
  run: Activity;
}

const RunRow = ({ run }: IRunRowProperties) => {
  const navigate = useNavigate();
  const location = useLocation();
  const distance = (run.distance / 1000.0).toFixed(2);
  const paceParts = run.average_speed ? formatPace(run.average_speed) : null;
  const heartRate = run.average_heartrate;
  const runTime = formatRunTime(run.moving_time);

  const handleClick = () => {
    navigate(
      {
        pathname: `/activity/${run.run_id}`,
        search: location.search,
      },
      {
        state: {
          fromDashboard: true,
          fallbackPathname: '/',
          dashboardScrollY: window.scrollY,
        },
      }
    );
  };

  return (
    <tr
      className={styles.runRow}
      key={run.start_date_local}
      onClick={handleClick}
    >
      <td>{titleForRun(run)}</td>
      <td>{distance}</td>
      {SHOW_ELEVATION_GAIN && <td>{(run.elevation_gain ?? 0.0).toFixed(1)}</td>}
      {paceParts && <td>{paceParts}</td>}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td>{runTime}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
    </tr>
  );
};

export default RunRow;
