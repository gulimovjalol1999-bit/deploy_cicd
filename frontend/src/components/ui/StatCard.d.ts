import type { LucideIcon } from 'lucide-react';
interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
}
export declare function StatCard({ title, value, icon: Icon, iconColor, iconBg }: Props): import("react").JSX.Element;
export {};
