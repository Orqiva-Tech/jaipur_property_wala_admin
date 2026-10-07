import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Download,
  Upload,
  Plus,
  Trash2,
  MessageSquare,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Eye,
  FileSpreadsheet,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  IndianRupee,
  Tag,
  FileText
} from 'lucide-react';
import { enquiryService, propertyService } from '../services/api';
import { Enquiry } from '../types';

/**
 * Robust client-side CSV parser supporting quoted strings and commas
 */
function parseCSV(text: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (rowStr: string): string[] => {
    const values: string[] = [];
    let val = '';
    let inQuote = false;
    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      if (c === '"') {
        if (inQuote && rowStr[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === ',' && !inQuote) {
        values.push(val.trim());
        val = '';
      } else {
        val += c;
      }
    }
    values.push(val.trim());
    return values;
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || row.every(v => !v)) continue;
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      let rawVal = row[idx] || '';
      rawVal = rawVal.replace(/^["']|["']$/g, '').trim();
      obj[header] = rawVal;
    });

    const name = obj['name'] || obj['customer name'] || obj['full name'] || obj['customer'] || '';
    const phone = obj['phone'] || obj['phone number'] || obj['mobile'] || obj['whatsapp'] || obj['contact'] || '';
    const email = obj['email'] || obj['email address'] || '';
    const property = obj['property'] || obj['interested scheme'] || obj['interested property'] || obj['scheme'] || obj['project'] || '';
    const location = obj['preferred location'] || obj['location'] || obj['locality'] || obj['city'] || '';
    const budget = obj['budget'] || obj['price'] || '';
    const message = obj['message'] || obj['requirements'] || obj['requirement'] || obj['notes'] || '';
    const source = obj['source'] || obj['lead source'] || 'CSV Import';
    const status = obj['status'] || obj['lead status'] || 'New';

    if (name || phone) {
      results.push({
        name,
        phone,
        email,
        interestedProperty: property || 'General Consultation',
        preferredLocation: location || 'Jaipur',
        budget: budget || 'Any',
        message,
        source: source || 'CSV Import',
        status: status || 'New'
      });
    }
  }

  return results;
}

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

  // Property list for auto-suggestion in form
  const [propertySuggestions, setPropertySuggestions] = useState<string[]>([]);

  // Add Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    interestedProperty: '',
    preferredLocation: 'Jaipur',
    budget: 'Any',
    message: '',
    source: 'Admin Direct',
    status: 'New' as Enquiry['status'],
    initialNote: ''
  });

  // Import Leads Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load properties for dropdown suggestions
  useEffect(() => {
    propertyService
      .getAll({ limit: 100 })
      .then((res) => {
        const titles = (res.data?.data || []).map((p: any) => p.title).filter(Boolean);
        setPropertySuggestions(titles);
      })
      .catch(() => {});
  }, []);

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

  // Submit Single Lead Form
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      setErrorMessage('Please enter both customer name and phone number.');
      return;
    }

    setSubmittingAdd(true);
    setErrorMessage(null);

    try {
      await enquiryService.createAdmin({
        name: addForm.name.trim(),
        phone: addForm.phone.trim(),
        email: addForm.email.trim(),
        interestedProperty: addForm.interestedProperty.trim() || 'General Consultation',
        preferredLocation: addForm.preferredLocation.trim() || 'Jaipur',
        budget: addForm.budget.trim() || 'Any',
        message: addForm.message.trim(),
        source: addForm.source.trim() || 'Admin Direct',
        status: addForm.status,
        initialNote: addForm.initialNote.trim()
      });

      setSuccessMessage(`Lead for "${addForm.name.trim()}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsAddModalOpen(false);
      // Reset form
      setAddForm({
        name: '',
        phone: '',
        email: '',
        interestedProperty: '',
        preferredLocation: 'Jaipur',
        budget: 'Any',
        message: '',
        source: 'Admin Direct',
        status: 'New',
        initialNote: ''
      });
      fetchLeads();
    } catch (err: any) {
      console.error('Error adding lead', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create lead. Please check details.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handle CSV file selection and parsing
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setParsingError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const results = parseCSV(text);
        if (results.length === 0) {
          setParsingError('No valid lead rows found. File must contain at least "Name" and "Phone" columns.');
          setParsedLeads([]);
        } else {
          setParsedLeads(results);
          setParsingError(null);
        }
      } catch (parseErr: any) {
        setParsingError('Failed to parse CSV file: ' + (parseErr.message || 'Invalid format'));
        setParsedLeads([]);
      }
    };
    reader.onerror = () => {
      setParsingError('Failed to read the file.');
      setParsedLeads([]);
    };
    reader.readAsText(file);
  };

  // Execute Bulk CSV Import
  const handleBulkImport = async () => {
    if (parsedLeads.length === 0) return;

    setIsImporting(true);
    setParsingError(null);

    try {
      const res = await enquiryService.importLeads(parsedLeads);
      const importedCount = res.data?.count || parsedLeads.length;
      setSuccessMessage(`Successfully imported ${importedCount} leads!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsImportModalOpen(false);
      setImportFile(null);
      setParsedLeads([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchLeads();
    } catch (err: any) {
      console.error('Error importing leads', err);
      setParsingError(err.response?.data?.message || 'Error occurred while importing leads.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Action Buttons: Export, Import CSV, and Add Lead */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full sm:w-auto justify-center px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
            title="Download all leads as a CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{exporting ? 'Exporting...' : 'Export Leads (CSV)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setParsingError(null);
              setImportFile(null);
              setParsedLeads([]);
              if (fileInputRef.current) fileInputRef.current.value = '';
              setIsImportModalOpen(true);
            }}
            className="w-full sm:w-auto justify-center px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
            title="Bulk import leads from a CSV spreadsheet"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Import Leads (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
            title="Manually register a single lead into CRM"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Lead</span>
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
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all cursor-pointer ${
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
        <div className="overflow-x-auto w-full min-h-[320px] pb-14">
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
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p>No leads found matching your search.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Add a new lead manually
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, idx) => {
                  const openUpward = idx >= 1;
                  return (
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
                        {lead.email && <span className="text-[11px] text-slate-500 font-normal block">{lead.email}</span>}
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {lead.source || 'Website'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
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
                          className={`text-xs font-medium rounded-md px-2.5 py-1 border transition-colors cursor-pointer ${
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
                          className="text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-2.5 py-1 rounded-md border border-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
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
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
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
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                }}
                              />
                              <div
                                className={`absolute right-0 ${
                                  openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } w-44 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(null);
                                    navigate(`/leads/${lead._id}`, { state: { lead } });
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 flex items-center space-x-2 transition-colors cursor-pointer"
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
                                  className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
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
                  );
                })
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
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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

      {/* ============================================================== */}
      {/* ADD LEAD MODAL (Single Lead Manual Entry)                      */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add New Buyer Lead
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly log customer requirements from direct phone calls, walk-in visits, or offline campaigns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddLeadSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9829012345"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="e.g. ramesh@example.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Interested Scheme / Property */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interested Scheme / Property
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      list="property-suggestions"
                      placeholder="e.g. Southern Vista or General Consultation"
                      value={addForm.interestedProperty}
                      onChange={(e) => setAddForm({ ...addForm, interestedProperty: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                    <datalist id="property-suggestions">
                      <option value="General Consultation" />
                      {propertySuggestions.map((title, i) => (
                        <option key={i} value={title} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Preferred Location / Locality */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preferred Location / Locality
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Jagatpura, Jaipur / Ajmer Road / Mansarovar"
                      value={addForm.preferredLocation}
                      onChange={(e) => setAddForm({ ...addForm, preferredLocation: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget Range
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. ₹35 - ₹50 Lakhs / Any"
                      value={addForm.budget}
                      onChange={(e) => setAddForm({ ...addForm, budget: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Lead Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value="New">New (Fresh Enquiry)</option>
                    <option value="Contacted">Contacted (Called / Messaged)</option>
                    <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Lead Source */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={addForm.source}
                      onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs cursor-pointer"
                    >
                      <option value="Admin Direct">Admin Direct (Manual)</option>
                      <option value="Phone Call">Phone Call / Inbound</option>
                      <option value="Direct Walk-in">Direct Walk-in</option>
                      <option value="WhatsApp Enquiry">WhatsApp Enquiry</option>
                      <option value="Meta Ads">Meta Ads (Facebook/Instagram)</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Referral">Referral / Channel Partner</option>
                      <option value="Website Modal">Website Modal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirements / Remarks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Requirements / Enquired Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Client needs 150-200 sq. yard residential plot near Ring Road, looking for immediate registry..."
                  value={addForm.message}
                  onChange={(e) => setAddForm({ ...addForm, message: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Initial Note */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Internal Sales Discussion Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spoke to customer, site visit scheduled for Sunday 11 AM with Sales Manager"
                  value={addForm.initialNote}
                  onChange={(e) => setAddForm({ ...addForm, initialNote: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  {submittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submittingAdd ? 'Saving Lead...' : 'Add Lead to Pipeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* IMPORT LEADS MODAL (Bulk CSV Import)                           */}
      {/* ============================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Leads from CSV
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bulk upload multiple buyer leads from Excel or CSV files directly into CRM.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Sample Template Download Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-xs">Need a CSV template?</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Columns supported: <strong>Name, Phone, Email, Property, Status, Preferred Location, Budget, Message, Source</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => enquiryService.downloadSampleCSV()}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100/50 rounded-lg text-xs font-semibold shrink-0 shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select CSV File (.csv)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,text/csv,text/plain"
                    onChange={handleCSVFileChange}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      Click to choose CSV file
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop here</span>
                    <p className="text-[11px] text-slate-400 mt-1">UTF-8 formatted CSV up to 10MB</p>
                  </label>
                </div>
              </div>

              {/* File Info & Parsing Error */}
              {parsingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{parsingError}</span>
                </div>
              )}

              {/* Parsed Leads Preview */}
              {importFile && parsedLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{parsedLeads.length} leads detected in {importFile.name}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Showing first {Math.min(5, parsedLeads.length)} of {parsedLeads.length}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px] text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Property</th>
                          <th className="p-2">Location</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedLeads.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 font-medium text-slate-900">{row.name}</td>
                            <td className="p-2 text-blue-600">{row.phone}</td>
                            <td className="p-2 text-slate-600 truncate max-w-[120px]">{row.interestedProperty}</td>
                            <td className="p-2 text-slate-600">{row.preferredLocation}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isImporting || parsedLeads.length === 0}
                  onClick={handleBulkImport}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isImporting ? 'Importing Leads...' : `Import ${parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : 'Leads'}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
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
                      className="text-slate-400 hover:text-red-600 p-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmLead._id}
                onClick={confirmDeleteLead}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
