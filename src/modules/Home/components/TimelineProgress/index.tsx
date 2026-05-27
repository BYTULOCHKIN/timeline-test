import type { MotionValue } from 'framer-motion';
import { motion } from 'framer-motion';
import s from '../../style.module.css';

type TimelineProgressProps = {
    progress: MotionValue<number>;
};

const TimelineProgress: React.FC<TimelineProgressProps> = ({ progress }) => {
    return (
        <div className={s.timelineRail} aria-hidden="true">
            <motion.span className={s.timelineProgress} style={{ scaleY: progress }} />
        </div>
    );
};

export default TimelineProgress;
