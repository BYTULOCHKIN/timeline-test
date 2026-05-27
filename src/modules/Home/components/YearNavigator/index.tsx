import clsx from 'clsx';
import { Button } from '@/components/Button/Button';
import s from '../../style.module.css';

type YearNavigatorProps = {
    years: string[];
    activeYear: string;
    availableYears: string[];
    onYearSelect: (_year: string) => void;
};

const YearNavigator: React.FC<YearNavigatorProps> = ({ years, activeYear, availableYears, onYearSelect }) => {
    return (
        <nav className={s.yearNav} aria-label="Timeline years">
            <div className={s.yearNavScroller}>
                {years.map((year) => {
                    const isActive = activeYear === year;
                    const isAvailable = availableYears.includes(year);

                    return (
                        <Button
                            key={year}
                            className={clsx(
                                s.yearButton,
                                isActive && s.yearButtonActive,
                                !isAvailable && s.yearButtonMuted
                            )}
                            variant="ghost"
                            size="small"
                            aria-current={isActive ? 'step' : undefined}
                            aria-disabled={!isAvailable}
                            onClick={() => {
                                if (isAvailable) {
                                    onYearSelect(year);
                                }
                            }}
                        >
                            {year}
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
};

export default YearNavigator;
