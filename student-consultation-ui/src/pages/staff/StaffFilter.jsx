import React from "react";

export default function StaffFilter({ filterStatus, setFilterStatus, counts = {} }) {
    
    // Định nghĩa danh sách các Tab
    const tabs = [
        { key: "", label: "Tất cả" },
        { key: "PENDING", label: "Chờ xử lý" },
        { key: "PROCESSING", label: "Đang xử lý" },
        { key: "READY_FOR_PICKUP", label: "Chờ nhận KQ" },
        { key: "COMPLETED", label: "Hoàn thành" },
        { key: "REJECTED", label: "Đã từ chối" },
    ];

    return (
        <div className="bg-white shadow-sm mb-4">
            <ul className="nav nav-tabs border-bottom-0 d-flex flex-nowrap overflow-auto" style={{padding: "0 10px"}}>
                {tabs.map((tab) => {
                    const isActive = filterStatus === tab.key;
                    return (
                        <li key={tab.key} className="nav-item">
                            <button
                                className="nav-link border-0 bg-transparent rounded-0 py-3 px-4 fw-medium position-relative"
                                style={{
                                    color: isActive ? "#ee4d2d" : "#555", // Màu cam Shopee hoặc xám
                                    borderBottom: isActive ? "3px solid #ee4d2d" : "3px solid transparent",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => setFilterStatus(tab.key)}
                            >
                                {tab.label}
                                {/* Nếu muốn hiện số lượng (badget) thì thêm ở đây */}
                                {/* {counts[tab.key] > 0 && <span className="ms-2 badge rounded-pill bg-danger">{counts[tab.key]}</span>} */}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}