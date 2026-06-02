import api from "./client";

export const fetchStats = () => api.get("/dashboard/stats");

// Additional dashboard API calls if needed
export const fetchTopBorrowers = () => api.get("/dashboard/top-borrowers");
export const fetchPopularBooks = () => api.get("/dashboard/popular-books");
export const fetchCirculationStats = () => api.get("/dashboard/circulation");