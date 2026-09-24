import axios from 'axios';

// Resolve backend URL safely: ALWAYS use live Render production backend for production builds and live domains
const LIVE_RENDER_API = 'https://jaipur-property-wala-backend.onrender.com/api';

const getApiBaseUrl = (): string => {
  // If Vite is in production build mode (Vercel deployment or npm run build), ALWAYS use live Render backend
  if (import.meta.env.PROD) {
    return LIVE_RENDER_API;
  }

  // If running in browser on any non-localhost domain, ALWAYS use live Render backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
      return LIVE_RENDER_API;
    }
  }

  // Local development fallback
  const rawEnv = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!rawEnv || rawEnv.includes('localhost:5050')) {
    return LIVE_RENDER_API;
  }

  const clean = rawEnv.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${clean}/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Format image URL: Cloudinary/External URLs remain untouched,
 * relative upload paths are prefixed with the backend URL.
 */
export const formatImageUrl = (url?: string): string => {
  if (!url) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jpw_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jpw_admin_token');
      localStorage.removeItem('jpw_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const propertyService = {
  getAll: (params?: Record<string, any>) => api.get('/properties', { params }),
  getFeatured: () => api.get('/properties/featured'),
  getBySlug: (slug: string) => api.get(`/properties/${slug}`),
  create: (formData: FormData) => api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, formData: FormData) => api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/properties/${id}`),
  uploadFile: (file: File) => {
    const data = new FormData();
    data.append('file', file);
    return api.post('/properties/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultipleFiles: (files: FileList | File[]) => {
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('files', files[i]);
    }
    return api.post('/properties/upload-multiple', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const enquiryService = {
  create: (data: Record<string, any>) => api.post('/enquiries', data),
  getAll: (params?: Record<string, any>) => api.get('/enquiries', { params }),
  updateStatus: (id: string, data: { status?: string; note?: string }) => api.put(`/enquiries/${id}`, data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
  deleteNote: (enquiryId: string, noteId: string) => api.delete(`/enquiries/${enquiryId}/notes/${noteId}`),
  exportCSV: () => `${API_BASE_URL}/enquiries/export`
};

export const careerService = {
  getActive: () => api.get('/careers'),
  getBySlug: (slug: string) => api.get(`/careers/${slug}`),
  apply: (formData: FormData) => api.post('/careers/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllAdmin: () => api.get('/careers/admin/all'),
  create: (data: any) => api.post('/careers/admin/create', data),
  update: (id: string, data: any) => api.put(`/careers/admin/${id}`, data),
  delete: (id: string) => api.delete(`/careers/admin/${id}`),
  getApplications: (params?: any) => api.get('/careers/admin/applications', { params }),
  updateAppStatus: (id: string, data: any) => api.put(`/careers/admin/applications/${id}`, data),
  getResumeDownloadUrl: (id: string) => `${API_BASE_URL}/careers/admin/applications/${id}/resume`
};

export const galleryService = {
  getAll: (params?: { category?: string; location?: string } | string) => {
    if (typeof params === 'string') {
      return api.get('/gallery', { params: { category: params } });
    }
    return api.get('/gallery', { params });
  },
  create: (formData: FormData) => api.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/gallery/${id}`)
};

export const blogService = {
  getAll: (params?: Record<string, any>) => api.get('/blogs', { params }),
  getBySlug: (slug: string) => api.get(`/blogs/${slug}`),
  getAllAdmin: () => api.get('/blogs/admin/all'),
  create: (data: any) => api.post('/blogs/admin', data),
  update: (id: string, data: any) => api.put(`/blogs/admin/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/admin/${id}`)
};

export const locationService = {
  getAll: (params?: Record<string, any>) => api.get('/locations', { params }),
  create: (data: { name: string; state?: string; tagline?: string; icon?: string; status?: string }) => api.post('/locations', data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`)
};

export const adminService = {
  login: (credentials: { email: string; password: string }) => api.post('/admin/auth/login', credentials),
  getProfile: () => api.get('/admin/auth/me'),
  getStats: () => api.get('/admin/stats'),
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data)
};

export default api;

