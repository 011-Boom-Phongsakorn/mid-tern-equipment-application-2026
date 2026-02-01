import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Shield, ShieldCheck, Trash2, ChevronDown, Search, X } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await usersAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        setUpdatingId(id);
        try {
            await usersAPI.updateRole(id, newRole);
            setUsers(users.map(u =>
                u._id === id ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถอัปเดตสิทธิ์ได้');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`คุณต้องการลบผู้ใช้ "${name}" หรือไม่?`)) return;

        setDeletingId(id);
        try {
            await usersAPI.delete(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        users: users.filter(u => u.role === 'user').length,
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
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-light">จัดการผู้ใช้</h2>
                <p className="text-light-muted">ดูและจัดการผู้ใช้ทั้งหมดในระบบ</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4">
                    <p className="text-light-muted text-sm">ผู้ใช้ทั้งหมด</p>
                    <p className="text-2xl font-bold text-light">{stats.total}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-secondary text-sm">ผู้ดูแลระบบ</p>
                    <p className="text-2xl font-bold text-secondary">{stats.admins}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-primary-light text-sm">สมาชิกทั่วไป</p>
                    <p className="text-2xl font-bold text-primary-light">{stats.users}</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-11 pr-10"
                        placeholder="ค้นหาผู้ใช้..."
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
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-light-muted font-medium">ผู้ใช้</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden sm:table-cell">อีเมล</th>
                                <th className="text-left p-4 text-light-muted font-medium">สิทธิ์</th>
                                <th className="text-left p-4 text-light-muted font-medium hidden md:table-cell">สมัครเมื่อ</th>
                                <th className="text-right p-4 text-light-muted font-medium">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-white">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-light">{user.name}</p>
                                                <p className="text-light-muted text-xs sm:hidden">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell text-light-muted text-sm">
                                        {user.email}
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={updatingId === user._id}
                                                className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-xs font-semibold cursor-pointer transition-all border-0 ${user.role === 'admin'
                                                    ? 'bg-secondary/20 text-secondary'
                                                    : 'bg-primary/20 text-primary-light'
                                                    }`}
                                            >
                                                <option value="user">สมาชิก</option>
                                                <option value="admin">ผู้ดูแล</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-sm text-light-muted">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => handleDelete(user._id, user.name)}
                                                disabled={deletingId === user._id}
                                                className="p-2 hover:bg-error/20 rounded-lg text-error transition-colors disabled:opacity-50"
                                                title="ลบผู้ใช้"
                                            >
                                                {deletingId === user._id ? (
                                                    <div className="spinner w-4 h-4"></div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-light-muted">
                        {search ? 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา' : 'ยังไม่มีผู้ใช้ในระบบ'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
