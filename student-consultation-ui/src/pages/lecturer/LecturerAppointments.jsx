import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";

export default function LecturerAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = () => {
        setLoading(true);
        appointmentApi.getLecturerAppointments()
            .then(res => setAppointments(res.data))
            .catch(() => alert("Không lấy được lịch giảng viên"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // duyệt lịch hẹn mới
    const approve = (id) => {
        appointmentApi.approve(id)
            .then(() => {
                alert("Đã duyệt lịch hẹn");
                loadAppointments();
            });
    };

    // từ chối lịch hẹn mới
    const reject = (id) => {
        appointmentApi.reject(id)
            .then(() => {
                alert("Đã từ chối lịch hẹn");
                loadAppointments();
            });
    };

    // duyệt yêu cầu hủy của sinh viên
    const approveCancel = (id) => {
        appointmentApi.approveCancel(id)
            .then(() => {
                alert("Đã duyệt yêu cầu hủy");
                loadAppointments();
            });
    };

    // từ chối yêu cầu hủy
    const rejectCancel = (id) => {
        appointmentApi.rejectCancel(id)
            .then(() => {
                alert("Đã từ chối yêu cầu hủy");
                loadAppointments();
            });
    };

    if (loading) {
        return <p className="text-center">Đang tải...</p>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Lịch hẹn giảng viên</h3>

            <table className="table table-bordered text-center">
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

                            <td>
                                {appt.status === "PENDING" && "Chờ duyệt"}
                                {appt.status === "APPROVED" && "Đã duyệt"}
                                {appt.status === "CANCEL_REQUEST" && "Sinh viên yêu cầu hủy"}
                                {appt.status === "CANCELED" && "Đã hủy"}
                                {appt.status === "REJECTED" && "Đã từ chối"}
                                {appt.status === "COMPLETED" && "Hoàn thành"}
                            </td>

                            <td>
                                {/* duyệt / từ chối lịch mới */}
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

                                {/* sinh viên gửi yêu cầu hủy */}
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

                                {/* các trạng thái còn lại */}
                                {(appt.status === "CANCELED" ||
                                  appt.status === "REJECTED" ||
                                  appt.status === "COMPLETED") && (
                                    <span>—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
