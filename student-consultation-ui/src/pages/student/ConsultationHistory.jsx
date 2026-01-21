import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const ConsultationHistory = () => {
    const token = localStorage.getItem("token");
    const [appointments, setAppointments] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);

    // --- STATE CHO BỘ LỌC ---
    const [searchName, setSearchName] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [dateFilter, setDateFilter] = useState({
        label: "📅 Tất cả thời gian", type: "ALL", startDate: null, endDate: null
    });

    // --- STATE ĐIỀU KHIỂN DROPDOWN ---
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // State cho Modal xem chi tiết
    const [viewModal, setViewModal] = useState({ show: false, title: "", content: "" });

    // 1. Load Data
    const loadData = () => {
        if (!token) return;
        fetch("http://localhost:8080/api/appointment/my", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // ✅ SẮP XẾP: Ngày gần nhất đến ngày xa nhất (Tăng dần a - b)
                const sorted = data.sort((a, b) =>
                    new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
                );
                setAppointments(sorted);
                setFilteredApps(sorted);
            })
            .catch(console.error);
    };

    useEffect(() => { loadData(); }, [token]);

    // 2. XỬ LÝ CLICK RA NGOÀI
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. LOGIC FILTER
    useEffect(() => {
        let result = [...appointments];

        // A. Lọc tên
        if (searchName.trim() !== "") {
            result = result.filter(a => a.lecturerName.toLowerCase().includes(searchName.toLowerCase()));
        }

        // B. Lọc Trạng thái
        if (selectedStatuses.length > 0) {
            result = result.filter(a => selectedStatuses.includes(a.statusCode));
        }

        // C. Lọc Thời gian
        if (dateFilter.type !== "ALL" && dateFilter.startDate && dateFilter.endDate) {
            result = result.filter(a => {
                const appDate = new Date(a.date);
                appDate.setHours(0, 0, 0, 0);
                const start = new Date(dateFilter.startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateFilter.endDate);
                end.setHours(23, 59, 59, 999);
                return appDate >= start && appDate <= end;
            });
        }
        setFilteredApps(result);
    }, [searchName, selectedStatuses, dateFilter, appointments]);

    // --- HÀM HỖ TRỢ ---
    const toggleDropdown = (name) => {
        if (activeDropdown === name) setActiveDropdown(null);
        else setActiveDropdown(name);
    };

    const toggleStatus = (code) => {
        if (selectedStatuses.includes(code)) {
            setSelectedStatuses(selectedStatuses.filter(s => s !== code));
        } else {
            setSelectedStatuses([...selectedStatuses, code]);
        }
    };

    const handleQuickDateSelect = (type) => {
        const today = new Date();
        let start = new Date(), end = new Date(), label = "";

        switch (type) {
            case "TODAY": label = "Hôm nay"; break;
            case "YESTERDAY":
                start.setDate(today.getDate() - 1); end.setDate(today.getDate() - 1);
                label = "Hôm qua"; break;
            case "LAST_7_DAYS":
                start.setDate(today.getDate() - 6);
                label = "Trong 7 ngày qua"; break;
            case "LAST_30_DAYS":
                start.setDate(today.getDate() - 29);
                label = "Trong 30 ngày qua"; break;
            case "ALL": default:
                setDateFilter({ label: "📅 Tất cả thời gian", type: "ALL", startDate: null, endDate: null });
                setActiveDropdown(null);
                return;
        }
        setDateFilter({ label, type, startDate: start, endDate: end });
        setActiveDropdown(null);
    };

    const handleSpecificDate = (e) => {
        if (!e.target.value) return;
        const dateVal = new Date(e.target.value);
        setDateFilter({ label: `Ngày ${formatDate(e.target.value)}`, type: "SPECIFIC_DATE", startDate: dateVal, endDate: dateVal });
        setActiveDropdown(null);
    };

    const handleSpecificMonth = (e) => {
        if (!e.target.value) return;
        const [year, month] = e.target.value.split('-');
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        setDateFilter({ label: `Tháng ${month}/${year}`, type: "SPECIFIC_MONTH", startDate: start, endDate: end });
        setActiveDropdown(null);
    };

    // ✅ ĐÃ SỬA: Hiển thị đúng dữ liệu thật từ DB (Start - End)
    // Nếu Backend chưa trả về endTime, bạn cần kiểm tra lại AppointmentDTO ở Java nhé
    const getDurationDisplay = (startTime, endTime) => {
        // Cắt chuỗi để bỏ giây (nếu có): 08:00:00 -> 08:00
        const formatTime = (t) => t ? t.substring(0, 5) : "";
        
        if (startTime && endTime) {
            return `${formatTime(startTime)} - ${formatTime(endTime)}`;
        }
        return formatTime(startTime); // Chỉ hiện giờ bắt đầu nếu thiếu giờ kết thúc
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };
    const handleDownload = (attachmentId, fileName) => {
        fetch(`http://localhost:8080/api/appointment/${attachmentId}/download`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => res.blob()).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = fileName;
            document.body.appendChild(a); a.click(); a.remove();
        }).catch(() => alert("Lỗi tải file"));
    };
    const openDetailModal = (title, content) => setViewModal({ show: true, title, content: content || "Không có nội dung" });

    const handleCancel = (appt) => {
        if (appt.statusCode === 'PENDING') {
            if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này không?")) return;
            fetch(`http://localhost:8080/api/appointment/${appt.id}/cancel/student`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            }).then(res => { if (res.ok) { alert("Đã hủy thành công"); loadData(); } else alert("Lỗi khi hủy."); });
        } else if (appt.statusCode === 'APPROVED') {
            const reason = window.prompt("Nhập lý do xin hủy:");
            if (reason === null || reason.trim() === "") return;
            fetch(`http://localhost:8080/api/appointment/${appt.id}/cancel/student?cancelReason=${encodeURIComponent(reason)}`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            }).then(res => { if (res.ok) { alert("Đã gửi yêu cầu."); loadData(); } else alert("Lỗi gửi yêu cầu."); });
        }
    };

    const getStatusBadge = (code, text) => {
        const colors = { APPROVED: "bg-success", PENDING: "bg-warning text-dark", REJECTED: "bg-danger", COMPLETED: "bg-primary", CANCEL_REQUEST: "bg-info text-dark", CANCELED: "bg-secondary" };
        return <span className={`badge rounded-pill ${colors[code] || "bg-secondary"} px-3 py-2 border border-light shadow-sm`} style={{ minWidth: "100px" }}>{text}</span>;
    };
    const getResultDisplay = (resultCode) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;
        const map = { SOLVED: "✅ Đã giải quyết", UNSOLVED: "⚠️ Cần theo dõi", STUDENT_ABSENT: "❌ Vắng mặt", CANCELLED_BY_GV: "⛔ Hủy bởi GV" };
        return <span className={`badge ${resultCode === 'SOLVED' ? 'bg-success' : 'bg-secondary'}`}>{map[resultCode] || resultCode}</span>;
    };

    const STATUS_OPTIONS = [
        { code: 'PENDING', label: '⏳ Chờ duyệt (Pending)' },
        { code: 'APPROVED', label: '✅ Đã duyệt (Approved)' },
        { code: 'COMPLETED', label: '🎉 Hoàn thành (Completed)' },
        { code: 'REJECTED', label: '⛔ Bị từ chối (Rejected)' },
        { code: 'CANCEL_REQUEST', label: '📩 Đang xin hủy' },
        { code: 'CANCELED', label: '❌ Đã hủy (Canceled)' }
    ];

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📋 Lịch Sử Tư Vấn</h3>
                    <p className="text-muted mb-0">Theo dõi trạng thái và kết quả các yêu cầu hỗ trợ của bạn</p>
                </div>
                <button className="btn btn-light shadow-sm text-primary border" onClick={loadData}>🔄 Làm mới</button>
            </div>

            {/* --- THANH CÔNG CỤ (FIX CỨNG CHIỀU CAO 45PX CHO TẤT CẢ) --- */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white" style={{ zIndex: 10 }} ref={dropdownRef}>
                <div className="card-body p-3">
                    <div className="row g-3">
                        
                        {/* 1. Tìm tên GV */}
                        <div className="col-md-4">
                            <div className="input-group" style={{ height: "45px" }}>
                                <span className="input-group-text bg-white border-end-0 d-flex align-items-center justify-content-center"
                                    style={{ width: "45px" }}>
                                    <i className="bi bi-search text-muted fs-5"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-2 shadow-none"
                                    placeholder="Tìm tên giảng viên..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    style={{ height: "100%" }}
                                />
                            </div>
                        </div>

                        {/* 2. Lọc Trạng thái */}
                        <div className="col-md-3 position-relative">
                            <div className="dropdown h-100">
                                <button className="btn btn-white border w-100 text-start d-flex justify-content-between align-items-center shadow-none"
                                    type="button" onClick={() => toggleDropdown('STATUS')}
                                    style={{ height: "45px" }}
                                >
                                    <span className="text-truncate d-flex align-items-center">
                                        <i className="bi bi-funnel me-2 text-primary fs-5"></i>
                                        <span className="mt-1" style={{ lineHeight: "1" }}>{selectedStatuses.length === 0 ? "Tất cả trạng thái" : `Đã chọn (${selectedStatuses.length})`}</span>
                                    </span>
                                    <i className="bi bi-chevron-down small text-muted"></i>
                                </button>

                                <ul className={`dropdown-menu w-100 p-2 shadow border-0 mt-1 ${activeDropdown === 'STATUS' ? 'show' : ''}`}>
                                    <li><h6 className="dropdown-header small text-muted text-uppercase">Chọn trạng thái hiển thị</h6></li>
                                    {STATUS_OPTIONS.map(opt => (
                                        <li key={opt.code} className="dropdown-item rounded d-flex align-items-center gap-2"
                                            onClick={(e) => { e.stopPropagation(); toggleStatus(opt.code); }} style={{ cursor: "pointer" }}>
                                            <input className="form-check-input mt-0" type="checkbox" checked={selectedStatuses.includes(opt.code)} readOnly />
                                            <span>{opt.label}</span>
                                        </li>
                                    ))}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="btn btn-sm btn-light w-100 text-danger" onClick={() => setSelectedStatuses([])}>Xóa chọn</button></li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Lọc Thời gian */}
                        <div className="col-md-3">
                            <div className="dropdown h-100">
                                <button className="btn btn-white border w-100 text-start d-flex justify-content-between align-items-center shadow-none"
                                    type="button" onClick={() => toggleDropdown('DATE')}
                                    style={{ height: "45px" }}
                                >
                                    <span className="text-truncate d-flex align-items-center">
                                        <i className="bi bi-calendar3 me-2 text-success fs-5"></i>
                                        <span className="mt-1" style={{ lineHeight: "1" }}>{dateFilter.label}</span>
                                    </span>
                                    <i className="bi bi-chevron-down small text-muted"></i>
                                </button>

                                <ul className={`dropdown-menu shadow border-0 mt-1 ${activeDropdown === 'DATE' ? 'show' : ''}`} style={{ minWidth: "260px" }}>
                                    <li><h6 className="dropdown-header small text-muted">Chọn nhanh</h6></li>
                                    <li><button className="dropdown-item py-2" onClick={() => handleQuickDateSelect('TODAY')}>Hôm nay</button></li>
                                    <li><button className="dropdown-item py-2" onClick={() => handleQuickDateSelect('YESTERDAY')}>Hôm qua</button></li>
                                    <li><button className="dropdown-item py-2" onClick={() => handleQuickDateSelect('LAST_7_DAYS')}>Trong 7 ngày qua</button></li>
                                    <li><button className="dropdown-item py-2" onClick={() => handleQuickDateSelect('LAST_30_DAYS')}>Trong 30 ngày qua</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><h6 className="dropdown-header small text-muted">Tùy chọn khác</h6></li>
                                    <li className="px-3 py-1">
                                        <label className="form-label small mb-1 text-muted">Theo ngày:</label>
                                        <input type="date" className="form-control form-control-sm" onChange={handleSpecificDate} />
                                    </li>
                                    <li className="px-3 py-1">
                                        <label className="form-label small mb-1 text-muted">Theo tháng:</label>
                                        <input type="month" className="form-control form-control-sm" onChange={handleSpecificMonth} />
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger py-2 text-center" onClick={() => handleQuickDateSelect('ALL')}>Xem tất cả</button></li>
                                </ul>
                            </div>
                        </div>

                        {/* 4. Nút Reset */}
                        <div className="col-md-2 d-grid">
                            <button className="btn btn-outline-secondary border-0 d-flex justify-content-center align-items-center shadow-none"
                                onClick={() => { setSearchName(""); setSelectedStatuses([]); handleQuickDateSelect('ALL'); }}
                                style={{ height: "45px" }}
                            >
                                <i className="bi bi-arrow-counterclockwise me-2 fs-5"></i> <span className="mt-1">Reset</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1400px" }}>
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold text-center">
                                <th className="py-3">STT</th>
                                <th className="py-3 text-start">Giảng viên</th>
                                <th className="py-3">Ngày hẹn</th>
                                <th className="py-3">Khung giờ</th>
                                <th className="py-3">Hình thức</th>
                                <th className="py-3">File</th>
                                <th className="py-3 text-start">Chủ đề / Nội dung</th>
                                <th className="py-3 text-start">Ghi chú từ GV</th>
                                <th className="py-3">Trạng thái</th>
                                <th className="py-3">Kết quả</th>
                                <th className="py-3">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApps.length === 0 ? (
                                <tr><td colSpan={11} className="text-center py-5 text-muted">Không tìm thấy dữ liệu phù hợp.</td></tr>
                            ) : (
                                filteredApps.map((a, i) => (
                                    <tr key={a.id} style={{ height: "65px" }}>
                                        <td className="text-center fw-bold text-muted">{i + 1}</td>
                                        <td className="text-start"><Link to={`/student/lecturer-info/${a.lecturerId}`} className="text-dark text-decoration-none">{a.lecturerName}</Link></td>
                                        <td className="text-center">{formatDate(a.date)}</td>
                                        
                                        {/* ✅ ĐÃ SỬA: Hiển thị Khung giờ (Start - End) */}
                                        <td className="text-center"><span className="badge bg-light text-dark border">{getDurationDisplay(a.time, a.endTime)}</span></td>
                                        
                                        <td className="text-center">{a.consultationType === "IN_PERSON" ? "🏢 Trực tiếp" : "💻 Online"}</td>
                                        <td className="text-center">{a.attachments?.length > 0 ? "📎 Có file" : "-"}</td>
                                        <td className="text-start cursor-pointer" onClick={() => openDetailModal("Nội dung", a.reason)}><div className="text-truncate" style={{ maxWidth: "200px" }}>{a.reason}</div></td>
                                        <td className="text-start cursor-pointer" onClick={() => openDetailModal("Ghi chú", a.feedbackNote)}><div className="text-truncate" style={{ maxWidth: "200px" }}>{a.feedbackNote || "-"}</div></td>
                                        <td className="text-center">{getStatusBadge(a.statusCode, a.statusDescription)}</td>
                                        <td className="text-center">{getResultDisplay(a.consultationResult)}</td>
                                        <td className="text-center">
                                            {a.statusCode === 'PENDING' && <button className="btn btn-outline-danger btn-sm rounded-circle" style={{ width: "28px", height: "28px" }} onClick={() => handleCancel(a)}>✕</button>}
                                            {a.statusCode === 'APPROVED' && <button className="btn btn-outline-warning text-dark btn-sm rounded-circle" style={{ width: "28px", height: "28px" }} onClick={() => handleCancel(a)}><i className="bi bi-calendar-x"></i></button>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {viewModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow border-0">
                            <div className="modal-header border-bottom-0"><h5 className="modal-title text-primary">{viewModal.title}</h5><button className="btn-close" onClick={() => setViewModal({ ...viewModal, show: false })}></button></div>
                            <div className="modal-body"><div className="p-3 bg-light rounded" style={{ whiteSpace: "pre-wrap" }}>{viewModal.content}</div></div>
                            <div className="modal-footer border-top-0"><button className="btn btn-secondary rounded-pill px-4" onClick={() => setViewModal({ ...viewModal, show: false })}>Đóng</button></div>
                        </div>
                    </div>
                </div>
            )}
            <div className="text-center mt-4 text-muted small">Hiển thị {filteredApps.length} kết quả.</div>
        </div>
    );
};
export default ConsultationHistory;