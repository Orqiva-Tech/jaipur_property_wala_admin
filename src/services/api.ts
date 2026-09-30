import axios from 'axios';

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const rawApiUrl = (
  (isLocal ? 'http://localhost:5050' : '') ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.jaipurpropertywala.in'
).replace(/\/+$/, '');

export const BACKEND_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl.slice(0, -4)
  : rawApiUrl;

export const API_BASE_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl}/api`;

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
  timeout: 60000
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
  uploadFile: async (file: File, onProgress?: (percent: number) => void) => {
    // Strategy 1: Direct Cloudinary CDN Upload (only for images under 40MB; videos and large files go straight to server)
    const isVideo = file.type.startsWith('video');
    const isLarge = file.size > 40 * 1024 * 1024;

    if (!isVideo && !isLarge) {
      try {
        const cloudData = new FormData();
        cloudData.append('file', file);
        cloudData.append('upload_preset', 'jaipur_property_wala_uploads');

        const cloudRes = await axios.post(
          'https://api.cloudinary.com/v1_1/ripzq8zx/auto/upload',
          cloudData,
          {
            timeout: 0,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total && onProgress) {
                const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
                onProgress(percent);
              }
            }
          }
        );

        if (cloudRes.data?.secure_url) {
          if (onProgress) onProgress(100);
          return {
            data: {
              url: cloudRes.data.secure_url,
              public_id: cloudRes.data.public_id,
              filename: file.name
            }
          };
        }
      } catch (directErr: any) {
        console.warn('[Direct Cloudinary upload attempt failed, falling back to server API]', directErr?.message || directErr);
      }
    }

    // Strategy 2: Server API endpoint fallback
    const data = new FormData();
    data.append('file', file);
    return api.post('/properties/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress(percent);
        }
      }
    });
  },
  uploadMultipleFiles: (files: FileList | File[]) => {
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('files', files[i]);
    }
    return api.post('/properties/upload-multiple', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0 // No timeout
    });
  }
};

export const enquiryService = {
  create: (data: Record<string, any>) => api.post('/enquiries', data),
  getAll: (params?: Record<string, any>) => api.get('/enquiries', { params }),
  getById: (id: string) => api.get(`/enquiries/${id}`),
  updateStatus: (id: string, data: { status?: string; note?: string }) => api.put(`/enquiries/${id}`, data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
  deleteNote: (enquiryId: string, noteId: string) => api.delete(`/enquiries/${enquiryId}/notes/${noteId}`),
  exportCSV: () => {
    const token = localStorage.getItem('token') || '';
    return `${API_BASE_URL}/enquiries/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  downloadCSV: async () => {
    const res = await api.get('/enquiries/export', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jaipur-property-wala-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }
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
  changePassword: (data: { currentPassword?: string; oldPassword?: string; newPassword: string; confirmPassword?: string }) => api.put('/admin/auth/change-password', data),
  getStats: () => api.get('/admin/stats'),
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data)
};

export default api;

