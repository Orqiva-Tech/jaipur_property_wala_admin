import React, { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  BookOpen, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Bold, 
  Italic, 
  Heading as HeadingIcon, 
  List, 
  Quote, 
  Eye, 
  Edit3, 
  Check, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { blogService, propertyService } from '../services/api';
import { Blog } from '../types';

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Clean, empty default form with no dummy content
  const initialForm = {
    title: '',
    category: 'JDA Plots & Investment Guide',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'Jaipur Property Wala',
    readTime: '5 min read',
    tags: '',
    isPublished: true
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<'write' | 'preview'>('write');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(blogs.length / itemsPerPage) || 1;
  const paginatedBlogs = blogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setCoverUploadError(null);
    setShowManualUrlInput(false);
    setActiveContentTab('write');
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      category: blog.category || 'JDA Plots & Investment Guide',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      author: blog.author || 'Jaipur Property Wala',
      readTime: blog.readTime || '5 min read',
      tags: blog.tags ? blog.tags.join(', ') : '',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true
    });
    setCoverUploadError(null);
    setShowManualUrlInput(false);
    setActiveContentTab('write');
    setIsModalOpen(true);
  };

  // Direct image upload from local computer / mobile device
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setCoverUploadError(null);

    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, coverImage: res.data.url }));
      } else {
        throw new Error('Image URL not received from server');
      }
    } catch (err: any) {
      console.error('Error uploading cover photo', err);
      setCoverUploadError(err.response?.data?.message || 'Failed to upload photo from your device. Please try again.');
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to insert formatting tags around selection or at cursor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content || '';
    const selected = currentText.substring(start, end);
    const replacement = prefix + (selected || '') + suffix;
    const updated = currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData(prev => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + (selected ? selected.length : 0);
      textarea.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  // Automatically format plain text into clean paragraphs for the website
  const formatContentForSaving = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    // If it already contains HTML tags like <p>, <h3>, <ul>, etc., preserve it
    if (/<(p|h[1-6]|ul|ol|li|div|blockquote|b|strong|i|em)[^>]*>/i.test(trimmed)) {
      return trimmed;
    }
    // Convert regular newlines / paragraphs to clean <p> tags
    return trimmed
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n\n');
  };

  // Helper for live preview rendering
  const getPreviewHtml = () => {
    return formatContentForSaving(formData.content || '');
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
        content: formatContentForSaving(formData.content),
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : []
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
    <div className="space-y-6 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Content & SEO Marketing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Blog Articles & Educational Guides
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Publish educational articles about JDA approval guidelines, upcoming infrastructure corridors, and high ROI property schemes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[650px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Article Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Loading articles...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">No blog articles created yet.</td>
                </tr>
              ) : (
                paginatedBlogs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 flex items-center space-x-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="truncate max-w-sm font-bold text-slate-900">{b.title}</span>
                    </td>
                    <td className="p-4 text-slate-700">{b.category}</td>
                    <td className="p-4 text-slate-500">{b.author}</td>
                    <td className="p-4">
                      {b.isPublished ? (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                        title="Delete Article"
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

        {/* Pagination Bar */}
        {blogs.length > 0 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, blogs.length)}</span> of <span className="font-bold text-slate-900">{blogs.length}</span> articles
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? 'Edit Article' : 'Compose Blog Article'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingId ? 'Update and republish your real estate article' : 'Write and publish a fresh article for website visitors'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter article title (e.g. 5 Checkpoints Before Buying a JDA Approved Plot)"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="JDA Plots & Investment Guide">JDA Plots & Investment Guide</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Legal & Documentation">Legal & Documentation</option>
                    <option value="Company News">Company News</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Cover Image Upload (Direct from Device) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Cover Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showManualUrlInput ? 'Hide URL input' : 'Paste image URL directly'}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                  onChange={handleCoverUpload}
                  className="hidden"
                />

                {/* Direct Upload Preview / Dropzone */}
                {formData.coverImage ? (
                  <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5 flex items-center space-x-3">
                    <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      <img
                        src={formData.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 text-emerald-600 text-[11px] font-semibold mb-0.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Cover Image Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">
                        {formData.coverImage}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: '' })}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingCover && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      uploadingCover
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30'
                    }`}
                  >
                    {uploadingCover ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-xs font-semibold text-blue-700">
                          Uploading image from your device...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload cover photo from Computer / Phone
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Supports JPG, PNG, WEBP, AVIF (Automatic Cloud Storage)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {coverUploadError && (
                  <div className="mt-1.5 text-[11px] text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{coverUploadError}</span>
                  </div>
                )}

                {/* Optional Manual URL Fallback Input */}
                {showManualUrlInput && (
                  <div className="mt-2.5">
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="Or paste an image URL (e.g. https://...)"
                      className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Short Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Short Excerpt (Summary for Google Search & Previews)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short 1-2 sentence summary of this article..."
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              {/* Clean Article Content Editor */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* Editor Header Toolbar */}
                <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-800 mr-2">
                      Article Content *
                    </span>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<b>', '</b>')}
                      title="Bold text"
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<i>', '</i>')}
                      title="Italic text"
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h3>', '</h3>')}
                      title="Heading"
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold"
                    >
                      <HeadingIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n  <li>Point 2</li>\n</ul>')}
                      title="Bullet points"
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                      title="Quote or Highlight"
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Write vs Preview Tabs */}
                  <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveContentTab('write')}
                      className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                        activeContentTab === 'write'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Write</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveContentTab('preview')}
                      className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                        activeContentTab === 'preview'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>

                {/* Editor Body */}
                {activeContentTab === 'write' ? (
                  <div>
                    <textarea
                      ref={textareaRef}
                      id="blog-content-textarea"
                      rows={8}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Start writing your article here... You can write simple plain text with paragraphs. No complex code or HTML knowledge needed!"
                      className="w-full p-3.5 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed resize-y font-sans"
                    />
                    <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
                      💡 Tip: Press Enter twice for a new paragraph. Use the toolbar buttons above to add bold text, headings, or bullet points.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white min-h-[200px] max-h-[300px] overflow-y-auto">
                    {formData.content?.trim() ? (
                      <div 
                        className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                      />
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs italic">
                        No content written yet. Switch to "Write" tab to type your article.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. JDA Plots, Jaipur, Investment"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="true">Published (Live on Website)</option>
                    <option value="false">Draft (Saved Privately)</option>
                  </select>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
