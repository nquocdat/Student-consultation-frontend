import { useEffect, useState } from "react";
import axios from "axios";

const AdminLogs = () => {
    const [allLogs, setAllLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchDate, setSearchDate] = useState("");

    const actionMap = {
        'LOGIN': 'Đăng nhập',
        'CREATE_REQUEST': 'Tạo yêu cầu',
        'CANCEL_REQUEST': 'Hủy yêu cầu',
        'REQUEST_CANCEL': 'Gửi yêu cầu hủy',
        'APPROVE_APPOINTMENT': 'Duyệt lịch hẹn',
        'REJECT_APPOINTMENT': 'Từ chối lịch',
        'UPDATE_STATUS': 'Cập nhật trạng thái',
        'COMPLETE_REQUEST': 'Hoàn thành tư vấn',
        'APPROVE_CANCEL': 'Chấp nhận hủy',
        'REJECT_CANCEL': 'Từ chối hủy',
        'DELETE_APPOINTMENT': 'Xóa lịch hẹn',
        'UPDATE_STATUS_RESULT': 'Cập nhật kết quả'
    };

    const roleMap = {
        'STUDENT': 'Sinh viên',
        'LECTURER': 'Giảng viên',
        'ADMIN': 'Quản trị viên',
        'STAFF': 'Nhân viên'
    };

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get("http://localhost:8080/api/admin/logs", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllLogs(res.data);
                setFilteredLogs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLogs();
    }, []);

    const handleDateFilter = (e) => {
        const date = e.target.value;
        setSearchDate(date);
        if (!date) {
            setFilteredLogs(allLogs);
        } else {
            const result = allLogs.filter(log => 
                log.timestamp && log.timestamp.startsWith(date)
            );
            setFilteredLogs(result);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    // 🔥 HÀM MỚI: KHÔNG XÓA ID MÀ LÀM NỔI BẬT NÓ
    const renderDescription = (desc) => {
        if (!desc) return "";
        
        // Tách chuỗi dựa trên mẫu ID (VD: "(ID: 74)" hoặc "#57")
        // Regex này sẽ chia chuỗi thành các phần, giữ lại cả phần ID
        const parts = desc.split(/(\(ID:\s*\d+\)|#\d+)/g);

        return (
            <span>
                {parts.map((part, index) => {
                    // Nếu phần này khớp với định dạng ID -> In đậm + Màu xanh
                    if (part.match(/^(\(ID:\s*\d+\)|#\d+)$/)) {
                        return (
                            <span key={index} className="fw-bold text-primary mx-1">
                                {part}
                            </span>
                        );
                    }
                    // Các phần chữ thường -> Hiển thị bình thường
                    return <span key={index}>{part}</span>;
                })}
            </span>
        );
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">📜 Nhật ký hoạt động</h4>
                
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-muted small">Lọc theo ngày:</span>
                    <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        style={{width: "150px"}}
                        value={searchDate}
                        onChange={handleDateFilter}
                    />
                    {searchDate && (
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                                setSearchDate("");
                                setFilteredLogs(allLogs);
                            }}
                        >
                            <i className="bi bi-x-lg"></i> Xóa
                        </button>
                    )}
                </div>
            </div>
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="py-3 ps-4">Thời gian</th>
                                <th className="py-3">Người dùng</th>
                                <th className="py-3">Vai trò</th> 
                                <th className="py-3">Hành động</th>
                                <th className="py-3">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <tr key={log.id} style={{borderBottom: '1px solid #f0f0f0'}}>
                                        <td className="text-muted small ps-4">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        
                                        <td>
                                            <div className="fw-bold text-dark">
                                                {log.user?.fullName}
                                            </div>
                                            <div className="small text-muted" style={{fontSize: '0.8rem'}}>
                                                <i className="bi bi-person-badge me-1"></i>
                                                {log.user?.username} 
                                            </div>
                                        </td>

                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {roleMap[log.user?.role] || log.user?.role}
                                            </span>
                                        </td>
                                        
                                        <td className="fw-bold text-dark" style={{fontSize: '0.95rem'}}>
                                            {actionMap[log.action] || log.action}
                                        </td>
                                        
                                        {/* 🔥 SỬ DỤNG HÀM RENDER MỚI */}
                                        <td className="text-secondary">
                                            {renderDescription(log.description)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        Không tìm thấy hoạt động nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;