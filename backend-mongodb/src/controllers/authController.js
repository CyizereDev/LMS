const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalize = (value) => String(value || "").trim().toLowerCase();
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }
    
    // Normalize inputs
    const normalizedUsername = normalize(username);
    const normalizedEmail = normalizeEmail(email);
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already taken" 
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Determine role - FIXED: Use 'librarian' as default instead of 'user'
    let userRole = 'librarian'; // ✅ Changed from 'user' to 'librarian'
    if (role === 'admin') {
      userRole = 'admin';
    }
    // If role is 'librarian' from frontend, keep it as 'librarian'
    if (role === 'librarian') {
      userRole = 'librarian';
    }
    
    // Create new user
    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: userRole, // Now this will be either 'admin' or 'librarian'
    });
    
    await newUser.save();
    
    // Auto-login after registration
    req.session.userId = String(newUser._id);
    req.session.username = newUser.username;
    req.session.role = newUser.role;
    
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Registration failed" 
    });
  }
};

const login = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = String(user._id);
    req.session.username = user.username;
    req.session.role = user.role;
    return res.json({
      message: "Login successful",
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required." });
    }
    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: "Confirm password is required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match.",
      });
    }
    const emailNorm = normalizeEmail(email);
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const me = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({
    username: req.session.username,
    role: req.session.role,
  });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

module.exports = { login, register, forgotPassword, me, logout };