import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, uploadAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    Plus, Edit, Trash2, Package, X, Check, Upload, Image,
    Camera, Projector, Tent, Mic, Lightbulb
} from 'lucide-react';

const categories = [
    { id: 'camera', name: 'กล้อง', icon: Camera },
    { id: 'projector', name: 'โปรเจกเตอร์', icon: Projector },
    { id: 'camping', name: 'แคมป์ปิ้ง', icon: Tent },
    { id: 'audio', name: 'เครื่องเสียง', icon: Mic },
    { id: 'lighting', name: 'ไฟแสง', icon: Lightbulb },
    { id: 'other', name: 'อื่นๆ', icon: Package },
];

const AdminEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'camera',
        pricePerDay: '',
        stock: 1,
        available: true,
        images: []
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const { data } = await equipmentAPI.getAll();
            setEquipment(data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                category: item.category,
                pricePerDay: item.pricePerDay,
                stock: item.stock,
                available: item.available,
                images: item.images || []
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                category: 'camera',
                pricePerDay: '',
                stock: 1,
                available: true,
                images: []
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setError('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data } = await uploadAPI.uploadImage(file);
            setFormData({ ...formData, images: [...formData.images, data.url] });
        } catch (error) {
            setError('อัปโหลดรูปภาพไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (editingItem) {
                await equipmentAPI.update(editingItem._id, formData);
            } else {
                await equipmentAPI.create(formData);
            }
            handleCloseModal();
            fetchEquipment();
        } catch (error) {
            setError(error.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณต้องการลบอุปกรณ์นี้หรือไม่?')) return;

        try {
            await equipmentAPI.delete(id);
            setEquipment(equipment.filter(e => e._id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถลบได้');
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-light">จัดการอุปกรณ์</h2>
                    <p className="text-light-muted">เพิ่ม แก้ไข หรือลบอุปกรณ์</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    เพิ่มอุปกรณ์
                </button>
            </div>

            {/* Equipment Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-light-muted font-medium">อุปกรณ์</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden sm:table-cell">หมวดหมู่</th>
                                <th className="text-left p-4 text-light-muted font-medium">ราคา/วัน</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden md:table-cell">สต็อก</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden md:table-cell">สถานะ</th>
                                <th className="text-right p-4 text-light-muted font-medium">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map((item) => (
                                <tr key={item._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-lighter flex-shrink-0">
                                                {item.images?.[0] ? (
                                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-light-muted/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-light line-clamp-1">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`badge category-${item.category}`}>
                                            {categories.find(c => c.id === item.category)?.name || item.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-secondary font-semibold">฿{item.pricePerDay?.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-light-muted">{item.stock}</td>
                                    <td className="p-4 hidden md:table-cell">
                                        {item.available ? (
                                            <span className="badge badge-confirmed">พร้อมใช้</span>
                                        ) : (
                                            <span className="badge badge-cancelled">ไม่พร้อม</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 hover:bg-error/20 rounded-lg text-error transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {equipment.length === 0 && (
                    <div className="text-center py-12 text-light-muted">
                        ยังไม่มีอุปกรณ์ คลิก "เพิ่มอุปกรณ์" เพื่อเริ่มต้น
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card w-full max-w-lg p-6 my-8 animate-[scale-in_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-light">
                                {editingItem ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-error/20 border border-error/30 text-error text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-light-muted mb-2">ชื่ออุปกรณ์ *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-muted mb-2">รายละเอียด *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input min-h-[100px] resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">หมวดหมู่</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="select"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">ราคา/วัน (฿) *</label>
                                    <input
                                        type="number"
                                        value={formData.pricePerDay}
                                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                                        className="input"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">จำนวนสต็อก</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 1 })}
                                        className="input"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-light-muted mb-2">สถานะ</label>
                                    <select
                                        value={formData.available ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
                                        className="select"
                                    >
                                        <option value="true">พร้อมให้เช่า</option>
                                        <option value="false">ไม่พร้อม</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-light-muted mb-2">รูปภาพ</label>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute inset-0 bg-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-5 h-5 text-error" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="btn btn-secondary cursor-pointer">
                                    {uploading ? (
                                        <div className="spinner w-4 h-4"></div>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            อัปโหลดรูปภาพ
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="btn btn-secondary flex-1">
                                    ยกเลิก
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
                                    {saving ? (
                                        <div className="spinner w-5 h-5"></div>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            {editingItem ? 'บันทึก' : 'เพิ่ม'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEquipment;
