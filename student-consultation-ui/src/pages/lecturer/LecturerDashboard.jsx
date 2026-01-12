import { Link } from "react-router-dom";

export default function LecturerDashboard() {
    return (
        <div>
            <h3 className="mb-4">Xin chào Giảng viên 👋</h3>

            <div className="row">
                <div className="col-md-4">
                    <div className="card text-center p-3">
                        <h5>Lịch hẹn</h5>
                        <p>Quản lý các lịch hẹn sinh viên</p>
                        <Link
                            to="/lecturer/appointments"
                            className="btn btn-primary"
                        >
                            Xem lịch
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
