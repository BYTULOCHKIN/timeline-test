import type { Milestone } from '../../types';
import React from 'react';
import clsx from 'clsx';
import { motion, useInView } from 'framer-motion';
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
        const articleRef = React.useRef<HTMLElement | null>(null);
        const metrics = Object.entries(milestone.metrics ?? {});
        const isMirrored = index % 2 === 1;
        const isInView = useInView(articleRef, {
            amount: 0.08,
            margin: '0px 0px 18% 0px',
            once: true,
        });

        const setArticleRef = React.useCallback(
            (node: HTMLElement | null) => {
                articleRef.current = node;

                if (typeof ref === 'function') {
                    ref(node);
                    return;
                }

                if (ref) {
                    ref.current = node;
                }
            },
            [ref]
        );

        return (
            <article
                ref={setArticleRef}
                id={`milestone-${milestone.year}`}
                className={clsx(
                    parentS.milestone,
                    isActive && parentS.milestoneActive,
                    isMirrored && parentS.milestoneMirrored
                )}
                aria-labelledby={`${milestone.id}-title`}
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
                    initial={false}
                    animate={
                        isInView
                            ? {
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                              }
                            : {
                                  opacity: 0,
                                  y: 36,
                                  scale: 0.98,
                              }
                    }
                    whileHover={{ y: -6 }}
                    transition={{
                        opacity: { duration: 0.32, ease: 'easeOut' },
                        scale: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                    }}
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
            </article>
        );
    }
);

TimelineMilestoneCard.displayName = 'TimelineMilestoneCard';

export default TimelineMilestoneCard;
