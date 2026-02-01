import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-white/10 bg-dark/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent mb-4">
                            EventGear
                        </h3>
                        <p className="text-light-muted max-w-md">
                            บริการเช่าอุปกรณ์งานอีเวนต์ครบวงจร ทั้งกล้องถ่ายรูป โปรเจกเตอร์ และอุปกรณ์แคมป์ปิ้ง
                            พร้อมบริการจัดส่งทั่วประเทศ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-light mb-4">ลิงก์ด่วน</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/equipment" className="text-light-muted hover:text-light transition-colors">
                                    อุปกรณ์ทั้งหมด
                                </Link>
                            </li>
                            <li>
                                <Link to="/equipment?category=camera" className="text-light-muted hover:text-light transition-colors">
                                    กล้องถ่ายรูป
                                </Link>
                            </li>
                            <li>
                                <Link to="/equipment?category=projector" className="text-light-muted hover:text-light transition-colors">
                                    โปรเจกเตอร์
                                </Link>
                            </li>
                            <li>
                                <Link to="/equipment?category=camping" className="text-light-muted hover:text-light transition-colors">
                                    อุปกรณ์แคมป์ปิ้ง
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-light mb-4">ติดต่อเรา</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-light-muted">
                                <Phone className="w-4 h-4 text-primary" />
                                02-xxx-xxxx
                            </li>
                            <li className="flex items-center gap-2 text-light-muted">
                                <Mail className="w-4 h-4 text-primary" />
                                info@eventgear.com
                            </li>
                            <li className="flex items-start gap-2 text-light-muted">
                                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                กรุงเทพมหานคร
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-light-muted text-sm">
                    <p className="flex items-center justify-center gap-1">
                        Made with <Heart className="w-4 h-4 text-error fill-error" /> EventGear © 2026
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
