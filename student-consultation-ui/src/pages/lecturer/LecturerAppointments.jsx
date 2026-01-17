import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";
import axios from "axios";

export default function LecturerAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // SEARCH & FILTER
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // ================= 1. HELPER FUNCTIONS (Đồng bộ với Sinh viên) =================
    
    // Tính giờ kết thúc (Start + 30p)
    const getDurationDisplay = (startTime) => {
        if (!startTime) return "-";
        // Giả sử startTime dạng "08:00:00" hoặc "08:00"
        const [h, m] = startTime.split(':').map(Number);
        const date = new Date(); 
        date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + 30);
        
        const newH = date.getHours(); 
        const newM = date.getMinutes();
        const end = `${(newH < 10 ? '0' : '') + newH}:${(newM < 10 ? '0' : '') + newM}`;
        
        // Trả về dạng: 08:00 - 08:30
        return `${startTime.slice(0, 5)} - ${end}`;
    };

    // Style Badge Trạng thái
    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success";
        if (code === 'PENDING') colorClass = "bg-warning text-dark"; // Chờ duyệt màu vàng
        if (code === 'REJECTED') colorClass = "bg-danger";
        if (code === 'COMPLETED') colorClass = "bg-primary";
        if (code === 'CANCEL_REQUEST') colorClass = "bg-info text-dark"; // Yêu cầu hủy
        if (code === 'CANCELED') colorClass = "bg-secondary";

        return <span className={`badge rounded-pill ${colorClass} px-3 py-2 border border-light shadow-sm`}>{text}</span>;
    };

    // Hiển thị Kết quả
    const getResultDisplay = (resultCode, note) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;

        let badge = <span className="badge bg-secondary">{resultCode}</span>;
        if (resultCode === 'SOLVED') badge = <span className="badge bg-success bg-opacity-75 text-white">✅ Đã giải quyết</span>;
        else if (resultCode === 'UNSOLVED') badge = <span className="badge bg-warning text-dark border">⚠️ Cần theo dõi</span>;
        else if (resultCode === 'STUDENT_ABSENT') badge = <span className="badge bg-danger">❌ Vắng mặt</span>;

        return (
            <div className="d-flex flex-column align-items-center">
                {badge}
                {/* Nút cập nhật kết quả nếu chưa xong (ví dụ) */}
                {!resultCode && <span className="text-muted small">Chưa ghi</span>}
            </div>
        );
    };

    // ================= 2. LOGIC TẢI FILE & API =================
    const downloadAttachment = async (appointmentId, file) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const url = `http://localhost:8080/api/appointment/${file.id}/download`;
            const res = await axios.get(url, {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = new Blob([res.data], { type: file.fileType || "application/octet-stream" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = downloadUrl; a.download = file.fileName;
            document.body.appendChild(a); a.click(); a.remove();
        } catch (err) { alert("Lỗi tải file"); }
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await appointmentApi.getLecturerAppointments();
            const sorted = res.data.sort((a, b) => 
                new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
            );
            setAppointments(sorted);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadAppointments(); }, []);

    const handleAction = async (actionFn, id, confirmMsg) => {
        if (window.confirm(confirmMsg)) {
            await actionFn(id);
            loadAppointments();
        }
    };

    // ================= 3. FILTER LOGIC =================
    const filteredAppointments = appointments.filter(appt => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
            (appt.studentName?.toLowerCase() || "").includes(term) ||
            (appt.studentCode?.toLowerCase() || "").includes(term) ||
            (appt.studentEmail?.toLowerCase() || "").includes(term);
        const matchDate = filterDate ? appt.date === filterDate : true;
        return matchSearch && matchDate;
    });

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            
            {/* HEADER & FILTER */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📅 Quản Lý Lịch Hẹn</h3>
                    <p className="text-muted mb-0">Danh sách yêu cầu tư vấn từ sinh viên</p>
                </div>

                <div className="d-flex gap-2">
                    <div className="input-group shadow-sm" style={{maxWidth: "250px"}}>
                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" className="form-control border-start-0 ps-0" placeholder="Tên, MSSV..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input 
                        type="date" className="form-control shadow-sm" style={{maxWidth: "150px"}}
                        value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    />
                    <button className="btn btn-light shadow-sm text-primary border" onClick={loadAppointments} title="Làm mới">
                        🔄
                    </button>
                </div>
            </div>

            {/* CARD BẢNG DỮ LIỆU */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1350px" }}>
                        
                        {/* THEAD: Đồng bộ với style của sinh viên (Sáng, chữ Xám đậm, Uppercase) */}
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold text-center">
                                <th className="py-3" style={{ width: "4%" }}>STT</th>
                                <th className="py-3 text-start" style={{ width: "15%" }}>Sinh viên</th>
                                <th className="py-3" style={{ width: "9%" }}>Ngày</th>
                                <th className="py-3" style={{ width: "11%" }}>Khung giờ</th>
                                <th className="py-3" style={{ width: "8%" }}>Hình thức</th>
                                <th className="py-3" style={{ width: "8%" }}>File</th>
                                <th className="py-3 text-start" style={{ width: "18%" }}>Lý do tư vấn</th>
                                <th className="py-3" style={{ width: "10%" }}>Trạng thái</th>
                                <th className="py-3" style={{ width: "10%" }}>Kết quả</th>
                                <th className="py-3" style={{ width: "7%" }}>Tác vụ</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr><td colSpan={10} className="text-center py-5 text-muted">Không tìm thấy dữ liệu phù hợp.</td></tr>
                            ) : (
                                filteredAppointments.map((appt, i) => (
                                    <tr key={appt.id}>
                                        {/* 1. STT */}
                                        <td className="text-center fw-bold text-muted">{i + 1}</td>

                                        {/* 2. Sinh viên (Gộp Tên + MSSV + Email cho gọn) */}
                                        <td className="text-start">
                                            <div className="fw-bold text-primary">{appt.studentName}</div>
                                            <div className="d-flex align-items-center gap-2 small text-muted mt-1">
                                                <span className="badge bg-light text-dark border">{appt.studentCode || "---"}</span>
                                            </div>
                                            <div className="small text-muted fst-italic mt-1" style={{fontSize: "0.8rem"}}>
                                                {appt.studentEmail}
                                            </div>
                                        </td>

                                        {/* 3. Ngày */}
                                        <td className="text-center fw-medium">{appt.date}</td>

                                        {/* 4. Khung giờ (Dùng hàm helper tính +30p) */}
                                        <td className="text-center">
                                            <span className="badge bg-white text-dark border px-2 py-1 shadow-sm font-monospace">
                                                🕒 {getDurationDisplay(appt.time)}
                                            </span>
                                        </td>

                                        {/* 5. Hình thức */}
                                        <td className="text-center">
                                            {appt.consultationType === "IN_PERSON"
                                                ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span>
                                                : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                            }
                                        </td>

                                        {/* 6. File */}
                                        <td className="text-center">
                                            {appt.attachments?.length > 0 ? (
                                                <div className="d-flex flex-column gap-1 align-items-center">
                                                    {appt.attachments.map(f => (
                                                        <button 
                                                            key={f.id}
                                                            className="btn btn-sm btn-outline-secondary border-0 py-0 px-1 d-flex align-items-center"
                                                            onClick={() => downloadAttachment(appt.id, f)}
                                                            title={f.fileName}
                                                        >
                                                            <span className="me-1 text-danger">📎</span> 
                                                            <span className="text-truncate" style={{maxWidth: "60px", fontSize: "0.8rem"}}>File</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted small opacity-50">-</span>}
                                        </td>

                                        {/* 7. Lý do */}
                                        <td className="text-start">
                                            <div className="text-truncate-2" style={{maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap", fontSize: "0.9rem"}} title={appt.reason}>
                                                {appt.reason || "Không có nội dung"}
                                            </div>
                                        </td>

                                        {/* 8. Trạng thái (Dùng helper) */}
                                        <td className="text-center">
                                            {getStatusBadge(appt.statusCode, appt.statusDescription)}
                                        </td>

                                        {/* 9. Kết quả (Dùng helper) */}
                                        <td className="text-center">
                                            {getResultDisplay(appt.consultationResult, appt.feedbackNote)}
                                        </td>

                                        {/* 10. Tác vụ (Nút tròn nhỏ) */}
                                        <td className="text-center">
                                            {/* PENDING: Duyệt / Từ chối */}
                                            {appt.statusCode === "PENDING" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-success btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "30px", height: "30px"}}
                                                        onClick={() => handleAction(appointmentApi.approve, appt.id, "Duyệt lịch hẹn này?")} title="Duyệt">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-danger btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "30px", height: "30px"}}
                                                        onClick={() => handleAction(appointmentApi.reject, appt.id, "Từ chối lịch hẹn này?")} title="Từ chối">
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {/* CANCEL_REQUEST: Đồng ý hủy / Giữ lại */}
                                            {appt.statusCode === "CANCEL_REQUEST" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-warning btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center text-dark" 
                                                        style={{width: "30px", height: "30px"}}
                                                        onClick={() => handleAction(appointmentApi.approveCancel, appt.id, "Chấp nhận yêu cầu hủy?")} title="Đồng ý hủy">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "30px", height: "30px"}}
                                                        onClick={() => handleAction(appointmentApi.rejectCancel, appt.id, "Từ chối yêu cầu hủy?")} title="Không hủy">
                                                        <i className="bi bi-arrow-return-left"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Đã khóa */}
                                            {["APPROVED", "COMPLETED", "REJECTED", "CANCELED"].includes(appt.statusCode) && (
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
            
            <div className="text-center mt-3 text-muted small">
                Hiển thị {filteredAppointments.length} bản ghi gần nhất.
            </div>
        </div>
    );
}