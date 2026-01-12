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
        <nav
            className="navbar bg-light px-4"
            style={{
                height: 64,
                flexShrink: 0,
                position: "relative",
                zIndex: 1000,
                overflow: "visible"
            }}
        >
            <span className="navbar-brand fw-bold">
                Lecturer Dashboard
            </span>

            {/* AVATAR */}
            <div className="position-relative">
                <img
                    src="https://i.pravatar.cc/40"
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-circle"
                    style={{
                        cursor: "pointer",
                        objectFit: "cover",
                        display: "block"
                    }}
                    onClick={() => setOpen(!open)}
                />

                {/* DROPDOWN */}
                {open && (
                    <div
                        className="dropdown-menu show"
                        style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            minWidth: 200,
                            zIndex: 2000
                        }}
                    >
                        <button
                            className="dropdown-item"
                            onClick={() => navigate("/lecturer/profile")}
                        >
                            Thông tin cá nhân
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => navigate("/lecturer/change-password")}
                        >
                            Đổi mật khẩu
                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                            className="dropdown-item text-danger"
                            onClick={logout}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
