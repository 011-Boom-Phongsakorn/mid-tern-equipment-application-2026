import { Link } from 'react-router-dom';
import { Camera, Projector, Tent, Mic, Lightbulb, Package } from 'lucide-react';

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

const EquipmentCard = ({ equipment }) => {
    const Icon = categoryIcons[equipment.category] || Package;

    return (
        <Link
            to={`/equipment/${equipment._id}`}
            className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-dark-lighter">
                {equipment.images && equipment.images.length > 0 ? (
                    <img
                        src={equipment.images[0]}
                        alt={equipment.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-16 h-16 text-light-muted/30" />
                    </div>
                )}

                {/* Category Badge */}
                <span className={`absolute top-3 left-3 badge category-${equipment.category}`}>
                    {categoryLabels[equipment.category]}
                </span>

                {/* Availability Badge */}
                {!equipment.available && (
                    <div className="absolute inset-0 bg-dark/80 flex items-center justify-center">
                        <span className="text-error font-bold">ไม่พร้อมให้เช่า</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-semibold text-lg text-light group-hover:text-primary-light transition-colors line-clamp-1">
                    {equipment.name}
                </h3>
                <p className="text-light-muted text-sm mt-1 line-clamp-2">
                    {equipment.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div>
                        <span className="text-2xl font-bold text-secondary">
                            ฿{equipment.pricePerDay?.toLocaleString()}
                        </span>
                        <span className="text-light-muted text-sm">/วัน</span>
                    </div>
                    <span className="text-light-muted text-sm">
                        คงเหลือ {equipment.stock} ชิ้น
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default EquipmentCard;
