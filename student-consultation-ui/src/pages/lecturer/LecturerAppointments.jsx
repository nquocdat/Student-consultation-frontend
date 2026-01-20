import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";
import axios from "axios";

export default function LecturerAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // SEARCH & FILTER STATE
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // ================= 1. HELPER FUNCTIONS (Định dạng dữ liệu) =================
    
    // Format Date: yyyy-mm-dd -> dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    // Format Time Range: Start -> Start - End (+30 mins)
    const getDurationDisplay = (startTime) => {
        if (!startTime) return "-";
        const [h, m] = startTime.split(':').map(Number);
        const date = new Date(); 
        date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + 30);
        
        const newH = date.getHours(); 
        const newM = date.getMinutes();
        // Format HH:mm
        const end = `${(newH < 10 ? '0' : '') + newH}:${(newM < 10 ? '0' : '') + newM}`;
        
        return `${startTime.slice(0, 5)} - ${end}`;
    };

    // Render Badge Trạng Thái (Status)
    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success"; // Đã duyệt (Xanh lá)
        if (code === 'PENDING') colorClass = "bg-warning text-dark"; // Chờ duyệt (Vàng)
        if (code === 'REJECTED') colorClass = "bg-danger"; // Từ chối (Đỏ)
        if (code === 'COMPLETED') colorClass = "bg-primary"; // Hoàn thành (Xanh dương)
        if (code === 'CANCEL_REQUEST') colorClass = "bg-info text-dark"; // Yêu cầu hủy (Xanh lơ)
        if (code === 'CANCELED') colorClass = "bg-secondary"; // Đã hủy (Xám)

        return (
            <span className={`badge rounded-pill ${colorClass} px-3 py-2 border border-light shadow-sm`} style={{minWidth: "100px"}}>
                {text}
            </span>
        );
    };

    // Render Kết Quả Buổi Hẹn (Result)
    const getResultDisplay = (resultCode) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;

        let badge = <span className="badge bg-secondary">{resultCode}</span>;
        
        if (resultCode === 'SOLVED') 
            badge = <span className="badge bg-success bg-opacity-75 text-white border border-success"><i className="bi bi-check-circle me-1"></i>Đã giải quyết</span>;
        else if (resultCode === 'UNSOLVED') 
            badge = <span className="badge bg-warning text-dark border border-warning"><i className="bi bi-exclamation-circle me-1"></i>Cần theo dõi</span>;
        else if (resultCode === 'STUDENT_ABSENT') 
            badge = <span className="badge bg-danger border border-danger"><i className="bi bi-person-x me-1"></i>Vắng mặt</span>;
        else if (resultCode === 'CANCELLED_BY_GV') 
            badge = <span className="badge bg-secondary">⛔ Hủy bởi GV</span>;

        return badge;
    };

    // ================= 2. LOGIC TẢI FILE & API =================
    
    const downloadAttachment = async (appointmentId, file) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const url = `http://localhost:8080/api/appointment/${file.id}/download`;
            const res = await axios.get(url, { responseType: "blob", headers: { Authorization: `Bearer ${token}` } });
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
            // Sắp xếp: Mới nhất lên đầu (hoặc ngày gần nhất)
            // Logic: Ngày (giảm dần) -> Giờ (giảm dần) để xem cái mới nhất
            const sorted = res.data.sort((a, b) => 
                new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
            );
            setAppointments(sorted);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadAppointments(); }, []);

    // ================= 3. HANDLE ACTIONS (Xử lý sự kiện) =================

    // Xử lý DUYỆT (Approve) - Có nhập tin nhắn
    // HÀM DUYỆT: Cho phép nhập liệu ở cả 2 trường hợp
    // HÀM DUYỆT (ĐÃ SỬA FORMAT TIN NHẮN)
    const handleApprove = async (appointment) => {
        let messageToSend = ""; // Nội dung cuối cùng sẽ gửi lên API
        let userInput = "";     // Nội dung giảng viên nhập vào (địa điểm hoặc link)
        
        // TRƯỜNG HỢP 1: Gặp trực tiếp -> Nhập địa điểm
        if (appointment.consultationType === "IN_PERSON") {
            userInput = window.prompt(
                "Nhập địa điểm phòng học / văn phòng:", 
                "Vui lòng đến đúng giờ tại phòng C01."
            );
            // Với trực tiếp, thường giảng viên nhập cả câu nên gán luôn
            messageToSend = userInput; 
        } 
        // TRƯỜNG HỢP 2: Online -> Nhập Link Meet (SỬA ĐOẠN NÀY)
        else {
            userInput = window.prompt(
                "Dán Link Google Meet vào đây:", 
                "https://meet.google.com/..." 
            );

            // Nếu giảng viên có nhập link, ta ghép vào câu văn mẫu
            if (userInput && userInput.trim() !== "") {
                messageToSend = `Link Google Meet: ${userInput} để tham gia cuộc tư vấn.`;
            }
        }

        // --- VALIDATION (Kiểm tra dữ liệu đầu vào) ---

        // 1. Nếu bấm Cancel (userInput là null) -> Dừng
        if (userInput === null) return;

        // 2. Nếu nhập chuỗi rỗng hoặc toàn dấu cách -> Báo lỗi
        if (userInput.trim() === "") {
            alert("Vui lòng nhập nội dung (Địa điểm hoặc Link Meet)!");
            return;
        }

        // --- GỬI API ---
        try {
            // Gửi messageToSend (đã được format đẹp) lên server
            await appointmentApi.approve(appointment.id, messageToSend); 
            alert("Đã duyệt thành công!");
            loadAppointments(); 
        } catch (error) {
            alert("Lỗi khi duyệt lịch hẹn: " + (error.response?.data || "Lỗi hệ thống"));
        }
    };

    // Xử lý CHỐT KẾT QUẢ (Hoàn thành / Vắng mặt)
    const handleResult = async (id, type) => {
        let confirmMsg = "";
        let bodyData = {};

        if (type === "SUCCESS") {
            confirmMsg = "Xác nhận buổi tư vấn đã hoàn thành?";
            // Cho phép nhập thêm ghi chú kết quả (nếu muốn)
            // const note = window.prompt("Ghi chú kết quả (optional):", "Đã hoàn thành.");
            bodyData = { 
                consultationResult: "SOLVED", 
                note: "Đã hoàn thành tư vấn." 
            };
        } else if (type === "ABSENT") {
            confirmMsg = "Xác nhận sinh viên VẮNG MẶT?";
            bodyData = { 
                consultationResult: "STUDENT_ABSENT", 
                note: "Sinh viên vắng mặt không lý do." 
            };
        }

        if (!window.confirm(confirmMsg)) return;

        try {
            await appointmentApi.updateResult(id, bodyData);
            alert("Đã cập nhật kết quả!");
            loadAppointments();
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data || "Lỗi hệ thống"));
        }
    };

    // Xử lý Từ chối / Hủy (Chung)
    const handleAction = async (actionFn, id, confirmMsg) => {
        if (window.confirm(confirmMsg)) {
            await actionFn(id);
            loadAppointments();
        }
    };

    // ================= 4. FILTER LOGIC =================
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

    // ================= 5. RENDER UI =================
    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            
            {/* Header Title & Filter Tools */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📅 Quản Lý Lịch Hẹn</h3>
                    <p className="text-muted mb-0">Danh sách yêu cầu tư vấn từ sinh viên</p>
                </div>
                
                <div className="d-flex gap-2">
                    <div className="input-group shadow-sm" style={{maxWidth: "250px"}}>
                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" className="form-control border-start-0 ps-0" 
                            placeholder="Tìm tên, MSSV..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <input 
                        type="date" className="form-control shadow-sm" style={{maxWidth: "150px"}} 
                        value={filterDate} onChange={e => setFilterDate(e.target.value)} 
                    />
                    <button className="btn btn-light shadow-sm text-primary border" onClick={loadAppointments} title="Làm mới dữ liệu">
                        🔄
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    {/* Set minWidth lớn để không bị vỡ layout khi nhiều cột */}
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1850px" }}>
                        
                        {/* Table Header */}
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold text-center">
                                <th className="py-3" style={{ width: "3%" }}>STT</th>
                                <th className="py-3" style={{ width: "6%" }}>Mã SV</th>
                                <th className="py-3 text-start" style={{ width: "10%" }}>Tên Sinh viên</th>
                                <th className="py-3" style={{ width: "7%" }}>SĐT</th>
                                <th className="py-3 text-start" style={{ width: "10%" }}>Email</th>
                                <th className="py-3" style={{ width: "7%" }}>Ngày</th>
                                <th className="py-3" style={{ width: "8%" }}>Khung giờ</th>
                                <th className="py-3" style={{ width: "7%" }}>Hình thức</th>
                                <th className="py-3" style={{ width: "5%" }}>File</th>
                                <th className="py-3 text-start" style={{ width: "12%" }}>Lý do tư vấn</th>
                                <th className="py-3 text-start" style={{ width: "12%" }}>Ghi chú / Lời nhắn</th>
                                <th className="py-3" style={{ width: "8%" }}>Trạng thái</th>
                                <th className="py-3" style={{ width: "8%" }}>Kết quả</th>
                                <th className="py-3" style={{ width: "7%" }}>Tác vụ</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr><td colSpan={14} className="text-center py-5 text-muted">Không tìm thấy dữ liệu phù hợp.</td></tr>
                            ) : (
                                filteredAppointments.map((appt, i) => (
                                    <tr key={appt.id}>
                                        <td className="text-center fw-bold text-muted">{i + 1}</td>
                                        
                                        {/* Thông tin Sinh viên */}
                                        <td className="text-center"><span className="badge bg-light text-dark border font-monospace">{appt.studentCode || "---"}</span></td>
                                        <td className="text-start fw-bold text-dark">{appt.studentName}</td>
                                        <td className="text-center small">{appt.studentPhone || "--"}</td>
                                        <td className="text-start small text-truncate" style={{maxWidth: "150px"}} title={appt.studentEmail}>{appt.studentEmail}</td>
                                        
                                        {/* Thời gian */}
                                        <td className="text-center fw-medium" style={{ fontSize: "0.9rem" }}>{formatDate(appt.date)}</td>
                                        <td className="text-center"><span className="badge bg-white text-dark border px-2 py-1 shadow-sm font-monospace">🕒 {getDurationDisplay(appt.time)}</span></td>
                                        
                                        {/* Hình thức */}
                                        <td className="text-center">
                                            {appt.consultationType === "IN_PERSON"
                                                ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span>
                                                : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                            }
                                        </td>

                                        {/* File đính kèm */}
                                        <td className="text-center">
                                            {appt.attachments?.length > 0 ? (
                                                <div className="d-flex flex-column gap-1 align-items-center">
                                                    {appt.attachments.map(f => (
                                                        <button key={f.id} className="btn btn-sm btn-outline-secondary border-0 py-0 px-1 d-flex align-items-center" 
                                                            onClick={() => downloadAttachment(appt.id, f)} title={f.fileName}>
                                                            <span className="me-1 text-danger">📎</span><span className="text-truncate" style={{maxWidth: "50px", fontSize: "0.8rem"}}>File</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted small opacity-50">-</span>}
                                        </td>

                                        {/* Lý do & Ghi chú */}
                                        <td className="text-start">
                                            <div className="text-truncate-2" style={{maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap", fontSize: "0.9rem"}} title={appt.reason}>
                                                {appt.reason || "Không có nội dung"}
                                            </div>
                                        </td>
                                        <td className="text-start">
                                            <div className="small text-muted fst-italic text-truncate-2" style={{maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap"}} title={appt.feedbackNote}>
                                                {appt.feedbackNote || <span className="opacity-25">--</span>}
                                            </div>
                                        </td>

                                        {/* Trạng thái & Kết quả */}
                                        <td className="text-center">{getStatusBadge(appt.statusCode, appt.statusDescription)}</td>
                                        <td className="text-center">{getResultDisplay(appt.consultationResult)}</td>

                                        {/* Tác vụ (Action Buttons) */}
                                        <td className="text-center">
                                            
                                            {/* 1. CHỜ DUYỆT (PENDING) -> Duyệt / Từ chối */}
                                            {appt.statusCode === "PENDING" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-success btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "32px", height: "32px"}} onClick={() => handleApprove(appt)} title="Duyệt & Nhắn tin">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-danger btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "32px", height: "32px"}} onClick={() => handleAction(appointmentApi.reject, appt.id, "Từ chối lịch hẹn này?")} title="Từ chối">
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {/* 2. ĐÃ DUYỆT (APPROVED) -> Chốt kết quả (Xong / Vắng) */}
                                            {appt.statusCode === "APPROVED" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-primary btn-sm shadow-sm px-2 py-1 d-flex align-items-center" 
                                                        style={{fontSize: "0.7rem"}} onClick={() => handleResult(appt.id, "SUCCESS")} title="Hoàn thành">
                                                        <i className="bi bi-check2-circle me-1"></i>Xong
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm shadow-sm px-2 py-1 d-flex align-items-center" 
                                                        style={{fontSize: "0.7rem"}} onClick={() => handleResult(appt.id, "ABSENT")} title="Vắng mặt">
                                                        <i className="bi bi-person-slash me-1"></i>Vắng
                                                    </button>
                                                </div>
                                            )}

                                            {/* 3. YÊU CẦU HỦY (CANCEL_REQUEST) -> Đồng ý / Không */}
                                            {appt.statusCode === "CANCEL_REQUEST" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-warning btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center text-dark" 
                                                        style={{width: "32px", height: "32px"}} onClick={() => handleAction(appointmentApi.approveCancel, appt.id, "Chấp nhận yêu cầu hủy?")} title="Đồng ý hủy">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                                        style={{width: "32px", height: "32px"}} onClick={() => handleAction(appointmentApi.rejectCancel, appt.id, "Từ chối yêu cầu hủy?")} title="Không hủy">
                                                        <i className="bi bi-arrow-return-left"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {/* 4. ĐÃ KẾT THÚC -> Khóa */}
                                            {["COMPLETED", "REJECTED", "CANCELED"].includes(appt.statusCode) && (
                                                <span className="text-muted opacity-25"><i className="bi bi-lock-fill fs-5"></i></span>
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
                Hiển thị {filteredAppointments.length} bản ghi phù hợp.
            </div>
        </div>
    );
}