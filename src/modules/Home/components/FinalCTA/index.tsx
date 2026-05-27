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
                <div className={s.brandLockup} aria-label="HomeNet">
                    <img src={homenetMarkUrl} alt="" className={s.brandMark} />
                    <span>HomeNet</span>
                </div>
                <span className={s.sectionKicker}>Наступне десятиліття</span>
                <Typography id="final-cta-title" variant="heading-2xl" className={s.finalTitle}>
                    Наступний крок — 300 000 абонентів і нові регіони покриття.
                </Typography>
                <Typography variant="body-md" className={s.finalText}>
                    HomeNet планує розширення у Рівненській, Хмельницькій і Житомирській областях, повернення на
                    Херсонщину та розвиток корпоративних послуг із SLA, DDoS-захистом, виділеними каналами й
                    аутсорсинговим контакт-центром.
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
