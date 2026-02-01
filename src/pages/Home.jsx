import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Projector, Tent, Mic, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { equipmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
    { id: 'camera', name: 'กล้องถ่ายรูป', icon: Camera, color: 'from-red-500 to-pink-500' },
    { id: 'projector', name: 'โปรเจกเตอร์', icon: Projector, color: 'from-blue-500 to-cyan-500' },
    { id: 'camping', name: 'อุปกรณ์แคมป์ปิ้ง', icon: Tent, color: 'from-green-500 to-emerald-500' },
    { id: 'audio', name: 'เครื่องเสียง', icon: Mic, color: 'from-purple-500 to-violet-500' },
];

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        fetchEquipment();
    }, []);

    // Auto scroll effect
    useEffect(() => {
        if (!sliderRef.current || equipment.length === 0 || isPaused) return;

        const slider = sliderRef.current;
        let animationId;

        const scroll = () => {
            scrollPositionRef.current += 0.5;
            if (scrollPositionRef.current >= slider.scrollWidth / 2) {
                scrollPositionRef.current = 0;
            }
            slider.scrollLeft = scrollPositionRef.current;
            animationId = requestAnimationFrame(scroll);
        };

        animationId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [equipment, isPaused]);

    const fetchEquipment = async () => {
        try {
            const { data } = await equipmentAPI.getAll();
            // Duplicate for infinite scroll effect
            setEquipment([...data, ...data]);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollSlider = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = 300;
        sliderRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            <span className="bg-linear-to-r from-light via-primary-light to-secondary bg-clip-text text-transparent">
                                เช่าอุปกรณ์อีเวนต์
                            </span>
                            <br />
                            <span className="text-light">ครบวงจร</span>
                        </h1>
                        <p className="mt-6 text-xl text-light-muted">
                            กล้องถ่ายรูป · โปรเจกเตอร์ · อุปกรณ์แคมป์ปิ้ง · เครื่องเสียง
                            <br />
                            พร้อมบริการจัดส่งทั่วประเทศ
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/equipment" className="btn btn-primary text-lg px-8 py-4">
                                ดูอุปกรณ์ทั้งหมด
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/register" className="btn btn-secondary text-lg px-8 py-4">
                                    สมัครสมาชิก
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
                        หมวดหมู่สินค้า
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/equipment?category=${cat.id}`}
                                className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300"
                            >
                                <div className={`w-16 h-16 mx-auto rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <cat.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-semibold text-light group-hover:text-primary-light transition-colors">
                                    {cat.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Slider Section */}
            <section className="py-16 bg-dark-light/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            สินค้า<span className="text-primary">แนะนำ</span>
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scrollSlider('left')}
                                className="p-2 glass-card hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollSlider('right')}
                                className="p-2 glass-card hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner w-10 h-10"></div>
                        </div>
                    ) : (
                        <div
                            ref={sliderRef}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {equipment.map((item, idx) => (
                                <Link
                                    key={`${item._id}-${idx}`}
                                    to={`/equipment/${item._id}`}
                                    className="shrink-0 w-64 glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300"
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-dark-lighter flex items-center justify-center">
                                                <Camera className="w-12 h-12 text-light-muted/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`badge badge-sm category-${item.category}`}>
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-light truncate group-hover:text-primary-light transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-lg font-bold text-secondary">
                                                ฿{item.pricePerDay?.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-light-muted">/วัน</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Link to="/equipment" className="btn btn-primary">
                            ดูสินค้าทั้งหมด
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
