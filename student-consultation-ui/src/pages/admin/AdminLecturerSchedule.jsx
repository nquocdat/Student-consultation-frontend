import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLecturerSchedule() {
    const DOMAIN = "http://localhost:8080";
    
    // Mặc định chọn ngày hôm nay
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Gọi API với tham số date
            const res = await axios.get(`${DOMAIN}/api/admin/lecturer-schedules?date=${selectedDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Sắp xếp theo giờ bắt đầu
            const sorted = res.data.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setSchedules(sorted);
        } catch (err) {
            console.error(err);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    // Khi ngày thay đổi thì gọi lại API
    useEffect(() => {
        fetchSchedules();
    }, [selectedDate]);

    // Format giờ HH:mm:ss -> HH:mm cho đẹp
    const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : "--";

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold mb-4 text-primary">
                <i className="bi bi-calendar-check me-2"></i>Lịch làm việc Giảng Viên
            </h3>

            {/* THANH CHỌN NGÀY */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                    <label className="fw-bold text-muted">Chọn ngày xem:</label>
                    <input 
                        type="date" 
                        className="form-control w-auto fw-bold text-primary" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                    />
                    <button className="btn btn-outline-primary" onClick={fetchSchedules}>
                        <i className="bi bi-arrow-clockwise me-1"></i> Tải lại
                    </button>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
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