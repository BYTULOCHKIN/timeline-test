import type { Milestone } from '../../types';
import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Typography from '@/components/Typography/Typography';
import s from '../../style.module.css';

type TimelineMilestoneCardProps = {
    milestone: Milestone;
    isActive: boolean;
    index: number;
};

const TimelineMilestoneCard = React.forwardRef<HTMLElement, TimelineMilestoneCardProps>(
    ({ milestone, isActive, index }, ref) => {
        const metrics = Object.entries(milestone.metrics ?? {});
        const isMirrored = index % 2 === 1;

        return (
            <motion.article
                ref={ref}
                id={`milestone-${milestone.year}`}
                className={clsx(s.milestone, isActive && s.milestoneActive, isMirrored && s.milestoneMirrored)}
                aria-labelledby={`${milestone.id}-title`}
                layout
                initial={{ opacity: 0, y: 42, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                viewport={{ once: false, amount: 0.34 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={s.timelineNode} aria-hidden="true">
                    <span>{milestone.year}</span>
                </div>

                <motion.div
                    className={s.milestoneCard}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    <div
                        className={s.milestoneImage}
                        style={{ backgroundImage: milestone.image }}
                        role="img"
                        aria-label={`${milestone.title} visual placeholder`}
                    >
                        <div className={s.imageGrid} />
                        <span>{milestone.year}</span>
                    </div>

                    <div className={s.milestoneBody}>
                        <div className={s.milestoneHeader}>
                            <span className={s.yearPill}>{milestone.year}</span>
                            <div className={s.tagList} aria-label={`${milestone.year} categories`}>
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

                        {metrics.length > 0 ? (
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
                        ) : null}
                    </div>
                </motion.div>
            </motion.article>
        );
    }
);

TimelineMilestoneCard.displayName = 'TimelineMilestoneCard';

export default TimelineMilestoneCard;
