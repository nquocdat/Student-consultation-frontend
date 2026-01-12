import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";

export default function LecturerAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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
                📎 Xem file
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

                            <td className="text-center">
                                {renderAttachment(appt.attachmentUrl)}
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
