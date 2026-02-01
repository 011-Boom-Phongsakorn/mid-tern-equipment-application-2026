import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    Calendar, Package, User, Clock, Check, XCircle, CheckCircle,
    ChevronDown, Filter
} from 'lucide-react';

const statusLabels = {
    pending: { label: 'รอดำเนินการ', icon: Clock, color: 'badge-pending' },
    confirmed: { label: 'ยืนยันแล้ว', icon: Check, color: 'badge-confirmed' },
    cancelled: { label: 'ยกเลิกแล้ว', icon: XCircle, color: 'badge-cancelled' },
    completed: { label: 'เสร็จสิ้น', icon: CheckCircle, color: 'badge-completed' }
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const { data } = await bookingAPI.getAll(params);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await bookingAPI.updateStatus(id, newStatus);
            setBookings(bookings.map(b =>
                b._id === id ? { ...b, status: newStatus } : b
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-light">จัดการการจอง</h2>
                <p className="text-light-muted">ดูและจัดการการจองทั้งหมด</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-card p-4">
                    <p className="text-light-muted text-sm">ทั้งหมด</p>
                    <p className="text-2xl font-bold text-light">{stats.total}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-warning text-sm">รอดำเนินการ</p>
                    <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-success text-sm">ยืนยันแล้ว</p>
                    <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-primary-light text-sm">เสร็จสิ้น</p>
                    <p className="text-2xl font-bold text-primary-light">{stats.completed}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-light-muted" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="select w-auto"
                    >
                        <option value="">ทั้งหมด</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="confirmed">ยืนยันแล้ว</option>
                        <option value="cancelled">ยกเลิกแล้ว</option>
                        <option value="completed">เสร็จสิ้น</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-light-muted font-medium">ผู้จอง</th>
                                <th className="text-left p-4 text-light-muted font-medium">อุปกรณ์</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden md:table-cell">วันที่เช่า</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden sm:table-cell">ราคารวม</th>
                                <th className="text-left p-4 text-light-muted font-medium">สถานะ</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden lg:table-cell">วันที่จอง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => {
                                const status = statusLabels[booking.status];
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-bold text-white">
                                                        {booking.user?.name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-light text-sm">{booking.user?.name || 'ไม่ทราบชื่อ'}</p>
                                                    <p className="text-light-muted text-xs">{booking.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-lighter flex-shrink-0">
                                                    {booking.equipment?.images?.[0] ? (
                                                        <img src={booking.equipment.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-light-muted/30" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-light text-sm line-clamp-1">{booking.equipment?.name || 'อุปกรณ์ถูกลบ'}</p>
                                                    <p className="text-light-muted text-xs">x{booking.quantity}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-sm text-light-muted">
                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            <span className="text-secondary font-semibold">฿{booking.totalPrice?.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                    disabled={updatingId === booking._id}
                                                    className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-xs font-semibold cursor-pointer transition-all border-0 ${booking.status === 'pending' ? 'bg-warning/20 text-warning' :
                                                        booking.status === 'confirmed' ? 'bg-success/20 text-success' :
                                                            booking.status === 'cancelled' ? 'bg-error/20 text-error' :
                                                                'bg-primary/20 text-primary-light'
                                                        }`}
                                                >
                                                    <option value="pending">รอดำเนินการ</option>
                                                    <option value="confirmed">ยืนยันแล้ว</option>
                                                    <option value="cancelled">ยกเลิกแล้ว</option>
                                                    <option value="completed">เสร็จสิ้น</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell text-xs text-light-muted">
                                            {formatDateTime(booking.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-12 text-light-muted">
                        ไม่พบการจอง
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
