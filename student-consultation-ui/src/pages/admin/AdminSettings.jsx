import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSettings() {
    // State lưu cấu hình
    const [config, setConfig] = useState({
        maxRequestsPerDay: 3,
        bookingWindowDays: 7,
        adminEmail: "",
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(false);

    // --- LẤY CẤU HÌNH KHI VÀO TRANG ---
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/admin/settings", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConfig(res.data);
            } catch (error) {
                console.error("Lỗi tải cấu hình:", error);
            }
        };
        fetchConfig();
    }, []);

    // --- XỬ LÝ LƯU CẤU HÌNH ---
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:8080/api/admin/settings", config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Đã lưu cấu hình hệ thống!");
        } catch (error) {
            alert("❌ Lỗi khi lưu cấu hình!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">
                <i className="bi bi-gear-fill me-2"></i>Cấu Hình Hệ Thống
            </h3>

            <div className="row">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Tham số vận hành</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSave}>
                                
                                {/* 1. Email liên hệ */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Email hỗ trợ (Hiển thị cho SV)</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        value={config.adminEmail}
                                        onChange={(e) => setConfig({...config, adminEmail: e.target.value})}
                                    />
                                    <div className="form-text">Email này sẽ hiện ở chân trang của sinh viên.</div>
                                </div>

                                {/* 2. Giới hạn Spam */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Giới hạn yêu cầu / ngày</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={config.maxRequestsPerDay}
                                        onChange={(e) => setConfig({...config, maxRequestsPerDay: e.target.value})}
                                    />
                                    <div className="form-text">Số lượng yêu cầu tối đa một sinh viên được tạo trong 24h.</div>
                                </div>

                                {/* 3. Giới hạn đặt lịch */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Thời gian đặt lịch trước (Ngày)</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={config.bookingWindowDays}
                                        onChange={(e) => setConfig({...config, bookingWindowDays: e.target.value})}
                                    />
                                    <div className="form-text">Ví dụ: Nhập 7 - Sinh viên chỉ thấy lịch rảnh trong 7 ngày tới.</div>
                                </div>

                                <hr className="my-4"/>

                                {/* 4. Chế độ bảo trì (Switch) */}
                                <div className="mb-4 p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                                    <div>
                                        <label className="form-check-label fw-bold mb-1 d-block text-danger">Chế độ bảo trì</label>
                                        <small className="text-muted">Khi bật, chỉ Admin mới có thể đăng nhập.</small>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            style={{width: '3em', height: '1.5em', cursor: 'pointer'}}
                                            checked={config.maintenanceMode}
                                            onChange={(e) => setConfig({...config, maintenanceMode: e.target.checked})}
                                        />
                                    </div>
                                </div>

                                {/* Nút Lưu */}
                                <button className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                                    {loading ? "Đang lưu..." : <><i className="bi bi-save me-2"></i>Lưu Thay Đổi</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Phần giải thích bên phải (Optional) */}
                <div className="col-md-6">
                    <div className="alert alert-info border-0 shadow-sm">
                        <h5 className="alert-heading fw-bold"><i className="bi bi-info-circle me-2"></i>Hướng dẫn</h5>
                        <p>
                            Tại đây bạn có thể điều chỉnh các tham số hoạt động của hệ thống mà không cần can thiệp vào mã nguồn.
                        </p>
                        <hr />
                        <ul className="mb-0 ps-3">
                            <li className="mb-2"><strong>Giới hạn yêu cầu:</strong> Giúp ngăn chặn việc spam hệ thống.</li>
                            <li className="mb-2"><strong>Thời gian đặt lịch:</strong> Giúp giảng viên kiểm soát lịch trình tốt hơn.</li>
                            <li><strong>Chế độ bảo trì:</strong> Dùng khi bạn cần nâng cấp hệ thống hoặc sửa lỗi gấp.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}