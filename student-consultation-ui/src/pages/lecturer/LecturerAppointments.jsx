import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";
import axios from "axios";

export default function LecturerAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔍 STATES CHO TÌM KIẾM VÀ LỌC
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // ... (Giữ nguyên logic downloadAttachment)
    const downloadAttachment = async (appointmentId, file) => {
        try {
            let token = localStorage.getItem("token") || localStorage.getItem("accessToken");
            if (!token) { alert("Lỗi token"); return; }
            if (token.startsWith('"')) token = token.slice(1, -1);

            const url = `http://localhost:8080/api/appointment/${file.id}/download`;
            const res = await axios.get(url, {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = new Blob([res.data], { type: file.fileType || "application/octet-stream" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = file.fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error(err);
            alert("Lỗi tải file");
        }
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await appointmentApi.getLecturerAppointments();
            const sorted = res.data.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
            setAppointments(sorted);
        } catch (error) {
            alert("Không lấy được lịch giảng viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAppointments(); }, []);

    // ... (Giữ nguyên các hàm actions: approve, reject...)
    const approve = async (id) => { await appointmentApi.approve(id); loadAppointments(); };
    const reject = async (id) => { await appointmentApi.reject(id); loadAppointments(); };
    const approveCancel = async (id) => { await appointmentApi.approveCancel(id); loadAppointments(); };
    const rejectCancel = async (id) => { await appointmentApi.rejectCancel(id); loadAppointments(); };

    // 🔍 LOGIC LỌC DỮ LIỆU
    // Kết hợp cả tìm kiếm từ khóa VÀ ngày
    const filteredAppointments = appointments.filter(appt => {
        // 1. Lọc theo từ khóa (Tên hoặc Email)
        const matchSearch = 
            appt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Lọc theo ngày (Nếu có chọn ngày thì so sánh, không thì lấy hết)
        const matchDate = filterDate ? appt.date === filterDate : true;

        return matchSearch && matchDate;
    });

    // ====== UI COLORS ======
    const renderStatus = (code, text) => {
        const statusColor = { PENDING: "bg-warning text-dark", APPROVED: "bg-success", CANCEL_REQUEST: "bg-info text-dark", CANCELED: "bg-secondary", REJECTED: "bg-danger", COMPLETED: "bg-dark" };
        return <span className={`badge py-2 ${statusColor[code]}`} style={{ width: "130px", display: "inline-block", textAlign: "center" }}>{text}</span>;
    };

    // 🎨 MÀU ĐỐI LẬP CHO HÌNH THỨC TƯ VẤN
    const renderConsultationType = (type) => {
        if (type === "IN_PERSON") {
            // Màu Xanh Dương đậm
            return <span className="badge bg-primary" style={{ minWidth: "90px" }}>Trực tiếp</span>;
        }
        if (type === "PHONE") {
            // Màu Vàng Cam (đối lập với xanh) - text-dark để chữ dễ đọc
            return <span className="badge bg-warning text-dark" style={{ minWidth: "90px" }}>Điện thoại</span>;
        }
        return <span className="text-muted">—</span>;
    };

    if (loading) return <p className="text-center mt-5">⏳ Đang tải dữ liệu...</p>;

    return (
        // 1️⃣ SỬ DỤNG container-fluid ĐỂ FULL MÀN HÌNH
        <div className="container-fluid mt-3 px-3">
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="m-0 text-primary fw-bold">📅 Quản lý lịch hẹn</h3>
                
                {/* 🔍 THANH TÌM KIẾM & LỌC */}
                <div className="d-flex gap-2">
                    {/* Ô nhập từ khóa */}
                    <div className="input-group" style={{ width: "300px" }}>
                        <span className="input-group-text bg-white">🔍</span>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tìm tên hoặc email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Ô chọn ngày */}
                    <input 
                        type="date" 
                        className="form-control" 
                        style={{ width: "180px" }}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    
                    {/* Nút xóa lọc (chỉ hiện khi đang lọc) */}
                    {(searchTerm || filterDate) && (
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={() => { setSearchTerm(""); setFilterDate(""); }}
                        >
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            <div className="table-responsive" style={{ minHeight: "80vh" }}>
                <table className="table table-bordered align-middle table-hover shadow-sm" style={{ tableLayout: "fixed" }}>
                    <thead className="table-primary text-center align-middle">
                        <tr>
                            <th style={{ width: "8%" }}>Ngày</th>
                            <th style={{ width: "6%" }}>Giờ</th>
                            <th style={{ width: "12%" }}>Sinh viên</th>
                            <th style={{ width: "15%" }}>Email</th>
                            <th style={{ width: "9%" }}>SĐT</th>
                            <th style={{ width: "15%" }}>Lý do</th> {/* Cột lý do */}
                            <th style={{ width: "8%" }}>Hình thức</th>
                            <th style={{ width: "7%" }}>File</th>
                            <th style={{ width: "10%" }}>Trạng thái</th>
                            <th style={{ width: "10%" }}>Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {filteredAppointments.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center py-4 text-muted">
                                    {appointments.length === 0 ? "Chưa có lịch hẹn nào." : "Không tìm thấy kết quả phù hợp."}
                                </td>
                            </tr>
                        )}

                        {filteredAppointments.map(appt => (
                            <tr key={appt.id}>
                                <td className="text-center">{appt.date}</td>
                                <td className="text-center fw-bold text-primary">{appt.time?.slice(0, 5)}</td>
                                <td className="text-truncate fw-bold" title={appt.studentName}>{appt.studentName}</td>
                                <td className="text-truncate" title={appt.studentEmail}>{appt.studentEmail}</td>
                                <td className="text-center">{appt.studentPhone}</td>
                                
                                {/* Lý do */}
                                <td className="text-truncate" title={appt.reason}>
                                    {appt.reason || <span className="text-muted small">Checking...</span>}
                                </td>

                                <td className="text-center">
                                    {renderConsultationType(appt.consultationType)}
                                </td>

                                <td className="text-center">
                                    {appt.attachments?.length > 0 ? (
                                        appt.attachments.map(f => (
                                            <div key={f.id}>
                                                <button className="btn btn-link p-0 small text-decoration-none" onClick={() => downloadAttachment(appt.id, f)}>
                                                    📎 {f.fileName.length > 10 ? f.fileName.substring(0,8)+"..." : f.fileName}
                                                </button>
                                            </div>
                                        ))
                                    ) : <span className="text-muted small">—</span>}
                                </td>

                                <td className="text-center">
                                    {renderStatus(appt.statusCode, appt.statusDescription)}
                                </td>

                                <td className="text-center">
                                    <div className="d-flex flex-column gap-1">
                                        {appt.statusCode === "PENDING" && (
                                            <>
                                                <button className="btn btn-success btn-sm w-100" onClick={() => approve(appt.id)}>Duyệt</button>
                                                <button className="btn btn-danger btn-sm w-100" onClick={() => reject(appt.id)}>Từ chối</button>
                                            </>
                                        )}
                                        {appt.statusCode === "CANCEL_REQUEST" && (
                                            <>
                                                <button className="btn btn-warning btn-sm w-100" onClick={() => approveCancel(appt.id)}>Duyệt hủy</button>
                                                <button className="btn btn-secondary btn-sm w-100" onClick={() => rejectCancel(appt.id)}>Từ chối</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}