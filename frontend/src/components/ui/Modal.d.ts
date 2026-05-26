import type { ReactNode } from 'react';
interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}
export declare function Modal({ open, onClose, title, children, size }: Props): import("react").JSX.Element | null;
export {};
