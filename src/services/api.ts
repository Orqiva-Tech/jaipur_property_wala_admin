import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

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

