import { useEffect, useState } from "react";
import scheduleApi from "../../api/scheduleApi";

export default function LecturerSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // TAB: 'manual' (Thủ công) | 'office' (Hành chính)
    const [activeTab, setActiveTab] = useState("manual");

    // FORM THỦ CÔNG
    const [formData, setFormData] = useState({ date: "", startTime: "", endTime: "" });
    const [overlapError, setOverlapError] = useState("");

    // FORM HÀNH CHÍNH (MỚI)
    const [batchForm, setBatchForm] = useState({
        fromDate: "",
        toDate: "",
        isMorning: true,   // Mặc định chọn sáng
        isAfternoon: true  // Mặc định chọn chiều
    });

    // 1. Load dữ liệu
    const loadSchedules = async () => {
        try {
            setLoading(true);
            const res = await scheduleApi.getMySchedules();
            const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSchedules(sorted);
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSchedules(); }, []);

    // Check trùng lịch (Chỉ dùng cho form thủ công)
    useEffect(() => {
        if (activeTab === "office") return; // Bỏ qua nếu đang tab hành chính
        const { date, startTime, endTime } = formData;
        if (!date || !startTime || !endTime) { setOverlapError(""); return; }

        const isOverlap = schedules.some(slot => {
            if (slot.date !== date) return false;
            const slotStart = slot.startTime.substring(0, 5); 
            const slotEnd = slot.endTime.substring(0, 5);
            return (startTime < slotEnd) && (endTime > slotStart);
        });

        if (isOverlap) setOverlapError("❌ Khung giờ này bị trùng với lịch đã có!");
        else if (startTime >= endTime) setOverlapError("⚠️ Giờ kết thúc phải sau giờ bắt đầu!");
        else setOverlapError("");

    }, [formData, schedules, activeTab]);

    // Xử lý nhập liệu chung
    const handleManualChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleBatchChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setBatchForm({ ...batchForm, [e.target.name]: value });
    };

    // --- SUBMIT 1: THỦ CÔNG ---
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (overlapError) return;
        try {
            setIsSubmitting(true);
            await scheduleApi.create({
                date: formData.date,
                startTime: formData.startTime + ":00",
                endTime: formData.endTime + ":00"
            });
            alert("✅ Đăng ký thành công!");
            loadSchedules();
            setFormData({ date: "", startTime: "", endTime: "" });
        } catch (error) {
            alert("Lỗi: " + (error.response?.data || "Không thể tạo lịch"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- SUBMIT 2: HÀNH CHÍNH (HÀNG LOẠT) ---
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        
        if (!batchForm.fromDate || !batchForm.toDate) {
            alert("Vui lòng chọn khoảng thời gian!"); return;
        }
        if (!batchForm.isMorning && !batchForm.isAfternoon) {
            alert("Vui lòng chọn ít nhất một buổi (Sáng hoặc Chiều)!"); return;
        }
        if (batchForm.fromDate > batchForm.toDate) {
            alert("Ngày kết thúc phải sau ngày bắt đầu!"); return;
        }

        setIsSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        // Tạo danh sách các ngày
        let currentDate = new Date(batchForm.fromDate);
        const stopDate = new Date(batchForm.toDate);
        
        const requests = [];

        while (currentDate <= stopDate) {
            // Format YYYY-MM-DD
            const dateStr = currentDate.toISOString().split("T")[0];

            // Thêm ca Sáng (07:00 - 11:30)
            if (batchForm.isMorning) {
                requests.push(scheduleApi.create({ date: dateStr, startTime: "07:00:00", endTime: "11:30:00" }));
            }
            // Thêm ca Chiều (13:30 - 17:30)
            if (batchForm.isAfternoon) {
                requests.push(scheduleApi.create({ date: dateStr, startTime: "13:30:00", endTime: "17:30:00" }));
            }

            // Tăng ngày lên 1
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Chạy Promise.allSettled để không bị dừng nếu có 1 request lỗi
        const results = await Promise.allSettled(requests);
        
        results.forEach(res => {
            if (res.status === 'fulfilled') successCount++;
            else failCount++;
        });

        alert(`📊 Hoàn tất!\n- Thành công: ${successCount} ca\n- Bỏ qua (do trùng): ${failCount} ca`);
        
        loadSchedules();
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Bạn muốn xóa khung giờ này?")) {
            try { await scheduleApi.delete(id); loadSchedules(); } 
            catch { alert("Không thể xóa lịch đã có sinh viên đặt!"); }
        }
    };

    const groupedSchedules = schedules.reduce((acc, curr) => {
        const d = curr.date;
        if (!acc[d]) acc[d] = []; acc[d].push(curr); return acc;
    }, {});

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            <h3 className="fw-bold text-primary mb-4">🕒 Quản Lý Lịch Rảnh</h3>

            <div className="row g-4">
                {/* --- CỘT TRÁI: FORM --- */}
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: "20px", zIndex: 1 }}>
                        
                        {/* HEADER + TABS */}
                        <div className="card-header bg-primary text-white fw-bold rounded-top-4 p-0 overflow-hidden">
                            <div className="d-flex text-center">
                                <button 
                                    className={`btn flex-fill rounded-0 py-3 fw-bold border-0 ${activeTab === 'manual' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
                                    onClick={() => setActiveTab('manual')}
                                >
                                    🛠️ Tùy chọn
                                </button>
                                <button 
                                    className={`btn flex-fill rounded-0 py-3 fw-bold border-0 ${activeTab === 'office' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
                                    onClick={() => setActiveTab('office')}
                                >
                                    🏢 Hành chính
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-4">
                            {/* --- TAB 1: THỦ CÔNG --- */}
                            {activeTab === 'manual' && (
                                <form onSubmit={handleManualSubmit}>
                                    <h6 className="fw-bold text-secondary mb-3">Thêm từng khung giờ</h6>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Ngày làm việc</label>
                                        <input type="date" className="form-control" name="date" min={new Date().toISOString().split("T")[0]} value={formData.date} onChange={handleManualChange} />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Bắt đầu</label>
                                            <input type="time" className={`form-control ${overlapError ? "is-invalid" : ""}`} name="startTime" value={formData.startTime} onChange={handleManualChange} />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Kết thúc</label>
                                            <input type="time" className={`form-control ${overlapError ? "is-invalid" : ""}`} name="endTime" value={formData.endTime} onChange={handleManualChange} />
                                        </div>
                                    </div>
                                    {overlapError && <div className="alert alert-danger small py-2 mb-3">{overlapError}</div>}
                                    <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold" disabled={isSubmitting || !!overlapError}>
                                        {isSubmitting ? "Đang lưu..." : "Lưu Lịch"}
                                    </button>
                                </form>
                            )}

                            {/* --- TAB 2: HÀNH CHÍNH (BATCH) --- */}
                            {activeTab === 'office' && (
                                <form onSubmit={handleBatchSubmit}>
                                    <h6 className="fw-bold text-secondary mb-3">Đăng ký nhanh nhiều ngày</h6>
                                    
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Từ ngày</label>
                                        <input type="date" className="form-control" name="fromDate" min={new Date().toISOString().split("T")[0]} value={batchForm.fromDate} onChange={handleBatchChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Đến ngày</label>
                                        <input type="date" className="form-control" name="toDate" min={batchForm.fromDate} value={batchForm.toDate} onChange={handleBatchChange} />
                                    </div>

                                    <div className="mb-3 bg-light p-3 rounded border">
                                        <label className="form-label small fw-bold text-uppercase text-muted mb-2">Chọn ca làm việc:</label>
                                        
                                        <div className="form-check mb-2">
                                            <input className="form-check-input" type="checkbox" id="checkMorning" name="isMorning" checked={batchForm.isMorning} onChange={handleBatchChange} />
                                            <label className="form-check-label" htmlFor="checkMorning">
                                                ☀️ Sáng (07:00 - 11:30)
                                            </label>
                                        </div>
                                        
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="checkAfternoon" name="isAfternoon" checked={batchForm.isAfternoon} onChange={handleBatchChange} />
                                            <label className="form-check-label" htmlFor="checkAfternoon">
                                                🌤️ Chiều (13:30 - 17:30)
                                            </label>
                                        </div>
                                    </div>

                                    <div className="alert alert-warning small py-2 border-0">
                                        <i className="bi bi-lightning-fill me-1"></i>
                                        Hệ thống sẽ bỏ qua các khung giờ bị trùng.
                                    </div>

                                    <button type="submit" className="btn btn-success w-100 rounded-pill fw-bold" disabled={isSubmitting}>
                                        {isSubmitting ? "Đang xử lý..." : "🚀 Đăng Ký Hàng Loạt"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: DANH SÁCH --- */}
                <div className="col-md-7 col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4" style={{ minHeight: "600px" }}>
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 ps-4">
                            <h5 className="fw-bold text-dark">Danh sách khung giờ đã đăng ký</h5>
                        </div>
                        <div className="card-body overflow-auto p-4" style={{ maxHeight: "750px" }}>
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : Object.keys(groupedSchedules).length === 0 ? (
                                <div className="text-center text-muted py-5">Chưa có lịch nào.</div>
                            ) : (
                                Object.keys(groupedSchedules).map(date => (
                                    <div key={date} className="mb-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2 rounded-pill border border-primary border-opacity-25">📅 {date.split("-").reverse().join("/")}</span>
                                            <div className="ms-2 border-bottom flex-grow-1"></div>
                                        </div>
                                        <div className="row g-3">
                                            {groupedSchedules[date].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                                                <div key={slot.id} className="col-xl-4 col-md-6">
                                                    <div className={`p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white shadow-sm h-100 position-relative overflow-hidden ${!slot.available ? "border-success" : ""}`}>
                                                        <div className={`position-absolute top-0 start-0 bottom-0 ${slot.available ? "bg-secondary" : "bg-success"}`} style={{ width: "4px" }}></div>
                                                        <div>
                                                            <div className="fw-bold fs-5 text-dark">{slot.startTime.slice(0, 5)} ➔ {slot.endTime.slice(0, 5)}</div>
                                                            <div className="small mt-1">
                                                                {slot.available ? <span className="text-muted">Đang trống</span> : <span className="text-success fw-bold">Đã có SV đặt</span>}
                                                            </div>
                                                        </div>
                                                        {slot.available && (
                                                            <button className="btn btn-light text-danger btn-sm rounded-circle border-0" onClick={() => handleDelete(slot.id)} title="Xóa"><i className="bi bi-trash"></i></button>
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