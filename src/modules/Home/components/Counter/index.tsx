import React from 'react';
import clsx from 'clsx';
import { Button } from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import s from './style.module.css';

const Counter: React.FC = () => {
    const [count, setCount] = React.useState(0);

    const increment = () => {
        setCount((prev) => {
            return prev + 1;
        });
    };

    const decrement = () => {
        if (count === 0) return;
        setCount((prev) => {
            return prev - 1;
        });
    };

    return (
        <article className={s.wrap}>
            <Typography className={s['counter-wrap']}>
                ENGINE REPLACES COUNTER:&nbsp;<strong>{count}</strong>
            </Typography>
            <footer className={s.footer}>
                <Button className={clsx(s.cta, 'focus-primary')} onClick={decrement}>
                    -
                </Button>
                <Button className={clsx(s.cta, 'focus-primary')} onClick={increment}>
                    +
                </Button>
            </footer>
        </article>
    );
};

export default React.memo(Counter);
