import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Building2, Filter, AlertCircle } from 'lucide-react';
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: '',
    tagline: '',
    description: '',
    category: 'Residential',
    type: 'Plot',
    city: 'Jaipur',
    area: '',
    address: '',
    price: 0,
    priceDisplay: '',
    pricePerSqYd: 0,
    plotSizes: '111.11, 138.88, 152.77, 200',
    status: 'Ongoing',
    jdaApproved: true,
    reraApproved: true,
    reraNumber: '',
    bankLoanAvailable: true,
    bankLoanDetails: '80% Loan from all leading banks',
    amenities: 'Gated Colony, 24x7 CCTV, Wide Bitumen Roads, Water Tank, Park',
    featured: false
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSelectedFiles(null);
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
      price: property.price,
      priceDisplay: property.priceDisplay,
      pricePerSqYd: property.pricePerSqYd || 0,
      plotSizes: property.plotSizes ? property.plotSizes.join(', ') : '',
      status: property.status,
      jdaApproved: property.jdaApproved,
      reraApproved: property.reraApproved,
      reraNumber: property.reraNumber || '',
      bankLoanAvailable: property.bankLoanAvailable,
      bankLoanDetails: property.bankLoanDetails || '',
      amenities: property.amenities ? property.amenities.join(', ') : '',
      featured: property.featured
    });
    setSelectedFiles(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await propertyService.delete(id);
      setSuccessMessage('Property listing removed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchProperties();
    } catch (err) {
      console.error('Error deleting property', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'area' || key === 'address' || key === 'city') return;
        data.append(key, String(value));
      });

      // Location object with explicit City support
      data.append('location', JSON.stringify({
        area: formData.area,
        city: formData.city,
        address: formData.address
      }));

      // Attached images
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          data.append('images', selectedFiles[i]);
        }
      }

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
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'ajmer':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'kishangarh':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      case 'mumbai':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      default:
        return 'bg-stone-800 text-gold-300 border-gold-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Luxury Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#11291f] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-400 font-sans">
              Executive Real Estate Portfolio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Township & Plot Inventory
          </h1>
          <p className="text-xs text-stone-300 max-w-xl">
            Direct management of certified JDA & RERA schemes across Jaipur, Ajmer, Kishangarh, and Mumbai.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="relative group px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 shrink-0 border border-gold-300"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Multi-City Quick Filter Tabs & Search Bar */}
      <div className="bg-[#0e2119] p-4 rounded-xl border border-gold-500/20 shadow-md space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* City Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-extrabold uppercase text-gold-400/80 mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> City:
          </span>
          {['All', ...(locations.length > 0 ? locations.map(l => l.name) : ['Jaipur', 'Ajmer', 'Kishangarh', 'Mumbai'])].map((cityName) => (
            <button
              key={cityName}
              onClick={() => setSelectedCityTab(cityName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCityTab === cityName
                  ? 'bg-gold-500 text-forest-950 shadow-md'
                  : 'bg-[#153125] text-stone-300 hover:text-white hover:bg-[#1a3d2e] border border-emerald-900/60'
              }`}
            >
              {cityName === 'All' ? 'All Cities' : cityName}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gold-400/70 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, locality..."
            className="w-full pl-9 pr-4 py-2 bg-[#091610] border border-gold-500/20 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
          />
        </div>
      </div>

      {/* Property Inventory Table */}
      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
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
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400">
                    <div className="inline-block w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div className="text-xs">Loading luxury inventory...</div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400 space-y-2">
                    <Building2 className="w-10 h-10 text-gold-500/40 mx-auto" />
                    <div className="text-sm font-bold text-stone-200">No properties found in this selection</div>
                    <div className="text-xs text-stone-500">Add a new property or change your city filter.</div>
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#152e22] flex-shrink-0 border border-gold-500/20">
                        {p.images && p.images.length > 0 ? (
                          <img
                            src={p.images[0].startsWith('http') ? p.images[0] : p.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500">N/A</div>
                        )}
                      </div>
                      <div>
                        <span className="block truncate max-w-xs font-editorial text-sm text-gold-200">{p.title}</span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {p.type} • {p.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getCityBadgeColor(p.location?.city)}`}>
                          {p.location?.city || 'Jaipur'}
                        </span>
                      </div>
                      <span className="font-semibold text-stone-200 block text-xs">{p.location?.area}</span>
                      {p.location?.address && (
                        <span className="block text-[10px] text-stone-500 truncate max-w-[180px]">{p.location.address}</span>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-gold-400">
                      <div>{p.priceDisplay}</div>
                      {p.pricePerSqYd ? (
                        <div className="text-[10px] text-stone-400 font-normal">₹{p.pricePerSqYd.toLocaleString()}/Sq.Yd</div>
                      ) : null}
                    </td>
                    <td className="p-4 space-y-1">
                      {p.jdaApproved ? (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 block w-max">
                          ✓ JDA Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-900 text-stone-400 px-2 py-0.5 rounded block w-max">
                          Private Title
                        </span>
                      )}
                      {p.reraApproved && (
                        <span className="text-[10px] bg-gold-950/60 text-gold-300 font-bold px-2 py-0.5 rounded border border-gold-500/30 block w-max">
                          ✓ RERA Registered
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-[#18392a] text-emerald-300 font-bold px-2.5 py-1 rounded-md text-[10px] border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.featured ? (
                        <span className="text-[10px] bg-gold-500 text-forest-950 font-extrabold px-2 py-0.5 rounded shadow">
                          ★ Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500">Regular</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-lg bg-[#153125] hover:bg-gold-500 hover:text-forest-950 text-gold-400 transition-all border border-gold-500/30"
                        title="Edit Property"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white transition-all border border-red-500/30"
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

      {/* Add / Edit Luxury Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0d1d16] rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#07130e] to-[#0f281e] p-5 text-white flex justify-between items-center sticky top-0 z-10 border-b border-gold-500/30">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-editorial text-gold-300">
                    {editingId ? 'Edit Property Listing' : 'Add New Property Listing'}
                  </h3>
                  <p className="text-[11px] text-stone-400">Jaipur, Ajmer, Kishangarh & Mumbai Portfolios</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal if any */}
            {errorMessage && (
              <div className="m-5 p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. VRB World City — Premium Township Plots"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              {/* City & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Select City / Hub *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                        <option value="Ajmer">Ajmer (Smart City Corridor)</option>
                        <option value="Kishangarh">Kishangarh (Marble City NH-8)</option>
                        <option value="Mumbai">Mumbai (Financial Hub & Coastal)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
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
                  <label className="block text-xs font-bold text-gold-300 mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Jagatpura, Mahindra SEZ, Pushkar Bypass"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Detailed Address / Landmark</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Near Bombay Hospital, Mahal Road"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Display Price (Optional)</label>
                  <input
                    type="text"
                    value={formData.priceDisplay || ''}
                    onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                    placeholder="e.g. ₹24.50 Lacs (Leave blank for Price on Request)"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Numerical Price (Optional)</label>
                  <input
                    type="number"
                    value={formData.price ? formData.price : ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="e.g. 2500000 (or leave blank)"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Available Plot Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={formData.plotSizes}
                    onChange={(e) => setFormData({ ...formData, plotSizes: e.target.value })}
                    placeholder="111.11, 138.88, 152.77, 200"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Project Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 py-2 bg-[#08140f] p-3 rounded-lg border border-gold-500/20">
                <label className="flex items-center space-x-2 text-xs font-semibold text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jdaApproved}
                    onChange={(e) => setFormData({ ...formData, jdaApproved: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>JDA Approved</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reraApproved}
                    onChange={(e) => setFormData({ ...formData, reraApproved: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>RERA Approved</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bankLoanAvailable}
                    onChange={(e) => setFormData({ ...formData, bankLoanAvailable: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span>80% Bank Loan Approved</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-gold-300">Homepage Featured</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Gated Colony, 24x7 CCTV, Park, Sweet Water"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of layout, connectivity, and development standards..."
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Upload Images (select up to 6)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-xs text-stone-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-forest-950 hover:file:bg-gold-400 cursor-pointer"
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
                  {submitting ? 'Saving Property...' : editingId ? 'Update Property' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
