import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    ArrowLeft, Calendar, Package, Check, X,
    Camera, Projector, Tent, Mic, Lightbulb
} from 'lucide-react';

const categoryIcons = {
    camera: Camera,
    projector: Projector,
    camping: Tent,
    audio: Mic,
    lighting: Lightbulb,
    other: Package
};

const categoryLabels = {
    camera: 'กล้อง',
    projector: 'โปรเจกเตอร์',
    camping: 'แคมป์ปิ้ง',
    audio: 'เครื่องเสียง',
    lighting: 'ไฟแสง',
    other: 'อื่นๆ'
};

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        quantity: 1,
        notes: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        fetchEquipment();
    }, [id]);

    const fetchEquipment = async () => {
        try {
            const { data } = await equipmentAPI.getById(id);
            setEquipment(data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!bookingData.startDate || !bookingData.endDate || !equipment) return 0;
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return equipment.pricePerDay * days * bookingData.quantity;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingLoading(true);

        try {
            await bookingAPI.create({
                equipmentId: equipment._id,
                ...bookingData
            });
            setBookingSuccess(true);
            setTimeout(() => {
                setShowBookingModal(false);
                navigate('/my-bookings');
            }, 2000);
        } catch (error) {
            setBookingError(error.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Package className="w-16 h-16 mx-auto text-light-muted/30 mb-4" />
                <h2 className="text-2xl font-bold text-light">ไม่พบอุปกรณ์</h2>
                <button onClick={() => navigate('/equipment')} className="btn btn-primary mt-4">
                    กลับไปหน้าอุปกรณ์
                </button>
            </div>
        );
    }

    const Icon = categoryIcons[equipment.category] || Package;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-light-muted hover:text-light mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                กลับ
            </button>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="glass-card overflow-hidden">
                        {equipment.images && equipment.images.length > 0 ? (
                            <img
                                src={equipment.images[selectedImage]}
                                alt={equipment.name}
                                className="w-full h-96 lg:h-[500px] object-cover transition-all duration-300"
                            />
                        ) : (
                            <div className="w-full h-96 lg:h-[500px] flex items-center justify-center bg-dark-lighter">
                                <Icon className="w-32 h-32 text-light-muted/30" />
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {equipment.images && equipment.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {equipment.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-primary ring-2 ring-primary/50'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${equipment.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    {/* Category & Title */}
                    <div>
                        <span className={`badge category-${equipment.category}`}>
                            {categoryLabels[equipment.category]}
                        </span>
                        <h1 className="text-3xl font-bold text-light mt-3">{equipment.name}</h1>
                    </div>

                    {/* Price */}
                    <div className="glass-card p-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-secondary">
                                ฿{equipment.pricePerDay?.toLocaleString()}
                            </span>
                            <span className="text-light-muted">/ วัน</span>
                        </div>
                        <p className="text-light-muted mt-2">
                            คงเหลือ {equipment.stock} ชิ้น
                        </p>
                    </div>

                    {/* Description */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-light mb-3">รายละเอียด</h3>
                        <p className="text-light-muted whitespace-pre-line">{equipment.description}</p>
                    </div>

                    {/* Availability */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3">
                            {equipment.available ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-success" />
                                    </div>
                                    <span className="text-success font-medium">พร้อมให้เช่า</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                                        <X className="w-5 h-5 text-error" />
                                    </div>
                                    <span className="text-error font-medium">ไม่พร้อมให้เช่า</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Book Button */}
                    {equipment.available && (
                        <button
                            onClick={() => isAuthenticated ? setShowBookingModal(true) : navigate('/login')}
                            className="btn btn-primary w-full py-4 text-lg"
                        >
                            <Calendar className="w-5 h-5" />
                            {isAuthenticated ? 'จองเลย' : 'เข้าสู่ระบบเพื่อจอง'}
                        </button>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 animate-[scale-in_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-light">จองอุปกรณ์</h2>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {bookingSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-success" />
                                </div>
                                <h3 className="text-xl font-semibold text-light">จองสำเร็จ!</h3>
                                <p className="text-light-muted mt-2">กำลังไปหน้าการจองของคุณ...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} className="space-y-4">
                                {bookingError && (
                                    <div className="p-3 rounded-lg bg-error/20 border border-error/30 text-error text-sm">
                                        {bookingError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">
                                        วันที่เริ่มเช่า
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.startDate}
                                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                        className="input"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">
                                        วันที่สิ้นสุด
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.endDate}
                                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                        className="input"
                                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">
                                        จำนวน
                                    </label>
                                    <input
                                        type="number"
                                        value={bookingData.quantity}
                                        onChange={(e) => setBookingData({ ...bookingData, quantity: parseInt(e.target.value) || 1 })}
                                        className="input"
                                        min="1"
                                        max={equipment.stock}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">
                                        หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        className="input min-h-[80px] resize-none"
                                        placeholder="ข้อความเพิ่มเติม..."
                                    />
                                </div>

                                {/* Price Summary */}
                                <div className="p-4 rounded-lg bg-dark-lighter">
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-muted">ราคารวม</span>
                                        <span className="text-2xl font-bold text-secondary">
                                            ฿{calculatePrice().toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="btn btn-success w-full py-3 disabled:opacity-50"
                                >
                                    {bookingLoading ? (
                                        <div className="spinner w-5 h-5"></div>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            ยืนยันการจอง
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentDetail;
