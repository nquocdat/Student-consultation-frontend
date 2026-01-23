import { useEffect, useState } from "react";
import axios from "axios";

// Import 3 file con (Nhớ sửa đường dẫn nếu bạn để khác thư mục)
import StaffFilter from "./StaffFilter";
import StaffRequestTable from "./StaffRequestTable";
import StaffUpdateModal from "./StaffUpdateModal";

export default function StaffProcedureManager() {
    const DOMAIN = "http://localhost:8080";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    
    // State quản lý việc mở Modal
    const [selectedRequest, setSelectedRequest] = useState(null);

    // 1. TẢI DỮ LIỆU
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = filterStatus 
                ? `${DOMAIN}/api/procedures/staff/requests?status=${filterStatus}`
                : `${DOMAIN}/api/procedures/staff/requests`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sắp xếp cũ lên đầu
            setRequests(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (err) {
            console.error(err);
            alert("Lỗi tải dữ liệu hoặc bạn không có quyền Staff!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    // 2. TẢI FILE
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
            link.setAttribute('download', `File_SV_gui_${requestId}.docx`); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert("Không thể tải file! File không tồn tại.");
        }
    };

    // 3. CẬP NHẬT TRẠNG THÁI (Được gọi từ Modal)
    const handleUpdateSubmit = async (requestId, newStatus, note) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${DOMAIN}/api/procedures/staff/request/${requestId}/status`, {
                status: newStatus,
                note: note
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Cập nhật thành công!");
            setSelectedRequest(null); // Đóng modal
            fetchRequests(); // Tải lại bảng
        } catch (err) {
            alert("Lỗi cập nhật: " + (err.response?.data || err.message));
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn p-4">
            <h3 className="fw-bold text-primary mb-4">🛠 Quản Lý Yêu Cầu Sinh Viên</h3>

            {/* Component 1: Bộ lọc */}
            <StaffFilter 
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onRefresh={fetchRequests}
            />

            {/* Component 2: Bảng dữ liệu */}
            <StaffRequestTable 
                requests={requests}
                loading={loading}
                onDownload={handleDownloadFile}
                onOpenModal={(req) => setSelectedRequest(req)}
            />

            {/* Component 3: Modal (Chỉ hiện khi selectedRequest != null) */}
            <StaffUpdateModal 
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onUpdate={handleUpdateSubmit}
            />
        </div>
    );
}