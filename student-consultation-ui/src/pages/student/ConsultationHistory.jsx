import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ConsultationHistory = () => {
    const token = localStorage.getItem("token");
    const [appointments, setAppointments] = useState([]);

    // 1. Load Data
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:8080/api/appointment/my", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => b.id - a.id);
                setAppointments(sorted);
            })
            .catch(console.error);
    }, [token]);

    // Helper: Tính giờ kết thúc
    const getDurationDisplay = (startTime, endTime) => {
        if (endTime) return `${startTime} - ${endTime}`;

        const [h, m] = startTime.split(':').map(Number);
        const date = new Date(); date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + 30);
        const newH = date.getHours(); const newM = date.getMinutes();
        const end = `${(newH < 10 ? '0' : '') + newH}:${(newM < 10 ? '0' : '') + newM}`;
        return `${startTime} - ${end}`;
    };

    // 2. Tải file
    const handleDownload = (attachmentId, fileName) => {
        fetch(`http://localhost:8080/api/appointment/${attachmentId}/download`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi tải file");
                return res.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = fileName;
                document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
            })
            .catch(e => alert(e.message));
    };

    // 3. Hủy lịch
    const cancelAppointment = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) return;

        fetch(`http://localhost:8080/api/appointment/${id}/cancel/student`, {
            method: "PUT", headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.ok) {
                alert("Đã hủy thành công");
                setAppointments(prev => prev.map(item =>
                    item.id === id ? { ...item, statusCode: 'CANCELLED', statusDescription: 'Đã hủy' } : item
                ));
            } else {
                alert("Không thể hủy lịch này (có thể GV đã duyệt rồi)");
            }
        });
    };

    // --- STYLE BADGES ---
    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success";
        if (code === 'PENDING') colorClass = "bg-warning text-dark";
        if (code === 'REJECTED') colorClass = "bg-danger";
        if (code === 'COMPLETED') colorClass = "bg-primary";

        return <span className={`badge rounded-pill ${colorClass} px-3 py-2`}>{text}</span>;
    };

    // --- HELPER HIỂN THỊ KẾT QUẢ ---
    const getResultDisplay = (resultCode, note) => {
        if (!resultCode) return <span className="text-muted small opacity-50">-</span>;

        let badge = <span className="badge bg-secondary">{resultCode}</span>;

        if (resultCode === 'SOLVED') badge = <span className="badge bg-success bg-opacity-75 text-white">✅ Đã giải quyết</span>;
        else if (resultCode === 'UNSOLVED') badge = <span className="badge bg-warning text-dark border">⚠️ Cần theo dõi thêm</span>;
        else if (resultCode === 'STUDENT_ABSENT') badge = <span className="badge bg-danger">❌ Vắng mặt</span>;
        else if (resultCode === 'CANCELLED_BY_GV') badge = <span className="badge bg-danger bg-opacity-75">⛔ Hủy bởi GV</span>;

        return (
            <div className="d-flex flex-column align-items-center">
                {badge}
                {note && (
                    <div className="small text-muted fst-italic mt-1 text-truncate" style={{ maxWidth: "140px" }} title={note}>
                        "{note}"
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container-fluid px-4 mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📋 Lịch Sử Tư Vấn</h3>
                    <p className="text-muted mb-0">Theo dõi trạng thái và kết quả các yêu cầu hỗ trợ của bạn</p>
                </div>
                <button className="btn btn-light shadow-sm text-primary fw-bold border" onClick={() => window.location.reload()}>
                    🔄 Làm mới
                </button>
            </div>

            {/* Card Bảng */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle mb-0" style={{ minWidth: "1250px" }}>
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold text-center">
                                {/* 1. STT */}
                                <th className="py-3" style={{ width: "4%" }}>STT</th>
                                {/* 2. Giảng viên */}
                                <th className="py-3 text-start" style={{ width: "14%" }}>Giảng viên</th>
                                {/* 3. Ngày hẹn */}
                                <th className="py-3" style={{ width: "9%" }}>Ngày hẹn</th>
                                {/* 4. Khung giờ */}
                                <th className="py-3" style={{ width: "11%" }}>Khung giờ</th>
                                {/* 5. Hình thức */}
                                <th className="py-3" style={{ width: "8%" }}>Hình thức</th>
                                {/* 6. File */}
                                <th className="py-3 text-start" style={{ width: "8%" }}>File đính kèm</th>
                                {/* 7. Chủ đề */}
                                <th className="py-3 text-start" style={{ width: "18%" }}>Chủ đề / Nội dung</th>
                                {/* 8. Trạng thái */}
                                <th className="py-3" style={{ width: "10%" }}>Trạng thái</th>
                                {/* 9. Kết quả (Mới thêm) */}
                                <th className="py-3" style={{ width: "13%" }}>Kết quả</th>
                                {/* 10. Hành động */}
                                <th className="py-3" style={{ width: "5%" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            Bạn chưa có yêu cầu tư vấn nào.
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {appointments.map((a, i) => (
                                <tr key={a.id} style={{ height: "65px" }}>
                                    {/* 1. STT */}
                                    <td className="fw-bold text-muted text-center">{i + 1}</td>

                                    {/* 2. Giảng viên */}
                                    <td className="text-start">
                                        {a.lecturerId ? ( // Kiểm tra nếu có ID giảng viên mới cho bấm
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                    style={{ width: "28px", height: "28px", fontSize: "11px" }}>
                                                    GV
                                                </div>

                                                {/* 👇 BIẾN TÊN THÀNH LINK Ở ĐÂY 👇 */}
                                                <Link
                                                    to={`/student/lecturer-info/${a.lecturerId}`}
                                                    className="fw-bold text-primary text-decoration-none text-truncate"
                                                    style={{ maxWidth: "130px", cursor: "pointer" }}
                                                    title="Xem thông tin giảng viên"
                                                >
                                                    {a.lecturerName}
                                                </Link>
                                                {/* 👆 -------------------------- 👆 */}

                                            </div>
                                        ) : (
                                            <span className="badge bg-light text-secondary border rounded-pill fw-normal">Đang xếp...</span>
                                        )}
                                    </td>

                                    {/* 3. Ngày hẹn */}
                                    <td className="text-center fw-medium text-secondary">
                                        {a.date}
                                    </td>

                                    {/* 4. Khung giờ */}
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "0.85rem" }}>
                                            🕒 {getDurationDisplay(a.time, a.endTime)}
                                        </span>
                                    </td>

                                    {/* 5. Hình thức */}
                                    <td className="text-center">
                                        {a.consultationType === "IN_PERSON"
                                            ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span>
                                            : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                        }
                                    </td>

                                    {/* 6. File */}
                                    <td className="text-start">
                                        {a.attachments && a.attachments.length > 0 ? (
                                            <div className="d-flex flex-column gap-1">
                                                {a.attachments.map(f => (
                                                    <a key={f.id} href="#"
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center border-0 text-start px-0 py-0"
                                                        onClick={(e) => { e.preventDefault(); handleDownload(f.id, f.fileName) }}
                                                        title="Tải xuống"
                                                    >
                                                        <span className="me-1 text-primary">📎</span>
                                                        <span className="text-truncate" style={{ maxWidth: "80px", fontSize: "0.85rem" }}>{f.fileName}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : <span className="text-muted small opacity-50">-</span>}
                                    </td>

                                    {/* 7. Chủ đề */}
                                    <td className="text-start">
                                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "250px" }} title={a.reason}>
                                            {a.reason || "Không có tiêu đề"}
                                        </div>
                                    </td>

                                    {/* 8. Trạng thái */}
                                    <td className="text-center">
                                        {getStatusBadge(a.statusCode, a.statusDescription)}
                                    </td>

                                    {/* 9. Kết quả (Cột riêng) */}
                                    <td className="text-center">
                                        {getResultDisplay(a.consultationResult, a.feedbackNote)}
                                    </td>

                                    {/* 10. Hành động */}
                                    <td className="text-center">
                                        {a.statusCode === 'PENDING' ? (
                                            <button
                                                className="btn btn-outline-danger btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto"
                                                style={{ width: "28px", height: "28px", padding: 0 }}
                                                title="Hủy yêu cầu"
                                                onClick={() => cancelAppointment(a.id)}
                                            >
                                                ✕
                                            </button>
                                        ) : (
                                            <span className="text-muted opacity-25">--</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center mt-4 text-muted small">
                Hiển thị {appointments.length} kết quả gần nhất.
            </div>
        </div>
    );
};

export default ConsultationHistory;