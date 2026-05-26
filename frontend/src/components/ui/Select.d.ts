import { type SelectHTMLAttributes } from 'react';
interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}
export declare const Select: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<HTMLSelectElement>>;
export {};
