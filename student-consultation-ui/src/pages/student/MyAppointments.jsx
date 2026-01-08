import { useEffect, useState } from "react";
import appointmentApi from "../../api/appointmentApi";

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // load danh sách lịch hẹn
    const loadAppointments = () => {
        setLoading(true);
        appointmentApi.getMyAppointments()
            .then(res => {
                setAppointments(res.data);
            })
            .catch(err => {
                console.error(err);
                alert("Không lấy được lịch hẹn");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // student gửi yêu cầu hủy
    const requestCancel = (id) => {
        if (!window.confirm("Bạn có chắc muốn gửi yêu cầu hủy lịch hẹn này?")) return;

        appointmentApi.requestCancel(id)
            .then(() => {
                alert("Đã gửi yêu cầu hủy tới giảng viên");
                loadAppointments(); // reload data
            })
            .catch(() => alert("Gửi yêu cầu hủy thất bại"));
    };

    if (loading) {
        return <p className="text-center">Đang tải...</p>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Lịch hẹn của tôi</h3>

            <table className="table table-bordered text-center">
                <thead className="table-light">
                    <tr>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Giảng viên</th>
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
                            <td>{appt.lecturerId}</td>

                            <td>
                                {appt.status === "PENDING" && "Chờ duyệt"}
                                {appt.status === "APPROVED" && "Đã duyệt"}
                                {appt.status === "CANCEL_REQUEST" && "Yêu cầu hủy"}
                                {appt.status === "CANCELED" && "Đã hủy"}
                            </td>

                            <td>
                                {/* PENDING → hủy luôn */}
                                {appt.status === "PENDING" && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => requestCancel(appt.id)}
                                    >
                                        Hủy
                                    </button>
                                )}

                                {/* APPROVED → gửi yêu cầu hủy */}
                                {appt.status === "APPROVED" && (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => requestCancel(appt.id)}
                                    >
                                        Yêu cầu hủy
                                    </button>
                                )}

                                {appt.status === "CANCEL_REQUEST" && (
                                    <span className="text-warning">Đã gửi yêu cầu</span>
                                )}

                                {appt.status === "CANCELED" && (
                                    <span className="text-danger">Đã hủy</span>
                                )}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
