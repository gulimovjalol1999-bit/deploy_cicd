import { type ButtonHTMLAttributes } from 'react';
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}
export declare function Button({ variant, size, loading, disabled, children, className, ...props }: Props): import("react").JSX.Element;
export {};
