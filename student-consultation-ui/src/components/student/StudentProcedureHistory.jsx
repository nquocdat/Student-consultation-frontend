import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentProcedureHistory() {
    const DOMAIN = "http://localhost:8080";
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 1. THÊM STATE CHO BỘ LỌC NGÀY
    const [filterDate, setFilterDate] = useState("");

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

    // --- HÀM TẢI FILE CÁ NHÂN ---
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

    // --- HÀM VẼ TIMELINE ---
    const renderTimeline = (logString) => {
        if (!logString) return <span className="text-muted small fst-italic">-- Chưa có cập nhật --</span>;
        const logs = logString.split('\n').reverse();

        return (
            <div className="timeline-wrapper" style={{ maxHeight: "200px", overflowY: "auto", paddingLeft: "5px" }}>
                {logs.map((line, index) => {
                    const parts = line.split(" ## ");
                    if (parts.length < 3) return <div key={index} className="small text-muted mb-1 border-bottom pb-1">{line}</div>;

                    const [time, status, note] = parts;
                    const isLatest = index === 0;

                    return (
                        <div key={index} className="d-flex mb-3 position-relative">
                            {index !== logs.length - 1 && (
                                <div style={{
                                    position: "absolute", left: "5px", top: "15px", bottom: "-25px",
                                    width: "2px", backgroundColor: "#e9ecef", zIndex: 0
                                }}></div>
                            )}
                            <div className={`rounded-circle flex-shrink-0 ${isLatest ? "bg-success shadow-sm" : "bg-secondary"}`} 
                                style={{
                                    width: "12px", height: "12px", marginTop: "6px", marginRight: "12px", 
                                    zIndex: 1, border: isLatest ? "2px solid #d1e7dd" : "none"
                                }}>
                            </div>
                            <div>
                                <div className={`small fw-bold text-uppercase ${isLatest ? "text-success" : "text-secondary"}`}>
                                    {status}
                                </div>
                                <div className="text-dark small mb-1">{note}</div>
                                <div className="text-muted" style={{fontSize: "0.7rem"}}>
                                    <i className="bi bi-clock me-1"></i>{time}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 2. SỬA HÀM HIỂN THỊ TRẠNG THÁI (TIẾNG VIỆT)
    const getStatusBadge = (status) => {
        // Map class màu sắc
        const colorMap = {
            "PENDING": "bg-warning text-dark",
            "PROCESSING": "bg-info text-dark",
            "READY_FOR_PICKUP": "bg-success",
            "COMPLETED": "bg-primary",
            "REJECTED": "bg-danger"
        };

        // Map tên tiếng Việt
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

    // 3. LOGIC LỌC DỮ LIỆU
    const filteredHistory = history.filter(h => {
        if (!filterDate) return true; // Nếu chưa chọn ngày thì lấy hết
        // Chuyển đổi createdAt sang chuỗi YYYY-MM-DD để so sánh
        const createdDate = new Date(h.createdAt).toISOString().split('T')[0];
        return createdDate === filterDate;
    });

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">🔍 Kết Quả Hồ Sơ</h3>
            
            {/* 4. GIAO DIỆN BỘ LỌC NGÀY */}
            <div className="row mb-3">
                <div className="col-md-4 col-lg-3">
                    <div className="input-group">
                        <span className="input-group-text bg-light border-0"><i className="bi bi-calendar3"></i></span>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            placeholder="Lọc theo ngày gửi"
                        />
                        {filterDate && (
                            <button className="btn btn-outline-secondary" onClick={() => setFilterDate("")}>
                                Xóa lọc
                            </button>
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
                            {/* 5. DÙNG filteredHistory ĐỂ HIỂN THỊ */}
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((h, index) => (
                                    <tr key={h.id}>
                                        <td className="ps-3">{index + 1}</td>
                                        
                                        <td>
                                            <div className="fw-bold text-dark">{h.studentCode}</div>
                                            <small className="text-muted">{h.studentName}</small>
                                        </td>

                                        <td className="fw-bold text-primary">{h.procedureName}</td>

                                        <td>
                                            <div className="text-truncate-3 small text-muted" style={{maxHeight: "60px", overflowY: "auto"}}>
                                                {h.reason || "-- Không có nội dung --"}
                                            </div>
                                        </td>

                                        <td>
                                            {h.attachmentUrl ? (
                                                <button 
                                                    className="btn btn-sm btn-outline-primary border-0 bg-light" 
                                                    onClick={() => handleDownloadFile(h.id)}
                                                    title="Tải file đã gửi"
                                                >
                                                    <i className="bi bi-file-earmark-text me-1"></i> Tải về
                                                </button>
                                            ) : (
                                                <span className="text-muted small">--</span>
                                            )}
                                        </td>

                                        <td>{new Date(h.createdAt).toLocaleDateString('vi-VN')}</td>
                                        
                                        <td>{getStatusBadge(h.status)}</td>

                                        <td className="py-3">
                                            {renderTimeline(h.staffNote)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        Không tìm thấy hồ sơ nào {filterDate ? `trong ngày ${new Date(filterDate).toLocaleDateString('vi-VN')}` : ""}
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