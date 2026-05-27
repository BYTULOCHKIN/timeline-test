import { TypographyVariant } from './types';

export const defaultTagMap: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
    'heading-3xl': 'h1',
    'heading-2xl': 'h2',
    'heading-xl': 'h3',
    'heading-lg': 'h4',
    'heading-md': 'h5',
    'heading-sm': 'h6',
    'body-lg': 'p',
    'body-md': 'p',
    'body-sm': 'p',
    'label-lg': 'span',
    'label-md': 'span',
    'label-sm': 'span',
    caption: 'span',
};
