import React, { useEffect, useState } from "react";
import axios from "axios"; 
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';

export default function AdminStatistics() {
    // --- STATE DỮ LIỆU ---
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalLecturers: 0,
        pendingAppointments: 0, // 🔥 Đổi thành Cuộc hẹn chờ
        pendingRequests: 0,     // 🔥 Đổi thành Thủ tục chờ
    });

    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);

    // --- STATE BỘ LỌC (Khớp với Backend) ---
    const [filterMode, setFilterMode] = useState("WEEK"); // WEEK, MONTH, YEAR
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- MÀU SẮC BIỂU ĐỒ ---
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // --- GỌI API THẬT ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                
                // 🔥 TẠO URL DỰA TRÊN BỘ LỌC
                let url = `http://localhost:8080/api/admin/stats?mode=${filterMode}`;
                
                if (filterMode === 'MONTH') {
                    url += `&month=${selectedMonth}&year=${selectedYear}`;
                } else if (filterMode === 'YEAR') {
                    url += `&year=${selectedYear}`;
                }

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data;

                // 1. Cập nhật số liệu tổng quan
                setStats({
                    totalStudents: data.totalStudents || 0,
                    totalLecturers: data.totalLecturers || 0,
                    // 🔥 Map đúng dữ liệu từ Backend
                    pendingAppointments: data.pendingAppointments || 0,
                    pendingRequests: data.pendingRequests || 0
                });

                // 2. Cập nhật dữ liệu biểu đồ cột
                setChartData(data.chartData || []);

                // 3. Cập nhật dữ liệu biểu đồ tròn
                setPieData(data.pieData || []);

            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            }
        };

        fetchStats();
    }, [filterMode, selectedMonth, selectedYear]); 

    // Helper tạo danh sách năm
    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            
            {/* --- HEADER & BỘ LỌC --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary mb-2 mb-md-0">
                    <i className="bi bi-bar-chart-line-fill me-2"></i>Báo Cáo & Thống Kê
                </h3>

                <div className="bg-white p-2 rounded shadow-sm border d-flex align-items-center gap-2">
                    <i className="bi bi-funnel-fill text-muted"></i>
                    
                    {/* 1. Chọn Chế độ */}
                    <select 
                        className="form-select border-0 bg-light fw-bold text-primary" 
                        style={{width: 'auto', cursor: 'pointer'}}
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                    >
                        <option value="WEEK">7 Ngày qua</option>
                        <option value="MONTH">Theo Tháng</option>
                        <option value="YEAR">Theo Năm</option>
                    </select>

                    {/* 2. Chọn Tháng */}
                    {filterMode === 'MONTH' && (
                        <select 
                            className="form-select border-0 bg-light" 
                            style={{width: 'auto', cursor: 'pointer'}}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                    )}

                    {/* 3. Chọn Năm */}
                    {(filterMode === 'MONTH' || filterMode === 'YEAR') && (
                        <select 
                            className="form-select border-0 bg-light" 
                            style={{width: 'auto', cursor: 'pointer'}}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

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

                {/* Card 3: Cuộc hẹn chờ xử lý */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-warning text-dark">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75 fw-bold">Cuộc hẹn chờ xử lý</h6>
                                <h3 className="fw-bold mb-0">{stats.pendingAppointments}</h3>
                            </div>
                            <i className="bi bi-calendar-check fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>

                {/* Card 4: Thủ tục chờ xử lý */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-info text-white">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="opacity-75">Thủ tục chờ xử lý</h6>
                                <h3 className="fw-bold mb-0">{stats.pendingRequests}</h3>
                            </div>
                            <i className="bi bi-file-earmark-text fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN 2: BIỂU ĐỒ --- */}
            <div className="row g-4">
                {/* Biểu đồ cột */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">
                                📊 Biểu đồ thống kê 
                                {filterMode === 'WEEK' && ' (7 ngày qua)'}
                                {filterMode === 'MONTH' && ` (Tháng ${selectedMonth}/${selectedYear})`}
                                {filterMode === 'YEAR' && ` (Năm ${selectedYear})`}
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        
                                        {/* Trục X */}
                                        <XAxis 
                                            dataKey="name" 
                                            style={{fontSize: '12px'}} 
                                            interval={filterMode === 'MONTH' ? 1 : 0} 
                                        />
                                        
                                        <YAxis allowDecimals={false} />
                                        
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        
                                        {/* Cột dữ liệu */}
                                        <Bar dataKey="appointments" name="Lịch hẹn tư vấn" fill="#667eea" radius={[4, 4, 0, 0]} barSize={filterMode === 'MONTH' ? 10 : 30} />
                                        <Bar dataKey="requests" name="Yêu cầu thủ tục" fill="#764ba2" radius={[4, 4, 0, 0]} barSize={filterMode === 'MONTH' ? 10 : 30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ tròn */}
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
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={100}
                                                fill="#8884d8" paddingAngle={5} dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-pie-chart display-4 d-block mb-3 opacity-25"></i>
                                    Chưa có dữ liệu
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