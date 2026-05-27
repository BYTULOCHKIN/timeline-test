import clsx from 'clsx';
import { motion } from 'framer-motion';
import Typography from '@/components/Typography/Typography';
import { ARCH, STACK } from './constants';
import Counter from './components/Counter';
import s from './style.module.css';

const Home: React.FC = () => {
    return (
        <main className={clsx(s.page, 'full-height')}>
            <div className={s.mStripe}>
                <span className={s.s1} />
                <span className={s.s2} />
                <span className={s.s3} />
            </div>

            <div className={s.hero}>
                <span className={s.badge}>RKR Template v1.0</span>
                <Typography variant="heading-3xl" className={s.title}>
                    Your next project <br /> starts <span className={s.accent}>here</span>
                </Typography>
                <Typography variant="body-lg" className={s.subtitle}>
                    A production-ready React + TypeScript template with a curated stack, strict tooling, and sane
                    defaults out of the box.
                </Typography>
                <code className={s.cmd}>
                    <span className={s.prompt}>$</span>
                    gh repo create my-project --template ruslan-krasiuk/rkr-template --clone
                </code>

                <motion.img
                    src="/logos/BMW-logo.png"
                    alt="BMW"
                    className={s.logo}
                    initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    draggable={false}
                />
                <h1 className={s.title}>BMW Performance</h1>
            </div>

            <section className={s.section}>
                <div className={s.sectionLabel}>Live demo — Counter (Engine replaces) component</div>
                <div className={s.counterWrap}>
                    <Counter />
                    <p className={s.counterHint}>useState · React.memo</p>
                </div>
            </section>

            <section className={s.section}>
                <div className={s.sectionLabel}>Stack</div>
                <div className={s.stackGrid}>
                    {STACK.map(({ name, role, color }) => {
                        return (
                            <div key={name} className={s.stackCard}>
                                <div className={s.cardDot} style={{ background: color }} />
                                <div>
                                    <div className={s.cardName}>{name}</div>
                                    <div className={s.cardRole}>{role}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className={s.divider} />

            <section className={s.section}>
                <div className={s.sectionLabel}>Architecture</div>
                <div className={s.arch}>
                    <div className={clsx(s.archRow, s.folder)}>
                        <span className={s.arIcon}>▸</span>
                        <code className={s.arName}>src/</code>
                    </div>
                    {ARCH.map(({ depth, name, desc }) => {
                        return (
                            <div key={name} className={clsx(s.archRow, depth === 2 && s.indent)}>
                                <span className={s.arIcon}>{depth === 2 ? '└' : '📁'}</span>
                                <code className={s.arName}>{name}</code>
                                <span className={s.arDesc}>{desc}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className={s.divider} />

            <footer className={s.footer}>
                <span className={s.footerLeft}>&copy;&nbsp;{new Date().getFullYear()}, Ruslan Krasiuk</span>
                <div className={s.chips}>
                    {['Node 20', 'pnpm', 'ESLint + Prettier', 'Husky'].map((c) => {
                        return (
                            <span key={c} className={s.chip}>
                                {c}
                            </span>
                        );
                    })}
                </div>
            </footer>
        </main>
    );
};

export default Home;
