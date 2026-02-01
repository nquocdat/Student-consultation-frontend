import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LecturerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- GỌI API LẤY THÔNG BÁO ---
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/notifications", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (error) {
                console.error("Lỗi tải thông báo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Helper: Màu sắc badge
    const getBadgeColor = (type) => {
        switch (type) {
            case "WARNING": return "bg-warning text-dark";
            case "ALERT": return "bg-danger";
            default: return "bg-info text-dark"; // INFO
        }
    };

    // Helper: Tên loại thông báo
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
                <i className="bi bi-bell-fill me-2"></i>Thông Báo Từ Nhà Trường
            </h3>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Đang tải thông báo...</p>
                </div>
            ) : (
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {notifications.length === 0 ? (
                            <div className="text-center py-5 text-muted bg-white rounded shadow-sm">
                                <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                                Hiện chưa có thông báo nào.
                            </div>
                        ) : (
                            <div className="list-group shadow-sm">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="list-group-item p-4 border-0 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <span className={`badge rounded-pill me-2 ${getBadgeColor(notif.type)}`}>
                                                    {getTypeName(notif.type)}
                                                </span>
                                                <span className="text-muted small">
                                                    <i className="bi bi-clock me-1"></i>
                                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h5 className="fw-bold text-primary mb-2">{notif.title}</h5>
                                        
                                        <div className="text-dark opacity-75" style={{whiteSpace: "pre-line"}}>
                                            {notif.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}