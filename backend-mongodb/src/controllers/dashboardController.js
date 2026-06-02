const Book = require("../models/Book");
const Student = require("../models/Student");
const Borrow = require("../models/Borrow");

const stats = async (_req, res) => {
  try {
    // Get total number of unique book titles
    const totalBookTitles = await Book.countDocuments();
    
    // Get total number of students
    const totalStudents = await Student.countDocuments();
    
    // Get total copies of all books
    const totalCopiesResult = await Book.aggregate([
      { $group: { _id: null, sum: { $sum: "$quantity" } } }
    ]);
    const totalCopiesInLibrary = totalCopiesResult[0]?.sum ?? 0;
    
    // Get currently borrowed books (not returned)
    const borrowedActive = await Borrow.countDocuments({ returnedAt: null });
    
    // Get total returned books (all time)
    const returnedCount = await Borrow.countDocuments({ returnedAt: { $ne: null } });
    
    // Get late returns (returned after due date)
    const lateReturned = await Borrow.countDocuments({
      returnedAt: { $ne: null },
      $expr: { $gt: ["$returnedAt", "$returnDueDate"] }
    });
    
    // Get currently overdue books (not returned and past due date)
    const now = new Date();
    const overdueActive = await Borrow.countDocuments({
      returnedAt: null,
      returnDueDate: { $lt: now }
    });
    
    // Optional: Get additional stats
    const availableCopies = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$availableQuantity" } } }
    ]);
    const totalAvailableCopies = availableCopies[0]?.total ?? 0;
    
    // Get borrowed books count by each student (top borrowers)
    const topBorrowers = await Borrow.aggregate([
      { $match: { returnedAt: { $ne: null } } },
      { $group: { _id: "$studentId", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { $project: { name: "$student.name", borrowCount: 1 } }
    ]);
    
    // Get most borrowed books
    const popularBooks = await Borrow.aggregate([
      { $match: { returnedAt: { $ne: null } } },
      { $group: { _id: "$bookId", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      { $project: { title: "$book.title", borrowCount: 1 } }
    ]);
    
    // Calculate circulation rate
    const circulationRate = totalCopiesInLibrary > 0 
      ? ((borrowedActive / totalCopiesInLibrary) * 100).toFixed(1)
      : 0;
    
    return res.json({
      totalBookTitles,
      totalCopiesInLibrary,
      totalAvailableCopies,
      totalStudents,
      borrowedActive,
      returnedCount,
      lateReturned,
      overdueActive,
      circulationRate: parseFloat(circulationRate),
      topBorrowers,
      popularBooks
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { stats };