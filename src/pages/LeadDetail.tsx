import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Calendar,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Send,
  Eye,
  Layers,
  Sparkles,
  FileCheck2,
  Landmark,
  Share2,
  Clock
} from 'lucide-react';
import { enquiryService, propertyService, formatImageUrl } from '../services/api';
import { Enquiry, Property } from '../types';

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [lead, setLead] = useState<Enquiry | null>((location.state as any)?.lead || null);
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(!lead);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Status updating
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Email draft state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [copied, setCopied] = useState(false);

  // Photo viewer modal
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch lead if not present in state or refresh
  const loadLead = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Try getById first
      try {
        const res = await enquiryService.getById(id);
        if (res.data?.data) {
          setLead(res.data.data);
          return;
        }
      } catch (err) {
        // Fallback: fetch all and find
        const allRes = await enquiryService.getAll();
        const found = (allRes.data?.data || []).find((l: Enquiry) => l._id === id);
        if (found) {
          setLead(found);
          return;
        }
        throw new Error('Lead not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch lead:', err);
      setError('Could not load lead information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lead && id) {
      loadLead();
    }
  }, [id]);

  // Sync recipient and draft email once lead is loaded
  useEffect(() => {
    if (!lead) return;

    setRecipientEmail(lead.email || '');

    const propName = lead.interestedProperty || 'Property Enquiry';
    const defaultSubject = `Information Regarding Your Enquiry for ${propName} - Jaipur Property Wala`;
    setEmailSubject(defaultSubject);

    const defaultMsg = `Dear ${lead.name},

Thank you for your enquiry with Jaipur Property Wala regarding "${propName}".

Here is a summary of your interest:
• Interested Scheme / Property: ${propName}
• Preferred Location: ${lead.preferredLocation || 'Jaipur'}
• Desired Budget: ${lead.budget || 'Flexible'}
${lead.message ? `• Your Request: "${lead.message}"\n` : ''}
We have prime, JDA-approved and RERA-registered plots and projects available matching your requirements. We would be pleased to share complete site layout maps, video walk-throughs, and government approved layout copies.

Would you be available for a brief discussion or a free site-visit cab tour this week?

Please feel free to reply directly to this email, or call/WhatsApp our senior property advisor at +91 92512 17568.

Warm regards,
Sales & Customer Relations Team
Jaipur Property Wala
Phone: +91 92512 17568
Email: info@jaipurpropertywala.in
Website: https://jaipurpropertywala.in`;

    setEmailBody(defaultMsg);
  }, [lead]);

  // Try to match property by propertyId or interestedProperty name
  useEffect(() => {
    if (!lead) return;

    // If lead already has populated property object
    if (lead.propertyId && typeof lead.propertyId === 'object' && lead.propertyId.title) {
      setMatchedProperty(lead.propertyId);
      return;
    }

    const searchProperty = async () => {
      setPropertyLoading(true);
      try {
        const res = await propertyService.getAll({ limit: 100 });
        const allProperties: Property[] = res.data?.data || [];

        // 1. Try matching by propertyId string
        if (lead.propertyId && typeof lead.propertyId === 'string') {
          const matchedById = allProperties.find(p => p._id === lead.propertyId);
          if (matchedById) {
            setMatchedProperty(matchedById);
            return;
          }
        }

        // 2. Try matching by title
        if (lead.interestedProperty && lead.interestedProperty !== 'General Consultation' && lead.interestedProperty !== 'General Enquiry') {
          const query = lead.interestedProperty.trim().toLowerCase();
          const matchedByTitle = allProperties.find(p =>
            p.title.toLowerCase().includes(query) || query.includes(p.title.toLowerCase())
          );
          if (matchedByTitle) {
            setMatchedProperty(matchedByTitle);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching property for lead:', err);
      } finally {
        setPropertyLoading(false);
      }
    };

    searchProperty();
  }, [lead]);

  // Status change handler
  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setStatusUpdating(true);
    try {
      await enquiryService.updateStatus(lead._id, { status: newStatus });
      setLead(prev => prev ? { ...prev, status: newStatus as any } : null);
      setSuccessMessage(`Lead status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError('Failed to update status.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Add Note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !noteText.trim()) return;

    setSavingNote(true);
    try {
      const res = await enquiryService.updateStatus(lead._id, { note: noteText });
      const updated = res.data?.data || {
        ...lead,
        internalNotes: [
          ...(lead.internalNotes || []),
          { note: noteText, author: 'Admin', date: new Date().toISOString() }
        ]
      };
      setLead(updated);
      setNoteText('');
      setSuccessMessage('Note added successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError('Could not save note.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Note handler
  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    try {
      await enquiryService.deleteNote(lead._id, noteId);
      setLead(prev => {
        if (!prev) return null;
        return {
          ...prev,
          internalNotes: (prev.internalNotes || []).filter((n: any, idx: number) => String(n._id || idx) !== String(noteId))
        };
      });
      setSuccessMessage('Note removed.');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError('Could not delete note.');
      setTimeout(() => setError(null), 4000);
    }
  };

  // Copy email draft
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Open default mail client (mailto)
  const handleOpenMailClient = () => {
    if (!recipientEmail) {
      alert('Please enter a recipient email address.');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  // Open Gmail Web
  const handleOpenGmailWeb = () => {
    if (!recipientEmail) {
      alert('Please enter a recipient email address.');
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
  };

  // Delete Lead
  const handleDeleteLead = async () => {
    if (!lead) return;
    setDeleting(true);
    try {
      await enquiryService.delete(lead._id);
      navigate('/leads', { replace: true });
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading lead details & property information...</span>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Lead Record Not Found</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          to="/leads"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </Link>
      </div>
    );
  }

  if (!lead) return null;

  const phoneClean = lead.phone.replace(/[^0-9]/g, '');
  const waPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;

  return (
    <div className="space-y-6 antialiased pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Back to Leads"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Lead #{lead._id.slice(-6).toUpperCase()}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                lead.status === 'New'
                  ? 'bg-red-100 text-red-700'
                  : lead.status === 'Contacted'
                  ? 'bg-blue-100 text-blue-700'
                  : lead.status === 'Site Visit Scheduled'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Received on {new Date(lead.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </p>
          </div>
        </div>

        {/* Status Dropdown & Delete Action */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <span>Status:</span>
            <select
              value={lead.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Site Visit Scheduled">Site Visit Scheduled</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
            title="Delete this lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Customer & Purpose Details (Left) + Property Showcase (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Info & Lead Purpose */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{lead.name}</h2>
                  <span className="text-[11px] text-slate-500">Customer Profile</span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Contact methods with 1-click actions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Phone Number</span>
                      <a href={`tel:${lead.phone}`} className="text-xs font-bold text-slate-900 hover:text-blue-600">
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${lead.name}, greetings from Jaipur Property Wala regarding your enquiry for ${lead.interestedProperty || 'our properties'}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                      title="Open WhatsApp chat"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Email Address</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {lead.email || <span className="text-slate-400 font-normal italic">Not provided</span>}
                      </span>
                    </div>
                  </div>
                  {lead.email && (
                    <a
                      href={`#email-section`}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Compose</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Purpose / Requirements */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lead Purpose & Preferences
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Interested Property</span>
                    <span className="font-bold text-slate-900 block truncate" title={lead.interestedProperty}>
                      {lead.interestedProperty || 'General Consultation'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Preferred Locality</span>
                    <span className="font-bold text-slate-900 block">
                      {lead.preferredLocation || 'Jaipur'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Budget</span>
                    <span className="font-bold text-slate-900 block">
                      {lead.budget || 'Flexible / Any'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Inquiry Source</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {lead.source || 'Website Lead'}
                    </span>
                  </div>
                </div>

                {/* Customer Message / Query */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                  <span className="text-[11px] font-semibold text-amber-900 block mb-1">
                    Customer Message / Query:
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed italic">
                    {lead.message ? `"${lead.message}"` : 'No additional message was provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Sales Discussion Notes ({lead.internalNotes ? lead.internalNotes.length : 0})
                </h3>
              </div>
            </div>

            {/* Note items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lead.internalNotes && lead.internalNotes.length > 0 ? (
                lead.internalNotes.map((n: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200 flex items-start justify-between group">
                    <div className="space-y-1 pr-2">
                      <p className="text-slate-800 font-medium">{n.note}</p>
                      <span className="text-[10px] text-slate-400 block">
                        By {n.author || 'Admin'} • {new Date(n.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n._id || String(idx))}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors shrink-0"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No internal notes recorded yet.
                </p>
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write customer update or follow-up note..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote || !noteText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{savingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Inquired Property Showcase & Photos */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Inquired Property Details & Photos
                </h3>
              </div>
              {matchedProperty && (
                <Link
                  to={`/properties`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                >
                  <span>Inventory View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-5">
              {propertyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500">Searching property inventory...</span>
                </div>
              ) : matchedProperty ? (
                <div className="space-y-5">
                  {/* Property Title & Badges Header */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {matchedProperty.category} • {matchedProperty.type}
                      </span>
                      {matchedProperty.jdaApproved && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>100% JDA Approved</span>
                        </span>
                      )}
                      {matchedProperty.reraApproved && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          RERA: {matchedProperty.reraNumber || 'Approved'}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {matchedProperty.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {matchedProperty.title}
                    </h2>
                    {matchedProperty.tagline && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {matchedProperty.tagline}
                      </p>
                    )}
                  </div>

                  {/* Photo Showcase & Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Property Photos ({matchedProperty.images?.length || 0})
                      </span>
                      <span className="text-[11px] text-slate-400">Click photo to zoom</span>
                    </div>

                    {matchedProperty.images && matchedProperty.images.length > 0 ? (
                      <div className="space-y-2">
                        {/* Main Featured Photo */}
                        <div
                          onClick={() => setActivePhoto(matchedProperty.images[0])}
                          className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden cursor-pointer group bg-slate-900"
                        >
                          <img
                            src={formatImageUrl(matchedProperty.images[0])}
                            alt={matchedProperty.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Full Image</span>
                            </span>
                          </div>
                        </div>

                        {/* Thumbnails Row */}
                        {matchedProperty.images.length > 1 && (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {matchedProperty.images.map((img, i) => (
                              <div
                                key={i}
                                onClick={() => setActivePhoto(img)}
                                className="h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity bg-slate-100"
                              >
                                <img
                                  src={formatImageUrl(img)}
                                  alt={`View ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-44 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                        No property photos uploaded.
                      </div>
                    )}
                  </div>

                  {/* Property Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block mb-0.5">Price Display</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-blue-600" />
                        {matchedProperty.priceDisplay || `₹${matchedProperty.price?.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block mb-0.5">Rate / Sq. Yd</span>
                      <span className="font-bold text-slate-900 block">
                        {matchedProperty.pricePerSqYd ? `₹${matchedProperty.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : 'On Request'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block mb-0.5">Plot Sizes</span>
                      <span className="font-bold text-slate-900 block truncate">
                        {matchedProperty.plotSizes && matchedProperty.plotSizes.length > 0
                          ? matchedProperty.plotSizes.map(s => `${s} ${matchedProperty.sizeUnit || 'sq.yd'}`).join(', ')
                          : 'Custom Sizes'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                      <span className="text-[11px] text-slate-500 block mb-0.5">Location</span>
                      <span className="font-bold text-slate-900 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{matchedProperty.location?.area}, {matchedProperty.location?.city}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block mb-0.5">Bank Loan</span>
                      <span className="font-bold text-slate-900 block">
                        {matchedProperty.bankLoanAvailable ? '80% Pre-Approved' : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {matchedProperty.amenities && matchedProperty.amenities.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-800 block mb-2">Amenities & Features</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedProperty.amenities.map((a, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">
                            • {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Public Link */}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={`https://jaipurpropertywala.in/property/${matchedProperty.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <span>View Live Listing on Customer Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                /* No Specific Property Matched / General Lead */
                <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {lead.interestedProperty || 'General Consultation Lead'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      This enquiry was submitted for general property consultation or custom requirement in <strong className="text-slate-800">{lead.preferredLocation || 'Jaipur'}</strong> with budget <strong className="text-slate-800">{lead.budget || 'Flexible'}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/properties"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      <span>Explore Inventory to Recommend</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Mailbox Section (Requirement: Email Customer With Pre-filled Lead Purpose) */}
      <div id="email-section" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <Mail className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Send Direct Email to Customer
              </h3>
              <p className="text-xs text-blue-200">
                Pre-filled with lead purpose and property specifications ready to dispatch via your mailbox.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors border border-white/20"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Draft!' : 'Copy Draft'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenGmailWeb}
              className="px-3.5 py-1.5 bg-white text-blue-900 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Open in Gmail</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Recipient Field */}
            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Recipient Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
              {!lead.email && (
                <span className="text-[11px] text-amber-600 font-medium block">
                  * Customer did not provide an email on web form. You can enter one manually above.
                </span>
              )}
            </div>

            {/* Subject Field */}
            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Email Subject:
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Email Body TextArea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Email Content / Message Template:
              </label>
              <span className="text-[11px] text-slate-400">
                You can customize this message before dispatching
              </span>
            </div>
            <textarea
              rows={10}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Send Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Clicking <strong>Send via Email App</strong> launches your default email client (Outlook, Apple Mail, Thunderbird). Or use <strong>Open in Gmail</strong> to send directly from browser.
            </p>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenGmailWeb}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 flex items-center justify-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open in Gmail Web</span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailClient}
                className="flex-1 sm:flex-initial px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send via Email App</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Photo Modal Viewer */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <img
              src={formatImageUrl(activePhoto)}
              alt="Enlarged Property Photo"
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Customer Lead?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete lead from <strong className="text-slate-900">{lead.name}</strong> ({lead.phone})? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteLead}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
