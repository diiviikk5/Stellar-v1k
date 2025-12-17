import { Outlet } from 'react-router-dom';
import { Sidebar, Starfield } from '../components';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-space-950 relative overflow-hidden">
            {/* Animated starfield background */}
            <Starfield />

            {/* Grid background overlay */}
            <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

            {/* Gradient overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-space-950/90 via-space-900/80 to-space-850/90 pointer-events-none z-0" />

            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <main className="ml-64 relative z-10 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
