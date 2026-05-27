import type { Milestone } from '../../types';
import React from 'react';
import { AnimatePresence, LayoutGroup, useScroll, useSpring } from 'framer-motion';
import Typography from '@/components/Typography/Typography';
import s from '../../style.module.css';
import TimelineMilestoneCard from '../TimelineMilestoneCard';
import TimelineProgress from '../TimelineProgress';

type TimelineProps = {
    milestones: Milestone[];
    activeYear: string;
    onActiveYearChange: (_year: string) => void;
    onYearStoriesOpen: (_year: string) => void;
};

const Timeline: React.FC<TimelineProps> = ({ milestones, activeYear, onActiveYearChange, onYearStoriesOpen }) => {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const milestoneRefs = React.useRef(new Map<string, HTMLElement>());
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 64%', 'end 58%'],
    });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

    React.useEffect(() => {
        const hasActiveMilestone = milestones.some((milestone) => {
            return milestone.year === activeYear;
        });

        if (!hasActiveMilestone) {
            onActiveYearChange(milestones[0]?.year ?? '');
        }
    }, [activeYear, milestones, onActiveYearChange]);

    React.useEffect(() => {
        const nodes = milestones
            .map((milestone) => {
                return milestoneRefs.current.get(milestone.year);
            })
            .filter((node): node is HTMLElement => {
                return Boolean(node);
            });

        if (nodes.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => {
                        return entry.isIntersecting;
                    })
                    .sort((a, b) => {
                        return b.intersectionRatio - a.intersectionRatio;
                    })[0];

                const year = visibleEntry?.target.getAttribute('data-year');

                if (year) {
                    onActiveYearChange(year);
                }
            },
            {
                rootMargin: '-24% 0px -42% 0px',
                threshold: [0.18, 0.32, 0.5, 0.68],
            }
        );

        nodes.forEach((node) => {
            observer.observe(node);
        });

        return () => {
            observer.disconnect();
        };
    }, [milestones, onActiveYearChange]);

    const registerMilestone = React.useCallback((year: string) => {
        return (node: HTMLElement | null) => {
            if (node) {
                node.setAttribute('data-year', year);
                milestoneRefs.current.set(year, node);

                return;
            }

            milestoneRefs.current.delete(year);
        };
    }, []);

    return (
        <section ref={sectionRef} id="timeline" className={s.timelineSection} aria-labelledby="timeline-title">
            <div className={s.timelineIntro}>
                <span className={s.sectionKicker}>Архів ключових подій</span>
                <Typography id="timeline-title" variant="heading-2xl" className={s.sectionTitle}>
                    Одинадцять розділів і одна мережа, що щороку стає сильнішою.
                </Typography>
                <Typography variant="body-md" className={s.sectionText}>
                    Скрольте таймлайн, щоб активний рік оновлювався автоматично, або використовуйте компактну навігацію
                    за роками для швидкого переходу.
                </Typography>
            </div>

            <div className={s.timelineCanvas}>
                <TimelineProgress progress={smoothProgress} />
                <LayoutGroup>
                    <AnimatePresence mode="popLayout">
                        {milestones.map((milestone, index) => {
                            return (
                                <TimelineMilestoneCard
                                    key={milestone.id}
                                    ref={registerMilestone(milestone.year)}
                                    milestone={milestone}
                                    isActive={activeYear === milestone.year}
                                    index={index}
                                    onYearStoriesOpen={onYearStoriesOpen}
                                />
                            );
                        })}
                    </AnimatePresence>
                </LayoutGroup>
            </div>
        </section>
    );
};

export default Timeline;
