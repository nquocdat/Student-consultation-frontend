import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// 🔥 1. IMPORT AXIOS VÀ ROUTER
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// ========================================================
// 🔥 2. CẤU HÌNH AXIOS TOÀN CỤC (GLOBAL CONFIG)
// ========================================================

// A. Thiết lập đường dẫn gốc (Sau này gọi api chỉ cần gõ "/students/..." là được)
axios.defaults.baseURL = "http://localhost:8080";

// B. REQUEST INTERCEPTOR: Tự động gắn Token vào mọi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// C. RESPONSE INTERCEPTOR: Tự động bắt lỗi 503 (Bảo trì)
axios.interceptors.response.use(
  (response) => {
    return response; // Nếu API trả về thành công thì cho qua
  },
  (error) => {
    // Nếu API trả về lỗi 503 (Service Unavailable) -> Chặn lại và đá sang trang bảo trì
    if (error.response && error.response.status === 503) {
      // Kiểm tra để tránh reload trang liên tục nếu đang ở trang maintenance rồi
      if (window.location.pathname !== "/maintenance") {
        window.location.href = "/maintenance";
      }
    }
    return Promise.reject(error);
  }
);

// ========================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Bọc BrowserRouter ở ngoài cùng để dùng được các tính năng Router trong App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();