import homenetMarkUrl from '@/icons/homenet-mark.svg';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import s from '../../style.module.css';

type TimelineHeroProps = {
    onExplore: () => void;
};

const heroStats = [
    { value: '250 тис.+', label: 'абонентів у регіонах України' },
    { value: '20 тис. км', label: 'власної мережевої інфраструктури' },
    { value: '1000+', label: 'населених пунктів у зоні покриття' },
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
                <div className={s.brandLockup} aria-label="HomeNet">
                    <img src={homenetMarkUrl} alt="" className={s.brandMark} />
                    <span>HomeNet</span>
                </div>
                <div className={s.eyebrow}>Перезапуск у 2016 · ціль 2026</div>
                <Typography id="timeline-hero-title" variant="heading-3xl" className={s.heroTitle}>
                    HomeNet там, де великий звʼязок зазвичай не ризикує.
                </Typography>
                <Typography variant="body-lg" className={s.heroText}>
                    Таймлайн про шлях HomeNet від регіонального перезапуску до національного оператора фіксованого
                    інтернету для приватного сектору, малих міст, сіл, бізнесу та громад.
                </Typography>
                <div className={s.heroActions}>
                    <Button className={s.primaryCta} onClick={onExplore}>
                        Переглянути таймлайн
                    </Button>
                    <span className={s.heroHint}>Історія HomeNet 2016-2026</span>
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
                    <img src={homenetMarkUrl} alt="" className={s.anniversaryLogo} />
                    <span>10</span>
                    <small>років</small>
                </div>
                <div className={s.signalCard}>
                    <strong>97%</strong>
                    <span>мережі побудовано на PON-технології</span>
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
