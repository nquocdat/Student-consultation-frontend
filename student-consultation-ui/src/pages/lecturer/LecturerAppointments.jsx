import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";
import axios from "axios";

export default function LecturerAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);


    const downloadAttachment = async (appointmentId, file) => {
        try {
            // 🛠️ SỬA 1: Lấy đúng key "token" (hoặc thử cả 2 nếu không chắc)
            let token = localStorage.getItem("token") || localStorage.getItem("accessToken");

            // Kiểm tra xem có lấy được không
            console.log("🔑 Token lấy được:", token);

            if (!token) {
                alert("Phiên đăng nhập hết hạn hoặc lỗi token. Vui lòng đăng nhập lại!");
                return;
            }

            // Xử lý nếu token bị dính dấu ngoặc kép "..." do JSON.stringify
            if (token.startsWith('"') && token.endsWith('"')) {
                token = token.slice(1, -1);
            }

            // 🛠️ SỬA 2: Sửa URL cho khớp với Backend AttachmentController
            // Backend: @RequestMapping("/api/attachments") -> GetMapping("/{id}/download")
            const url = `http://localhost:8080/api/appointment/${file.id}/download`;
            
            console.log("📥 Đang tải từ URL:", url);

            const res = await axios.get(url, {
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${token}` // Token giờ chắc chắn có giá trị
                }
            });

            // Tạo link tải
            const blob = new Blob([res.data], {
                type: file.fileType || "application/octet-stream"
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = file.fileName; // Tên file
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error("DOWNLOAD ERROR:", err);
            // Hiển thị lỗi chi tiết hơn
            if (err.response && err.response.status === 403) {
                alert("⛔ Bạn không có quyền tải file này (Lỗi 403).");
            } else if (err.response && err.response.status === 404) {
                alert("❌ File không tồn tại trên hệ thống (Lỗi 404).");
            } else {
                alert("❌ Lỗi tải file: " + err.message);
            }
        }
    };


    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await appointmentApi.getLecturerAppointments();

            // 🔥 SORT: lịch gần nhất lên trên
            const sorted = res.data.sort((a, b) => {
                const timeA = new Date(`${a.date}T${a.time}`);
                const timeB = new Date(`${b.date}T${b.time}`);
                return timeA - timeB;
            });

            setAppointments(sorted);
        } catch (error) {
            alert("Không lấy được lịch giảng viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // ====== ACTIONS ======
    const approve = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn duyệt lịch hẹn này?")) return;
        await appointmentApi.approve(id);
        loadAppointments();
    };

    const reject = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn từ chối lịch hẹn này?")) return;
        await appointmentApi.reject(id);
        loadAppointments();
    };

    const approveCancel = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn duyệt yêu cầu hủy?")) return;
        await appointmentApi.approveCancel(id);
        loadAppointments();
    };

    const rejectCancel = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn từ chối yêu cầu hủy?")) return;
        await appointmentApi.rejectCancel(id);
        loadAppointments();
    };

    // ====== STATUS UI ======
    const renderStatus = (code, text) => {
        const statusColor = {
            PENDING: "bg-warning text-dark",
            APPROVED: "bg-success",
            CANCEL_REQUEST: "bg-info text-dark",
            CANCELED: "bg-secondary",
            REJECTED: "bg-danger",
            COMPLETED: "bg-dark"
        };

        return (
            <span
                className={`badge py-2 ${statusColor[code] || "bg-light text-dark"}`}
                style={{
                    width: "140px",
                    display: "inline-block",
                    textAlign: "center"
                }}
            >
                {text}
            </span>
        );
    };

    // ====== CONSULTATION TYPE ======
    const renderConsultationType = (type) => {
        if (type === "IN_PERSON") return <span className="badge bg-primary">Trực tiếp</span>;
        if (type === "PHONE") return <span className="badge bg-info text-dark">Điện thoại</span>;
        return <span className="text-muted">—</span>;
    };

    // ====== ATTACHMENT ======
    const renderAttachment = (fileUrl) => {
        if (!fileUrl) return <span className="text-muted">—</span>;

        return (
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
            >
                 Xem file
            </a>
        );
    };

    if (loading) {
        return <p className="text-center mt-5">⏳ Đang tải dữ liệu...</p>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-3">📅 Quản lý lịch hẹn</h3>

            <table className="table table-bordered align-middle">
                <thead className="table-light text-center">
                    <tr>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Tên sinh viên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Hình thức</th>
                        <th>File đính kèm</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="9" className="text-center">
                                Chưa có lịch hẹn
                            </td>
                        </tr>
                    )}

                    {appointments.map(appt => (
                        <tr key={appt.id}>
                            <td className="text-center">{appt.date}</td>
                            <td className="text-center">{appt.time}</td>

                            <td>{appt.studentName}</td>
                            <td>{appt.studentEmail}</td>
                            <td>{appt.studentPhone}</td>

                            <td className="text-center">
                                {renderConsultationType(appt.consultationType)}
                            </td>

                            <td className="text-start">
                                {Array.isArray(appt.attachments) && appt.attachments.length > 0 ? (
                                    appt.attachments.map(file => (
                                        <div key={file.id}>
                                            <button
                                                className="btn btn-link p-0 text-decoration-none"
                                                onClick={() => downloadAttachment(appt.id, file)}
                                            >
                                                📎 {file.fileName}
                                            </button>

                                        </div>
                                    ))
                                ) : (
                                    <span className="text-muted">Không có</span>
                                )}
                            </td>



                            <td className="text-center">
                                {renderStatus(appt.statusCode, appt.statusDescription)}
                            </td>

                            <td className="text-center">
                                {appt.statusCode === "PENDING" && (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => approve(appt.id)}
                                        >
                                            Duyệt
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm ms-2"
                                            onClick={() => reject(appt.id)}
                                        >
                                            Từ chối
                                        </button>
                                    </>
                                )}

                                {appt.statusCode === "CANCEL_REQUEST" && (
                                    <>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => approveCancel(appt.id)}
                                        >
                                            Duyệt hủy
                                        </button>

                                        <button
                                            className="btn btn-secondary btn-sm ms-2"
                                            onClick={() => rejectCancel(appt.id)}
                                        >
                                            Từ chối
                                        </button>
                                    </>
                                )}

                                {["APPROVED", "CANCELED", "REJECTED", "COMPLETED"].includes(appt.statusCode) && (
                                    <span className="text-muted">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
