import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';
import s from './Button.module.css';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'big',
    isIcon = false,
    render,
    ...rest
}) => {
    const element = useRender({
        defaultTagName: 'button',
        render,
        props: mergeProps<'button'>({ className: clsx(s.wrap, 'focus-primary', className) }, rest),
        state: {
            variant,
            size,
            isIcon,
        },
        stateAttributesMapping: {
            variant(value) {
                return { 'data-button-variant': value };
            },
            size(value) {
                return { 'data-button-size': value };
            },
            isIcon(value) {
                return value ? { 'data-button-is-icon': '' } : null;
            },
        },
    });

    return element;
};
