import styles from './style.module.css';

const RunMapButtons = ({
  changeYear,
  thisYear,
  years,
}: {
  changeYear: (_year: string) => void;
  thisYear: string;
  years: string[];
}) => {
  const yearsButtons = years.slice();

  return (
    <ul className={styles.buttons}>
      {yearsButtons.map((year) => (
        <li
          key={`${year}button`}
          className={
            styles.button + ` ${year === thisYear ? styles.selected : ''}`
          }
          onClick={() => {
            changeYear(year);
          }}
        >
          {year}
        </li>
      ))}
    </ul>
  );
};

export default RunMapButtons;
