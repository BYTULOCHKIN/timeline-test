import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';
import { defaultTagMap } from './constants';
import { TypographyProps, TypographyState } from './types';
import s from './Typography.module.css';

export function Typography({ variant = 'body-md', render, className, ...otherProps }: TypographyProps) {
    const state: TypographyState = { variant };

    const merged = mergeProps<'p'>({ className: clsx(s.wrap, className) }, otherProps as useRender.ElementProps<'p'>);

    const props: Record<string, unknown> = {
        ...merged,
        'data-variant': variant,
    };

    const element = useRender({
        defaultTagName: defaultTagMap[variant],
        render: render as useRender.ComponentProps<'p'>['render'],
        state,
        props,
    });

    return element;
}

export default Typography;
