import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Xin chào! Mình là trợ lý AI. Bạn cần tìm hiểu thủ tục gì hay thông tin giảng viên nào không?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:8080/api/chat/ask", 
                { question: userMsg },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const botMsg = res.data.answer;
            setMessages(prev => [...prev, { sender: "bot", text: botMsg }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: "bot", text: "Lỗi kết nối server AI." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
            {/* Nút bật/tắt chat */}
            {!isOpen && (
                <button 
                    onClick={toggleChat}
                    className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px", fontSize: "24px" }}
                >
                    <i className="bi bi-robot"></i>
                </button>
            )}

            {/* Khung chat */}
            {isOpen && (
                <div className="card shadow-lg animate__animated animate__fadeInUp" style={{ width: "350px", height: "500px", display: "flex", flexDirection: "column" }}>
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <div className="fw-bold"><i className="bi bi-stars me-2"></i>Trợ lý ảo SV</div>
                        <button onClick={toggleChat} className="btn btn-sm btn-close btn-close-white"></button>
                    </div>

                    <div className="card-body bg-light overflow-auto flex-grow-1 p-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                                <div 
                                    className={`p-2 rounded-3 shadow-sm ${msg.sender === "user" ? "bg-primary text-white" : "bg-white text-dark"}`}
                                    style={{ maxWidth: "80%" }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="text-start text-muted small fst-italic ms-2">
                                <span className="spinner-border spinner-border-sm me-1"></span> Đang suy nghĩ...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="card-footer bg-white">
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập câu hỏi..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={loading}
                            />
                            <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}