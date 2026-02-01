import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    
    // 🔥 Thêm field 'type' vào state, mặc định là INFO
    const [newNotif, setNewNotif] = useState({ title: "", content: "", type: "INFO" });
    const [loading, setLoading] = useState(false);

    // --- LẤY DỮ LIỆU ---
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // --- TẠO THÔNG BÁO ---
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newNotif.title || !newNotif.content) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Gửi cả type lên server
            await axios.post("http://localhost:8080/api/notifications", newNotif, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewNotif({ title: "", content: "", type: "INFO" }); // Reset form về mặc định
            fetchNotifications(); 
            alert("Đăng thông báo thành công!");
        } catch (error) {
            alert("Lỗi khi đăng thông báo");
        } finally {
            setLoading(false);
        }
    };

    // --- XÓA THÔNG BÁO ---
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa thông báo này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            alert("Lỗi khi xóa");
        }
    };

    // Helper: Lấy màu badge dựa trên loại thông báo
    const getBadgeColor = (type) => {
        switch (type) {
            case "WARNING": return "bg-warning text-dark"; // Màu vàng
            case "ALERT": return "bg-danger";   // Màu đỏ
            default: return "bg-info text-dark"; // Màu xanh (INFO)
        }
    };

    // Helper: Lấy tên hiển thị tiếng Việt
    const getTypeName = (type) => {
        switch (type) {
            case "WARNING": return "Lưu ý";
            case "ALERT": return "Khẩn cấp";
            default: return "Tin tức";
        }
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">
                <i className="bi bi-bell-fill me-2"></i>Quản Lý Thông Báo Chung
            </h3>

            <div className="row g-4">
                {/* --- CỘT TRÁI: FORM TẠO --- */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Soạn thông báo mới</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tiêu đề</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Ví dụ: Lịch nghỉ tết..."
                                        value={newNotif.title}
                                        onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                                        required
                                    />
                                </div>

                                {/* 🔥 MỚI: DROPDOWN CHỌN LOẠI */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Loại thông báo</label>
                                    <select 
                                        className="form-select"
                                        value={newNotif.type}
                                        onChange={e => setNewNotif({...newNotif, type: e.target.value})}
                                    >
                                        <option value="INFO">ℹ️ Tin tức chung (Info)</option>
                                        <option value="WARNING">⚠️ Lưu ý quan trọng (Warning)</option>
                                        <option value="ALERT">🔥 Thông báo khẩn (Alert)</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nội dung</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="5"
                                        placeholder="Nhập nội dung chi tiết..."
                                        value={newNotif.content}
                                        onChange={e => setNewNotif({...newNotif, content: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                <button className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Đang đăng..." : <><i className="bi bi-send-fill me-2"></i>Đăng thông báo</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: DANH SÁCH --- */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Danh sách đã đăng</h6>
                        </div>
                        <div className="card-body p-0">
                            {notifications.length === 0 ? (
                                <div className="text-center py-5 text-muted">Chưa có thông báo nào</div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="list-group-item p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="w-100">
                                                    <div className="d-flex align-items-center mb-1">
                                                        {/* 🔥 HIỂN THỊ BADGE MÀU */}
                                                        <span className={`badge me-2 ${getBadgeColor(notif.type)}`}>
                                                            {getTypeName(notif.type)}
                                                        </span>
                                                        <h6 className="fw-bold text-primary mb-0">{notif.title}</h6>
                                                    </div>
                                                    
                                                    <small className="text-muted d-block mb-2 ms-1">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                    </small>
                                                    <p className="mb-0 text-dark opacity-75">{notif.content}</p>
                                                </div>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm border-0 ms-2"
                                                    onClick={() => handleDelete(notif.id)}
                                                    title="Xóa thông báo"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}