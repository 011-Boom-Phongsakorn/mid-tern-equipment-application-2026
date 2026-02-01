import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, bookingAPI, usersAPI } from '../../services/api';
import { Package, Calendar, Users, TrendingUp, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        equipment: 0,
        bookings: 0,
        users: 0,
        pendingBookings: 0,
        revenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [equipmentRes, bookingsRes, usersRes] = await Promise.all([
                equipmentAPI.getAll(),
                bookingAPI.getAll(),
                usersAPI.getAll()
            ]);

            const bookings = bookingsRes.data;
            const pending = bookings.filter(b => b.status === 'pending').length;
            const revenue = bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            setStats({
                equipment: equipmentRes.data.length,
                bookings: bookings.length,
                users: usersRes.data.length,
                pendingBookings: pending,
                revenue
            });

            setRecentBookings(bookings.slice(0, 5));
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statCards = [
        { label: 'อุปกรณ์ทั้งหมด', value: stats.equipment, icon: Package, color: 'from-primary to-primary-dark', to: '/admin/equipment' },
        { label: 'การจองทั้งหมด', value: stats.bookings, icon: Calendar, color: 'from-accent to-accent-light', to: '/admin/bookings' },
        { label: 'ผู้ใช้ทั้งหมด', value: stats.users, icon: Users, color: 'from-secondary to-secondary-light', to: '/admin/users' },
        { label: 'รายได้ (สำเร็จ)', value: `฿${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'from-success to-emerald-400', isRevenue: true },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner w-10 h-10"></div>
            </div>
        );
    }

    return (
        <div className="animate-[fade-in_0.3s_ease-out]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-light">Dashboard</h1>
                <p className="text-light-muted">ภาพรวมระบบเช่าอุปกรณ์</p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass-card p-6 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-light-muted text-sm">{stat.label}</p>
                            <p className="text-3xl font-bold text-light mt-1">{stat.value}</p>
                            {stat.to && (
                                <Link
                                    to={stat.to}
                                    className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:text-primary-light transition-colors"
                                >
                                    ดูรายละเอียด <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Alert */}
            {stats.pendingBookings > 0 && (
                <div className="glass-card p-4 mb-8 border-l-4 border-warning bg-warning/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-warning">มีการจองรอดำเนินการ {stats.pendingBookings} รายการ</p>
                            <p className="text-light-muted text-sm">กรุณาตรวจสอบและยืนยันการจอง</p>
                        </div>
                        <Link to="/admin/bookings?status=pending" className="btn btn-secondary py-2">
                            ดูการจอง
                        </Link>
                    </div>
                </div>
            )}

            {/* Recent Bookings */}
            <div className="glass-card">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-light">การจองล่าสุด</h2>
                    <Link to="/admin/bookings" className="text-primary text-sm hover:text-primary-light transition-colors">
                        ดูทั้งหมด
                    </Link>
                </div>
                <div className="divide-y divide-white/5">
                    {recentBookings.length === 0 ? (
                        <div className="p-8 text-center text-light-muted">
                            ยังไม่มีการจอง
                        </div>
                    ) : (
                        recentBookings.map((booking) => (
                            <div key={booking._id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-white">
                                        {booking.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-light text-sm truncate">
                                        {booking.user?.name} จอง {booking.equipment?.name}
                                    </p>
                                    <p className="text-light-muted text-xs">{formatDate(booking.createdAt)}</p>
                                </div>
                                <span className={`badge ${booking.status === 'pending' ? 'badge-pending' :
                                    booking.status === 'confirmed' ? 'badge-confirmed' :
                                        booking.status === 'cancelled' ? 'badge-cancelled' : 'badge-completed'
                                    }`}>
                                    {booking.status === 'pending' ? 'รอ' :
                                        booking.status === 'confirmed' ? 'ยืนยัน' :
                                            booking.status === 'cancelled' ? 'ยกเลิก' : 'สำเร็จ'}
                                </span>
                                <span className="text-secondary font-semibold text-sm">
                                    ฿{booking.totalPrice?.toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
