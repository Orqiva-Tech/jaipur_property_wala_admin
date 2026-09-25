import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Download, Trash2, MessageSquare, Filter, X, CheckCircle2, AlertCircle, MoreVertical, Eye } from 'lucide-react';
import { enquiryService } from '../services/api';
import { Enquiry } from '../types';

export const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [activeNoteModal, setActiveNoteModal] = useState<Enquiry | null>(null);
  const [noteText, setNoteText] = useState('');
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<Enquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(enquiries.length / itemsPerPage) || 1;
  const paginatedLeads = enquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await enquiryService.getAll({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setEnquiries(res.data.data || []);
    } catch (err: any) {
      console.error('Error fetching leads', err);
      setErrorMessage(err.response?.data?.message || 'Error loading leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLeads();
  }, [search, statusFilter]);

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async (e: React.MouseEvent) => {
    e.preventDefault();
    setExporting(true);
    try {
      await enquiryService.downloadCSV();
      setSuccessMessage('Leads exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Export error, opening direct link', err);
      window.open(enquiryService.exportCSV(), '_blank');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await enquiryService.updateStatus(id, { status: newStatus });
      setSuccessMessage('Lead status updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchLeads();
    } catch (err: any) {
      console.error('Error updating status', err);
      setErrorMessage(err.response?.data?.message || 'Error updating status');
    }
  };

  const confirmDeleteLead = async () => {
    if (!deleteConfirmLead) return;
    const id = deleteConfirmLead._id;
    setDeletingId(id);
    setErrorMessage(null);
    try {
      await enquiryService.delete(id);
      setSuccessMessage(`Lead from ${deleteConfirmLead.name} deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setDeleteConfirmLead(null);
      fetchLeads();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error deleting lead. Please try again.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteNote = async (enquiryId: string, noteId: string) => {
    try {
      await enquiryService.deleteNote(enquiryId, noteId);
      setActiveNoteModal(prev => {
        if (!prev) return null;
        return {
          ...prev,
          internalNotes: (prev.internalNotes || []).filter((n: any, idx: number) => String(n._id || idx) !== String(noteId))
        };
      });
      setSuccessMessage('Note removed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchLeads();
    } catch (err: any) {
      console.error('Error deleting note', err);
      setErrorMessage(err.response?.data?.message || 'Error deleting note');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteModal || !noteText.trim()) return;

    try {
      await enquiryService.updateStatus(activeNoteModal._id, { note: noteText });
      setNoteText('');
      setSuccessMessage('Note saved successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setActiveNoteModal(null);
      fetchLeads();
    } catch (err: any) {
      console.error('Error adding note', err);
      setErrorMessage(err.response?.data?.message || 'Error adding note');
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Customer Leads & CRM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buyer Leads & Enquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Live pipeline of incoming customer interest with direct WhatsApp calling, automated emails to admin, and customer verification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>{exporting ? 'Exporting CSV...' : 'Export All Leads (CSV)'}</span>
        </button>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, email, or property..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Status:
          </span>
          {['All', 'New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[850px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Phone / WhatsApp</th>
                <th className="p-4">Interested Scheme</th>
                <th className="p-4">Budget / Locality</th>
                <th className="p-4">Requirements</th>
                <th className="p-4">Lead Status</th>
                <th className="p-4">Internal Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">Loading leads...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">No leads found matching your search.</td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <Link
                        to={`/leads/${lead._id}`}
                        state={{ lead }}
                        className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        title="Click to view full lead details"
                      >
                        {lead.name}
                      </Link>
                      {lead.email && <span className="text-[11px] text-slate-500 font-normal">{lead.email}</span>}
                    </td>
                    <td className="p-4">
                      <a href={`tel:${lead.phone}`} className="font-semibold text-blue-600 hover:underline block">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-4 font-medium text-slate-800 max-w-xs truncate">
                      {lead.interestedProperty || 'General Portfolio'}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900">{lead.budget || 'Any'}</span>
                      <span className="block text-[11px] text-slate-500">{lead.preferredLocation}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 text-[11px]">{lead.message || '—'}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`text-xs font-medium rounded-md px-2.5 py-1 border transition-colors ${
                          lead.status === 'New'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : lead.status === 'Contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lead.status === 'Site Visit Scheduled'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setActiveNoteModal(lead)}
                        className="text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-2.5 py-1 rounded-md border border-slate-200 flex items-center space-x-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span>Notes ({lead.internalNotes ? lead.internalNotes.length : 0})</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === lead._id ? null : lead._id);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            activeDropdownId === lead._id
                              ? 'bg-slate-200 text-slate-900 border-slate-300'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 shadow-2xs'
                          }`}
                          title="Actions menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three-dot Dropdown Menu */}
                        {activeDropdownId === lead._id && (
                          <>
                            {/* Backdrop to close on click outside */}
                            <div
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                              }}
                            />
                            <div
                              className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                  navigate(`/leads/${lead._id}`, { state: { lead } });
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 flex items-center space-x-2 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Details</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                  setDeleteConfirmLead(lead);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Delete Lead</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {enquiries.length > 0 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, enquiries.length)}</span> of <span className="font-bold text-slate-900">{enquiries.length}</span> enquiries
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                      currentPage === pg
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Internal Notes Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sales Discussion Notes
                </h3>
                <p className="text-[11px] text-slate-500">Lead: {activeNoteModal.name} ({activeNoteModal.phone})</p>
              </div>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Notes */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activeNoteModal.internalNotes && activeNoteModal.internalNotes.length > 0 ? (
                activeNoteModal.internalNotes.map((n: any, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-200 flex items-start justify-between group">
                    <div className="flex-1 pr-2">
                      <p className="text-slate-800">{n.note}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {n.author || 'Admin'} • {new Date(n.date).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(activeNoteModal._id, n._id || String(i))}
                      className="text-slate-400 hover:text-red-600 p-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No internal notes added yet.</p>
              )}
            </div>

            {/* Add New Note */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-slate-200">
              <textarea
                rows={2}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add follow-up notes (e.g. customer interested in 150 sq.yd east facing plot, site visit on Sunday)..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead In-App Confirmation Modal */}
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Customer Enquiry?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently remove the enquiry from <strong className="text-slate-900">{deleteConfirmLead.name}</strong> ({deleteConfirmLead.phone})? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLead(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmLead._id}
                onClick={confirmDeleteLead}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {deletingId === deleteConfirmLead._id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
