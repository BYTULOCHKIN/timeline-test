import { useRender } from '@base-ui/react/use-render';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'icon';

export type ButtonSize = 'big' | 'medium' | 'small';

export interface ButtonState extends Record<string, unknown> {
    variant: ButtonVariant;
    size: ButtonSize;
    isIcon: boolean;
}

export type ButtonProps = Omit<useRender.ComponentProps<'button'>, 'render'> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isIcon?: boolean;
    render?: useRender.ComponentProps<'button'>['render'];
    className?: string;
};
