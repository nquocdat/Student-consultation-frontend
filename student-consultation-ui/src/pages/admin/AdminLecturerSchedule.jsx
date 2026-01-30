import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ 1. Import useNavigate

export default function AdminLecturerSchedule() {
    const DOMAIN = "http://localhost:8080";
    const navigate = useNavigate(); // ✅ 2. Hook điều hướng

    // --- STATE CŨ (XEM THEO NGÀY) ---
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- STATE MỚI (TÌM KIẾM GIẢNG VIÊN) ---
    const [allLecturers, setAllLecturers] = useState([]); // Chứa danh sách tất cả GV
    const [searchName, setSearchName] = useState("");     // Chứa từ khóa đang nhập
    const [suggestions, setSuggestions] = useState([]);   // Chứa danh sách gợi ý

    // =========================================================
    // 1. LOGIC MỚI: TẢI DANH SÁCH GV ĐỂ TÌM KIẾM
    // =========================================================
    useEffect(() => {
        const fetchAllLecturers = async () => {
            try {
                const token = localStorage.getItem("token");
                // Gọi API lấy danh sách GV (Id, Tên, Email)
                const res = await axios.get(`${DOMAIN}/api/admin/lecturers/search`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllLecturers(res.data);
            } catch (err) {
                console.error("Lỗi tải danh sách giảng viên:", err);
            }
        };
        fetchAllLecturers();
    }, []);

    // Xử lý khi gõ tên tìm kiếm
    const handleSearchChange = (text) => {
        setSearchName(text);
        if (text.length > 0) {
            // Lọc danh sách khớp với từ khóa (Tên hoặc Email)
            const matches = allLecturers.filter(lec => 
                lec.fullName.toLowerCase().includes(text.toLowerCase()) ||
                lec.email.toLowerCase().includes(text.toLowerCase())
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    // Xử lý khi chọn giảng viên từ gợi ý -> Chuyển trang
    const handleSelectLecturer = (lecturerId) => {
        // Chuyển sang trang chi tiết (Bạn nhớ khai báo Route này trong App.js nhé)
        navigate(`/admin/lecturer-schedules/${lecturerId}`);
    };

    // =========================================================
    // 2. LOGIC CŨ: XEM LỊCH THEO NGÀY (GIỮ NGUYÊN)
    // =========================================================
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/lecturer-schedules?date=${selectedDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = res.data.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setSchedules(sorted);
        } catch (err) {
            console.error(err);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [selectedDate]);

    const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : "--";

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold mb-4 text-primary">
                <i className="bi bi-calendar-check me-2"></i>Lịch làm việc Giảng Viên
            </h3>

            {/* 🔥 KHỐI TÌM KIẾM NHANH (MỚI THÊM) */}
            <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white position-relative" style={{zIndex: 1000}}>
    <div className="card-body p-3">
        {/* Thêm class 'small' và giảm mb-2 xuống mb-1 */}
        <label className="fw-bold text-dark small mb-1">🔍 Tra cứu lịch riêng của Giảng viên:</label>
        
        <div className="position-relative">
            <input 
                type="text" 
                // Bỏ 'form-control-lg' để ô nhập nhỏ lại
                className="form-control border-primary"
                placeholder="Nhập tên giảng viên hoặc email để tìm..." 
                value={searchName}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ fontSize: '0.95rem' }} // Chỉnh font chữ nhập liệu vừa phải
            />
            
            {/* Danh sách gợi ý thả xuống */}
            {suggestions.length > 0 && (
                <div className="list-group position-absolute w-100 shadow mt-1" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    {suggestions.map(lec => (
                        <button 
                            key={lec.lecturerId} 
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2" // Thêm py-2 để list gọn hơn
                            onClick={() => handleSelectLecturer(lec.lecturerId)}
                        >
                            <div>
                                <div className="fw-bold text-primary small">{lec.fullName}</div>
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>{lec.email} - Khoa: {lec.department}</small>
                            </div>
                            <i className="bi bi-chevron-right text-muted small"></i>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
</div>

            <hr className="my-4 text-muted" />

            <h5 className="fw-bold text-muted mb-3">📅 Xem tổng hợp toàn bộ theo ngày:</h5>

            {/* THANH CHỌN NGÀY (CŨ) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                    <label className="fw-bold text-muted">Chọn ngày xem:</label>
                    <input 
                        type="date" 
                        className="form-control w-auto fw-bold text-primary" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                    />
                   
                </div>
            </div>

            {/* BẢNG DỮ LIỆU (CŨ) */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3">STT</th>
                                <th className="py-3">Giảng viên</th>
                                <th className="py-3">Khoa / Bộ môn</th>
                                <th className="py-3">Khung giờ đăng ký</th>
                                <th className="py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">
                                    <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                                    Không có giảng viên nào đăng ký lịch vào ngày {selectedDate.split('-').reverse().join('/')}
                                </td></tr>
                            ) : (
                                schedules.map((slot, index) => (
                                    <tr key={slot.id}>
                                        <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                        
                                        <td>
                                            <div className="fw-bold text-dark">{slot.lecturerName}</div>
                                            <div className="small text-muted">{slot.lecturerEmail}</div>
                                        </td>
                                        
                                        <td><span className="badge bg-light text-dark border">{slot.department || "N/A"}</span></td>
                                        
                                        <td>
                                            <span className="badge bg-primary fs-6">
                                                <i className="bi bi-clock me-1"></i>
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </span>
                                        </td>

                                        <td>
                                            {slot.isBooked ? 
                                                <span className="badge bg-success">Đã có SV đặt</span> : 
                                                <span className="badge bg-secondary">Đang rảnh</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}