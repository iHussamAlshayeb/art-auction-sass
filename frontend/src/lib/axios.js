import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:3000/api/v1",
  baseURL: "https://api.fanan3.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default api;
