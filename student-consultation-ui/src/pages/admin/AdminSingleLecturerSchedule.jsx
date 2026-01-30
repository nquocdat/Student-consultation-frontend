import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminSingleLecturerSchedule() {
    const { lecturerId } = useParams();
    const navigate = useNavigate();
    const DOMAIN = "http://localhost:8080";

    // schedules sẽ chứa dữ liệu ĐÃ NHÓM theo ngày
    // Cấu trúc: { "2024-05-20": [slot1, slot2], "2024-05-21": [slot3] }
    const [groupedSchedules, setGroupedSchedules] = useState({});
    
    // State để quản lý ngày nào đang được mở (expanded)
    // Lưu ngày đang mở (ví dụ: "2024-05-20"), nếu null nghĩa là đóng hết
    const [expandedDate, setExpandedDate] = useState(null);
    
    const [lecturerInfo, setLecturerInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${DOMAIN}/api/admin/lecturer/${lecturerId}/schedules`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // 1. Lấy thông tin giảng viên
                if (res.data.length > 0) {
                    setLecturerInfo({
                        name: res.data[0].lecturerName,
                        email: res.data[0].lecturerEmail,
                        dept: res.data[0].department
                    });
                }

                // 2. NHÓM DỮ LIỆU THEO NGÀY
                const grouped = res.data.reduce((acc, slot) => {
                    const dateKey = slot.date; // Giả sử format "2024-05-20"
                    if (!acc[dateKey]) {
                        acc[dateKey] = [];
                    }
                    acc[dateKey].push(slot);
                    return acc;
                }, {});

                // Sắp xếp các slot trong từng ngày theo giờ
                Object.keys(grouped).forEach(date => {
                    grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
                });

                setGroupedSchedules(grouped);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lecturerId]);

    const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : "--";
    
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "-";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    // Hàm xử lý khi nhấn vào ngày -> Đóng/Mở
    const toggleDate = (dateKey) => {
        if (expandedDate === dateKey) {
            setExpandedDate(null); // Đang mở thì đóng lại
        } else {
            setExpandedDate(dateKey); // Chưa mở thì mở ra
        }
    };

    // Sắp xếp danh sách ngày tăng dần để hiển thị
    const sortedDates = Object.keys(groupedSchedules).sort((a, b) => new Date(a) - new Date(b));

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> Quay lại
            </button>

            {/* THÔNG TIN GIẢNG VIÊN */}
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                <div className="card-body p-4">
                    <h4 className="fw-bold text-primary mb-1">
                        Lịch làm việc của: {lecturerInfo ? lecturerInfo.name : "..."}
                    </h4>
                    <p className="text-muted mb-0">
                        {lecturerInfo ? `${lecturerInfo.email} - Khoa ${lecturerInfo.dept}` : "Đang tải thông tin..."}
                    </p>
                </div>
            </div>

            {/* DANH SÁCH NGÀY LÀM VIỆC (DẠNG ACCORDION) */}
            <h5 className="fw-bold text-muted mb-3">Danh sách ngày đăng ký:</h5>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Đang tải lịch...</p>
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="alert alert-secondary text-center">Giảng viên này chưa đăng ký lịch nào.</div>
            ) : (
                <div className="accordion" id="scheduleAccordion">
                    {sortedDates.map((dateKey, index) => {
                        const slots = groupedSchedules[dateKey];
                        const isOpen = expandedDate === dateKey;
                        const totalSlots = slots.length;
                        const bookedSlots = slots.filter(s => s.isBooked).length;

                        return (
                            <div className="card border-0 shadow-sm mb-3 rounded-3 overflow-hidden" key={dateKey}>
                                {/* HEADER CỦA NGÀY (Nhấn vào đây để mở) */}
                                <div 
                                    className={`card-header p-3 bg-white border-0 d-flex justify-content-between align-items-center cursor-pointer ${isOpen ? 'border-bottom' : ''}`}
                                    onClick={() => toggleDate(dateKey)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${isOpen ? 'bg-primary text-white' : 'bg-light text-primary'}`} 
                                             style={{width: '40px', height: '40px', transition: '0.3s'}}>
                                            <i className="bi bi-calendar-event"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark">Ngày {formatDateVN(dateKey)}</h6>
                                            <small className="text-muted">
                                                Tổng {totalSlots} ca • <span className="text-success">{totalSlots - bookedSlots} rảnh</span> • <span className="text-danger">{bookedSlots} bận</span>
                                            </small>
                                        </div>
                                    </div>
                                    
                                    <i className={`bi bi-chevron-down transition-icon ${isOpen ? 'rotate-180' : ''}`} style={{transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}></i>
                                </div>

                                {/* BODY HIỂN THỊ GIỜ CHI TIẾT (Chỉ hiện khi isOpen = true) */}
                                {isOpen && (
                                    <div className="card-body bg-light bg-opacity-25 animate__animated animate__fadeIn">
                                        <div className="table-responsive">
                                            <table className="table table-sm table-borderless mb-0">
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
                                                                <span className="badge bg-white text-primary border shadow-sm fw-normal fs-6">
                                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                </span>
                                                            </td>
                                                            <td className="py-2">
                                                                {slot.isBooked ? 
                                                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Đã đặt</span> : 
                                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Đang rảnh</span>
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