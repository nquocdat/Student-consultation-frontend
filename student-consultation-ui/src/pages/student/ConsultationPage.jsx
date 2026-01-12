import { useEffect, useState, useCallback } from "react";

const ConsultationPage = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    lecturerId: "",
    date: "",
    time: "",
    reason: "",
  });

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
      .then(res => res.json())
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
      .then(res => (res.ok ? res.json() : []))
      .then(setFreeSlots)
      .catch(() => setFreeSlots([]));
  }, [form.lecturerId, form.date, token]);

  /* ================= LOAD LECTURERS ================= */
  useEffect(() => {
    fetch("http://localhost:8080/api/lecturers")
      .then(res => res.json())
      .then(setLecturers)
      .catch(console.error);
  }, []);

  /* ================= INIT LOAD ================= */
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  /* ================= RELOAD SLOT WHEN DATE / LECTURER CHANGE ================= */
  useEffect(() => {
    setForm(prev => ({ ...prev, time: "" }));
    loadFreeSlots();
  }, [form.lecturerId, form.date, loadFreeSlots]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ================= CREATE APPOINTMENT ================= */
  const handleSubmit = () => {
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

    fetch("http://localhost:8080/api/appointment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error("Tạo lịch hẹn thất bại");
      })
      .then(() => {
        alert("Đăng ký tư vấn thành công!");
        setForm({ lecturerId: "", date: "", time: "", reason: "" });
        setFreeSlots([]);
        loadAppointments();
      })
      .catch(err => alert(err.message));
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy cuộc hẹn này không?")) return;

    fetch(`http://localhost:8080/api/appointment/${id}/cancel/student`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Hủy lịch thất bại");
      })
      .then(() => {
        alert("Đã hủy lịch thành công");
        loadAppointments();
        loadFreeSlots(); // 🔥 CỰC KỲ QUAN TRỌNG
      })
      .catch(err => alert(err.message));
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
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>
                {l.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Giờ tư vấn</label>

          {form.lecturerId ? (
            <>
              <select
                className="form-control"
                name="time"
                value={form.time}
                onChange={handleChange}
                disabled={!freeSlots.length}
              >
                <option value="">-- Chọn giờ --</option>
                {freeSlots.map((s, i) => (
                  <option key={i} value={s.startTime}>
                    {s.startTime} - {s.endTime}
                  </option>
                ))}
              </select>

              {!freeSlots.length && (
                <small className="text-danger">
                  Giảng viên không còn giờ rảnh ngày này
                </small>
              )}
            </>
          ) : (
            <input
              type="time"
              className="form-control"
              name="time"
              step="1800"
              value={form.time}
              onChange={handleChange}
            />
          )}
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

        <div className="mb-3">
          <label>Hình thức tư vấn</label><br />
          <label>
            <input
              type="radio"
              value="IN_PERSON"
              checked={consultationType === "IN_PERSON"}
              onChange={e => setConsultationType(e.target.value)}
            /> Trực tiếp
          </label>

          <label className="ms-3">
            <input
              type="radio"
              value="PHONE"
              checked={consultationType === "PHONE"}
              onChange={e => setConsultationType(e.target.value)}
            /> Qua điện thoại
          </label>
        </div>

        <button className="btn btn-success" onClick={handleSubmit}>
          ➕ Đăng ký tư vấn
        </button>
      </div>

      <hr />

      <h5>📋 Lịch tư vấn đã đăng ký</h5>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Giảng viên</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Lý do</th>
            <th>Hình thức</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center">
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
              <td>{a.consultationType === "IN_PERSON" ? "Trực tiếp" : "Điện thoại"}</td>
              <td>{a.statusDescription}</td>
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
