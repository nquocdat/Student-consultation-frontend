import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminSingleLecturerSchedule() {
    const { lecturerId } = useParams();
    const navigate = useNavigate();
    const DOMAIN = "https://student-consultation-nqd.onrender.com";

    // State lưu dữ liệu đã nhóm theo ngày
    const [groupedSchedules, setGroupedSchedules] = useState({});
    // State lưu ngày đang được mở (expanded)
    const [expandedDate, setExpandedDate] = useState(null);
    
    const [lecturerInfo, setLecturerInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                // Gọi API (API này đã được sửa ở Backend để trả về cả slot Rảnh và slot Bận)
                const res = await axios.get(`${DOMAIN}/api/admin/lecturer/${lecturerId}/schedules`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // 1. Lấy thông tin GV từ bản ghi đầu tiên tìm thấy
                if (res.data.length > 0) {
                    // Tìm slot có tên GV (ưu tiên) hoặc lấy slot đầu tiên
                    const info = res.data.find(item => item.lecturerName) || res.data[0];
                    setLecturerInfo({
                        name: info.lecturerName,
                        email: info.lecturerEmail,
                        dept: info.department
                    });
                }

                // 2. NHÓM DỮ LIỆU THEO NGÀY
                const grouped = res.data.reduce((acc, slot) => {
                    const dateKey = slot.date; // Format "YYYY-MM-DD" từ Backend
                    if (!acc[dateKey]) {
                        acc[dateKey] = [];
                    }
                    acc[dateKey].push(slot);
                    return acc;
                }, {});

                // 3. Sắp xếp slot trong từng ngày (Giờ tăng dần)
                Object.keys(grouped).forEach(date => {
                    grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
                });

                setGroupedSchedules(grouped);

            } catch (err) {
                console.error("Lỗi tải lịch:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lecturerId]);

    // Helper format giờ (HH:mm:ss -> HH:mm)
    const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : "--";
    
    // Helper format ngày VN (YYYY-MM-DD -> DD/MM/YYYY)
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "-";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    // Hàm đóng/mở ngày
    const toggleDate = (dateKey) => {
        setExpandedDate(expandedDate === dateKey ? null : dateKey);
    };

    // Sắp xếp danh sách ngày tăng dần để hiển thị
    const sortedDates = Object.keys(groupedSchedules).sort((a, b) => new Date(a) - new Date(b));

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <button className="btn btn-outline-secondary mb-3 btn-sm" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
            </button>

            {/* CARD THÔNG TIN GIẢNG VIÊN */}
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold text-primary mb-1">
                        <i className="bi bi-person-badge me-2"></i>
                        {lecturerInfo ? lecturerInfo.name : "..."}
                    </h5>
                    <p className="text-muted small mb-0 ms-4">
                        {lecturerInfo ? `${lecturerInfo.email} • Khoa ${lecturerInfo.dept}` : "Đang tải thông tin..."}
                    </p>
                </div>
            </div>

            <h6 className="fw-bold text-muted mb-3">📅 Chi tiết lịch làm việc:</h6>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted small">Đang tải dữ liệu...</p>
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="alert alert-secondary text-center">Giảng viên này chưa có lịch nào trong hệ thống.</div>
            ) : (
                <div className="accordion" id="scheduleAccordion">
                    {sortedDates.map((dateKey) => {
                        const slots = groupedSchedules[dateKey];
                        const isOpen = expandedDate === dateKey;
                        
                        // Tính toán thống kê cho Header
                        const totalSlots = slots.length;
                        const bookedSlots = slots.filter(s => s.isBooked).length;
                        const freeSlots = totalSlots - bookedSlots;

                        return (
                            <div className="card border-0 shadow-sm mb-2 rounded-3 overflow-hidden" key={dateKey}>
                                {/* HEADER CỦA NGÀY (Click để mở) */}
                                <div 
                                    className={`card-header p-3 bg-white border-0 d-flex justify-content-between align-items-center cursor-pointer ${isOpen ? 'border-bottom' : ''}`}
                                    onClick={() => toggleDate(dateKey)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Icon Ngày */}
                                        <div className={`rounded-3 d-flex flex-column align-items-center justify-content-center border ${isOpen ? 'bg-primary text-white border-primary' : 'bg-light text-dark border-light'}`} 
                                             style={{width: '50px', height: '50px', transition: '0.2s'}}>
                                            <span className="fw-bold small">{dateKey.split('-')[2]}</span>
                                            <span style={{fontSize: '0.65rem'}}>Thg {dateKey.split('-')[1]}</span>
                                        </div>
                                        
                                        {/* Thông tin tóm tắt */}
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">Ngày {formatDateVN(dateKey)}</h6>
                                            <div className="d-flex gap-2">
                                                {freeSlots > 0 && <span className="badge bg-success-subtle text-success border border-success-subtle fw-normal">Rảnh: {freeSlots}</span>}
                                                {bookedSlots > 0 && <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-normal">Bận: {bookedSlots}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <i className={`bi bi-chevron-down text-muted transition-icon ${isOpen ? 'rotate-180' : ''}`} 
                                       style={{transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}></i>
                                </div>

                                {/* BODY HIỂN THỊ DANH SÁCH GIỜ (Chỉ hiện khi isOpen = true) */}
                                {isOpen && (
                                    <div className="card-body bg-light bg-opacity-10">
                                        <div className="table-responsive">
                                            <table className="table table-sm table-borderless mb-0 align-middle">
                                                <thead className="text-muted small border-bottom">
                                                    <tr>
                                                        <th className="ps-3">Khung giờ</th>
                                                        <th>Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {slots.map((slot) => (
                                                        <tr key={slot.id} className="border-bottom border-light">
                                                            <td className="ps-3 py-2">
                                                                <div className={`d-inline-flex align-items-center gap-2 px-2 py-1 rounded border ${slot.isBooked ? 'bg-white border-danger text-danger' : 'bg-white border-success text-success'}`}>
                                                                    <i className="bi bi-clock"></i>
                                                                    <span className="fw-bold small">
                                                                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2">
                                                                {slot.isBooked ? 
                                                                    <span className="badge bg-danger">Đã có SV đặt</span> : 
                                                                    <span className="badge bg-success">Đang rảnh</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}