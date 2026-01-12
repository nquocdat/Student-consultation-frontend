import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LecturerHeader() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
            <h5 className="mb-0">Lecturer Dashboard</h5>

            <div className="position-relative">
                <img
                    src="https://i.pravatar.cc/40"
                    alt="avatar"
                    className="rounded-circle border"
                    style={{ cursor: "pointer", width: 40, height: 40 }}
                    onClick={() => setOpen(!open)}
                />

                {open && (
                    <div
                        className="position-absolute end-0 mt-2 bg-white shadow rounded"
                        style={{ width: 200, zIndex: 1000 }}
                    >
                        <button
                            className="dropdown-item"
                            onClick={() => navigate("/lecturer/profile")}
                        >
                            👤 Thông tin giảng viên
                        </button>

                        <button className="dropdown-item">
                            ✏️ Chỉnh sửa thông tin
                        </button>

                        <button className="dropdown-item">
                            🔒 Đổi mật khẩu
                        </button>

                        <hr className="m-0" />

                        <button
                            className="dropdown-item text-danger"
                            onClick={logout}
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
