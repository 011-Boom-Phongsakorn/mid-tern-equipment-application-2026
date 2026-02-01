import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
                            EventGear
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/equipment"
                            className="text-light-muted hover:text-light transition-colors font-medium"
                        >
                            อุปกรณ์ทั้งหมด
                        </Link>

                        {isAuthenticated && (
                            <Link
                                to="/my-bookings"
                                className="text-light-muted hover:text-light transition-colors font-medium flex items-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                การจอง
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="text-secondary hover:text-secondary-light transition-colors font-medium"
                            >
                                แอดมิน
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-light-muted hover:text-light transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="font-medium">{user?.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary py-2 px-3"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary">
                                    เข้าสู่ระบบ
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    สมัครสมาชิก
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/equipment"
                                className="px-4 py-2 text-light-muted hover:text-light transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                อุปกรณ์ทั้งหมด
                            </Link>

                            {isAuthenticated && (
                                <Link
                                    to="/my-bookings"
                                    className="px-4 py-2 text-light-muted hover:text-light transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    การจองของฉัน
                                </Link>
                            )}

                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-2 px-4 pt-2">
                                    <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                                        สมัครสมาชิก
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="mx-4 btn btn-secondary"
                                >
                                    <LogOut className="w-4 h-4" />
                                    ออกจากระบบ
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
