import { useEffect, useState } from "react";

const ConsultationHistory = () => {
    const token = localStorage.getItem("token");
    const [appointments, setAppointments] = useState([]);

    // Load dữ liệu khi vào trang
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:8080/api/appointment/my", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setAppointments)
        .catch(console.error);
    }, [token]);

    const handleDownload = (attachmentId, fileName) => {
        fetch(`http://localhost:8080/api/appointment/${attachmentId}/download`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` },
        })
        .then(res => { 
            if(!res.ok) throw new Error("Lỗi tải file"); 
            return res.blob(); 
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = fileName;
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
        })
        .catch(e => alert(e.message));
    };

    const cancelAppointment = (id) => {
        if(!window.confirm("Hủy lịch này?")) return;
        fetch(`http://localhost:8080/api/appointment/${id}/cancel/student`, {
            method: "PUT", headers: { Authorization: `Bearer ${token}` }
        }).then(() => { 
            alert("Đã hủy"); 
            // Load lại danh sách sau khi hủy
            setAppointments(prev => prev.filter(item => item.id !== id));
        });
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3 text-primary fw-bold">📋 Kết quả xử lý / Lịch sử</h4>
            <div className="card shadow-sm">
                <table className="table table-bordered table-hover mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Giảng viên</th>
                            <th>Thời gian</th>
                            <th>Hình thức</th>
                            <th>Trạng thái</th>
                            <th>File</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-4">Chưa có lịch hẹn nào</td></tr>
                        )}
                        {appointments.map((a, i) => (
                            <tr key={a.id}>
                                <td>{i + 1}</td>
                                <td>{a.lecturerName || <span className="text-secondary fst-italic">⏳ Đang tìm GV...</span>}</td>
                                <td>
                                    <div>📅 {a.date}</div>
                                    <div className="fw-bold text-primary">⏰ {a.time}</div>
                                </td>
                                <td>{a.consultationType === "IN_PERSON" ? "Trực tiếp" : "Online"}</td>
                                <td>
                                    <span className={`badge ${a.statusCode==='APPROVED'?'bg-success':a.statusCode==='PENDING'?'bg-warning':'bg-secondary'}`}>
                                        {a.statusDescription}
                                    </span>
                                </td>
                                <td>
                                    {a.attachments?.map(f => (
                                        <div key={f.id}>
                                            <a href="#" className="text-decoration-none" onClick={(e)=>{e.preventDefault();handleDownload(f.id,f.fileName)}}>
                                                📎 {f.fileName}
                                            </a>
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    {a.statusCode === 'PENDING' && 
                                        <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(a.id)}>❌ Hủy</button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConsultationHistory;