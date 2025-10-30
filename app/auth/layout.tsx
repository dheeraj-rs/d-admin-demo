import '../../styles/pages/auth/index.scss';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="page-transition">
            {children}
        </div>
    );
}
