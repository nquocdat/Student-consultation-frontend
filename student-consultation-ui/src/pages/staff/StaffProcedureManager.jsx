import { useEffect, useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import StaffFilter from "./StaffFilter";
import StaffRequestTable from "./StaffRequestTable";
import StaffUpdateModal from "./StaffUpdateModal";

export default function StaffProcedureManager() {
    const DOMAIN = "https://student-consultation-nqd.onrender.com";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Mặc định vào tab PENDING
    const [filterStatus, setFilterStatus] = useState("PENDING"); 
    
    // 🔍 1. STATE TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState(""); 
    
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // --- 1. TẢI DỮ LIỆU ---
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = filterStatus 
                ? `${DOMAIN}/api/procedures/staff/requests?status=${filterStatus}`
                : `${DOMAIN}/api/procedures/staff/requests`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setRequests(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
            setSelectedIds([]); // Reset chọn khi load lại
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    
    useEffect(() => { fetchRequests(); }, [filterStatus]);

    // 🔍 2. LOGIC LỌC DỮ LIỆU (SEARCH)
    const filteredRequests = requests.filter(req => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true; // Nếu không tìm kiếm thì lấy hết

        const code = req.studentCode?.toLowerCase() || "";
        const name = req.studentName?.toLowerCase() || "";

        return code.includes(term) || name.includes(term);
    });

    // --- 2. XỬ LÝ CHECKBOX ---
    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleToggleAll = (isChecked) => {
        // Lưu ý: Chỉ chọn những items đang hiển thị (sau khi lọc)
        setSelectedIds(isChecked ? filteredRequests.map(r => r.id) : []);
    };

    // --- 3. HÀM TRỢ GIÚP LẤY ĐUÔI FILE ---
    const getFileExtension = (filename) => {
        if (!filename) return "docx"; 
        return filename.split('.').pop().toLowerCase();
    };

    // --- 4. TẢI FILE LẺ ---
    const downloadFile = async (requestId) => {
        try {
            const request = requests.find(r => r.id === requestId);
            const originalUrl = request?.attachmentUrl || "";
            const ext = getFileExtension(originalUrl); 

            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/procedures/request/${requestId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HoSo_${request.studentCode}_${requestId}.${ext}`); 
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) { 
            console.error("Lỗi tải file", e); 
            alert("Không thể tải file. Vui lòng kiểm tra lại.");
        }
    };

    // --- 5. XỬ LÝ HÀNG LOẠT ---
    const handleBulkAction = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        let nextStatus = "";
        let note = "";
        let shouldDownload = false;

        if (filterStatus === "PENDING") {
            if (!window.confirm(`Bạn có chắc muốn TIẾP NHẬN ${selectedIds.length} hồ sơ và TẢI FILE ZIP về không?`)) return;
            nextStatus = "PROCESSING";
            note = "Đã tiếp nhận hồ sơ, đang xử lý.";
            shouldDownload = true;
        } 
        else if (filterStatus === "PROCESSING") {
            const room = window.prompt(`Nhập PHÒNG TRẢ KẾT QUẢ cho ${selectedIds.length} hồ sơ này:`, "C01");
            if (room === null) return;
            if (room.trim() === "") { alert("Bạn chưa nhập tên phòng!"); return; }
            nextStatus = "READY_FOR_PICKUP";
            note = `Đã có kết quả, em đến phòng ${room} nhận kết quả.`;
        } 
        else if (filterStatus === "READY_FOR_PICKUP") {
            if (!window.confirm(`Xác nhận ĐÃ TRẢ ${selectedIds.length} hồ sơ?`)) return;
            nextStatus = "COMPLETED";
            note = "Sinh viên đã nhận kết quả. Hoàn tất.";
        } 
        else { return; }

        setLoading(true);

        try {
            if (shouldDownload) {
                const zip = new JSZip();
                const folderName = `TiepNhan_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`;
                const imgFolder = zip.folder(folderName);

                const downloadPromises = selectedIds.map(async (id) => {
                    try {
                        const reqInfo = requests.find(r => r.id === id);
                        if (!reqInfo.attachmentUrl) {
                            imgFolder.file(`WARNING_${id}.txt`, `Hồ sơ của ${reqInfo.studentCode} không có file đính kèm.`);
                            return;
                        }

                        const ext = getFileExtension(reqInfo.attachmentUrl);
                        const fileName = `${reqInfo.studentCode}_${reqInfo.studentName}_${id}.${ext}`;

                        const fileRes = await axios.get(`${DOMAIN}/api/procedures/request/${id}/download`, {
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob'
                        });
                        imgFolder.file(fileName, fileRes.data);
                    } catch (err) {
                        console.error(`Lỗi tải file ID ${id}`, err);
                        imgFolder.file(`ERROR_${id}.txt`, "Lỗi tải file này: " + err.message);
                    }
                });

                await Promise.all(downloadPromises);
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, `${folderName}.zip`);
            }

            let successCount = 0;
            const updatePromises = selectedIds.map(async (id) => {
                try {
                    await axios.put(`${DOMAIN}/api/procedures/staff/request/${id}/status`, 
                        { status: nextStatus, note: note }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    successCount++;
                } catch (updateErr) {
                    console.error(`Lỗi update trạng thái ID ${id}`, updateErr);
                }
            });

            await Promise.all(updatePromises);

            alert(`Đã xử lý xong!\n- Cập nhật thành công: ${successCount}/${selectedIds.length} hồ sơ.`);
            fetchRequests(); 
            setSelectedIds([]); 

        } catch (err) {
            alert("Có lỗi chung xảy ra: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 6. CẬP NHẬT LẺ ---
    const handleUpdateSubmit = async (requestId, newStatus, note) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${DOMAIN}/api/procedures/staff/request/${requestId}/status`, {
                status: newStatus,
                note: note
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Cập nhật thành công!");
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) { alert("Lỗi: " + err.message); }
    };

    // --- 7. RENDER NÚT BẤM ---
    const renderBulkButton = () => {
        if (selectedIds.length === 0) return null;
        if (filterStatus === "PENDING") return <button className="btn btn-success fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-file-zip-fill me-2"></i> Tiếp nhận & Tải ZIP ({selectedIds.length})</button>;
        if (filterStatus === "PROCESSING") return <button className="btn btn-primary fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-check2-circle me-2"></i> Xác nhận Đã Xong ({selectedIds.length})</button>;
        if (filterStatus === "READY_FOR_PICKUP") return <button className="btn btn-info text-white fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-box-seam me-2"></i> Xác nhận Đã Trả HS ({selectedIds.length})</button>;
        return null;
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn p-0 bg-light min-vh-100">
             
             {/* --- HEADER TOOLBAR --- */}
             <div className="bg-white shadow-sm border-bottom px-4 py-3 mb-4 d-flex flex-wrap justify-content-between align-items-center sticky-top" 
                  style={{zIndex: 100, transition: 'all 0.3s'}}>
                 
                 {/* 1. BỘ LỌC (TABS) */}
                 <div className="flex-grow-1">
                    <StaffFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
                 </div>

                 {/* 2. THANH TÌM KIẾM ĐẸP (Modern Search Bar) */}
                 <div className="ms-md-4 mt-2 mt-md-0" style={{ minWidth: "300px" }}>
                    <div className="input-group input-group-sm rounded-pill overflow-hidden border bg-light">
                        {/* Icon Search */}
                        <span className="input-group-text bg-light border-0 ps-3">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        
                        {/* Input Field */}
                        <input 
                            type="text" 
                            className="form-control bg-light border-0 shadow-none ps-2 py-2" 
                            placeholder="Tìm tên hoặc mã SV..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '0.9rem', color: '#495057' }}
                        />

                        {/* Nút Xóa (Chỉ hiện khi có text) */}
                        {searchTerm && (
                            <button 
                                className="btn btn-light border-0 pe-3 text-secondary" 
                                onClick={() => setSearchTerm("")}
                                title="Xóa tìm kiếm"
                                style={{transition: 'color 0.2s'}}
                            >
                                <i className="bi bi-x-circle-fill" style={{fontSize: '0.9rem'}}></i>
                            </button>
                        )}
                    </div>
                 </div>
             </div>

             {/* --- NỘI DUNG CHÍNH --- */}
             <div className="px-4">
                
                {/* Thông báo chọn hàng loạt (Giữ nguyên) */}
                {selectedIds.length > 0 && (
                    <div className="alert alert-warning border-0 shadow-sm d-flex justify-content-between align-items-center mb-3 animate__animated animate__fadeInDown rounded-3">
                        <div>
                            <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                            Đang chọn <strong className="mx-1">{selectedIds.length}</strong> yêu cầu.
                        </div>
                        <div>{renderBulkButton()}</div>
                    </div>
                )}
                
                {/* Bảng dữ liệu */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <StaffRequestTable 
                        requests={filteredRequests} 
                        loading={loading}
                        onDownload={downloadFile}
                        onOpenModal={(req) => setSelectedRequest(req)}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onToggleAll={handleToggleAll}
                        filterStatus={filterStatus}
                    />
                </div>
             </div>

             {/* Modal cập nhật */}
             <StaffUpdateModal 
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onUpdate={handleUpdateSubmit}
            />
        </div>
    );
}