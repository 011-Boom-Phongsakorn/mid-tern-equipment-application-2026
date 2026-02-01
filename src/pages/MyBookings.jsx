import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Package, X, Clock, Check, XCircle, CheckCircle } from 'lucide-react';

const statusLabels = {
    pending: { label: 'รอดำเนินการ', icon: Clock },
    confirmed: { label: 'ยืนยันแล้ว', icon: Check },
    cancelled: { label: 'ยกเลิกแล้ว', icon: XCircle },
    completed: { label: 'เสร็จสิ้น', icon: CheckCircle }
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await bookingAPI.getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) return;

        setCancellingId(id);
        try {
            await bookingAPI.cancel(id);
            setBookings(bookings.map(b =>
                b._id === id ? { ...b, status: 'cancelled' } : b
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-light flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" />
                    การจองของฉัน
                </h1>
                <p className="text-light-muted mt-2">รายการจองอุปกรณ์ทั้งหมดของคุณ</p>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <div className="text-center py-16 glass-card">
                    <Package className="w-16 h-16 mx-auto text-light-muted/30 mb-4" />
                    <h3 className="text-xl font-semibold text-light-muted">ยังไม่มีการจอง</h3>
                    <p className="text-light-muted mt-2">ไปเลือกอุปกรณ์ที่คุณต้องการเช่ากันเลย!</p>
                    <Link to="/equipment" className="btn btn-primary mt-6">
                        ดูอุปกรณ์ทั้งหมด
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const status = statusLabels[booking.status];
                        const StatusIcon = status.icon;

                        return (
                            <div key={booking._id} className="glass-card p-5">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Image */}
                                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-dark-lighter">
                                        {booking.equipment?.images?.[0] ? (
                                            <img
                                                src={booking.equipment.images[0]}
                                                alt={booking.equipment.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-light-muted/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <Link
                                                    to={`/equipment/${booking.equipment?._id}`}
                                                    className="text-lg font-semibold text-light hover:text-primary-light transition-colors"
                                                >
                                                    {booking.equipment?.name || 'อุปกรณ์ถูกลบ'}
                                                </Link>
                                                <p className="text-light-muted text-sm">
                                                    จำนวน {booking.quantity} ชิ้น
                                                </p>
                                            </div>
                                            <span className={`badge badge-${booking.status} flex items-center gap-1`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Date & Price */}
                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-light-muted">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                            </div>
                                            <div className="text-secondary font-semibold">
                                                ฿{booking.totalPrice?.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {booking.notes && (
                                            <p className="mt-2 text-sm text-light-muted">
                                                หมายเหตุ: {booking.notes}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        {booking.status === 'pending' && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancellingId === booking._id}
                                                    className="btn btn-danger py-2 px-4 text-sm disabled:opacity-50"
                                                >
                                                    {cancellingId === booking._id ? (
                                                        <div className="spinner w-4 h-4"></div>
                                                    ) : (
                                                        <>
                                                            <X className="w-4 h-4" />
                                                            ยกเลิกการจอง
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
