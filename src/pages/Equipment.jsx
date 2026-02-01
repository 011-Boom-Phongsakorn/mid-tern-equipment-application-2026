import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { equipmentAPI } from '../services/api';
import EquipmentCard from '../components/EquipmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, X, Camera, Projector, Tent, Mic, Lightbulb, Package } from 'lucide-react';

const categories = [
    { id: '', name: 'ทั้งหมด', icon: Package },
    { id: 'camera', name: 'กล้อง', icon: Camera },
    { id: 'projector', name: 'โปรเจกเตอร์', icon: Projector },
    { id: 'camping', name: 'แคมป์ปิ้ง', icon: Tent },
    { id: 'audio', name: 'เครื่องเสียง', icon: Mic },
    { id: 'lighting', name: 'ไฟแสง', icon: Lightbulb },
];

const Equipment = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    useEffect(() => {
        fetchEquipment();
    }, [selectedCategory]);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;

            const { data } = await equipmentAPI.getAll(params);
            setEquipment(data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category) {
            setSearchParams({ category });
        } else {
            setSearchParams({});
        }
    };

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-light">อุปกรณ์ทั้งหมด</h1>
                <p className="text-light-muted mt-2">เลือกอุปกรณ์ที่คุณต้องการเช่า</p>
            </div>

            {/* Search & Filter */}
            <div className="mb-8 space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                    {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" /> */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-11 pr-10"
                        placeholder="ค้นหาอุปกรณ์..."
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-light-muted hover:bg-white/10 hover:text-light'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Equipment Grid */}
            {loading ? (
                <LoadingSpinner size="lg" />
            ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="w-16 h-16 mx-auto text-light-muted/30 mb-4" />
                    <h3 className="text-xl font-semibold text-light-muted">ไม่พบอุปกรณ์</h3>
                    <p className="text-light-muted mt-2">
                        {search ? 'ลองค้นหาด้วยคำอื่น' : 'ยังไม่มีอุปกรณ์ในหมวดหมู่นี้'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-light-muted mb-4">พบ {filteredEquipment.length} รายการ</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEquipment.map((item) => (
                            <EquipmentCard key={item._id} equipment={item} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Equipment;
