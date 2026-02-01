import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirect authenticated users away from certain pages like login/register
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="spinner w-10 h-10"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default GuestRoute;
