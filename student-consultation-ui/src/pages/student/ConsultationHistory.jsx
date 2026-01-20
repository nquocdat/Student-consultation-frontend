import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ConsultationHistory = () => {
    const token = localStorage.getItem("token");
    const [appointments, setAppointments] = useState([]);
    
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
                // ✅ SORT: Ngày gần nhất xếp trước (Tăng dần a - b)
                const sorted = data.sort((a, b) => 
                    new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
                );
                setAppointments(sorted);
            })
            .catch(console.error);
    };

    useEffect(() => { loadData(); }, [token]);

    // Helper Functions
    const getDurationDisplay = (startTime, endTime) => {
        if (endTime) return `${startTime} - ${endTime}`;
        const [h, m] = startTime.split(':').map(Number);
        const date = new Date(); date.setHours(h, m, 0, 0); date.setMinutes(date.getMinutes() + 30);
        const end = `${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
        return `${startTime} - ${end}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleDownload = (attachmentId, fileName) => {
        fetch(`http://localhost:8080/api/appointment/${attachmentId}/download`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = fileName;
                document.body.appendChild(a); a.click(); a.remove();
            })
            .catch(() => alert("Lỗi tải file"));
    };

    const openDetailModal = (title, content) => {
        setViewModal({ show: true, title, content: content || "Không có nội dung" });
    };

    // 2. LOGIC HỦY LỊCH (ĐÃ NÂNG CẤP ĐỂ GỬI LÝ DO)
    const handleCancel = (appt) => {
        
        // A. TRƯỜNG HỢP: PENDING -> Hủy luôn
        if (appt.statusCode === 'PENDING') {
            if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này không?")) return;
            
            fetch(`http://localhost:8080/api/appointment/${appt.id}/cancel/student`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.ok) { alert("Đã hủy thành công"); loadData(); }
                else alert("Lỗi khi hủy lịch hẹn.");
            });
        }
        
        // B. TRƯỜNG HỢP: APPROVED -> Gửi yêu cầu hủy kèm lý do
        else if (appt.statusCode === 'APPROVED') {
            const reason = window.prompt("Lịch đã được duyệt. Vui lòng nhập lý do xin hủy:");
            
            if (reason === null) return; // Bấm Cancel
            if (reason.trim() === "") { alert("Vui lòng nhập lý do để giảng viên biết!"); return; }

            // 🔥 QUAN TRỌNG: Gửi lý do lên qua query param 'cancelReason'
            // Backend cần bắt tham số này và nối vào cột 'reason' hoặc 'note' cũ
            const url = `http://localhost:8080/api/appointment/${appt.id}/cancel/student?cancelReason=${encodeURIComponent(reason)}`;

            fetch(url, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.ok) { 
                    alert("Đã gửi yêu cầu. Lý do hủy đã được cập nhật cho giảng viên."); 
                    loadData(); 
                } else {
                    alert("Có lỗi xảy ra khi gửi yêu cầu.");
                }
            });
        }
    };

    // --- STYLE BADGES ---
    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success";
        if (code === 'PENDING') colorClass = "bg-warning text-dark";
        if (code === 'REJECTED') colorClass = "bg-danger";
        if (code === 'COMPLETED') colorClass = "bg-primary";
        if (code === 'CANCEL_REQUEST') colorClass = "bg-info text-dark"; 

        return <span className={`badge rounded-pill ${colorClass} px-3 py-2 border border-light shadow-sm`} style={{minWidth: "100px"}}>{text}</span>;
    };

    const getResultDisplay = (resultCode) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;
        let badge = <span className="badge bg-secondary">{resultCode}</span>;
        if (resultCode === 'SOLVED') badge = <span className="badge bg-success bg-opacity-75 text-white">✅ Đã giải quyết</span>;
        else if (resultCode === 'UNSOLVED') badge = <span className="badge bg-warning text-dark border">⚠️ Cần theo dõi</span>;
        else if (resultCode === 'STUDENT_ABSENT') badge = <span className="badge bg-danger">❌ Vắng mặt</span>;
        else if (resultCode === 'CANCELLED_BY_GV') badge = <span className="badge bg-danger bg-opacity-75">⛔ Hủy bởi GV</span>;
        return <div className="d-flex flex-column align-items-center">{badge}</div>;
    };

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📋 Lịch Sử Tư Vấn</h3>
                    <p className="text-muted mb-0">Theo dõi trạng thái và kết quả các yêu cầu hỗ trợ của bạn</p>
                </div>
                <button className="btn btn-light shadow-sm text-primary border" onClick={loadData}>🔄 Làm mới</button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1400px" }}>
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold text-center">
                                <th className="py-3" style={{ width: "3%" }}>STT</th>
                                <th className="py-3 text-start" style={{ width: "12%" }}>Giảng viên</th>
                                <th className="py-3" style={{ width: "8%" }}>Ngày hẹn</th>
                                <th className="py-3" style={{ width: "9%" }}>Khung giờ</th>
                                <th className="py-3" style={{ width: "7%" }}>Hình thức</th>
                                <th className="py-3" style={{ width: "5%" }}>File</th>
                                <th className="py-3 text-start" style={{ width: "15%" }}>Chủ đề / Nội dung</th>
                                <th className="py-3 text-start" style={{ width: "15%" }}>Ghi chú từ GV</th>
                                <th className="py-3" style={{ width: "9%" }}>Trạng thái</th>
                                <th className="py-3" style={{ width: "10%" }}>Kết quả</th>
                                <th className="py-3" style={{ width: "5%" }}>Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr><td colSpan={11} className="text-center py-5 text-muted">Bạn chưa có yêu cầu tư vấn nào.</td></tr>
                            ) : (
                                appointments.map((a, i) => (
                                    <tr key={a.id} style={{ height: "65px" }}>
                                        <td className="text-center fw-bold text-muted">{i + 1}</td>
                                        
                                        {/* Tên Giảng viên: Chữ thường, đen */}
                                        <td className="text-start">
                                            <Link to={`/student/lecturer-info/${a.lecturerId}`} className="text-dark text-decoration-none hover-text-primary">
                                                {a.lecturerName}
                                            </Link>
                                        </td>

                                        {/* Ngày hẹn: Chữ thường (bỏ fw-medium) */}
                                        <td className="text-center">{formatDate(a.date)}</td>
                                        
                                        <td className="text-center"><span className="badge bg-light text-dark border">{getDurationDisplay(a.time, a.endTime)}</span></td>
                                        
                                        <td className="text-center">
                                            {a.consultationType === "IN_PERSON"
                                                ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span>
                                                : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                            }
                                        </td>

                                        <td className="text-center">
                                            {a.attachments?.length > 0 ? (
                                                <div className="d-flex flex-column gap-1 align-items-center">
                                                    {a.attachments.map(f => (
                                                        <button key={f.id} className="btn btn-sm btn-link text-decoration-none p-0" onClick={() => handleDownload(f.id, f.fileName)} title={f.fileName}>📎 File</button>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted small opacity-50">-</span>}
                                        </td>

                                        {/* Chủ đề: Chữ thường, có Popup */}
                                        <td className="text-start" style={{cursor: "pointer"}} onClick={() => openDetailModal("Nội dung tư vấn", a.reason)}>
                                            <div className="text-dark text-truncate-2" style={{ maxWidth: "200px", maxHeight: "3em", overflow: "hidden" }}>
                                                {a.reason || "Không có nội dung"}
                                            </div>
                                            {(a.reason && a.reason.length > 50) && <small className="text-primary fst-italic" style={{fontSize: "0.7rem"}}>Xem thêm...</small>}
                                        </td>

                                        {/* Ghi chú GV */}
                                        <td className="text-start" style={{cursor: "pointer"}} onClick={() => openDetailModal("Ghi chú từ Giảng viên", a.feedbackNote)}>
                                            <div className="small text-muted fst-italic text-truncate-2" style={{ maxWidth: "200px", maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap" }}>
                                                {a.feedbackNote || <span className="opacity-50">--</span>}
                                            </div>
                                            {(a.feedbackNote && a.feedbackNote.length > 50) && <small className="text-primary fst-italic" style={{fontSize: "0.7rem"}}>Xem thêm...</small>}
                                        </td>

                                        <td className="text-center">{getStatusBadge(a.statusCode, a.statusDescription)}</td>
                                        <td className="text-center">{getResultDisplay(a.consultationResult)}</td>

                                        <td className="text-center">
                                            {a.statusCode === 'PENDING' && (
                                                <button className="btn btn-outline-danger btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto"
                                                    style={{ width: "28px", height: "28px" }} title="Hủy yêu cầu" onClick={() => handleCancel(a)}>
                                                    ✕
                                                </button>
                                            )}
                                            {a.statusCode === 'APPROVED' && (
                                                <button className="btn btn-outline-warning text-dark btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto"
                                                    style={{ width: "28px", height: "28px" }} title="Xin hủy lịch (Gửi yêu cầu)" onClick={() => handleCancel(a)}>
                                                    <i className="bi bi-calendar-x"></i>
                                                </button>
                                            )}
                                            {['COMPLETED', 'REJECTED', 'CANCELED', 'CANCEL_REQUEST'].includes(a.statusCode) && (
                                                <span className="text-muted opacity-25"><i className="bi bi-lock-fill"></i></span>
                                            )}
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
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold text-primary">{viewModal.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setViewModal({ ...viewModal, show: false })}></button>
                            </div>
                            <div className="modal-body">
                                <div className="p-3 bg-light rounded" style={{ whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto" }}>
                                    {viewModal.content}
                                </div>
                            </div>
                            <div className="modal-footer border-top-0">
                                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setViewModal({ ...viewModal, show: false })}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center mt-4 text-muted small">Hiển thị {appointments.length} kết quả gần nhất.</div>
        </div>
    );
};

export default ConsultationHistory;