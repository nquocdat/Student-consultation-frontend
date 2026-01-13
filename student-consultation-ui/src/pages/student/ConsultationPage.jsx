import { useEffect, useState, useCallback, useRef } from "react";

const ConsultationPage = () => {
  const token = localStorage.getItem("token");

  // --- STATE ---
  const [form, setForm] = useState({
    lecturerId: "", 
    date: "",
    startTime: "",  // Giờ bắt đầu
    duration: 30,   // Thời lượng mặc định 30 phút
    reason: "",
  });

  // State Hình thức tư vấn
  const [consultationType, setConsultationType] = useState("IN_PERSON");

  // State File & Ref
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Data
  const [lecturers, setLecturers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // 🆕 STATE MỚI: Danh sách giờ hợp lệ lấy từ Server
  const [validStartTimes, setValidStartTimes] = useState([]);

  // Hiển thị giờ kết thúc dự kiến
  const [endTimePreview, setEndTimePreview] = useState("");

  /* ================= HELPERS: TÍNH GIỜ KẾT THÚC ================= */
  const calculateEndTime = (start, minutes) => {
    if (!start) return "";
    const [h, m] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + Number(minutes));
    
    const newH = date.getHours();
    const newM = date.getMinutes();
    return `${(newH < 10 ? '0' : '') + newH}:${(newM < 10 ? '0' : '') + newM}`;
  };

  /* ================= LOAD INITIAL DATA ================= */
  const loadAppointments = useCallback(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/appointment/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setAppointments)
    .catch(console.error);
  }, [token]);

  useEffect(() => {
    // Load danh sách giảng viên
    fetch("http://localhost:8080/api/lecturers")
      .then(res => res.json())
      .then(setLecturers)
      .catch(console.error);
    
    loadAppointments();
  }, [loadAppointments]);

  /* ================= 🆕 LOAD GIỜ HỢP LỆ TỪ SERVER ================= */
  // Logic: Khi chọn Ngày, GV, Thời lượng -> Gọi API lấy các giờ bắt đầu phù hợp
  useEffect(() => {
    if (form.date && form.lecturerId && form.duration) {
        
        console.log("🔄 Đang tìm giờ phù hợp từ server...");
        
        // Gọi API Backend (API này bạn đã viết ở bước trước)
        fetch(`http://localhost:8080/api/schedule/valid-times?lecturerId=${form.lecturerId}&date=${form.date}&duration=${form.duration}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Lỗi tải giờ rảnh");
            return res.json();
        })
        .then(data => {
            console.log("✅ Giờ hợp lệ:", data);
            setValidStartTimes(data); 

            // Nếu giờ đang chọn trước đó không còn nằm trong danh sách mới -> Reset
            if (form.startTime && !data.includes(form.startTime)) {
                setForm(prev => ({...prev, startTime: ""}));
            }
        })
        .catch(err => {
            console.error(err);
            setValidStartTimes([]); // Nếu lỗi hoặc không có giờ -> Rỗng
        });

    } else {
        // Nếu chưa chọn đủ thông tin -> Xóa danh sách giờ
        setValidStartTimes([]);
    }
  }, [form.date, form.lecturerId, form.duration, token]);

  /* ================= HANDLE CHANGE & EFFECT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Tự động tính toán giờ kết thúc để hiển thị Preview
  useEffect(() => {
    if (form.startTime && form.duration) {
        const end = calculateEndTime(form.startTime, form.duration);
        setEndTimePreview(end);
    } else {
        setEndTimePreview("");
    }
  }, [form.startTime, form.duration]);

  /* ================= DOWNLOAD FILE ================= */
  const handleDownload = (attachmentId, fileName) => {
    fetch(`http://localhost:8080/api/appointment/${attachmentId}/download`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(response => {
        if (!response.ok) throw new Error("Lỗi tải file");
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(e => alert(e.message));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.date || !form.startTime) {
      alert("Vui lòng chọn Ngày và Giờ bắt đầu!");
      return;
    }

    // 1. Tính giờ kết thúc chính xác
    const finalEndTime = calculateEndTime(form.startTime, form.duration);
    
    // 2. Ghép thành chuỗi "HH:mm - HH:mm" để gửi Backend
    const timeString = `${form.startTime} - ${finalEndTime}`;

    const payload = {
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
      date: form.date,
      time: timeString, // Gửi chuỗi: "08:00 - 08:30"
      reason: form.reason,
      consultationType: consultationType,
    };

    console.log("Payload gửi đi:", payload);

    try {
      // 3. Gọi API tạo lịch
      const createRes = await fetch("http://localhost:8080/api/appointment/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
         const msg = await createRes.text();
         throw new Error(msg || "Lỗi tạo lịch hẹn");
      }

      const newAppt = await createRes.json();
      
      // 4. Upload file (Nếu có)
      if (selectedFile && newAppt.id) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await fetch(`http://localhost:8080/api/appointment/${newAppt.id}/attachments`, {
            method: "POST", headers: {Authorization: `Bearer ${token}`}, body: formData
        });
      }

      alert(`Đăng ký thành công! (Khung giờ: ${timeString})`);
      
      // Reset Form
      setForm({ lecturerId: "", date: "", startTime: "", duration: 30, reason: "" });
      setSelectedFile(null);
      setValidStartTimes([]); // Reset list giờ
      if(fileInputRef.current) fileInputRef.current.value = "";
      loadAppointments();

    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const cancelAppointment = (id) => {
    if(!window.confirm("Hủy lịch này?")) return;
    fetch(`http://localhost:8080/api/appointment/${id}/cancel/student`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
    }).then(() => { alert("Đã hủy"); loadAppointments(); });
  };

  return (
    <div>
      <h4 className="mb-3">⏱️ Đăng ký tư vấn (Tìm giờ rảnh thông minh)</h4>

      <div className="card p-3 shadow-sm bg-light">
        <div className="row">
            {/* --- 1. NGÀY --- */}
            <div className="col-md-4 mb-3">
                <label className="fw-bold">📅 Ngày tư vấn <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="date" 
                       value={form.date} onChange={handleChange} />
            </div>

            {/* --- 2. GIẢNG VIÊN --- */}
            <div className="col-md-4 mb-3">
                <label className="fw-bold">👨‍🏫 Giảng viên</label>
                <select className="form-control" name="lecturerId" 
                        value={form.lecturerId} onChange={handleChange}>
                    <option value="">-- Chọn giảng viên --</option>
                    {lecturers.map(l => <option key={l.id} value={l.id}>{l.fullName}</option>)}
                </select>
            </div>
            
            {/* --- 3. THỜI LƯỢNG --- */}
            <div className="col-md-4 mb-3">
                <label className="fw-bold">⏳ Thời lượng mong muốn</label>
                <select className="form-control" name="duration" 
                        value={form.duration} onChange={handleChange}>
                    <option value="15">⚡ 15 Phút</option>
                    <option value="30">🕐 30 Phút (Tiêu chuẩn)</option>
                    <option value="45">🕒 45 Phút</option>
                    <option value="60">🕕 60 Phút</option>
                    <option value="90">📚 90 Phút</option>
                </select>
            </div>
        </div>

        {/* --- 4. CHỌN GIỜ BẮT ĐẦU (Lấy từ API) --- */}
        <div className="mb-3">
            <label className="fw-bold">⏰ Giờ bắt đầu phù hợp <span className="text-danger">*</span></label>
            <select className="form-control" name="startTime" 
                    value={form.startTime} onChange={handleChange} 
                    disabled={validStartTimes.length === 0}>
                
                <option value="">
                    {/* Hiển thị thông báo thông minh trong dropdown */}
                    {validStartTimes.length === 0 
                        ? (form.date && form.lecturerId 
                            ? "-- Không có giờ phù hợp / Đã kín lịch --" 
                            : "-- Vui lòng chọn Ngày & Giảng viên trước --") 
                        : "-- Chọn giờ bắt đầu --"}
                </option>

                {/* Render danh sách giờ lấy từ Server */}
                {validStartTimes.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
            
            {/* Preview Kết quả */}
            {endTimePreview && (
                <div className="alert alert-success mt-2 py-2 mb-0">
                    ✅ Cuộc hẹn dự kiến: <strong>{form.startTime}</strong> ➝ <strong>{endTimePreview}</strong>
                </div>
            )}
        </div>

        {/* --- 5. LÝ DO --- */}
        <div className="mb-3">
            <label className="fw-bold">📝 Nội dung / Lý do</label>
            <textarea className="form-control" rows={2} name="reason" 
                      value={form.reason} onChange={handleChange} />
        </div>

        {/* --- 6. FILE UPLOAD --- */}
        <div className="mb-3">
            <label className="fw-bold">📎 Đính kèm tài liệu</label>
            <input type="file" className="form-control" ref={fileInputRef}
                   onChange={e => setSelectedFile(e.target.files[0])} />
            <small className="text-muted">Hỗ trợ PDF, Ảnh (Optional)</small>
        </div>

        {/* --- 7. HÌNH THỨC TƯ VẤN --- */}
        <div className="mb-3">
            <label className="fw-bold d-block">📞 Hình thức tư vấn:</label>
            <div className="mt-2">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" 
                        name="consultationType" id="typeInPerson" value="IN_PERSON"
                        checked={consultationType === "IN_PERSON"}
                        onChange={(e) => setConsultationType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="typeInPerson">🏫 Trực tiếp tại trường</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" 
                        name="consultationType" id="typePhone" value="PHONE"
                        checked={consultationType === "PHONE"}
                        onChange={(e) => setConsultationType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="typePhone">📱 Qua điện thoại / Online</label>
                </div>
            </div>
        </div>
        
        {/* --- BUTTON SUBMIT --- */}
        <button className="btn btn-success w-100 fw-bold py-2" onClick={handleSubmit}>
            🚀 Gửi Đăng Ký Tư Vấn
        </button>
      </div>

      <hr className="my-4"/>
      
      {/* --- DANH SÁCH LỊCH SỬ --- */}
      <h5 className="mb-3">📋 Lịch sử đăng ký</h5>
      <table className="table table-bordered table-striped table-hover">
        <thead className="table-dark">
            <tr>
                <th>STT</th>
                <th>Giảng viên</th>
                <th>Thời gian</th>
                <th>Hình thức</th>
                <th>Trạng thái</th>
                <th>File</th>
                <th>Thao tác</th>
            </tr>
        </thead>
        <tbody>
            {appointments.length === 0 && (
                <tr><td colSpan={7} className="text-center">Chưa có cuộc hẹn nào</td></tr>
            )}
            {appointments.map((a, i) => (
                <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.lecturerName || <span className="text-secondary fst-italic">Chờ xếp GV</span>}</td>
                    <td>
                        <div>📅 {a.date}</div>
                        <div className="fw-bold text-primary">⏰ {a.time}</div>
                    </td>
                    <td>
                        {a.consultationType === "IN_PERSON" ? "🏫 Trực tiếp" : "📱 Điện thoại"}
                    </td>
                    <td>
                        <span className={`badge ${a.statusCode==='APPROVED'?'bg-success':a.statusCode==='PENDING'?'bg-warning':'bg-secondary'}`}>
                            {a.statusDescription}
                        </span>
                    </td>
                    <td>
                        {a.attachments?.map(f => (
                           <div key={f.id}>
                               <a href="#" className="text-decoration-none" 
                                  onClick={(e)=>{e.preventDefault();handleDownload(f.id,f.fileName)}}>
                                  📎 {f.fileName}
                               </a>
                           </div>
                        ))}
                    </td>
                    <td>
                        {a.statusCode === 'PENDING' && 
                            <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(a.id)}>❌ Hủy</button>
                        }
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationPage;