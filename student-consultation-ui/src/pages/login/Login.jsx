import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { saveAuth } from "../../utils/auth";
import axios from "axios"; // 👈 QUAN TRỌNG: Thêm thư viện này để gọi API
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE QUÊN MẬT KHẨU ---
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");

  // --- LOGIC ĐĂNG NHẬP (GIỮ NGUYÊN) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.login(username, password);
      const { token, role } = res.data;
      
      saveAuth(token, role);

      setTimeout(() => {
        if (role === "STUDENT") {
            navigate("/student/create-request");
        } else if (role === "LECTURER") {
            navigate("/lecturer/dashboard");
        }
      }, 500);

    } catch (err) {
      setError("❌ Sai tài khoản hoặc mật khẩu!");
      setIsLoading(false);
    }
  };

  // --- LOGIC XỬ LÝ QUÊN MẬT KHẨU (ĐÃ SỬA THÀNH API THẬT) ---
  const handleForgotPassword = async (e) => { // 👈 Thêm async
    e.preventDefault();
    if(!email) {
        setError("Vui lòng nhập email!");
        return;
    }
    
    setIsLoading(true);
    setError(""); // Xóa lỗi cũ

    try {
        // 👇 GỌI API THẬT SANG BACKEND
        // Lưu ý: Đảm bảo Backend đang chạy ở cổng 8080
        const response = await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);

        // Nếu thành công (Backend trả về 200 OK)
        alert(response.data); // Hiện thông báo từ Backend: "Mật khẩu mới đã được gửi..."
        
        // Reset lại form
        setIsForgotPassword(false); 
        setEmail("");
        
    } catch (err) {
        // Nếu lỗi (Backend trả về lỗi hoặc không kết nối được)
        console.error("Lỗi gửi mail:", err);
        const errorMsg = err.response ? err.response.data : "Không thể kết nối đến Server!";
        setError("❌ " + errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-section">
          <img 
            src="https://hunre.edu.vn/media/data/docs/thong-bao/2019/logo.jpg"
            alt="Logo HUNRE" 
            className="logo"
          />
          <div className="school-name">Trường Đại học Tài Nguyên & Môi Trường Hà Nội</div>
          <h2 className="portal-name">Cổng Tư Vấn Học Đường</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* --- DÙNG ĐIỀU KIỆN ĐỂ HIỂN THỊ FORM --- */}
        {!isForgotPassword ? (
            // === FORM ĐĂNG NHẬP (CŨ) ===
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Tên đăng nhập / Mã SV</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: sv2024..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 👇 LINK QUÊN MẬT KHẨU */}
              <div style={{ textAlign: "right", marginBottom: "15px" }}>
                <span 
                    style={{ color: "#007bff", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
                    onClick={() => {
                        setIsForgotPassword(true);
                        setError(""); // Xóa lỗi cũ nếu có
                    }}
                >
                    Quên mật khẩu?
                </span>
              </div>

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>
        ) : (
            // === FORM QUÊN MẬT KHẨU (MỚI) ===
            <form onSubmit={handleForgotPassword}>
                <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Khôi phục mật khẩu</h3>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", textAlign: "center" }}>
                    Nhập email nhà trường cấp để nhận liên kết đặt lại mật khẩu.
                </p>

                <div className="input-group">
                    <label>Email xác thực</label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="email@hunre.edu.vn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <button type="submit" className="btn-login" disabled={isLoading} style={{ marginTop: "10px" }}>
                    {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>

                {/* NÚT QUAY LẠI */}
                <button 
                    type="button" 
                    className="btn-login" 
                    style={{ backgroundColor: "#6c757d", marginTop: "10px" }}
                    onClick={() => {
                        setIsForgotPassword(false);
                        setError("");
                    }}
                >
                    Quay lại đăng nhập
                </button>
            </form>
        )}

        <div className="footer-text">
          Hệ thống hỗ trợ sinh viên - HUNRE <br/>
          Hỗ trợ kỹ thuật: support@hunre.edu.vn
        </div>
      </div>
    </div>
  );
};

export default Login;