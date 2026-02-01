import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, Calendar, Users, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/equipment', icon: Package, label: 'อุปกรณ์' },
    { to: '/admin/bookings', icon: Calendar, label: 'การจอง' },
    { to: '/admin/users', icon: Users, label: 'ผู้ใช้' },
    { to: '/admin/chat', icon: MessageCircle, label: 'แชท' },
];

const AdminLayout = () => {
    const { isAdmin, loading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-10 h-10"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 glass-card border-r border-white/10 z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Nav Items */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-light-muted hover:bg-white/5 hover:text-light'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Collapse Button */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-light-muted hover:text-light hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {collapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <>
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>ย่อเมนู</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'
                    }`}
            >
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
