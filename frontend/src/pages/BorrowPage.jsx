import { useEffect, useState } from "react";
import { createBook, deleteBook, listBooks, updateBook } from "../api/booksApi";
import { motion, AnimatePresence } from "framer-motion";

const empty = { title: "", author: "", category: "", quantity: 0, publishedYear: new Date().getFullYear() };
const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Children", "Academic", "Reference", "Other"];

const validateBook = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.author.trim()) errors.author = "Author is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
    errors.quantity = "Quantity must be 0 or greater.";
  }
  if (!form.publishedYear || Number.isNaN(Number(form.publishedYear))) {
    errors.publishedYear = "Published year is required.";
  } else if (form.publishedYear < 1000 || form.publishedYear > new Date().getFullYear()) {
    errors.publishedYear = "Enter a valid year.";
  }
  return errors;
};

export default function BooksPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const load = () =>
    listBooks()
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e.response?.data?.message || "Load failed"));

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `block w-full px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      fieldErrors[key] 
        ? "border-red-500 bg-red-50" 
        : focusedField === key 
        ? "border-blue-500 bg-blue-50" 
        : "border-gray-300 bg-white"
    } text-gray-900 placeholder-gray-400`;

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    const errors = validateBook(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        publishedYear: Number(form.publishedYear),
      };
      if (editId) await updateBook(editId, payload);
      else await createBook(payload);
      setForm(empty);
      setEditId(null);
      setFieldErrors({});
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const edit = (r) => {
    setEditId(r._id);
    setForm({
      title: r.title,
      author: r.author,
      category: r.category,
      quantity: r.quantity,
      publishedYear: r.publishedYear,
    });
    setFieldErrors({});
  };

  const remove = async (id) => {
    if (!confirm("Delete this book?")) return;
    setErr("");
    setLoading(true);
    try {
      await deleteBook(id);
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || row.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const uniqueCategories = [...new Set(rows.map(row => row.category))];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Book Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your library collection, add new books, and track inventory</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-lg border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-medium uppercase">Total Titles</p>
              <p className="text-2xl font-bold text-blue-800">{rows.length}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 shadow-lg border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs font-medium uppercase">Total Copies</p>
              <p className="text-2xl font-bold text-purple-800">{totalQuantity}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 shadow-lg border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs font-medium uppercase">Categories</p>
              <p className="text-2xl font-bold text-green-800">{uniqueCategories.length}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 shadow-lg border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-xs font-medium uppercase">Avg Copies/Title</p>
              <p className="text-2xl font-bold text-orange-800">{rows.length ? (totalQuantity / rows.length).toFixed(1) : 0}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {err && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg bg-red-50 border border-red-200 p-3"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-xs text-red-700">{err}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {editId ? (
              <>
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Book
              </>
            ) : (
              <>
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Add New Book
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={save} className="p-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Title *
              </label>
              <input
                className={inputClass("title")}
                placeholder="Enter book title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                className={inputClass("author")}
                placeholder="Enter author name"
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                onFocus={() => setFocusedField("author")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.author && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.author}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className={inputClass("category")}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.category}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                className={inputClass("quantity")}
                type="number"
                min={0}
                placeholder="Number of copies"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                onFocus={() => setFocusedField("quantity")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.quantity && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.quantity}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published Year *
              </label>
              <input
                className={inputClass("publishedYear")}
                type="number"
                placeholder="Year of publication"
                value={form.publishedYear}
                onChange={(e) => setField("publishedYear", e.target.value)}
                onFocus={() => setFocusedField("publishedYear")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.publishedYear && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.publishedYear}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-100"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                editId ? "Update Book" : "Add Book"
              )}
            </button>
            {editId && (
              <button
                type="button"
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => {
                  setEditId(null);
                  setForm(empty);
                  setFieldErrors({});
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="text-sm text-gray-500 flex items-center">
          {filteredRows.length} / {rows.length} books
        </div>
      </div>

      {/* Books Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredRows.map((r, index) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{r.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.author}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        r.quantity > 10 ? 'bg-green-100 text-green-700' :
                        r.quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.quantity} copies
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.publishedYear}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => edit(r)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(r._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredRows.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mt-2 text-gray-500">No books found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
        <p>Total Books: {rows.length} | Total Copies: {totalQuantity} | Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}