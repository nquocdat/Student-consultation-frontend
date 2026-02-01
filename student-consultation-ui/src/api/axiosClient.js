import axios from "axios";

const axiosClient = axios.create({
   
    baseURL: "http://localhost:8080", 
});

// 1. REQUEST INTERCEPTOR (Giữ nguyên đoạn code cũ của bạn)
// Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==========================================================
// 🔥 2. RESPONSE INTERCEPTOR (THÊM ĐOẠN NÀY VÀO)
// Tự động bắt lỗi khi Backend trả về
// ==========================================================
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API trả về thành công -> Trả về data bình thường
        return response; 
    },
    (error) => {
        // 🔥 KIỂM TRA NẾU LÀ LỖI 503 (BẢO TRÌ)
        if (error.response && error.response.status === 503) {
            // Nếu đang không ở trang maintenance thì mới chuyển hướng (tránh loop vô tận)
            if (window.location.pathname !== "/maintenance") {
                window.location.href = "/maintenance";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;