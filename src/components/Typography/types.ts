import { useRender } from '@base-ui/react/use-render';

export type TypographyVariant =
    | 'heading-3xl'
    | 'heading-2xl'
    | 'heading-xl'
    | 'heading-lg'
    | 'heading-md'
    | 'heading-sm'
    | 'body-lg'
    | 'body-md'
    | 'body-sm'
    | 'label-lg'
    | 'label-md'
    | 'label-sm'
    | 'caption';

export type TypographyState = Record<string, unknown> & {
    variant: TypographyVariant;
};

export type TypographyProps = Omit<useRender.ComponentProps<'p'>, 'render'> & {
    variant?: TypographyVariant;
    render?: useRender.ComponentProps<'p'>['render'];
    className?: string;
};
