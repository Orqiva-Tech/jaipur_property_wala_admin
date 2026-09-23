import React, { useEffect, useState } from 'react';
import { Search, Download, Trash2, MessageSquare, Filter, X } from 'lucide-react';
import { enquiryService } from '../services/api';
import { Enquiry } from '../types';

export const Leads: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeNoteModal, setActiveNoteModal] = useState<Enquiry | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await enquiryService.getAll({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setEnquiries(res.data.data || []);
    } catch (err) {
      console.error('Error fetching leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await enquiryService.updateStatus(id, { status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this enquiry record?')) return;
    try {
      await enquiryService.delete(id);
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteModal || !noteText.trim()) return;

    try {
      await enquiryService.updateStatus(activeNoteModal._id, { note: noteText });
      setNoteText('');
      setActiveNoteModal(null);
      fetchLeads();
    } catch (err) {
      console.error('Error adding note', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-400 font-sans">
              Sales Pipeline & CRM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Buyer Leads & Enquiries
          </h1>
          <p className="text-xs text-stone-300 max-w-xl">
            Real-time incoming customer interest with automated email alerts dispatched to ankityadav941318@gmail.com and courteous customer confirmations.
          </p>
        </div>

        <a
          href={enquiryService.exportCSV()}
          download
          className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 shrink-0 border border-gold-300"
        >
          <Download className="w-4 h-4" />
          <span>Export All Leads (CSV)</span>
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0e2119] p-4 rounded-xl border border-gold-500/20 shadow-md flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gold-400/70 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, email, or property..."
            className="w-full pl-9 pr-3 py-2 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold-500/60"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gold-400/80 whitespace-nowrap mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Status:
          </span>
          {['All', 'New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gold-500 text-forest-950 shadow-md'
                  : 'bg-[#153125] text-stone-300 hover:text-white hover:bg-[#1a3d2e] border border-emerald-900/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
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
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-400">Loading leads...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-400">No leads found matching your search.</td>
                </tr>
              ) : (
                enquiries.map((lead) => (
                  <tr key={lead._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <span className="block text-sm text-gold-200">{lead.name}</span>
                      {lead.email && <span className="text-[11px] text-stone-400 font-normal">{lead.email}</span>}
                    </td>
                    <td className="p-4">
                      <a href={`tel:${lead.phone}`} className="font-semibold text-gold-400 hover:underline block">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-4 font-medium text-stone-200 max-w-xs truncate">
                      {lead.interestedProperty || 'General Portfolio'}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gold-400">{lead.budget || 'Any'}</span>
                      <span className="block text-[11px] text-stone-400">{lead.preferredLocation}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-stone-300 text-[11px]">{lead.message || '—'}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border ${
                          lead.status === 'New'
                            ? 'bg-red-950/80 text-red-300 border-red-500/40'
                            : lead.status === 'Contacted'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                            : lead.status === 'Site Visit Scheduled'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
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
                        className="text-[11px] bg-[#153125] text-gold-300 hover:bg-[#1c4030] font-semibold px-2.5 py-1 rounded-lg border border-gold-500/30 flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3 h-3 text-gold-400" />
                        <span>Notes ({lead.internalNotes ? lead.internalNotes.length : 0})</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white transition-all border border-red-500/30"
                        title="Delete Lead"
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

      {/* Internal Notes Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0d1d16] rounded-2xl p-6 max-w-md w-full border border-gold-500/40 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold-500/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gold-300 font-editorial">
                  Sales Discussion Notes
                </h3>
                <p className="text-[11px] text-stone-400">Lead: {activeNoteModal.name} ({activeNoteModal.phone})</p>
              </div>
              <button onClick={() => setActiveNoteModal(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Notes */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activeNoteModal.internalNotes && activeNoteModal.internalNotes.length > 0 ? (
                activeNoteModal.internalNotes.map((n, i) => (
                  <div key={i} className="p-2.5 bg-[#08140f] rounded-lg text-xs space-y-1 border border-gold-500/20">
                    <p className="text-stone-200">{n.note}</p>
                    <span className="text-[10px] text-stone-500 block">
                      {n.author || 'Admin'} • {new Date(n.date).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 text-center py-4">No internal notes added yet.</p>
              )}
            </div>

            {/* Add New Note */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-gold-500/20">
              <textarea
                rows={2}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add follow-up notes (e.g. customer wants 150 sq.yd east facing plot, visit planned on Sunday)..."
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-bold shadow"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
