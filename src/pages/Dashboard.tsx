import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Download,
  Plus
} from 'lucide-react';
import { adminService, enquiryService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data.stats);
      setRecentEnquiries(res.data.recentEnquiries || []);
    } catch (error) {
      console.error('Error fetching admin dashboard metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      await enquiryService.updateStatus(enquiryId, { status: newStatus });
      fetchStats();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async (e: React.MouseEvent) => {
    e.preventDefault();
    setExporting(true);
    try {
      await enquiryService.downloadCSV();
    } catch (err: any) {
      console.error('Export error, opening direct link', err);
      window.open(enquiryService.exportCSV(), '_blank');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 antialiased">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Live Operations Dashboard
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Real-time monitoring across township inventory, buyer enquiries, job applications, and marketing content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/properties"
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Properties Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Properties
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.totalProperties || 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Active Inventory</span>
          </div>
          <Link
            to="/properties"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 pt-2 border-t border-slate-100"
          >
            <span>Manage Inventory</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Leads Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Buyer Enquiries
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.totalEnquiries || 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {stats?.newEnquiries || 0} New
            </span>
          </div>
          <Link
            to="/leads"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 pt-2 border-t border-slate-100"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Job Applications Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Job Applications
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.totalApplications || 0}
            </span>
            <span className="text-[11px] text-purple-600 font-medium">Resumes Received</span>
          </div>
          <Link
            to="/applications"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 pt-2 border-t border-slate-100"
          >
            <span>Review Candidates</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Published Blogs Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Articles & Blogs
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.publishedBlogs || 0}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Published Posts</span>
          </div>
          <Link
            to="/blogs"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 pt-2 border-t border-slate-100"
          >
            <span>Manage Articles</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Active Territory Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Territory Coverage</h3>
            <p className="text-xs text-slate-500">
              All 4 active markets accepting buyer enquiries with automatic routing.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
          <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
            Jaipur (HQ Hub)
          </span>
          <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
            Ajmer (Expressway)
          </span>
          <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
            Kishangarh (Airport)
          </span>
          <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
            Mumbai (Coastal Region)
          </span>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Latest Property Leads & Enquiries
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live incoming customer submissions with automated notifications
            </p>
          </div>
          <Link
            to="/leads"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Complete CRM &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Interested Scheme</th>
                <th className="p-3.5">Budget / Location</th>
                <th className="p-3.5">CRM Status</th>
                <th className="p-3.5">Received Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No leads recorded yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">
                      {lead.name}
                      {lead.email && (
                        <span className="block text-[11px] font-normal text-slate-500">
                          {lead.email}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-3.5 max-w-xs truncate font-medium text-slate-800">
                      {lead.interestedProperty || 'General Portfolio'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900">{lead.budget || 'Any Budget'}</span>
                      <span className="block text-[11px] text-slate-500">
                        {lead.preferredLocation || 'Rajasthan / MMR'}
                      </span>
                    </td>
                    <td className="p-3.5">
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
                        <option value="Site Visit Scheduled">Site Visit</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
