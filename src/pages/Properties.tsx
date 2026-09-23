import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Building2, Filter, AlertCircle, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { propertyService, locationService } from '../services/api';
import { Property, LocationItem } from '../types';

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityTab, setSelectedCityTab] = useState('All');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultArchImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'
  ];

  const defaultImageHighlights = [
    {
      title: 'Grand Entrance & 24x7 Security Post',
      description: 'Majestic Royal Archway with 24x7 security personnel, automated boom barriers, and illuminated stone fencing.',
      image: defaultArchImages[0]
    },
    {
      title: 'Wide Bitumen Demarcated Roads',
      description: '40 ft & 60 ft heavy-duty paved master avenues with curb stones, tree plantations, and storm-water drainage.',
      image: defaultArchImages[1]
    },
    {
      title: 'Underground Electrification & Water Supply',
      description: 'Reliable underground high-tension power network, high-yield overhead water reservoir, and dual-pipeline distribution.',
      image: defaultArchImages[2]
    },
    {
      title: 'Lush Landscaped Theme Park & Gazebo',
      description: 'Expansive recreational green garden, acupressure walking tracks, children play station, and meditation pagoda.',
      image: defaultArchImages[3]
    },
    {
      title: 'Instant Demarcation & Fast-Track Registry',
      description: 'Concrete boundary stone on every single plot with 100% legal 90-A sanction and immediate spot registry.',
      image: defaultArchImages[4]
    },
    {
      title: 'Commercial SCO High Street & Conveniences',
      description: 'Dedicated front-facing retail spaces, convenience shops, EV charging bays, and visitor car parking.',
      image: defaultArchImages[5]
    }
  ];

  const defaultNearbyLocations = [
    { name: 'National Highway / Ring Road', distance: '2 Mins', category: 'Highway', icon: '🛣️' },
    { name: 'International Airport', distance: '15 Mins', category: 'Transit', icon: '✈️' },
    { name: 'Multispecialty Hospital', distance: '8 Mins', category: 'Healthcare', icon: '🏥' },
    { name: 'Reputed International School', distance: '5 Mins', category: 'Education', icon: '🎓' },
    { name: 'Railway Station / Metro Hub', distance: '12 Mins', category: 'Transit', icon: '🚆' },
    { name: 'Commercial Hub / D-Mart', distance: '4 Mins', category: 'Shopping', icon: '🛍️' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: '',
    tagline: '',
    description: '',
    category: 'Township Plots',
    type: 'Plot',
    city: 'Jaipur',
    area: '',
    address: '',
    mapEmbedUrl: '',
    brochureUrl: '',
    price: 0,
    priceDisplay: '',
    pricePerSqYd: 0,
    showPrice: true,
    virtualTourUrl: '',
    imageHighlights: [...defaultImageHighlights],
    nearbyLocations: [...defaultNearbyLocations] as Array<{ name: string; distance: string; category?: string; icon?: string; }>,
    plotSizes: '100, 150, 200, 250',
    status: 'Ongoing',
    jdaApproved: true,
    reraApproved: true,
    bankLoanAvailable: true,
    amenities: 'Gated Colony, 24x7 CCTV, Wide Bitumen Roads, Water Tank, Park',
    featured: false,
    existingImages: [] as string[]
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmProperty, setDeleteConfirmProperty] = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingHighlightIdx, setUploadingHighlightIdx] = useState<number | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setErrorMessage(null);
    try {
      const res = await propertyService.uploadMultipleFiles(files);
      if (res.data?.urls && res.data.urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          existingImages: [...prev.existingImages, ...res.data.urls]
        }));
        setSuccessMessage(`Successfully uploaded ${res.data.urls.length} photo(s) from computer!`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      console.error('Error uploading gallery files', err);
      setErrorMessage(err.response?.data?.message || 'Error uploading photos. Please try again.');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleHighlightUpload = async (file: File, idx: number) => {
    setUploadingHighlightIdx(idx);
    setErrorMessage(null);
    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        const updated = [...formData.imageHighlights];
        updated[idx].image = res.data.url;
        setFormData(prev => ({ ...prev, imageHighlights: updated }));
        setSuccessMessage(`Highlight 0${idx + 1} photo uploaded successfully!`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      console.error('Error uploading highlight image', err);
      setErrorMessage(err.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingHighlightIdx(null);
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

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCityTab !== 'All') params.city = selectedCityTab;
      const res = await propertyService.getAll(params);
      setProperties(res.data.data || []);
    } catch (err) {
      console.error('Error loading properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [search, selectedCityTab]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (property: Property) => {
    setEditingId(property._id);
    setFormData({
      title: property.title,
      tagline: property.tagline || '',
      description: property.description,
      category: property.category,
      type: property.type,
      city: property.location?.city || 'Jaipur',
      area: property.location?.area || '',
      address: property.location?.address || '',
      mapEmbedUrl: property.location?.mapEmbedUrl || '',
      brochureUrl: property.brochureUrl || '',
      price: property.price,
      priceDisplay: property.priceDisplay,
      pricePerSqYd: property.pricePerSqYd || 0,
      showPrice: property.showPrice !== false,
      virtualTourUrl: property.virtualTourUrl || '',
      imageHighlights: (property.imageHighlights && property.imageHighlights.length === 6
        ? property.imageHighlights.map((h, i) => ({
            title: h.title || defaultImageHighlights[i].title,
            description: h.description || defaultImageHighlights[i].description,
            image: h.image || property.images?.[i] || defaultImageHighlights[i]?.image || defaultArchImages[i] || ''
          }))
        : defaultImageHighlights.map((h, i) => ({
            ...h,
            image: property.images?.[i] || h.image || defaultArchImages[i] || ''
          }))),
      nearbyLocations: (property.nearbyLocations && property.nearbyLocations.length > 0)
        ? property.nearbyLocations
        : [...defaultNearbyLocations],
      plotSizes: property.plotSizes ? property.plotSizes.join(', ') : '',
      status: property.status,
      jdaApproved: property.jdaApproved,
      reraApproved: property.reraApproved,
      bankLoanAvailable: property.bankLoanAvailable,
      amenities: property.amenities ? property.amenities.join(', ') : '',
      featured: property.featured,
      existingImages: property.images || []
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!deleteConfirmProperty) return;
    const id = deleteConfirmProperty._id;
    setDeletingId(id);
    try {
      await propertyService.delete(id);
      setSuccessMessage(`Property "${deleteConfirmProperty.title}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setDeleteConfirmProperty(null);
      fetchProperties();
    } catch (err: any) {
      console.error('Error deleting property', err);
      setErrorMessage(err.response?.data?.message || 'Error deleting property. Please try again.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'area' || key === 'address' || key === 'city' || key === 'mapEmbedUrl' || key === 'brochureUrl' || key === 'imageHighlights' || key === 'nearbyLocations' || key === 'existingImages') return;
        data.append(key, String(value));
      });

      data.append('location', JSON.stringify({
        area: formData.area,
        city: formData.city,
        address: formData.address,
        mapEmbedUrl: formData.mapEmbedUrl
      }));
      data.append('mapEmbedUrl', formData.mapEmbedUrl);
      data.append('brochureUrl', formData.brochureUrl);

      data.append('imageHighlights', JSON.stringify(formData.imageHighlights));
      data.append('nearbyLocations', JSON.stringify(formData.nearbyLocations));
      data.append('existingImages', JSON.stringify(formData.existingImages));

      if (editingId) {
        await propertyService.update(editingId, data);
        setSuccessMessage('Property updated successfully!');
      } else {
        await propertyService.create(data);
        setSuccessMessage('New property created successfully!');
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchProperties();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error saving property. Please check all fields.';
      setErrorMessage(msg);
      console.error('Save error details:', err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCityBadgeColor = (city?: string) => {
    switch (city?.toLowerCase()) {
      case 'jaipur':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ajmer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'kishangarh':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'mumbai':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
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
              Inventory & Township Portfolio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Township & Plot Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Direct management of certified JDA & RERA schemes across Jaipur, Ajmer, Kishangarh, and Mumbai.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Multi-City Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> City:
          </span>
          {['All', ...(locations.length > 0 ? locations.map(l => l.name) : ['Jaipur', 'Ajmer', 'Kishangarh', 'Mumbai'])].map((cityName) => (
            <button
              key={cityName}
              onClick={() => setSelectedCityTab(cityName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCityTab === cityName
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cityName === 'All' ? 'All Cities' : cityName}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, locality..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Property Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Property & Type</th>
                <th className="p-4">City / Location</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">JDA / RERA</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <div className="text-xs">Loading properties...</div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-sm font-semibold text-slate-700">No properties found</div>
                    <div className="text-xs text-slate-400">Add a new property or adjust your search filter.</div>
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {p.images && p.images.length > 0 ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">N/A</div>
                        )}
                      </div>
                      <div>
                        <span className="block truncate max-w-xs font-bold text-sm text-slate-900">{p.title}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {p.type} • {p.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getCityBadgeColor(p.location?.city)}`}>
                          {p.location?.city || 'Jaipur'}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800 block text-xs">{p.location?.area}</span>
                      {p.location?.address && (
                        <span className="block text-[11px] text-slate-500 truncate max-w-[180px]">{p.location.address}</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      <div>{p.priceDisplay}</div>
                      {p.showPrice === false && (
                        <span className="text-[10px] bg-red-50 text-red-700 font-medium px-1.5 py-0.5 rounded border border-red-200 block w-max mt-0.5">
                          Price Hidden on Site
                        </span>
                      )}
                      {p.pricePerSqYd ? (
                        <div className="text-[11px] text-slate-500 font-normal">₹{p.pricePerSqYd.toLocaleString()}/Sq.Yd</div>
                      ) : null}
                    </td>
                    <td className="p-4 space-y-1">
                      {p.jdaApproved ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 block w-max">
                          ✓ JDA Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded block w-max">
                          Private Title
                        </span>
                      )}
                      {p.reraApproved && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200 block w-max">
                          ✓ RERA Registered
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full text-[10px] border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.featured ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                          ★ Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Edit Property"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmProperty(p)}
                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                        title="Delete Property"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Studio Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-5xl lg:max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-white p-5 sm:p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {editingId ? 'Property Editor' : 'Create Listing'}
                    </span>
                    {editingId && (
                      <span className="text-xs text-slate-400 font-mono">ID: {editingId.slice(-6)}</span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {editingId ? (formData.title || 'Edit Property Listing') : 'Add New Property Listing'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal if any */}
            {errorMessage && (
              <div className="m-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700 shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. VRB World City — Premium Township Plots"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              {/* City & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select City / Hub *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                        <option value="Ajmer">Ajmer (Smart City Corridor)</option>
                        <option value="Kishangarh">Kishangarh (Marble City NH-8)</option>
                        <option value="Mumbai">Mumbai (Financial Hub & Coastal)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="Plot">Plot (Gaj / Sq.Yd)</option>
                    <option value="Villa">Villa / Farmhouse</option>
                    <option value="Commercial Plot">Commercial Plot / SCO</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Jagatpura, Mahindra SEZ, Pushkar Bypass"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Address / Landmark</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Near Bombay Hospital, Mahal Road"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Map Embed URL / Location Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.mapEmbedUrl}
                  onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                  placeholder="e.g. https://www.google.com/maps/embed?... or direct Google Maps location URL"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display Price (Optional)</label>
                  <input
                    type="text"
                    value={formData.priceDisplay || ''}
                    onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                    placeholder="e.g. ₹24.50 Lacs (Leave blank for Price on Request)"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Numerical Price (Optional)</label>
                  <input
                    type="number"
                    value={formData.price ? formData.price : ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="e.g. 2500000 (or leave blank)"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Show / Hide Price Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Show Price on Public Website</div>
                  <div className="text-[11px] text-slate-500">
                    {formData.showPrice
                      ? '✓ Price is visible on public website'
                      : '✕ Price is hidden on public website (Displays "Price on Request" & "Contact for Pricing")'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPrice}
                    onChange={(e) => setFormData({ ...formData, showPrice: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Plot Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={formData.plotSizes}
                    onChange={(e) => setFormData({ ...formData, plotSizes: e.target.value })}
                    placeholder="111.11, 138.88, 152.77, 200"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catchy Tagline / Pitch</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Ultra-Luxury Gated Township opposite Mega Riverfront Park"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive project description highlighting location advantages, connectivity, and development standards..."
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              {/* Virtual Tour Embed URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Virtual Tour / 360 Video Embed URL
                </label>
                <input
                  type="text"
                  value={formData.virtualTourUrl}
                  onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/embed/... or Matterport 3D Tour Link"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              {/* 6 Key Architectural Highlights */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      6 Project Highlights & Amenities
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload photos directly from your PC and write custom titles & descriptions.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 self-start sm:self-auto">
                    6 Verified Architectural Points
                  </span>
                </div>

                <div className="space-y-3">
                  {formData.imageHighlights.map((hl, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] text-blue-700 font-bold">
                            0{idx + 1}
                          </span>
                          <span>Highlight 0{idx + 1}: {hl.title || defaultImageHighlights[idx]?.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.imageHighlights];
                            updated[idx].image = defaultArchImages[idx] || '';
                            setFormData({ ...formData, imageHighlights: updated });
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          Reset to Default Photo
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Live Thumbnail Preview with click to upload */}
                        <label className="w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner shrink-0 group cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.svg,.gif,.avif,.jfif,.heic,.mp4"
                            className="hidden"
                            disabled={uploadingHighlightIdx === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHighlightUpload(file, idx);
                            }}
                          />
                          {hl.image ? (
                            <img
                              src={hl.image}
                              alt={hl.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = defaultArchImages[idx] || '';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[11px] p-2 text-center">
                              <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                              <span>No Photo</span>
                              <span className="text-[10px] text-blue-600 mt-0.5 font-semibold">Click to Upload</span>
                            </div>
                          )}

                          {uploadingHighlightIdx === idx ? (
                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center space-y-1">
                              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              <span className="text-[10px] text-blue-700 font-semibold">Uploading...</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                              <Upload className="w-4 h-4" />
                              <span className="text-[10px] font-semibold">Upload Photo</span>
                            </div>
                          )}

                          <div className="absolute top-1.5 left-1.5 bg-slate-900/80 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white">
                            0{idx + 1}
                          </div>
                        </label>

                        {/* Title, Direct File Upload, and Description inputs */}
                        <div className="flex-1 w-full space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Highlight Title</label>
                              <input
                                type="text"
                                value={hl.title}
                                onChange={(e) => {
                                  const updated = [...formData.imageHighlights];
                                  updated[idx].title = e.target.value;
                                  setFormData({ ...formData, imageHighlights: updated });
                                }}
                                placeholder="e.g. Grand Entrance Arch"
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Photo from Computer
                              </label>
                              <label className="flex items-center justify-center space-x-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium cursor-pointer transition-colors shadow-xs">
                                {uploadingHighlightIdx === idx ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{hl.image ? 'Change Photo' : 'Select Photo'}</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.svg,.gif,.avif,.jfif,.heic,.mp4"
                                  className="hidden"
                                  disabled={uploadingHighlightIdx === idx}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleHighlightUpload(file, idx);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Detailed Description</label>
                            <textarea
                              rows={2}
                              value={hl.description}
                              onChange={(e) => {
                                const updated = [...formData.imageHighlights];
                                updated[idx].description = e.target.value;
                                setFormData({ ...formData, imageHighlights: updated });
                              }}
                              placeholder="Describe the architectural and lifestyle benefit..."
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Connectivity / Distances */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Nearby Connectivity & Distances
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Major expressways, transit hubs, hospitals, and amenities with travel times.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        nearbyLocations: [
                          ...prev.nearbyLocations,
                          { name: '', distance: '', category: 'Transit', icon: '📍' }
                        ]
                      }));
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors shadow-xs"
                  >
                    + Add Landmark
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {formData.nearbyLocations.map((loc, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start space-x-2 relative group shadow-xs">
                      <span className="text-base mt-1">{loc.icon || '📍'}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 mb-1">
                          <input
                            type="text"
                            value={loc.name}
                            onChange={(e) => {
                              const updated = [...formData.nearbyLocations];
                              updated[idx].name = e.target.value;
                              setFormData({ ...formData, nearbyLocations: updated });
                            }}
                            placeholder="Landmark name (e.g. Ring Road)"
                            className="flex-1 p-1 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                nearbyLocations: prev.nearbyLocations.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-400 hover:text-red-600 px-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={loc.distance}
                            onChange={(e) => {
                              const updated = [...formData.nearbyLocations];
                              updated[idx].distance = e.target.value;
                              setFormData({ ...formData, nearbyLocations: updated });
                            }}
                            placeholder="Distance (e.g. 5 Mins)"
                            className="w-1/2 p-1 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={loc.category || ''}
                            onChange={(e) => {
                              const updated = [...formData.nearbyLocations];
                              updated[idx].category = e.target.value;
                              setFormData({ ...formData, nearbyLocations: updated });
                            }}
                            placeholder="Category (e.g. Transit)"
                            className="w-1/2 p-1 bg-white border border-slate-200 rounded text-xs text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Gallery & Images Management */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Property Gallery & Primary Cover Photo
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload photos directly from your computer. The photo marked "Primary Cover" appears as the hero banner on the website.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.existingImages.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            existingImages: [...defaultArchImages.slice(0, 4)]
                          }));
                        }}
                        className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-medium transition-colors shadow-xs"
                      >
                        + Load 4 Default Photos
                      </button>
                    )}
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {formData.existingImages.length} Image(s) Attached
                    </span>
                  </div>
                </div>

                {/* Direct PC File Upload Dropzone (Unlimited Files) */}
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 bg-white hover:bg-blue-50/30 transition-all text-center group cursor-pointer shadow-xs">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.svg,.gif,.avif,.jfif,.heic,.mp4"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                  />
                  {uploadingGallery ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-semibold text-slate-900">Uploading photos to server...</p>
                      <p className="text-xs text-slate-500">Processing high-resolution photos directly into gallery</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          Click to Browse or Drag & Drop Photos from PC
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload unlimited files (JPG, PNG, WEBP, AVIF, JFIF, MP4 up to 100MB each)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Uploaded Gallery Grid */}
                {formData.existingImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {formData.existingImages.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 space-y-2 transition-all shadow-xs group"
                      >
                        <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video border border-slate-200">
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = defaultArchImages[imgIdx % defaultArchImages.length];
                            }}
                          />
                          {imgIdx === 0 ? (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                              ★ Primary Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const imgs = [...prev.existingImages];
                                  const [moved] = imgs.splice(imgIdx, 1);
                                  imgs.unshift(moved);
                                  return { ...prev, existingImages: imgs };
                                });
                              }}
                              className="absolute top-2 left-2 bg-white/90 hover:bg-blue-600 hover:text-white text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs transition-colors"
                            >
                              Set as Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                existingImages: prev.existingImages.filter((_, i) => i !== imgIdx)
                              }));
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-sm transition-transform active:scale-95"
                            title="Delete this image"
                          >
                            ×
                          </button>
                        </div>

                        {/* Image Info Label */}
                        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                          <span className="truncate max-w-[170px] text-slate-700 font-mono text-[11px]" title={imgUrl}>
                            {imgUrl.split('/').pop() || `Photo #${imgIdx + 1}`}
                          </span>
                          {imgIdx === 0 ? (
                            <span className="text-blue-600 font-semibold text-[11px]">Main Cover</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">#{imgIdx + 1}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-500">No project images attached yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          existingImages: [...defaultArchImages.slice(0, 4)]
                        }));
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors shadow-xs"
                    >
                      + Add 4 Default Photos
                    </button>
                  </div>
                )}
              </div>

              {/* Form End Spacer */}
              <div className="h-2" />
            </form>

            {/* Sticky Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 hidden sm:block">
                All changes sync automatically with public website
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Property...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update Property' : 'Publish Property'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Property Confirmation Modal */}
      {deleteConfirmProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Property Listing?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete <strong className="text-slate-900">{deleteConfirmProperty.title}</strong> in {deleteConfirmProperty.location?.city || 'Jaipur'}? This cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProperty(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmProperty._id}
                onClick={confirmDeleteProperty}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {deletingId === deleteConfirmProperty._id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
