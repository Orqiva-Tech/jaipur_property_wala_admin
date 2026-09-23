import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { blogService } from '../services/api';
import { Blog } from '../types';

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: '',
    category: 'JDA Plots & Investment Guide',
    excerpt: '',
    content: '<p>Write comprehensive real estate article content here...</p>',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    author: 'Jaipur Property Wala Editorial',
    readTime: '5 min read',
    tags: 'JDA Plots, Jaipur, Investment',
    isPublished: true
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogService.getAllAdmin();
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error('Error fetching blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title,
      category: blog.category,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      author: blog.author,
      readTime: blog.readTime,
      tags: blog.tags ? blog.tags.join(', ') : '',
      isPublished: blog.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await blogService.delete(id);
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingId) {
        await blogService.update(editingId, payload);
      } else {
        await blogService.create(payload);
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Real Estate Blog Articles & Insights
          </h1>
          <p className="text-xs text-stone-300">
            Publish educational articles about JDA approval guidelines, upcoming metro extensions, and high ROI property schemes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
              <tr>
                <th className="p-4">Article Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400">Loading articles...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400">No blog articles created yet.</td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#07130e] flex-shrink-0 border border-gold-500/20">
                        <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate max-w-sm text-gold-200">{b.title}</span>
                    </td>
                    <td className="p-4 text-stone-300">{b.category}</td>
                    <td className="p-4 text-stone-400">{b.author}</td>
                    <td className="p-4">
                      {b.isPublished ? (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/40">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-900 text-stone-400 px-2.5 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded bg-[#153125] text-gold-300 hover:bg-gold-500 hover:text-forest-950"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 rounded bg-red-950/60 text-red-300 hover:bg-red-700 hover:text-white"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0d1d16] rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#07130e] to-[#0f281e] p-5 text-white flex justify-between items-center border-b border-gold-500/30">
              <h3 className="text-lg font-bold font-editorial text-gold-300">
                {editingId ? 'Edit Article' : 'Write New Article'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Short Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Article Content (HTML / Markdown) *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-gold-500/20 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-extrabold"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
