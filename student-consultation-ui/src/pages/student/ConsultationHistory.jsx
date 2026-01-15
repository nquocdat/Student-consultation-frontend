import { useEffect, useState } from "react";

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

    // 2. Tải file
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

    // 3. Hủy lịch
    const cancelAppointment = (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) return;
        
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

    // --- STYLE OBJECTS (Giúp code gọn hơn) ---
    const getStatusBadge = (code, text) => {
        let colorClass = "bg-secondary";
        if (code === 'APPROVED') colorClass = "bg-success";
        if (code === 'PENDING') colorClass = "bg-warning text-dark";
        if (code === 'REJECTED') colorClass = "bg-danger";
        if (code === 'COMPLETED') colorClass = "bg-primary";
        
        return <span className={`badge rounded-pill ${colorClass} px-3 py-2`}>{text}</span>;
    };

    return (
        // Sử dụng container-fluid để full màn hình, px-4 để có lề 2 bên đẹp
        <div className="container-fluid px-4 mt-4">
            
            {/* Header đẹp hơn */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">📋 Lịch Sử Tư Vấn</h3>
                    <p className="text-muted mb-0">Theo dõi trạng thái và kết quả các yêu cầu hỗ trợ của bạn</p>
                </div>
                {/* Nút làm mới danh sách (Optional) */}
                <button className="btn btn-light shadow-sm text-primary fw-bold" onClick={() => window.location.reload()}>
                    🔄 Làm mới
                </button>
            </div>
            
            {/* Card bo tròn, đổ bóng */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive"> 
                    <table className="table table-hover align-middle mb-0" style={{ minWidth: "1000px" }}>
                        <thead className="bg-light text-secondary">
                            <tr className="text-uppercase small fw-bold">
                                <th className="py-3 ps-4" style={{width: "5%"}}>#</th>
                                <th className="py-3" style={{width: "25%"}}>Chủ đề / Lý do</th> 
                                <th className="py-3" style={{width: "15%"}}>Giảng viên</th>
                                <th className="py-3" style={{width: "15%"}}>Thời gian</th>
                                <th className="py-3" style={{width: "10%"}}>Hình thức</th>
                                <th className="py-3" style={{width: "10%"}}>Trạng thái</th>
                                <th className="py-3" style={{width: "15%"}}>Tệp đính kèm</th>
                                <th className="py-3 text-center" style={{width: "5%"}}>Hủy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            Bạn chưa có yêu cầu tư vấn nào.
                                        </div>
                                    </td>
                                </tr>
                            )}
                            
                            {appointments.map((a, i) => (
                                <tr key={a.id} style={{ height: "70px" }}>
                                    <td className="ps-4 fw-bold text-muted">{i + 1}</td>
                                    
                                    <td>
                                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: "300px"}} title={a.reason}>
                                            {a.reason || "Không có tiêu đề"}
                                        </div>
                                    </td>

                                    <td>
                                        {a.lecturerName ? (
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: "35px", height: "35px", fontSize: "12px"}}>
                                                    GV
                                                </div>
                                                <span className="fw-medium">{a.lecturerName}</span>
                                            </div>
                                        ) : (
                                            <span className="badge bg-light text-secondary border rounded-pill fw-normal">Đang xếp GV...</span>
                                        )}
                                    </td>

                                    <td>
                                        <div className="small text-muted">{a.date}</div>
                                        <div className="fw-bold text-dark">{a.time}</div>
                                    </td>

                                    <td>
                                        {a.consultationType === "IN_PERSON" 
                                            ? <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">🏢 Trực tiếp</span> 
                                            : <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill">💻 Online</span>
                                        }
                                    </td>

                                    <td>
                                        {getStatusBadge(a.statusCode, a.statusDescription)}
                                    </td>

                                    <td>
                                        {a.attachments && a.attachments.length > 0 ? (
                                            <div className="d-flex flex-column gap-1">
                                                {a.attachments.map(f => (
                                                    <a key={f.id} href="#" 
                                                       className="btn btn-sm btn-outline-secondary d-flex align-items-center border-0 text-start px-0" 
                                                       onClick={(e)=>{e.preventDefault(); handleDownload(f.id,f.fileName)}}
                                                       title="Bấm để tải xuống"
                                                    >
                                                        <span className="me-2 text-primary">📎</span> 
                                                        <span className="text-truncate" style={{maxWidth: "150px"}}>{f.fileName}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : <span className="text-muted small">-</span>}
                                    </td>

                                    <td className="text-center">
                                        {a.statusCode === 'PENDING' ? (
                                            <button 
                                                className="btn btn-outline-danger btn-sm rounded-circle shadow-sm" 
                                                style={{width: "32px", height: "32px", padding: 0}}
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
            
            {/* Footer nhỏ */}
            <div className="text-center mt-4 text-muted small">
                Hiển thị {appointments.length} kết quả gần nhất.
            </div>
        </div>
    );
};

export default ConsultationHistory;