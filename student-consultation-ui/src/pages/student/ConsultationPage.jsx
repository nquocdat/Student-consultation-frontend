import { useEffect, useState, useCallback, useRef } from "react";

const ConsultationPage = () => {
  const token = localStorage.getItem("token");

  // State cho form
  const [form, setForm] = useState({
    lecturerId: "",
    date: "",
    time: "",
    reason: "",
  });

  // 🆕 1. Thêm state để lưu file
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Dùng ref để reset ô input file sau khi gửi
  const fileInputRef = useRef(null);

  const [lecturers, setLecturers] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [consultationType, setConsultationType] = useState("IN_PERSON");

  /* ================= LOAD APPOINTMENTS ================= */
  const loadAppointments = useCallback(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/appointment/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAppointments)
      .catch(console.error);
  }, [token]);

  /* ================= LOAD FREE SLOTS ================= */
  const loadFreeSlots = useCallback(() => {
    if (!form.lecturerId || !form.date || !token) {
      setFreeSlots([]);
      return;
    }
    fetch(
      `http://localhost:8080/api/schedule/free/${form.lecturerId}?date=${form.date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then(setFreeSlots)
      .catch(() => setFreeSlots([]));
  }, [form.lecturerId, form.date, token]);

  /* ================= LOAD LECTURERS ================= */
  useEffect(() => {
    fetch("http://localhost:8080/api/lecturers")
      .then((res) => res.json())
      .then(setLecturers)
      .catch(console.error);
  }, []);

  /* ================= INIT LOAD ================= */
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  /* ================= RELOAD SLOT ================= */
  useEffect(() => {
    setForm((prev) => ({ ...prev, time: "" }));
    loadFreeSlots();
  }, [form.lecturerId, form.date, loadFreeSlots]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= 🆕 HANDLE DOWNLOAD (Hàm mới để tải file) ================= */
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
        a.style.display = 'none';
        a.href = url;
        a.download = fileName; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => alert(error.message));
  };

  /* ================= 🆕 CREATE APPOINTMENT (Sửa lại để upload file) ================= */
  const handleSubmit = async () => {
    if (!form.date || !form.time) {
      alert("Vui lòng chọn ngày và giờ tư vấn");
      return;
    }

    const payload = {
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
      date: form.date,
      time: form.time,
      reason: form.reason,
      consultationType,
    };

    try {
        // BƯỚC 1: TẠO CUỘC HẸN
        const createRes = await fetch("http://localhost:8080/api/appointment/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!createRes.ok) throw new Error("Tạo lịch hẹn thất bại");

        const newAppointment = await createRes.json();
        
        // BƯỚC 2: UPLOAD FILE (Nếu người dùng có chọn)
        if (selectedFile && newAppointment.id) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadRes = await fetch(`http://localhost:8080/api/appointment/${newAppointment.id}/attachments`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // Để browser tự set Content-Type
                body: formData
            });

            if (!uploadRes.ok) alert("Lịch đã tạo nhưng file upload bị lỗi (File quá lớn?)");
        }

        alert("Đăng ký tư vấn thành công!");
        
        // Reset form và file
        setForm({ lecturerId: "", date: "", time: "", reason: "" });
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        
        setFreeSlots([]);
        loadAppointments();

    } catch (err) {
        alert(err.message);
    }
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy cuộc hẹn này không?")) return;

    fetch(`http://localhost:8080/api/appointment/${id}/cancel/student`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Hủy lịch thất bại");
      })
      .then(() => {
        alert("Đã hủy lịch thành công");
        loadAppointments();
        loadFreeSlots();
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <h4 className="mb-3">📘 Đăng ký tư vấn học đường</h4>

      <div style={{ background: "#cfe6ff", padding: 20, borderRadius: 6 }}>
        <div className="mb-3">
          <label>Ngày tư vấn</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Giảng viên</label>
          <select
            className="form-control"
            name="lecturerId"
            value={form.lecturerId}
            onChange={handleChange}
            disabled={!form.date}
          >
            <option value="">-- Tự phân công --</option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Giờ tư vấn</label>
          <select
            className="form-control"
            name="time"
            value={form.time}
            onChange={handleChange}
          >
            <option value="">-- Chọn giờ --</option>
            {freeSlots.map((s, i) => (
              <option key={i} value={s.startTime}>
                {s.startTime} - {s.endTime}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Lý do</label>
          <textarea
            className="form-control"
            rows={3}
            name="reason"
            value={form.reason}
            onChange={handleChange}
          />
        </div>

        {/* 🆕 Ô CHỌN FILE ĐÍNH KÈM */}
        <div className="mb-3">
            <label className="fw-bold">📎 Đính kèm tài liệu</label>
            <input 
                type="file" 
                className="form-control"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <small className="text-muted">Hỗ trợ PDF, Ảnh</small>
        </div>

        <div className="mb-3">
          <label>Hình thức tư vấn</label>
          <br />
          <label>
            <input
              type="radio"
              value="IN_PERSON"
              checked={consultationType === "IN_PERSON"}
              onChange={(e) => setConsultationType(e.target.value)}
            />{" "}
            Trực tiếp
          </label>
          <label className="ms-3">
            <input
              type="radio"
              value="PHONE"
              checked={consultationType === "PHONE"}
              onChange={(e) => setConsultationType(e.target.value)}
            />{" "}
            Qua điện thoại
          </label>
        </div>

        <button className="btn btn-success" onClick={handleSubmit}>
          ➕ Đăng ký & Gửi
        </button>
      </div>

      <hr />

      <h5>📋 Lịch tư vấn đã đăng ký</h5>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Giảng viên</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Lý do</th>
            <th>Hình thức</th>
            <th>Trạng thái</th>
            {/* 🆕 Thêm cột File */}
            <th>File đính kèm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center">
                Chưa có cuộc hẹn
              </td>
            </tr>
          )}

          {appointments.map((a, i) => (
            <tr key={a.id}>
              <td>{i + 1}</td>
              <td>{a.lecturerName || "Chưa phân công"}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{a.reason}</td>
              <td>
                {a.consultationType === "IN_PERSON" ? "Trực tiếp" : "Điện thoại"}
              </td>
              <td>{a.statusDescription}</td>
              
              {/* 🆕 Logic hiển thị File */}
              <td>
                  {a.attachments && a.attachments.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                          {a.attachments.map(file => (
                              <li key={file.id}>
                                  <a 
                                      href="#" 
                                      className="text-primary text-decoration-none"
                                      onClick={(e) => {
                                          e.preventDefault();
                                          handleDownload(file.id, file.fileName);
                                      }}
                                  >
                                      📥 {file.fileName}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <span className="text-muted small">Không có file</span>
                  )}
              </td>

              <td>
                {a.statusCode === "PENDING" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => cancelAppointment(a.id)}
                  >
                    ❌ Hủy
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationPage;