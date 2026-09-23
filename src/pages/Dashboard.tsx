import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Download
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 bg-[#0c1a13] rounded-2xl border border-gold-500/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Luxury Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-400 font-sans">
              Jaipur • Ajmer • Kishangarh • Mumbai
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-stone-300 max-w-xl">
            Real-time multi-market visibility over active township inventory, buyer enquiries, job candidate pipelines, and digital content.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-3">
          <Link
            to="/properties"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-extrabold shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center space-x-1.5"
          >
            <span>+ Add New Property</span>
          </Link>
          <a
            href={enquiryService.exportCSV()}
            download
            className="px-4 py-2.5 rounded-xl bg-[#122b1f] hover:bg-[#1a3d2c] border border-gold-500/30 text-gold-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Luxury Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Properties Card */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-3 hover:border-gold-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Total Properties</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-editorial text-gold-300">
              {stats?.totalProperties || 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">Across 4 Cities</span>
          </div>
          <Link to="/properties" className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center space-x-1 pt-1 border-t border-gold-500/10">
            <span>Manage Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Leads Card */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-3 hover:border-gold-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Buyer Enquiries</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-editorial text-gold-300">
              {stats?.totalEnquiries || 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">{stats?.newEnquiries || 0} New</span>
          </div>
          <Link to="/leads" className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center space-x-1 pt-1 border-t border-gold-500/10">
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Job Applications Card */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-3 hover:border-gold-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Job Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-editorial text-gold-300">
              {stats?.totalApplications || 0}
            </span>
            <span className="text-[11px] text-blue-400 font-semibold">Resumes Received</span>
          </div>
          <Link to="/applications" className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center space-x-1 pt-1 border-t border-gold-500/10">
            <span>Review Candidates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Published Blogs Card */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-3 hover:border-gold-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Articles & Media</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-editorial text-gold-300">
              {stats?.publishedBlogs || 0}
            </span>
            <span className="text-[11px] text-purple-400 font-semibold">Published Blogs</span>
          </div>
          <Link to="/blogs" className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center space-x-1 pt-1 border-t border-gold-500/10">
            <span>Compose Article</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Multi-Market Summary Bar */}
      <div className="bg-[#0b1712] p-5 rounded-2xl border border-gold-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Territory Coverage</h3>
              <p className="text-xs text-stone-400">All 4 regions actively accepting customer enquiries and showing on public navigation</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold">
              🏰 Jaipur (HQ Hub)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              🕌 Ajmer (Corridor)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              🏛️ Kishangarh (Marble City)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-bold">
              🌊 Mumbai (Coastal Hub)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden space-y-4">
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-editorial text-gold-300">
              Latest Property Leads & Enquiries
            </h3>
            <p className="text-xs text-stone-400">Real-time incoming customer interest with automated email alerts</p>
          </div>
          <Link to="/leads" className="text-xs font-bold text-gold-400 hover:text-white transition-colors">
            View Complete CRM →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 font-extrabold border-b border-gold-500/20 uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Interested Scheme</th>
                <th className="p-4">Budget / Location</th>
                <th className="p-4">CRM Status</th>
                <th className="p-4">Received Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152e22]">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No leads recorded yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((lead) => (
                  <tr key={lead._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {lead.name}
                      {lead.email && <span className="block text-[11px] font-normal text-stone-400">{lead.email}</span>}
                    </td>
                    <td className="p-4">
                      <a href={`tel:${lead.phone}`} className="font-semibold text-gold-400 hover:underline">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-stone-200">
                      {lead.interestedProperty || 'General Portfolio'}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gold-400">{lead.budget || 'Any Budget'}</span>
                      <span className="block text-[11px] text-stone-400">{lead.preferredLocation || 'Rajasthan / MMR'}</span>
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
                        <option value="Site Visit Scheduled">Site Visit</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-stone-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
