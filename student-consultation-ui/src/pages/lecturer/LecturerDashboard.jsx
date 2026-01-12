export default function LecturerDashboard() {
    return (
        <div>
            {/* <h3>📊 Dashboard giảng viên</h3> */}

            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>Tổng lịch hẹn</h5>
                            <h2>12</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>Lịch hôm nay</h5>
                            <h2>3</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>Chờ duyệt</h5>
                            <h2>2</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
