import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Shield, Save, Check } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await authAPI.updateProfile({ name, email });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-light">โปรไฟล์ของฉัน</h1>
                <p className="text-light-muted mt-2">จัดการข้อมูลบัญชีของคุณ</p>
            </div>

            {/* Profile Card */}
            <div className="glass-card p-6 sm:p-8">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-light">{user?.name}</h2>
                        <div className="flex items-center gap-2 text-light-muted mt-1">
                            <Shield className="w-4 h-4" />
                            <span className="capitalize">{user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-error/20 border border-error/30 text-error text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-success/20 border border-success/30 text-success text-sm flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        บันทึกข้อมูลสำเร็จ!
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-light-muted mb-2">
                            ชื่อ
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input pl-11"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-muted mb-2">
                            อีเมล
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input pl-11"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="spinner w-5 h-5"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                บันทึกการเปลี่ยนแปลง
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
