import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProcedureManager() {
    const DOMAIN = "http://localhost:8080";
    
    // --- KHAI BÁO STATE ---
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 🔥 1. STATE TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState("");

    // State Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const initialFormState = { code: "", name: "", description: "" };
    const [formData, setFormData] = useState(initialFormState);
    
    // State File
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentFileUrl, setCurrentFileUrl] = useState(null);

    // State Menu 3 chấm
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Effect đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // Tải danh sách
    const fetchProcedures = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/procedures`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProcedures(res.data);
        } catch (err) {
            console.error(err);
            setProcedures([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProcedures(); }, []);

    // --- LOGIC LỌC DANH SÁCH (TÌM KIẾM) ---
    const filteredProcedures = procedures.filter(proc => {
        const keyword = searchTerm.toLowerCase();
        const matchCode = proc.code?.toLowerCase().includes(keyword);
        const matchName = proc.name?.toLowerCase().includes(keyword);
        return matchCode || matchName; // Tìm thấy ở Mã HOẶC Tên đều được
    });

    // Các hàm xử lý Modal
    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData(initialFormState);
        setSelectedFile(null);
        setCurrentFileUrl(null);
        setShowModal(true);
    };

    const handleEditClick = (proc) => {
        setIsEditing(true);
        setCurrentId(proc.id);
        setFormData({
            code: proc.code,
            name: proc.name,
            description: proc.description
        });
        const url = proc.templateUrl || proc.template_url;
        setCurrentFileUrl(url);
        setSelectedFile(null);
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            alert("Vui lòng nhập Mã và Tên thủ tục!"); return;
        }
        const data = new FormData();
        data.append("code", formData.code);
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (selectedFile) data.append("file", selectedFile);

        const token = localStorage.getItem("token");
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        };
        
        try {
            if (isEditing) {
                await axios.put(`${DOMAIN}/api/admin/procedures/${currentId}`, data, config);
                alert("✅ Cập nhật thủ tục thành công!");
            } else {
                if (!selectedFile) { alert("⚠️ Vui lòng chọn file!"); return; }
                await axios.post(`${DOMAIN}/api/admin/procedures`, data, config);
                alert("✅ Thêm thủ tục mới thành công!");
            }
            setShowModal(false);
            fetchProcedures();
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data || "Có lỗi xảy ra"));
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa thủ tục này không?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${DOMAIN}/api/admin/procedures/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("🗑️ Đã xóa thủ tục!");
            fetchProcedures();
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data));
        }
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            
            {/* --- HEADER + THANH TÌM KIẾM --- */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
                <h4 className="fw-bold text-dark m-0 mb-3 mb-md-0">
                    <i className="bi bi-file-earmark-text-fill me-2 text-primary"></i>Danh mục Thủ tục
                </h4>
                
                <div className="d-flex align-items-center gap-3">
                    {/* 🔍 INPUT TÌM KIẾM */}
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border" style={{maxWidth: '300px', height: '38px'}}>
                        <span className="input-group-text bg-white border-0 ps-3">
                            <i className="bi bi-search text-secondary"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-0 ps-1 shadow-none h-100" 
                            placeholder="Tìm mã hoặc tên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{fontSize: '0.95rem'}}
                        />
                    </div>

                    {/* ➕ NÚT THÊM MỚI */}
                    <button 
                        className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" 
                        onClick={handleOpenAdd}
                        style={{height: '38px'}}
                    >
                        <i className="bi bi-plus-lg"></i>
                        <span className="fw-medium">Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* DANH SÁCH THẺ (Dùng filteredProcedures để hiển thị) */}
            <div className="row g-4">
                {filteredProcedures.length === 0 ? (
                    <div className="col-12 text-center text-muted py-5">
                        <i className="bi bi-inbox display-4 d-block mb-3 opacity-50"></i>
                        {searchTerm ? `Không tìm thấy thủ tục nào khớp với "${searchTerm}"` : "Chưa có dữ liệu thủ tục."}
                    </div>
                ) : (
                    filteredProcedures.map(proc => {
                        const fileUrl = proc.templateUrl || proc.template_url;

                        return (
                            <div className="col-md-6 col-lg-4" key={proc.id}>
                                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                                                    {proc.code}
                                                </span>
                                                <h5 className="card-title fw-bold text-dark mb-1">{proc.name}</h5>
                                            </div>
                                            
                                            {/* MENU 3 CHẤM */}
                                            <div className="dropdown position-relative">
                                                <button 
                                                    className="btn btn-sm btn-light rounded-circle" 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === proc.id ? null : proc.id);
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                                
                                                {activeMenuId === proc.id && (
                                                    <ul 
                                                        className="dropdown-menu dropdown-menu-end border-0 shadow show"
                                                        style={{ display: 'block', position: 'absolute', right: 0, zIndex: 999 }}
                                                    >
                                                        <li>
                                                            <button className="dropdown-item" onClick={() => handleEditClick(proc)}>
                                                                <i className="bi bi-pencil me-2 text-warning"></i>Sửa thông tin
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider"/></li>
                                                        <li>
                                                            <button className="dropdown-item text-danger" onClick={() => handleDelete(proc.id)}>
                                                                <i className="bi bi-trash me-2"></i>Xóa thủ tục
                                                            </button>
                                                        </li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="card-text text-muted small mt-3 text-truncate-3" style={{minHeight: '40px'}}>
                                            {proc.description}
                                        </p>

                                        <div className="border-top pt-3">
                                            <a 
                                                href={fileUrl ? `${DOMAIN}${fileUrl}` : "#"} 
                                                className={`btn btn-sm w-100 ${fileUrl ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                                download 
                                                onClick={(e) => {
                                                    if (!fileUrl) {
                                                        e.preventDefault();
                                                        alert("Thủ tục này chưa có file biểu mẫu!");
                                                    }
                                                }}
                                            >
                                                <i className={`bi ${fileUrl ? 'bi-file-earmark-arrow-down' : 'bi-exclamation-circle'} me-2`}></i>
                                                {fileUrl ? "Tải biểu mẫu" : "Chưa có biểu mẫu"}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {isEditing ? <><i className="bi bi-pencil-square me-2"></i>Cập nhật Thông tin</> : <><i className="bi bi-plus-lg me-2"></i>Thêm Thủ tục Mới</>}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Mã thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: P01" 
                                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Tên thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: Giấy xác nhận sinh viên..." 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Mô tả hướng dẫn</label>
                                    <textarea className="form-control" rows="4" 
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                                <div className="mb-3 bg-light p-3 rounded border">
                                    <label className="form-label fw-bold text-muted small">Biểu mẫu đính kèm (Word/PDF)</label>
                                    {isEditing && currentFileUrl ? (
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-file-earmark-check-fill text-success fs-4 me-2"></i>
                                            <div>
                                                <div className="small fw-bold text-dark">File hiện tại:</div>
                                                <div className="small text-muted text-break">{currentFileUrl.split('/').pop()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        isEditing && <div className="small text-warning mb-2"><i className="bi bi-exclamation-triangle me-1"></i>Chưa có file nào</div>
                                    )}
                                    <input type="file" className="form-control mt-2" onChange={e => setSelectedFile(e.target.files[0])} />
                                    <div className="form-text text-muted mt-2">
                                        {isEditing ? "💡 Mẹo: Bỏ trống nếu muốn giữ nguyên file cũ." : "⚠️ Bắt buộc chọn file khi thêm mới."}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-light px-4 fw-bold" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleSave}>
                                    {isEditing ? "Lưu thay đổi" : "Thêm mới"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}