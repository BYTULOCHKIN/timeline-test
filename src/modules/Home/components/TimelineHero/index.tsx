import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import s from '../../style.module.css';

type TimelineHeroProps = {
    onExplore: () => void;
};

const heroStats = [
    { value: '10', label: 'years building local connectivity' },
    { value: '78k+', label: 'mock connected customers' },
    { value: '610 km', label: 'mock fiber routes' },
];

const TimelineHero: React.FC<TimelineHeroProps> = ({ onExplore }) => {
    return (
        <section className={s.hero} aria-labelledby="timeline-hero-title">
            <motion.div
                className={s.heroContent}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={s.eyebrow}>Founded in 2016 · Celebrating 10 years in 2026</div>
                <Typography id="timeline-hero-title" variant="heading-3xl" className={s.heroTitle}>
                    A decade of faster, calmer internet.
                </Typography>
                <Typography variant="body-lg" className={s.heroText}>
                    Explore the milestones of a modern Internet Service Provider as it grows from a neighborhood launch
                    into a resilient fiber-first network.
                </Typography>
                <div className={s.heroActions}>
                    <Button className={s.primaryCta} onClick={onExplore}>
                        Explore timeline
                    </Button>
                    <span className={s.heroHint}>2016-2026 company journey</span>
                </div>
            </motion.div>

            <motion.div
                className={s.heroVisual}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={s.orbit}>
                    <span />
                    <span />
                    <span />
                </div>
                <div className={s.anniversaryMark}>
                    <span>10</span>
                    <small>years</small>
                </div>
                <div className={s.signalCard}>
                    <strong>99.95%</strong>
                    <span>modernized network uptime target</span>
                </div>
            </motion.div>

            <motion.div
                className={s.heroStats}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                {heroStats.map((stat) => {
                    return (
                        <div key={stat.value} className={s.statCard}>
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                        </div>
                    );
                })}
            </motion.div>
        </section>
    );
};

export default TimelineHero;
