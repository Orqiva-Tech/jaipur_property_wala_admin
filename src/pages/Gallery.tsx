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
      setSuccessMessage('Media item removed.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchItems();
    } catch (err) {
      console.error('Error deleting gallery item', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append('title', title);
      data.append('category', category);
      data.append('mediaType', mediaType);
      data.append('caption', caption);
      data.append('location', location);
      data.append('projectName', projectName);
      if (mediaUrl) data.append('mediaUrl', mediaUrl);
      if (selectedFile) data.append('media', selectedFile);

      await galleryService.create(data);
      setSuccessMessage('Media successfully uploaded to gallery!');
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsModalOpen(false);
      setTitle('');
      setMediaUrl('');
      setCaption('');
      setSelectedFile(null);
      fetchItems();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error saving gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-400 font-sans">
              Visual Reality Repository
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Media & Progress Gallery
          </h1>
          <p className="text-xs text-stone-300 max-w-xl">
            Upload on-site drone visuals, construction updates, and entrance gate photos for Jaipur, Ajmer, Kishangarh, and Mumbai.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 shrink-0 border border-gold-300"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Item</span>
        </button>
      </div>

      {/* City Filter Pills */}
      <div className="bg-[#0e2119] p-4 rounded-xl border border-gold-500/20 shadow-md flex items-center flex-wrap gap-2">
        <span className="text-[11px] font-extrabold uppercase text-gold-400/80 mr-1 flex items-center">
          <Filter className="w-3 h-3 mr-1" /> Filter Location:
        </span>
        {['All', ...(locations.length > 0 ? locations.map(l => l.name) : ['Jaipur', 'Ajmer', 'Kishangarh', 'Mumbai'])].map((cityName) => (
          <button
            key={cityName}
            onClick={() => setSelectedCityFilter(cityName)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCityFilter === cityName
                ? 'bg-gold-500 text-forest-950 shadow-md'
                : 'bg-[#153125] text-stone-300 hover:text-white hover:bg-[#1a3d2e] border border-emerald-900/60'
            }`}
          >
            {cityName === 'All' ? 'All Visuals' : cityName}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[4/3] bg-[#0c1a13] rounded-2xl animate-pulse border border-gold-500/20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#0c1a13] p-12 text-center rounded-2xl border border-gold-500/20 text-stone-400 space-y-2">
          <Image className="w-10 h-10 text-gold-500/40 mx-auto" />
          <div className="text-sm font-bold text-stone-200">No media found for {selectedCityFilter}</div>
          <div className="text-xs text-stone-500">Upload new construction pictures or site visit photos using the button above.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const src = item.mediaUrl.startsWith('http') ? item.mediaUrl : item.mediaUrl;
            return (
              <div key={item._id} className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 overflow-hidden shadow-xl flex flex-col justify-between hover:border-gold-500/50 transition-all group">
                <div className="relative aspect-[4/3] bg-[#07130e] overflow-hidden">
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white">
                      <Play className="w-8 h-8 text-gold-400" />
                    </div>
                  ) : (
                    <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <span className="absolute top-2 left-2 bg-[#050e0a]/80 backdrop-blur-sm text-gold-300 border border-gold-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  {item.location && (
                    <span className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-sm text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gold-400" />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-stone-400 line-clamp-1">{item.caption || item.projectName || 'Verified Scheme'}</p>

                  <div className="pt-2 border-t border-gold-500/10 flex justify-end">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center space-x-1 hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0d1d16] rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40">
            <div className="bg-gradient-to-r from-[#07130e] to-[#0f281e] p-5 text-white flex justify-between items-center border-b border-gold-500/30">
              <h3 className="text-lg font-bold font-editorial text-gold-300">
                Upload Media Item
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-5 p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Title / Caption *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Entrance Archway VRB World City"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
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
                  <label className="block text-xs font-bold text-gold-300 mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="image">Image (Photo)</option>
                    <option value="video">Video (MP4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Location / City</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
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
                  <label className="block text-xs font-bold text-gold-300 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. VRB World City"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">
                  Upload File OR Enter Direct Media URL
                </label>
                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-stone-300 mb-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-forest-950 hover:file:bg-gold-400"
                />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gold-500/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-extrabold shadow-lg hover:shadow-gold-500/20"
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
