import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/equipment');
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md animate-[slide-up_0.4s_ease-out]">
                <div className="glass-card p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mb-4">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-light">สมัครสมาชิก</h1>
                        <p className="text-light-muted mt-2">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-error/20 border border-error/30 text-error text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-light-muted mb-2">
                                ชื่อ
                            </label>
                            <div className="relative">
                                {/* <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" /> */}
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input pl-11"
                                    placeholder="ชื่อของคุณ"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-muted mb-2">
                                อีเมล
                            </label>
                            <div className="relative">
                                {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" /> */}
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-11"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-muted mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" /> */}
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-11 pr-11"
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-muted mb-2">
                                ยืนยันรหัสผ่าน
                            </label>
                            <div className="relative">
                                {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" /> */}
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input pl-11"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success w-full py-3 text-base disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="spinner w-5 h-5"></div>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    สมัครสมาชิก
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-light-muted mt-6">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-light font-medium">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
