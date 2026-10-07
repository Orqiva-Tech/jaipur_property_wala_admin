import axios from 'axios';

const rawApiUrl = (
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
    // Strategy 1: Direct Cloudinary CDN Upload (supports images and videos up to 95MB)
    // This completely bypasses server/Nginx reverse proxy limits on live production
    const isVideo = file.type.startsWith('video');
    const isUnderCloudinaryLimit = file.size <= 95 * 1024 * 1024; // 95MB max for unsigned Cloudinary

    if (isUnderCloudinaryLimit) {
      try {
        const cloudData = new FormData();
        cloudData.append('file', file);
        cloudData.append('upload_preset', 'jaipur_property_wala_uploads');

        const uploadEndpoint = isVideo
          ? 'https://api.cloudinary.com/v1_1/ripzq8zx/video/upload'
          : 'https://api.cloudinary.com/v1_1/ripzq8zx/auto/upload';

        const cloudRes = await axios.post(
          uploadEndpoint,
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
  createAdmin: async (data: Record<string, any>) => {
    try {
      return await api.post('/enquiries/admin', data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Fallback for older backend versions
        const fallbackRes = await api.post('/enquiries', data);
        const leadId = fallbackRes.data?.data?.id || fallbackRes.data?.data?._id;
        if (data.status && data.status !== 'New' && leadId) {
          try {
            await api.put(`/enquiries/${leadId}`, { status: data.status });
          } catch (_) {}
        }
        if (data.initialNote && leadId) {
          try {
            await api.put(`/enquiries/${leadId}`, { note: data.initialNote });
          } catch (_) {}
        }
        return fallbackRes;
      }
      throw err;
    }
  },
  importLeads: async (leads: Array<Record<string, any>>) => {
    try {
      return await api.post('/enquiries/import', { leads });
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Fallback: batch import one by one
        let imported = 0;
        const errors: any[] = [];
        for (const item of leads) {
          try {
            await enquiryService.createAdmin(item);
            imported++;
          } catch (e: any) {
            errors.push({ lead: item, error: e.message });
          }
        }
        return {
          data: {
            success: true,
            count: imported,
            message: `Successfully imported ${imported} leads.`,
            skippedCount: errors.length
          }
        };
      }
      throw err;
    }
  },
  downloadSampleCSV: () => {
    const csvContent =
      `Name,Phone,Email,Property,Status,Preferred Location,Budget,Message,Source\n` +
      `"Rajesh Kumar","9829012345","rajesh@example.com","Southern Vista","New","Jagatpura, Jaipur","45 - 60 Lakhs","Interested in 200 sq yard villa","Direct Walk-in"\n` +
      `"Pooja Sharma","9829123456","pooja@example.com","General Consultation","Contacted","Mansarovar","Any","Looking for 3BHK luxury flat","Phone Call"\n` +
      `"Vikram Singh","9829234567","vikram@example.com","Royal Greens","Site Visit Scheduled","Ajmer Road","60 - 80 Lakhs","Wants site visit this Sunday","Meta Ads"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads-sample-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  },
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
  uploadMedia: async (file: File, onProgress?: (percent: number) => void): Promise<{ url: string; public_id?: string; resource_type?: string }> => {
    // Strategy 1: Direct Cloudinary CDN Upload (supports images and videos up to 100MB)
    // This completely bypasses server/Nginx reverse proxy limits on live production
    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|webm|mkv|avi|m4v|3gp)$/i.test(file.name);
    const isUnderCloudinaryLimit = file.size <= 100 * 1024 * 1024; // 100MB max for direct Cloudinary

    if (isUnderCloudinaryLimit) {
      try {
        const cloudData = new FormData();
        cloudData.append('file', file);
        cloudData.append('upload_preset', 'jaipur_property_wala_uploads');
        cloudData.append('folder', 'jaipur_property_wala/gallery');

        const uploadEndpoint = isVideo
          ? 'https://api.cloudinary.com/v1_1/ripzq8zx/video/upload'
          : 'https://api.cloudinary.com/v1_1/ripzq8zx/auto/upload';

        const cloudRes = await axios.post(
          uploadEndpoint,
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
            url: cloudRes.data.secure_url,
            public_id: cloudRes.data.public_id,
            resource_type: isVideo ? 'video' : 'image'
          };
        }
      } catch (directErr: any) {
        console.warn('[Direct Cloudinary gallery upload failed, checking fallback]', directErr?.message || directErr);
      }
    }

    // Fallback: If direct upload didn't succeed or was over limit, try server
    const data = new FormData();
    data.append('media', file);
    const res = await api.post('/gallery', data, {
      timeout: 0,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress(percent);
        }
      }
    });
    return {
      url: res.data?.data?.mediaUrl || res.data?.url
    };
  },
  create: async (data: FormData | Record<string, any>, onProgress?: (percent: number) => void) => {
    // If it's a plain JS object
    if (!(data instanceof FormData)) {
      return api.post('/gallery', data);
    }

    // If it's FormData, check if a File is attached in 'media' or 'file'
    const file = (data.get('media') || data.get('file')) as File | null;
    if (file && typeof file === 'object' && 'size' in file && file.size > 0) {
      try {
        const uploadResult = await galleryService.uploadMedia(file, onProgress);
        if (uploadResult?.url) {
          const payload: Record<string, any> = {};
          data.forEach((val, key) => {
            if (key !== 'media' && key !== 'file') {
              payload[key] = val;
            }
          });
          payload.mediaUrl = uploadResult.url;
          return api.post('/gallery', payload);
        }
      } catch (err) {
        console.warn('[Gallery FormData direct upload fallback]', err);
      }
    }

    return api.post('/gallery', data, {
      timeout: 300000
    });
  },
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

