import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";

export default function LecturerAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await appointmentApi.getLecturerAppointments();
            setAppointments(res.data);
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

    // ====== UI ======
    const renderStatus = (status) => {
        switch (status) {
            case "PENDING":
                return <span className="badge bg-warning">Chờ duyệt</span>;
            case "APPROVED":
                return <span className="badge bg-success">Đã duyệt</span>;
            case "CANCEL_REQUEST":
                return <span className="badge bg-info">Yêu cầu hủy</span>;
            case "CANCELED":
                return <span className="badge bg-secondary">Đã hủy</span>;
            case "REJECTED":
                return <span className="badge bg-danger">Đã từ chối</span>;
            case "COMPLETED":
                return <span className="badge bg-dark">Hoàn thành</span>;
            default:
                return status;
        }
    };

    if (loading) {
        return <p className="text-center mt-5">⏳ Đang tải dữ liệu...</p>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-3">📅 Lịch hẹn giảng viên</h3>

            <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                    <tr>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Sinh viên</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="5">Chưa có lịch hẹn</td>
                        </tr>
                    )}

                    {appointments.map(appt => (
                        <tr key={appt.id}>
                            <td>{appt.date}</td>
                            <td>{appt.time}</td>
                            <td>{appt.studentId}</td>
                            <td>{renderStatus(appt.status)}</td>

                            <td>
                                {appt.status === "PENDING" && (
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

                                {appt.status === "CANCEL_REQUEST" && (
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

                                {(appt.status === "CANCELED" ||
                                  appt.status === "REJECTED" ||
                                  appt.status === "COMPLETED") && (
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
