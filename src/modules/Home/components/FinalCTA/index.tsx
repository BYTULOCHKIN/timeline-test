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
                <span className={s.sectionKicker}>Next decade</span>
                <Typography id="final-cta-title" variant="heading-2xl" className={s.finalTitle}>
                    Built for the next 10 years of connectivity.
                </Typography>
                <Typography variant="body-md" className={s.finalText}>
                    Replace the mock milestones with real company data, customer photos, and verified network metrics
                    when the anniversary campaign is ready.
                </Typography>
                <div className={s.finalActions}>
                    <Button className={s.primaryCta} onClick={onRestart}>
                        Back to 2016
                    </Button>
                    <Button
                        className={s.secondaryCta}
                        variant="ghost"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Return to top
                    </Button>
                </div>
            </motion.div>
        </section>
    );
};

export default FinalCTA;
