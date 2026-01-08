import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { saveAuth } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.login(username, password);

      const { token, role } = res.data;

      saveAuth(token, role);

      // Điều hướng theo role
      if (role === "STUDENT") {
        navigate("/student/appointments");
      } else if (role === "LECTURER") {
        navigate("/lecturer/appointments");
      }
    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Mã sinh viên / Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;

// style đơn giản
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  form: {
    width: 320,
    padding: 20,
    background: "#fff",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  error: {
    color: "red",
    fontSize: 14,
  },
};
