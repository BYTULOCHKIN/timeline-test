import homenetMarkUrl from '@/icons/homenet-mark.svg';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import s from '../../style.module.css';

type FinalCTAProps = {
    onRestart: () => void;
};

const FinalCTA: React.FC<FinalCTAProps> = ({ onRestart }) => {
    return (
        <section className={s.finalCta} aria-labelledby="final-cta-title">
            <motion.div
                className={s.finalCtaInner}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={s.brandLockup} aria-label="HomeNET">
                    <img src={homenetMarkUrl} alt="" className={s.brandMark} />
                    <span>HomeNET</span>
                </div>
                <span className={s.sectionKicker}>Наступне десятиліття</span>
                <Typography id="final-cta-title" variant="heading-2xl" className={s.finalTitle}>
                    Побудовано для наступних 10 років звʼязку.
                </Typography>
                <Typography variant="body-md" className={s.finalText}>
                    ФЕЙК ДАНІ ПОТРІБНО ЗАМІНИТИ НА РЕАЛЬНО. Дякуємо що стали частиною нашої історії. Ми з нетерпінням
                    чекаємо на те, що принесе наступне десятиліття!!!!!.
                </Typography>
                <div className={s.finalActions}>
                    <Button className={s.primaryCta} onClick={onRestart}>
                        Повернутись до 2016
                    </Button>
                    <Button
                        className={s.secondaryCta}
                        variant="ghost"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Нагору
                    </Button>
                </div>
            </motion.div>
        </section>
    );
};

export default FinalCTA;
