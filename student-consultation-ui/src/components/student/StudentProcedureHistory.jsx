import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentProcedureHistory() {
    const DOMAIN = "http://localhost:8080";
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState("");

    // State lưu trữ các hàng đang mở rộng
    const [expandedRows, setExpandedRows] = useState(new Set());

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${DOMAIN}/api/procedures/request/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchHistory();
    }, []);

    // --- HÀM TOGGLE MỞ RỘNG ---
    const toggleExpand = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };

    const handleDownloadFile = async (requestId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/procedures/request/${requestId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `File_dinh_kem_${requestId}.docx`); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert("Không thể tải file! (File không tồn tại hoặc lỗi hệ thống)");
        }
    };

    // --- HÀM VẼ 1 DÒNG LOG (ĐÃ VIỆT HÓA) ---
    const renderSingleLogItem = (line, index, isLatest) => {
        const parts = line.split(" ## ");
        if (parts.length < 3) return <div key={index} className="small text-muted mb-1 pb-1">{line}</div>;

        const [time, status, note] = parts;

        // 👇 1. BỘ TỪ ĐIỂN DỊCH SANG TIẾNG VIỆT
        const statusMap = {
            "PENDING": "Chờ xử lý",
            "PROCESSING": "Đang xử lý",
            "READY_FOR_PICKUP": "Chờ nhận kết quả",
            "COMPLETED": "Hoàn thành",
            "REJECTED": "Đã từ chối"
        };
        const vietnameseStatus = statusMap[status] || status; // Nếu không khớp thì giữ nguyên tiếng Anh

        return (
            <div key={index} className="d-flex mb-2 position-relative animate__animated animate__fadeIn">
                {/* Đường kẻ nối */}
                <div style={{
                    position: "absolute", left: "5px", top: "12px", bottom: "-15px",
                    width: "2px", backgroundColor: "#e9ecef", zIndex: 0,
                    display: isLatest ? "none" : "block"
                }}></div>

                <div className={`rounded-circle flex-shrink-0 ${isLatest ? "bg-success shadow-sm" : "bg-secondary"}`} 
                    style={{
                        width: "12px", height: "12px", marginTop: "6px", marginRight: "12px", 
                        zIndex: 1, border: isLatest ? "2px solid #d1e7dd" : "none"
                    }}>
                </div>
                <div>
                    {/* 👇 2. HIỂN THỊ TIẾNG VIỆT Ở ĐÂY */}
                    <div className={`small fw-bold text-uppercase ${isLatest ? "text-success" : "text-secondary"}`}>
                        {vietnameseStatus}
                    </div>
                    <div className="text-dark small mb-1">{note}</div>
                    <div className="text-muted" style={{fontSize: "0.7rem"}}>
                        <i className="bi bi-clock me-1"></i>{time}
                    </div>
                </div>
            </div>
        );
    };

    // --- HÀM VẼ TIMELINE CHÍNH ---
    const renderTimeline = (logString, rowId) => {
        if (!logString) return <span className="text-muted small fst-italic">-- Chưa có cập nhật --</span>;
        
        const logs = logString.split('\n').reverse(); // Mới nhất lên đầu
        const isExpanded = expandedRows.has(rowId);
        
        const latestLog = logs[0];
        const olderLogs = logs.slice(1);

        return (
            <div className="timeline-wrapper" style={{ paddingLeft: "5px" }}>
                {renderSingleLogItem(latestLog, 0, true)}

                {olderLogs.length > 0 && (
                    <div className="ms-4 mb-2">
                        <span 
                            className="text-primary small fw-bold" 
                            style={{cursor: "pointer", fontSize: "0.75rem", userSelect: "none"}}
                            onClick={() => toggleExpand(rowId)}
                        >
                            {isExpanded ? (
                                <span><i className="bi bi-chevron-up me-1"></i> Thu gọn</span>
                            ) : (
                                <span><i className="bi bi-chevron-down me-1"></i> Lịch sử ({olderLogs.length})</span>
                            )}
                        </span>
                    </div>
                )}

                {isExpanded && olderLogs.map((line, index) => (
                    renderSingleLogItem(line, index + 1, false)
                ))}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const colorMap = {
            "PENDING": "bg-warning text-dark",
            "PROCESSING": "bg-info text-dark",
            "READY_FOR_PICKUP": "bg-success",
            "COMPLETED": "bg-primary",
            "REJECTED": "bg-danger"
        };
        const textMap = {
            "PENDING": "Chờ xử lý",
            "PROCESSING": "Đang xử lý",
            "READY_FOR_PICKUP": "Chờ nhận KQ",
            "COMPLETED": "Hoàn thành",
            "REJECTED": "Đã từ chối"
        };
        return <span className={`badge ${colorMap[status] || "bg-secondary"}`}>
            {textMap[status] || status}
        </span>;
    };

    const filteredHistory = history.filter(h => {
        if (!filterDate) return true;
        const createdDate = new Date(h.createdAt).toISOString().split('T')[0];
        return createdDate === filterDate;
    });

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">🔍 Kết Quả Hồ Sơ</h3>
            
            <div className="row mb-3">
                <div className="col-md-4 col-lg-3">
                    <div className="input-group">
                        <span className="input-group-text bg-light border-0"><i className="bi bi-calendar3"></i></span>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                        {filterDate && (
                            <button className="btn btn-outline-secondary" onClick={() => setFilterDate("")}>Xóa lọc</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-nowrap">
                            <tr>
                                <th className="ps-3">STT</th>
                                <th>Sinh Viên</th>
                                <th>Thủ tục</th>
                                <th style={{width: "15%"}}>Nội dung gửi</th>
                                <th>File đính kèm</th>
                                <th>Ngày gửi</th>
                                <th>Trạng thái</th>
                                <th style={{width: "30%", minWidth: "250px"}}>Kết quả xử lý</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((h, index) => (
                                    <tr key={h.id} style={{verticalAlign: "top"}}>
                                        <td className="ps-3 pt-3">{index + 1}</td>
                                        
                                        <td className="pt-3">
                                            <div className="fw-bold text-dark">{h.studentCode}</div>
                                            <small className="text-muted">{h.studentName}</small>
                                        </td>

                                        <td className="fw-bold text-primary pt-3">{h.procedureName}</td>

                                        <td className="pt-3">
                                            <div className="text-truncate-3 small text-muted" style={{maxHeight: "60px", overflowY: "auto"}}>
                                                {h.reason || "-- Không có nội dung --"}
                                            </div>
                                        </td>

                                        <td className="pt-3">
                                            {h.attachmentUrl ? (
                                                <button 
                                                    className="btn btn-sm btn-outline-primary border-0 bg-light" 
                                                    onClick={() => handleDownloadFile(h.id)}
                                                    title="Tải file đã gửi"
                                                >
                                                    <i className="bi bi-file-earmark-text me-1"></i> Tải về
                                                </button>
                                            ) : <span className="text-muted small">--</span>}
                                        </td>

                                        <td className="pt-3">{new Date(h.createdAt).toLocaleDateString('vi-VN')}</td>
                                        
                                        <td className="pt-3">{getStatusBadge(h.status)}</td>

                                        <td className="py-3">
                                            {renderTimeline(h.staffNote, h.id)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        Không tìm thấy hồ sơ nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}