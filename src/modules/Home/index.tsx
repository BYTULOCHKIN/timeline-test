import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ALL_TIMELINE_FILTER, MILESTONES, TIMELINE_TAGS } from './constants';
import FinalCTA from './components/FinalCTA';
import Timeline from './components/Timeline';
import TimelineFilters from './components/TimelineFilters';
import TimelineHero from './components/TimelineHero';
import YearNavigator from './components/YearNavigator';
import s from './style.module.css';

const Home: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();
    const [activeTag, setActiveTag] = React.useState<string>(ALL_TIMELINE_FILTER);
    const [activeYear, setActiveYear] = React.useState(MILESTONES[0]?.year ?? '');

    const filterOptions = React.useMemo(() => {
        return [ALL_TIMELINE_FILTER, ...TIMELINE_TAGS];
    }, []);

    const filteredMilestones = React.useMemo(() => {
        if (activeTag === ALL_TIMELINE_FILTER) {
            return MILESTONES;
        }

        return MILESTONES.filter((milestone) => {
            return milestone.tags.includes(activeTag);
        });
    }, [activeTag]);

    const years = React.useMemo(() => {
        return MILESTONES.map((milestone) => {
            return milestone.year;
        });
    }, []);

    const availableYears = React.useMemo(() => {
        return filteredMilestones.map((milestone) => {
            return milestone.year;
        });
    }, [filteredMilestones]);

    const scrollToYear = React.useCallback((year: string) => {
        const element = document.getElementById(`milestone-${year}`);

        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, []);

    const scrollToTimeline = React.useCallback(() => {
        document.getElementById('timeline')?.scrollIntoView({
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
            block: 'start',
        });
    }, [shouldReduceMotion]);

    const restartTimeline = React.useCallback(() => {
        setActiveTag(ALL_TIMELINE_FILTER);
        window.requestAnimationFrame(() => {
            scrollToYear(MILESTONES[0]?.year ?? '2016');
        });
    }, [scrollToYear]);

    return (
        <main className={s.page}>
            <div className={s.backgroundGlow} aria-hidden="true" />
            <TimelineHero onExplore={scrollToTimeline} />

            <section className={s.introSection} aria-labelledby="journey-intro-title">
                <motion.div
                    className={s.introPanel}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                    <span className={s.sectionKicker}>Company journey</span>
                    <h2 id="journey-intro-title" className={s.introTitle}>
                        From first neighborhood links to a future-ready fiber platform.
                    </h2>
                    <p className={s.introText}>
                        This timeline is structured around replaceable data, so campaign teams can move from mock
                        milestones to verified launch dates, real metrics, and production media without changing the
                        experience layer.
                    </p>
                </motion.div>
            </section>

            <TimelineFilters activeTag={activeTag} tags={filterOptions} onTagChange={setActiveTag} />
            <YearNavigator
                years={years}
                activeYear={activeYear}
                availableYears={availableYears}
                onYearSelect={scrollToYear}
            />
            <Timeline milestones={filteredMilestones} activeYear={activeYear} onActiveYearChange={setActiveYear} />
            <FinalCTA onRestart={restartTimeline} />
        </main>
    );
};

export default Home;
