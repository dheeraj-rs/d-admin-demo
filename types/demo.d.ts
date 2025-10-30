/* FullCalendar Types */
import { EventInput } from '@fullcalendar/core';

/* Chart.js Types */
// import { ChartData, ChartOptions } from 'chart.js';

type InventoryStatus = 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';

type Status = 'DELIVERED' | 'PENDING' | 'RETURNED' | 'CANCELLED';

type LayoutType = 'list' | 'grid';
type SortOrderType = 1 | 0 | -1;

interface CustomEvent {
    name?: string;
    status?: 'Ordered' | 'Processing' | 'Shipped' | 'Delivered';
    date?: string;
    color?: string;
    icon?: string;
    image?: string;
}

interface ShowOptions {
    severity?: string;
    content?: string;
    summary?: string;
    detail?: string;
    life?: number;
}

// interface ChartDataState {
//     barData?: ChartData;
//     pieData?: ChartData;
//     lineData?: ChartData;
//     polarData?: ChartData;
//     radarData?: ChartData;
// }

// interface ChartOptionsState {
//     barOptions?: ChartOptions;
//     pieOptions?: ChartOptions;
//     lineOptions?: ChartOptions;
//     polarOptions?: ChartOptions;
//     radarOptions?: ChartOptions;
// }

interface AppMailProps {
    mails: Demo.Mail[];
}

interface AppMailSidebarItem {
    label: string;
    icon: string;
    to?: string;
    badge?: number;
    badgeValue?: number;
}

interface AppMailReplyProps {
    content: Demo.Mail | null;
    hide: () => void;
}

declare namespace Demo {
    interface Country {
        name: string;
        code: string;
    }
}

export type {
    InventoryStatus,
    Status,
    AppMailReplyProps,
    AppMailProps,
    AppMailSidebarItem,
    CustomEvent,
    Event,
};
