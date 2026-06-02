import { useEffect, useState } from "react";
import { createStudent, deleteStudent, listStudents, updateStudent } from "../api/studentsApi";
import { motion, AnimatePresence } from "framer-motion";

const GENDERS = ["Male", "Female", "Other"];
const empty = { fullName: "", gender: "Male", className: "", phone: "", email: "" };

const validateStudent = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.gender) errors.gender = "Select gender.";
  else if (!GENDERS.includes(form.gender)) errors.gender = "Select a valid gender.";
  if (!form.className.trim()) errors.className = "Class is required.";
  if (!form.phone.trim()) errors.phone = "Phone is required.";
  else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number (7–15 digits).";
  }
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
};

export default function StudentsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const load = () =>
    listStudents()
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
    const errors = validateStudent(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (editId) await updateStudent(editId, form);
      else await createStudent(form);
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
      fullName: r.fullName,
      gender: r.gender,
      className: r.className,
      phone: r.phone,
      email: r.email,
    });
    setFieldErrors({});
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    setErr("");
    setLoading(true);
    try {
      await deleteStudent(id);
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(row =>
    row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage student records, add new students, and update information</p>
          </div>
        </div>
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
                Edit Student
              </>
            ) : (
              <>
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add New Student
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={save} className="p-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                className={inputClass("fullName")}
                placeholder="Enter full name"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.fullName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                className={inputClass("gender")}
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                onFocus={() => setFocusedField("gender")}
                onBlur={() => setFocusedField(null)}
              >
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              {fieldErrors.gender && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.gender}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <input
                className={inputClass("className")}
                placeholder="Enter class (e.g., Grade 10-A)"
                value={form.className}
                onChange={(e) => setField("className", e.target.value)}
                onFocus={() => setFocusedField("className")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.className && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.className}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                className={inputClass("phone")}
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.phone}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                className={inputClass("email")}
                placeholder="Enter email address"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn">{fieldErrors.email}</p>
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
                editId ? "Update Student" : "Save Student"
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

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search students by name, class, or email..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredRows.length} / {rows.length} students
        </div>
      </div>

      {/* Students Table */}
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
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
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{r.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        r.gender === 'Male' ? 'bg-blue-100 text-blue-700' :
                        r.gender === 'Female' ? 'bg-pink-100 text-pink-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {r.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {r.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.email}</td>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="mt-2 text-gray-500">No students found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
        <p>Total Students: {rows.length} | Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}