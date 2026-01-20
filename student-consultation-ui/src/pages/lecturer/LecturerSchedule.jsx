import { useEffect, useState } from "react";
import scheduleApi from "../../api/scheduleApi";

export default function LecturerSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State form
    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });

    // 1. Load dữ liệu
    const loadSchedules = async () => {
        try {
            setLoading(true);
            const res = await scheduleApi.getMySchedules();
            // Sắp xếp: Ngày mới nhất lên đầu
            const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSchedules(sorted);
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSchedules(); }, []);

    // 2. Xử lý nhập liệu
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Submit Form (Tạo lịch)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate cơ bản
        if(!formData.date || !formData.startTime || !formData.endTime) {
            alert("Vui lòng nhập đủ thông tin!"); return;
        }
        if(formData.startTime >= formData.endTime) {
            alert("Giờ kết thúc phải sau giờ bắt đầu!"); return;
        }

        try {
            // Thêm :00 vào giây để khớp định dạng LocalTime của Java
            await scheduleApi.create({
                date: formData.date,
                startTime: formData.startTime + ":00",
                endTime: formData.endTime + ":00"
            });
            
            alert("✅ Đăng ký lịch thành công! Hệ thống sẽ tự động ghép sinh viên chờ (nếu có).");
            loadSchedules();
            setFormData({ date: "", startTime: "", endTime: "" }); // Reset form
        } catch (error) {
            alert("Lỗi: " + (error.response?.data || "Không thể tạo lịch (có thể bị trùng giờ)"));
        }
    };

    // 4. Xóa lịch
    const handleDelete = async (id) => {
        if(window.confirm("Bạn muốn xóa khung giờ này?")) {
            try {
                await scheduleApi.delete(id);
                loadSchedules();
            } catch (error) {
                alert("Không thể xóa lịch đã có sinh viên đặt!");
            }
        }
    };

    // Helper: Gom nhóm lịch theo ngày (Group By Date)
    const groupedSchedules = schedules.reduce((acc, curr) => {
        const d = curr.date;
        if (!acc[d]) acc[d] = [];
        acc[d].push(curr);
        return acc;
    }, {});

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            <h3 className="fw-bold text-primary mb-4">🕒 Đăng Ký Lịch Làm Việc</h3>

            <div className="row g-4">
                {/* --- CỘT TRÁI: FORM ĐĂNG KÝ --- */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-primary text-white fw-bold rounded-top-4 py-3">
                            <i className="bi bi-plus-circle me-2"></i> Thêm khung giờ mới
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary">Ngày làm việc</label>
                                    <input 
                                        type="date" 
                                        className="form-control py-2" 
                                        name="date"
                                        min={new Date().toISOString().split("T")[0]} // Chặn ngày quá khứ
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label fw-bold text-secondary">Bắt đầu</label>
                                        <input 
                                            type="time" 
                                            className="form-control py-2" 
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold text-secondary">Kết thúc</label>
                                        <input 
                                            type="time" 
                                            className="form-control py-2" 
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm">
                                    Lưu Lịch & Tự Động Ghép
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="alert alert-info mt-3 small shadow-sm border-0 rounded-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <strong>Lưu ý:</strong> Khi bạn tạo lịch, hệ thống sẽ tự động kiểm tra danh sách chờ (Waitlist) và gán sinh viên vào ngay nếu khớp thời gian.
                    </div>
                </div>

                {/* --- CỘT PHẢI: DANH SÁCH LỊCH --- */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 rounded-4" style={{minHeight: "600px"}}>
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 ps-4">
                            <h5 className="fw-bold text-dark">Danh sách khung giờ đã đăng ký</h5>
                        </div>
                        <div className="card-body overflow-auto p-4" style={{maxHeight: "700px"}}>
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : Object.keys(groupedSchedules).length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                                    Chưa có lịch nào được tạo.
                                </div>
                            ) : (
                                Object.keys(groupedSchedules).map(date => (
                                    <div key={date} className="mb-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2 rounded-pill border border-primary border-opacity-25">
                                                📅 {date.split("-").reverse().join("/")}
                                            </span>
                                            <div className="ms-2 border-bottom flex-grow-1"></div>
                                        </div>
                                        
                                        <div className="row g-3">
                                            {groupedSchedules[date]
                                                .sort((a,b) => a.startTime.localeCompare(b.startTime))
                                                .map(slot => (
                                                <div key={slot.id} className="col-md-4 col-sm-6">
                                                    <div className={`p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white shadow-sm h-100 position-relative overflow-hidden ${!slot.available ? "border-success" : ""}`}>
                                                        {/* Dải màu trạng thái bên trái */}
                                                        <div className={`position-absolute top-0 start-0 bottom-0 ${slot.available ? "bg-secondary" : "bg-success"}`} style={{width: "4px"}}></div>
                                                        
                                                        <div>
                                                            <div className="fw-bold fs-5 text-dark">
                                                                {slot.startTime.slice(0,5)} <span className="text-muted fw-light mx-1">➔</span> {slot.endTime.slice(0,5)}
                                                            </div>
                                                            <div className="small mt-1">
                                                                {slot.available ? (
                                                                    <span className="text-muted"><i className="bi bi-circle me-1"></i>Đang trống</span>
                                                                ) : (
                                                                    <span className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Đã có SV đặt</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Nút xóa chỉ hiện khi còn trống */}
                                                        {slot.available && (
                                                            <button 
                                                                className="btn btn-light text-danger btn-sm rounded-circle border-0 hover-bg-danger-soft"
                                                                onClick={() => handleDelete(slot.id)}
                                                                title="Xóa khung giờ này"
                                                                style={{width: "32px", height: "32px"}}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}