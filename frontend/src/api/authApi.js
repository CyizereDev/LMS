import api from "./client";

export const registerUser = (body) => api.post("/auth/register", body);
export const loginUser = (body) => api.post("/auth/login", body);
export const fetchMe = () => api.get("/auth/me");
export const logoutUser = () => api.post("/auth/logout");