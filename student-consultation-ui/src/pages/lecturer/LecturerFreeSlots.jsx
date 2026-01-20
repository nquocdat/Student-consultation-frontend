import { useEffect, useState } from "react";
import scheduleApi from "../../api/scheduleApi";

export default function LecturerFreeSlots() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu
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

    // Xóa lịch
    const handleDelete = async (id) => {
        if(window.confirm("Bạn muốn xóa khung giờ này?")) {
            try { 
                await scheduleApi.delete(id); 
                loadSchedules(); // Load lại sau khi xóa
            } catch (error) { 
                alert("Không thể xóa lịch đã có sinh viên đặt!"); 
            }
        }
    };

    // Gom nhóm hiển thị
    const groupedSchedules = schedules.reduce((acc, curr) => {
        const d = curr.date;
        if (!acc[d]) acc[d] = []; acc[d].push(curr); return acc;
    }, {});

    return (
        <div className="container-fluid px-4 mt-4 font-monospace">
            <h3 className="fw-bold text-success mb-4">👀 Danh Sách Khung Giờ Tư Vấn</h3>
            
            <div className="card shadow-sm border-0 rounded-4" style={{ minHeight: "600px" }}>
                <div className="card-header bg-white border-bottom-0 pt-4 pb-2 ps-4">
                    <h5 className="fw-bold text-dark">Các khung giờ bạn đã mở</h5>
                </div>
                <div className="card-body overflow-auto p-4">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : Object.keys(groupedSchedules).length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                            Bạn chưa đăng ký lịch nào.
                        </div>
                    ) : (
                        Object.keys(groupedSchedules).map(date => (
                            <div key={date} className="mb-4">
                                <div className="d-flex align-items-center mb-3">
                                    <span className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2 rounded-pill border border-success border-opacity-25">
                                        📅 {date.split("-").reverse().join("/")}
                                    </span>
                                    <div className="ms-2 border-bottom flex-grow-1"></div>
                                </div>
                                <div className="row g-3">
                                    {groupedSchedules[date].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                                        <div key={slot.id} className="col-xl-3 col-lg-4 col-md-6">
                                            <div className={`p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white shadow-sm h-100 position-relative overflow-hidden ${!slot.available ? "border-success" : ""}`}>
                                                <div className={`position-absolute top-0 start-0 bottom-0 ${slot.available ? "bg-secondary" : "bg-success"}`} style={{ width: "4px" }}></div>
                                                <div>
                                                    <div className="fw-bold fs-5 text-dark">{slot.startTime.slice(0, 5)} ➔ {slot.endTime.slice(0, 5)}</div>
                                                    <div className="small mt-1">
                                                        {slot.available ? <span className="text-muted">Đang trống</span> : <span className="text-success fw-bold">Đã có SV đặt</span>}
                                                    </div>
                                                </div>
                                                {slot.available && (
                                                    <button className="btn btn-light text-danger btn-sm rounded-circle border-0" onClick={() => handleDelete(slot.id)} title="Xóa">
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
    );
}