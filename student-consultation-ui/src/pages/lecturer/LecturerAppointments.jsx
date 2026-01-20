import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";
import axios from "axios";

export default function LecturerAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATES CHO FILTER & PAGINATION ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Bộ lọc trạng thái
    const [selectedStatuses, setSelectedStatuses] = useState(["PENDING", "APPROVED", "CANCEL_REQUEST"]);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Danh sách trạng thái
    const statusOptions = [
        { code: "PENDING", label: "Chờ duyệt", color: "text-warning" },
        { code: "APPROVED", label: "Đã duyệt", color: "text-success" },
        { code: "CANCEL_REQUEST", label: "Yêu cầu hủy", color: "text-info" },
        { code: "COMPLETED", label: "Hoàn thành", color: "text-primary" },
        { code: "REJECTED", label: "Từ chối", color: "text-danger" },
        { code: "CANCELED", label: "Đã hủy", color: "text-secondary" }
    ];

    // ================= HELPER FUNCTIONS =================
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const getDurationDisplay = (startTime) => {
        if (!startTime) return "-";
        const [h, m] = startTime.split(':').map(Number);
        const date = new Date(); date.setHours(h, m, 0, 0); date.setMinutes(date.getMinutes() + 30);
        const end = `${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
        return `${startTime.slice(0, 5)} - ${end}`;
    };

    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success";
        if (code === 'PENDING') colorClass = "bg-warning text-dark";
        if (code === 'REJECTED') colorClass = "bg-danger";
        if (code === 'COMPLETED') colorClass = "bg-primary";
        if (code === 'CANCEL_REQUEST') colorClass = "bg-info text-dark";
        return <span className={`badge rounded-pill ${colorClass} px-3 py-2 border border-light shadow-sm`} style={{ minWidth: "100px" }}>{text}</span>;
    };

    const getResultDisplay = (resultCode) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;
        if (resultCode === 'SOLVED') return <span className="badge bg-success bg-opacity-75 text-white border border-success"><i className="bi bi-check-circle me-1"></i>Đã giải quyết</span>;
        if (resultCode === 'UNSOLVED') return <span className="badge bg-warning text-dark border border-warning"><i className="bi bi-exclamation-circle me-1"></i>Cần theo dõi</span>;
        if (resultCode === 'STUDENT_ABSENT') return <span className="badge bg-danger border border-danger"><i className="bi bi-person-x me-1"></i>Vắng mặt</span>;
        if (resultCode === 'CANCELLED_BY_GV') return <span className="badge bg-secondary">⛔ Hủy bởi GV</span>;
        return <span className="badge bg-secondary">{resultCode}</span>;
    };

    // ================= API CALLS =================
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
            
            // ✅ SỬA LẠI SORT: Ngày gần nhất xếp trước (Tăng dần - Ascending)
            const sorted = res.data.sort((a, b) => 
                new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
            );
            
            setAppointments(sorted);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAppointments(); }, []);

    // ================= ACTION HANDLERS =================

    // 1. HÀM XỬ LÝ CHUNG
    const handleAction = async (actionFn, id, confirmMsg) => {
        if (!actionFn || typeof actionFn !== 'function') {
            alert("Lỗi: Hàm API chưa được khai báo đúng tên!");
            return;
        }
        if (window.confirm(confirmMsg)) {
            try {
                await actionFn(id);
                alert("Thao tác thành công!");
                loadAppointments(); 
            } catch (error) {
                console.error(error);
                alert("Có lỗi xảy ra: " + (error.response?.data || "Lỗi hệ thống"));
            }
        }
    };

    // 2. HÀM DUYỆT
    const handleApprove = async (appointment) => {
        let messageToSend = "";
        let userInput = "";
        
        if (appointment.consultationType === "IN_PERSON") {
            userInput = window.prompt("Nhập địa điểm phòng học / văn phòng:", "Vui lòng đến đúng giờ tại phòng C01.");
            if (userInput) messageToSend = userInput;
        } else {
            userInput = window.prompt("Dán Link Google Meet vào đây:", "https://meet.google.com/...");
            if (userInput && userInput.trim() !== "") messageToSend = `Link Google Meet: ${userInput}`;
        }

        if (userInput === null) return; 
        if (!messageToSend || messageToSend.trim() === "") {
            alert("Vui lòng nhập nội dung!"); return;
        }

        try {
            await appointmentApi.approve(appointment.id, messageToSend); 
            alert("Đã duyệt thành công!");
            loadAppointments(); 
        } catch (error) {
            alert("Lỗi khi duyệt: " + (error.response?.data || "Lỗi hệ thống"));
        }
    };

    // 3. HÀM CHỐT KẾT QUẢ
    const handleResult = async (id, type) => {
        let confirmMsg = "";
        let bodyData = {};

        if (type === "SUCCESS") {
            confirmMsg = "Xác nhận buổi tư vấn đã hoàn thành?";
            bodyData = { consultationResult: "SOLVED", note: "Đã hoàn thành tư vấn." };
        } else if (type === "ABSENT") {
            confirmMsg = "Xác nhận sinh viên VẮNG MẶT?";
            bodyData = { consultationResult: "STUDENT_ABSENT", note: "Sinh viên vắng mặt không lý do." };
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

    // ================= FILTER & PAGINATION LOGIC =================
    const filteredAppointments = appointments.filter(appt => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
            (appt.studentName?.toLowerCase() || "").includes(term) ||
            (appt.studentCode?.toLowerCase() || "").includes(term) ||
            (appt.studentEmail?.toLowerCase() || "").includes(term);

        const matchDate = filterDate ? appt.date === filterDate : true;
        const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(appt.statusCode);

        return matchSearch && matchDate && matchStatus;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleStatus = (code) => {
        setSelectedStatuses(prev =>
            prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]
        );
        setCurrentPage(1); 
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">

            {/* --- HEADER & TOOLBAR --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📅 Quản Lý Lịch Hẹn</h3>
                    <p className="text-muted mb-0">Danh sách yêu cầu tư vấn từ sinh viên</p>
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-start">
                    <div className="position-relative shadow-sm" style={{ width: "220px" }}>
                        <i className="bi bi-search position-absolute text-muted" style={{ top: "50%", left: "12px", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}></i>
                        <input type="text" className="form-control ps-5" placeholder="Tên, MSSV..." style={{ height: "38px", borderRadius: "8px" }} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>

                    <input type="date" className="form-control shadow-sm" style={{ width: "150px", height: "38px" }} value={filterDate} onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }} />

                    <div className="position-relative">
                        <button className="btn btn-white border shadow-sm dropdown-toggle d-flex align-items-center gap-2" style={{ height: "38px" }} onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                            <i className="bi bi-funnel"></i> Trạng thái ({selectedStatuses.length})
                        </button>
                        {showStatusDropdown && (
                            <>
                                <div className="card position-absolute shadow p-2 mt-1 z-3" style={{ width: "200px", right: 0 }}>
                                    <div className="d-flex flex-column gap-1">
                                        {statusOptions.map(opt => (
                                            <label key={opt.code} className="d-flex align-items-center gap-2 px-2 py-1 hover-bg-light rounded cursor-pointer">
                                                <input type="checkbox" checked={selectedStatuses.includes(opt.code)} onChange={() => toggleStatus(opt.code)} />
                                                <span className={`small fw-bold ${opt.color}`}>{opt.label}</span>
                                            </label>
                                        ))}
                                        <hr className="my-1" />
                                        <button className="btn btn-xs btn-link text-decoration-none text-center" onClick={() => setSelectedStatuses([])}>Xóa chọn tất cả</button>
                                    </div>
                                </div>
                                <div className="position-fixed top-0 start-0 w-100 h-100 z-2" onClick={() => setShowStatusDropdown(false)} />
                            </>
                        )}
                    </div>

                    <button className="btn btn-light shadow-sm text-primary border" style={{ height: "38px" }} onClick={loadAppointments} title="Làm mới">🔄</button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1850px" }}>
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
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr><td colSpan={14} className="text-center py-5 text-muted">Không tìm thấy dữ liệu phù hợp.</td></tr>
                            ) : (
                                currentItems.map((appt, i) => (
                                    <tr key={appt.id}>
                                        <td className="text-center fw-bold text-muted">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="text-center"><span className="badge bg-light text-dark border font-monospace">{appt.studentCode || "---"}</span></td>
                                        
                                        {/* ✅ SỬA Ở ĐÂY: Xóa fw-bold để tên không in đậm */}
                                        <td className="text-start text-dark">{appt.studentName}</td>
                                        
                                        <td className="text-center small">{appt.studentPhone || "--"}</td>
                                        <td className="text-start small text-truncate" style={{ maxWidth: "150px" }} title={appt.studentEmail}>{appt.studentEmail}</td>
                                        <td className="text-center fw-medium" style={{ fontSize: "0.9rem" }}>{formatDate(appt.date)}</td>
                                        <td className="text-center"><span className="badge bg-white text-dark border px-2 py-1 shadow-sm font-monospace">🕒 {getDurationDisplay(appt.time)}</span></td>
                                        <td className="text-center">
                                            {appt.consultationType === "IN_PERSON"
                                                ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span>
                                                : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                            }
                                        </td>
                                        <td className="text-center">
                                            {appt.attachments?.length > 0 ? (
                                                <div className="d-flex flex-column gap-1 align-items-center">
                                                    {appt.attachments.map(f => (
                                                        <button key={f.id} className="btn btn-sm btn-outline-secondary border-0 py-0 px-1 d-flex align-items-center" onClick={() => downloadAttachment(appt.id, f)} title={f.fileName}>
                                                            <span className="me-1 text-danger">📎</span><span className="text-truncate" style={{ maxWidth: "50px", fontSize: "0.8rem" }}>File</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted small opacity-50">-</span>}
                                        </td>
                                        <td className="text-start"><div className="text-truncate-2" style={{ maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap", fontSize: "0.9rem" }} title={appt.reason}>{appt.reason || "Không có nội dung"}</div></td>
                                        <td className="text-start"><div className="small text-muted fst-italic text-truncate-2" style={{ maxHeight: "3em", overflow: "hidden", whiteSpace: "pre-wrap" }} title={appt.feedbackNote}>{appt.feedbackNote || <span className="opacity-25">--</span>}</div></td>
                                        <td className="text-center">{getStatusBadge(appt.statusCode, appt.statusDescription)}</td>
                                        <td className="text-center">{getResultDisplay(appt.consultationResult)}</td>
                                        
                                        <td className="text-center">
                                            {appt.statusCode === "PENDING" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-success btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }} onClick={() => handleApprove(appt)} title="Duyệt"><i className="bi bi-check-lg"></i></button>
                                                    <button className="btn btn-danger btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }} onClick={() => handleAction(appointmentApi.reject, appt.id, "Từ chối?")} title="Từ chối"><i className="bi bi-x-lg"></i></button>
                                                </div>
                                            )}
                                            {appt.statusCode === "APPROVED" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-primary btn-sm shadow-sm px-2 py-1 d-flex align-items-center" style={{ fontSize: "0.7rem" }} onClick={() => handleResult(appt.id, "SUCCESS")} title="Xong"><i className="bi bi-check2-circle me-1"></i>Xong</button>
                                                    <button className="btn btn-outline-danger btn-sm shadow-sm px-2 py-1 d-flex align-items-center" style={{ fontSize: "0.7rem" }} onClick={() => handleResult(appt.id, "ABSENT")} title="Vắng"><i className="bi bi-person-slash me-1"></i>Vắng</button>
                                                </div>
                                            )}
                                            {appt.statusCode === "CANCEL_REQUEST" && (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-warning btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }} onClick={() => handleAction(appointmentApi.approveCancelRequest, appt.id, "Đồng ý hủy?")} title="Đồng ý"><i className="bi bi-check-lg"></i></button>
                                                    <button className="btn btn-secondary btn-sm rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }} onClick={() => handleAction(appointmentApi.rejectCancelRequest, appt.id, "Không hủy?")} title="Không"><i className="bi bi-arrow-return-left"></i></button>
                                                </div>
                                            )}
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

            {/* --- PAGINATION --- */}
            {filteredAppointments.length > 0 && (
                <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAppointments.length)} / {filteredAppointments.length} bản ghi</div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => paginate(currentPage - 1)}>Trước</button></li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button></li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => paginate(currentPage + 1)}>Sau</button></li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
}