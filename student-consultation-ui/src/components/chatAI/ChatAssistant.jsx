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
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1050, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
            
            {/* Nút bật/tắt chat (Floating Action Button - FAB) */}
            {!isOpen && (
                <button 
                    onClick={toggleChat}
                    className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite"
                    style={{ 
                        width: "65px", 
                        height: "65px", 
                        fontSize: "28px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Gradient tím xanh hiện đại
                        border: "none"
                    }}
                >
                    <i className="bi bi-chat-dots-fill text-white"></i>
                </button>
            )}

            {/* Khung chat (Chat Window) */}
            {isOpen && (
                <div 
                    className="card border-0 shadow-lg animate__animated animate__fadeInUp" 
                    style={{ 
                        width: "380px", 
                        height: "550px", 
                        borderRadius: "20px", 
                        overflow: "hidden",
                        display: "flex", 
                        flexDirection: "column" 
                    }}
                >
                    {/* Header: Gradient + Bo góc trên */}
                    <div 
                        className="card-header text-white d-flex justify-content-between align-items-center p-3"
                        style={{ 
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderBottom: "none"
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <div className="bg-white text-primary rounded-circle d-flex justify-content-center align-items-center me-2" style={{width: 35, height: 35}}>
                                <i className="bi bi-robot fs-5"></i>
                            </div>
                            <div>
                                <div className="fw-bold" style={{fontSize: "1rem"}}>Trợ lý ảo SV</div>
                                <div style={{fontSize: "0.75rem", opacity: 0.8}}>Luôn sẵn sàng hỗ trợ</div>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="btn btn-sm text-white" style={{opacity: 0.8}}><i className="bi bi-x-lg"></i></button>
                    </div>

                    {/* Body: Màu nền xám nhạt */}
                    <div className="card-body bg-light overflow-auto flex-grow-1 p-3" style={{ scrollbarWidth: "thin" }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                                
                                {/* Avatar Bot (chỉ hiện khi bot chat) */}
                                {msg.sender === "bot" && (
                                    <div className="me-2 d-flex align-items-end">
                                        <div className="bg-white border rounded-circle d-flex justify-content-center align-items-center shadow-sm" style={{width: 30, height: 30}}>
                                            <i className="bi bi-robot text-primary" style={{fontSize: "14px"}}></i>
                                        </div>
                                    </div>
                                )}

                                <div 
                                    className={`p-3 shadow-sm ${msg.sender === "user" ? "text-white" : "bg-white text-dark"}`}
                                    style={{ 
                                        maxWidth: "75%", 
                                        borderRadius: "18px",
                                        borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px", // Bo góc kiểu tin nhắn
                                        borderBottomLeftRadius: msg.sender === "bot" ? "4px" : "18px",
                                        background: msg.sender === "user" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#fff",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {/* Hiệu ứng loading 3 chấm */}
                        {loading && (
                            <div className="d-flex justify-content-start mb-3">
                                <div className="bg-white p-3 rounded-4 shadow-sm text-muted fst-italic small">
                                    <span className="spinner-grow spinner-grow-sm me-1" style={{width: "0.5rem", height: "0.5rem"}}></span>
                                    <span className="spinner-grow spinner-grow-sm me-1" style={{width: "0.5rem", height: "0.5rem", animationDelay: "0.2s"}}></span>
                                    <span className="spinner-grow spinner-grow-sm" style={{width: "0.5rem", height: "0.5rem", animationDelay: "0.4s"}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer: Input bo tròn */}
                    <div className="card-footer bg-white p-3 border-top-0">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                            <input 
                                type="text" 
                                className="form-control border-0 px-3" 
                                placeholder="Nhập câu hỏi của bạn..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={loading}
                                style={{boxShadow: "none", fontSize: "0.95rem"}}
                            />
                            <button 
                                className="btn border-0 text-primary pe-3" 
                                onClick={handleSend} 
                                disabled={loading || !input.trim()}
                                style={{background: "transparent"}}
                            >
                                <i className="bi bi-send-fill fs-5"></i>
                            </button>
                        </div>
                        <div className="text-center mt-2 text-muted" style={{fontSize: "0.7rem"}}>
                            Được hỗ trợ bởi AI • Thông tin chỉ mang tính tham khảo
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}