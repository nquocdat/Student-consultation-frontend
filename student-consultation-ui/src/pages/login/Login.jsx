import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { saveAuth } from "../../utils/auth";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.login(username, password);
      const { token, role } = res.data;
      
      saveAuth(token, role);

      // Timeout nhỏ để trải nghiệm mượt mà hơn (tùy chọn)
      setTimeout(() => {
        if (role === "STUDENT") {
            navigate("/student/consultation"); // Hoặc đường dẫn bạn muốn
        } else if (role === "LECTURER") {
            navigate("/lecturer/dashboard");
        }
      }, 500);

    } catch (err) {
      setError("❌ Sai tài khoản hoặc mật khẩu!");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-section">
          {/* Dùng link ảnh online cho code gọn, load nhanh */}
          <img 
          src = "https://hunre.edu.vn/media/data/docs/thong-bao/2019/logo.jpg"
            alt="Logo HUNRE" 
            className="logo"
          />
          <div className="school-name">Trường Đại học Tài Nguyên & Môi Trường Hà Nội</div>
          <h2 className="portal-name">Cổng Tư Vấn Học Đường</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Tên đăng nhập / Mã SV</label>
            
            {/* 👇 Cấu trúc chuẩn để CSS không bị lệch */}
            <div className="input-wrapper">
              {/* <span className="input-icon">👤</span>  */}
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
              {/* <span className="input-icon">🔒</span> */}
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

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="footer-text">
          Hệ thống hỗ trợ sinh viên - HUNRE <br/>
          Hỗ trợ kỹ thuật: support@hunre.edu.vn
        </div>
      </div>
    </div>
  );
};

export default Login;