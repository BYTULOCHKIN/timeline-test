import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import s from '../../style.module.css';

type TimelineFiltersProps = {
    activeTag: string;
    tags: string[];
    onTagChange: (_tag: string) => void;
};

const TimelineFilters: React.FC<TimelineFiltersProps> = ({ activeTag, tags, onTagChange }) => {
    return (
        <section className={s.filtersSection} aria-labelledby="timeline-filters-title">
            <div>
                <span className={s.sectionKicker}>Фільтр за категорією</span>
                <h2 id="timeline-filters-title" className={s.sectionTitle}>
                    Перегляньте шлях HomeNet за напрямами розвитку.
                </h2>
            </div>
            <div className={s.filterList} role="list" aria-label="Категорії таймлайну">
                {tags.map((tag) => {
                    const isActive = activeTag === tag;

                    return (
                        <Button
                            key={tag}
                            className={clsx(s.filterButton, isActive && s.filterButtonActive)}
                            variant="ghost"
                            size="medium"
                            aria-pressed={isActive}
                            onClick={() => {
                                onTagChange(tag);
                            }}
                        >
                            {isActive ? <motion.span className={s.filterDot} layoutId="active-filter-dot" /> : null}
                            {tag}
                        </Button>
                    );
                })}
            </div>
        </section>
    );
};

export default TimelineFilters;
