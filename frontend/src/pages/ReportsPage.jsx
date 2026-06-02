import { useState } from "react";
import { reportBooks, reportBorrowed, reportReturned, reportStudents } from "../api/reportsApi";
import { motion, AnimatePresence } from "framer-motion";

function formatPrintDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ReportsPage() {
  const [tab, setTab] = useState("students");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (t) => {
    setTab(t);
    setErr("");
    setData(null);
    setLoading(true);
    try {
      let res;
      if (t === "students") res = await reportStudents();
      else if (t === "books") res = await reportBooks();
      else if (t === "borrowed") res = await reportBorrowed();
      else res = await reportReturned();
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const printNow = () => window.print();

  const nowLabel = new Date().toLocaleString();

  const getTabIcon = (tabName) => {
    switch(tabName) {
      case 'students':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'books':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'borrowed':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'returned':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">Generate and print library reports</p>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="no-print">
        <div className="flex flex-wrap gap-2 mb-6">
          {['students', 'books', 'borrowed', 'returned'].map((tabName) => (
            <motion.button
              key={tabName}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                tab === tabName
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
              onClick={() => load(tabName)}
            >
              {getTabIcon(tabName)}
              {tabName === 'students' && 'All Students'}
              {tabName === 'books' && 'All Books'}
              {tabName === 'borrowed' && 'Borrowed Books'}
              {tabName === 'returned' && 'Returned Books'}
            </motion.button>
          ))}
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="ml-auto px-5 py-2.5 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md flex items-center gap-2"
            onClick={printNow}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </motion.button>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!loading && !err && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="lms-report-print"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none"
        >
          {/* Report Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 print:bg-white print:border-black">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800 print:text-black">
                  Library Management System
                </h2>
                <h3 className="text-lg font-semibold text-gray-700 mt-1 print:text-black">
                  {tab === "students" && "Student Report"}
                  {tab === "books" && "Books Catalog Report"}
                  {tab === "borrowed" && "Currently Borrowed Books Report"}
                  {tab === "returned" && "Returned Books History Report"}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 print:text-black">Generated: {nowLabel}</p>
                {data?.generatedAt && (
                  <p className="text-xs text-gray-500 print:text-black mt-1">
                    Data snapshot: {formatPrintDate(data.generatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6">
            {!data && !err && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-500">Select a report from the buttons above</p>
              </div>
            )}

            {/* Students Report */}
            {data?.rows && tab === "students" && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Total Students: {data.rows.length}
                  </h4>
                  <div className="text-xs text-gray-500">
                    Last updated: {formatPrintDate(data.generatedAt)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 print:bg-white print:border-black">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.rows.map((r, index) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{r.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              r.gender === 'Male' ? 'bg-blue-100 text-blue-700' :
                              r.gender === 'Female' ? 'bg-pink-100 text-pink-700' :
                              'bg-gray-100 text-gray-700'
                            } print:bg-transparent print:text-black`}>
                              {r.gender}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.className}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.email}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Books Report */}
            {data?.rows && tab === "books" && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Total Books: {data.rows.length}
                  </h4>
                  <div className="text-xs text-gray-500">
                    Total Copies: {data.rows.reduce((sum, book) => sum + book.quantity, 0)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 print:bg-white print:border-black">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.rows.map((r, index) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{r.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.author}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 print:bg-transparent print:text-black">
                              {r.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              r.quantity > 10 ? 'bg-green-100 text-green-700' :
                              r.quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            } print:bg-transparent print:text-black`}>
                              {r.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.publishedYear}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Borrowed/Returned Reports */}
            {data?.rows && (tab === "borrowed" || tab === "returned") && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Total Records: {data.rows.length}
                  </h4>
                  <div className="text-xs text-gray-500">
                    {tab === "borrowed" ? "Currently active borrowings" : "Historical return records"}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 print:bg-white print:border-black">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Borrowed</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Returned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.rows.map((r, index) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{r.student?.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{r.book?.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.borrowDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.returnDueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">
                            {r.returnedAt ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {new Date(r.returnedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-yellow-600">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Not Returned
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Report Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 print:bg-white print:border-black">
            <div className="text-xs text-gray-500 text-center print:text-black">
              <p>This report is generated automatically by the Library Management System</p>
              <p className="mt-1">© {new Date().getFullYear()} LMS - All Rights Reserved</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}