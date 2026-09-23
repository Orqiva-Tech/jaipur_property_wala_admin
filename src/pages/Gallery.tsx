import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image, Play, MapPin, Filter, Check, AlertCircle, X } from 'lucide-react';
import { galleryService, locationService } from '../services/api';
import { GalleryItem, LocationItem } from '../types';

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Project Photos');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('Jaipur');
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCityFilter !== 'All') params.location = selectedCityFilter;
      const res = await galleryService.getAll(params);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Error fetching gallery', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await locationService.getAll();
      if (res.data?.data) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching locations', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCityFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await galleryService.delete(id);
      setSuccessMessage('Gallery item removed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchItems();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error deleting item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('mediaType', mediaType);
      formData.append('location', location);
      if (caption) formData.append('caption', caption);
      if (projectName) formData.append('projectName', projectName);
      if (mediaUrl) formData.append('mediaUrl', mediaUrl);
      if (selectedFile) formData.append('file', selectedFile);

      await galleryService.create(formData);
      setSuccessMessage('Media item published successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);

      setIsModalOpen(false);
      setTitle('');
      setCaption('');
      setProjectName('');
      setMediaUrl('');
      setSelectedFile(null);
      fetchItems();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error saving media item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Media & Visual Repository
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Media & Progress Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Upload on-site drone visuals, construction updates, and entrance gate photos for Jaipur, Ajmer, Kishangarh, and Mumbai.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Item</span>
        </button>
      </div>

      {/* City Filter Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center flex-wrap gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter Location:
        </span>
        {['All', ...(locations.length > 0 ? locations.map(l => l.name) : ['Jaipur', 'Ajmer', 'Kishangarh', 'Mumbai'])].map((cityName) => (
          <button
            key={cityName}
            onClick={() => setSelectedCityFilter(cityName)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCityFilter === cityName
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cityName === 'All' ? 'All Visuals' : cityName}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[4/3] bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 space-y-2">
          <Image className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No media found for {selectedCityFilter}</div>
          <div className="text-xs text-slate-400">Upload new construction pictures or site visit photos using the button above.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => {
            const src = item.mediaUrl.startsWith('http') ? item.mediaUrl : item.mediaUrl;
            return (
              <div key={item._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                      <Play className="w-8 h-8 text-blue-400" />
                    </div>
                  ) : (
                    <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                    {item.category}
                  </span>
                  {item.location && (
                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded shadow-xs flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.caption || item.projectName || 'Verified Scheme'}</p>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center space-x-1 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">
                Upload Media Item
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Caption *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Entrance Archway VRB World City"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="Project Photos">Project Photos</option>
                    <option value="Construction Progress">Construction Progress</option>
                    <option value="Completed Projects">Completed Projects</option>
                    <option value="Property Site Visits">Property Site Visits</option>
                    <option value="Events">Events</option>
                    <option value="Videos">Videos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="image">Image (Photo)</option>
                    <option value="video">Video (MP4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <option key={loc._id} value={loc.name}>
                          {loc.name} {loc.tagline ? `(${loc.tagline})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Jaipur">Jaipur (Pink City HQ)</option>
                        <option value="Ajmer">Ajmer (Smart City)</option>
                        <option value="Kishangarh">Kishangarh (Marble City)</option>
                        <option value="Mumbai">Mumbai (Coastal Hub)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. VRB World City"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload File from Computer (or Enter URL)
                </label>
                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-slate-600 mb-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Or enter direct URL: https://images.unsplash.com/..."
                  className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {submitting ? 'Saving...' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
