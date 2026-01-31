import React, { useEffect, useState } from "react";
import axios from "axios"; // Đừng quên import axios
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';

export default function AdminStatistics() {
    // --- STATE DỮ LIỆU ---
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalLecturers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0
    });

    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);

    // --- MÀU SẮC BIỂU ĐỒ ---
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // --- GỌI API THẬT ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                // Gọi API tới Backend Spring Boot
                const res = await axios.get("http://localhost:8080/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data;

                // 1. Cập nhật số liệu tổng quan
                setStats({
                    totalStudents: data.totalStudents || 0,
                    totalLecturers: data.totalLecturers || 0,
                    totalRequests: data.totalRequests || 0,
                    pendingRequests: data.pendingRequests || 0,
                    completedRequests: data.completedRequests || 0
                });

                // 2. Cập nhật dữ liệu biểu đồ cột (Backend đã tính toán theo 7 ngày)
                setChartData(data.chartData || []);

                // 3. Cập nhật dữ liệu biểu đồ tròn
                setPieData(data.pieData || []);

            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
                // Nếu lỗi thì giữ nguyên giá trị mặc định (0) để không crash trang
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">
                <i className="bi bi-bar-chart-line-fill me-2"></i>Báo Cáo & Thống Kê
            </h3>

            {/* --- PHẦN 1: CARDS TỔNG QUAN --- */}
            <div className="row g-3 mb-4">
                {/* Card 1: Tổng sinh viên */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-primary text-white">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75">Tổng Sinh viên</h6>
                                <h3 className="fw-bold mb-0">{stats.totalStudents}</h3>
                            </div>
                            <i className="bi bi-mortarboard-fill fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>

                {/* Card 2: Tổng Giảng viên */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-success text-white">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75">Giảng viên</h6>
                                <h3 className="fw-bold mb-0">{stats.totalLecturers}</h3>
                            </div>
                            <i className="bi bi-person-video3 fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>

                {/* Card 3: Yêu cầu chờ xử lý (Quan trọng) */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-warning text-dark">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75 fw-bold">Chờ xử lý</h6>
                                <h3 className="fw-bold mb-0">{stats.pendingRequests}</h3>
                            </div>
                            <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>

                {/* Card 4: Tổng hồ sơ đã xử lý */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-info text-white">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75">Đã hoàn thành</h6>
                                <h3 className="fw-bold mb-0">{stats.completedRequests}</h3>
                            </div>
                            <i className="bi bi-check2-circle fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN 2: BIỂU ĐỒ --- */}
            <div className="row g-4">
                {/* Biểu đồ cột: Xu hướng tuần */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">📊 Xu hướng tuần qua</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} /> {/* Số lượng thì không hiện số lẻ */}
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="appointments" name="Lịch hẹn tư vấn" fill="#667eea" radius={[5, 5, 0, 0]} barSize={30} />
                                        <Bar dataKey="requests" name="Yêu cầu thủ tục" fill="#764ba2" radius={[5, 5, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ tròn: Tỷ lệ thủ tục */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">🍰 Tỷ lệ loại thủ tục</h6>
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center">
                            {pieData.length > 0 ? (
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-pie-chart display-4 d-block mb-3 opacity-25"></i>
                                    Chưa có dữ liệu thủ tục nào
                                </div>
                            )}
                            
                            <div className="text-center small text-muted mt-3">
                                * Thống kê dựa trên tổng số yêu cầu đã gửi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}