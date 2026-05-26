import type { ReactNode } from 'react';
interface Props {
    title?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}
export declare function Card({ title, children, className, action }: Props): import("react").JSX.Element;
export {};
