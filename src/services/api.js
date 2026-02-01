import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Equipment API
export const equipmentAPI = {
    getAll: (params) => api.get('/equipment', { params }),
    getById: (id) => api.get(`/equipment/${id}`),
    create: (data) => api.post('/equipment', data),
    update: (id, data) => api.put(`/equipment/${id}`, data),
    delete: (id) => api.delete(`/equipment/${id}`)
};

// Booking API
export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/my'),
    getAll: (params) => api.get('/bookings', { params }),
    updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
    cancel: (id) => api.delete(`/bookings/${id}`)
};

// Upload API
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteImage: (path) => api.delete('/upload', { data: { path } })
};

// Users API (Admin)
export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    delete: (id) => api.delete(`/users/${id}`)
};

// Chat API
export const chatAPI = {
    getRooms: () => api.get('/chat/rooms'),
    getMessages: (room) => api.get(`/chat/${room}`),
    markAsRead: (room) => api.put(`/chat/${room}/read`)
};

export default api;
