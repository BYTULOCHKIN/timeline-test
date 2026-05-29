import type { Milestone } from '../../types';
import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Typography from '@/components/Typography/Typography';
import parentS from '../../style.module.css';
import TimelineYearStories from '../TimelineYearStories';
import s from './TimelineMilestoneCard.module.css';

type TimelineMilestoneCardProps = {
    milestone: Milestone;
    isActive: boolean;
    index: number;
    onYearStoriesOpen: (_year: string, _userIndex?: number) => void;
    onYearStoryAdd: (_year: string) => void;
};

const TimelineMilestoneCard = React.forwardRef<HTMLElement, TimelineMilestoneCardProps>(
    ({ milestone, isActive, index, onYearStoriesOpen, onYearStoryAdd }, ref) => {
        const metrics = Object.entries(milestone.metrics ?? {});
        const isMirrored = index % 2 === 1;

        return (
            <motion.article
                ref={ref}
                id={`milestone-${milestone.year}`}
                className={clsx(
                    parentS.milestone,
                    isActive && parentS.milestoneActive,
                    isMirrored && parentS.milestoneMirrored
                )}
                aria-labelledby={`${milestone.id}-title`}
                layout
                initial={{ opacity: 0, y: 42, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                viewport={{ once: false, amount: 0.34 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={parentS.timelineNode} aria-hidden="true">
                    <span>{milestone.year}</span>
                </div>

                <motion.div
                    className={clsx(
                        s.milestoneCard,
                        isActive && s.milestoneCardActive,
                        isMirrored && s.milestoneCardMirrored
                    )}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    {/* Image — full width, зверху */}
                    <div
                        className={s.milestoneImage}
                        style={{ backgroundImage: milestone.image }}
                        role="img"
                        aria-label={`Візуалізація події: ${milestone.title}`}
                    >
                        <div className={s.imageGrid} aria-hidden="true" />
                        <span className={s.milestoneImageYear} aria-hidden="true">
                            {milestone.year}
                        </span>
                    </div>

                    {/* Body — текст під зображенням */}
                    <div className={s.milestoneBody}>
                        <div className={s.milestoneHeader}>
                            <span className={s.yearPill}>{milestone.year}</span>
                            <div className={s.tagList} aria-label={`Категорії ${milestone.year} року`}>
                                {milestone.tags.map((tag) => {
                                    return (
                                        <span key={tag} className={s.tag}>
                                            {tag}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <Typography id={`${milestone.id}-title`} variant="heading-xl" className={s.milestoneTitle}>
                            {milestone.title}
                        </Typography>

                        <Typography variant="body-md" className={s.milestoneDescription}>
                            {milestone.description}
                        </Typography>

                        {metrics.length > 0 && (
                            <dl className={s.metricGrid}>
                                {metrics.map(([label, value]) => {
                                    return (
                                        <div key={label} className={s.metric}>
                                            <dt>{label}</dt>
                                            <dd>{value}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        )}
                    </div>
                </motion.div>

                <TimelineYearStories
                    milestone={milestone}
                    isActive={isActive}
                    isMirrored={isMirrored}
                    onStoriesOpen={onYearStoriesOpen}
                    onStoryAdd={onYearStoryAdd}
                />
            </motion.article>
        );
    }
);

TimelineMilestoneCard.displayName = 'TimelineMilestoneCard';

export default TimelineMilestoneCard;
