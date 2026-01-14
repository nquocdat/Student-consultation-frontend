import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset trạng thái cũ
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            // Gọi API Backend
            // Lưu ý: Backend dùng @RequestParam nên ta truyền kiểu query param (?email=...)
            const response = await axios.post(
                `http://localhost:8080/api/auth/forgot-password?email=${email}`
            );

            // Nếu thành công
            setMessage(response.data); // "Mật khẩu mới đã được gửi..."
        } catch (err) {
            // Nếu lỗi (400, 500)
            if (err.response && err.response.data) {
                setError(err.response.data); // Lấy tin nhắn lỗi từ Backend trả về
            } else {
                setError("Có lỗi xảy ra, vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Quên Mật Khẩu</h2>
                <p>Nhập email của bạn để nhận mật khẩu mới.</p>

                {/* Hiển thị thông báo thành công hoặc lỗi */}
                {message && <div style={styles.success}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
                    </button>
                </form>

                <div style={styles.link}>
                    <Link to="/login">Quay lại Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

// CSS nội tuyến đơn giản (Bạn có thể chuyển sang file .css riêng)
const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5'
    },
    card: {
        width: '400px', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', textAlign: 'center'
    },
    inputGroup: { marginBottom: '15px' },
    input: {
        width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px'
    },
    success: { color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' },
    error: { color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' },
    link: { marginTop: '15px', fontSize: '14px' }
};

export default ForgotPassword;