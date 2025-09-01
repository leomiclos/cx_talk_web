import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import type { Message } from "../interfaces/message";
import type { User } from "../interfaces/user";
import { toast } from 'react-toastify';


// Error Boundary para capturar erros de renderização
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro de renderização capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Algo deu errado!</h2>
          <p>Erro: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ChatPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const API_URL = import.meta.env.VITE_API_URL;

    if (!token) return;

    const s: Socket = io(`${API_URL}`, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    s.on("connect", () => {
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("connect_error", (error) => {
      console.error('Erro de conexão WebSocket:', error);
    });

    s.on("history", (msgs: Message[]) => {
      setMessages(msgs);
    });
    
    s.on("message", (msg: Message) => {
      try {
        setMessages((prev) => {
          return [...prev, msg];
        });
      } catch (error) {
        console.error('Erro ao adicionar mensagem:', error);
      }
    });

    // Escuta eventos de entrada e saída de usuários
    s.on("user:joined", (data: { userId: string; userName: string; userEmail: string; timestamp: string }) => {
      toast.success(`${data.userName} entrou no chat`);
    });

    s.on("user:left", (data: { userId: string; userName: string; userEmail: string; timestamp: string }) => {
      toast.warning(`${data.userName} saiu do chat`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !text.trim() || !isConnected) {
      return;
    }
    
    socket.emit("message", { text });
    setText("");
  };

  return (
    <ErrorBoundary>
      <div className="chat-container">
      <div className="chat-header">
        <h2 className="chat-title">Chat</h2>
        <div className="header-right">
          <div className="user-info">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            Logado como: <strong>{user.name}</strong>
          </div>
          <button className="logout-button" onClick={onLogout} title="Sair">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 16L21 12M21 12L17 8M21 12H9M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((m) => {
            // Verifica se a mensagem tem dados válidos
            if (!m || !m.id || !m.content) {
              console.error('Mensagem inválida:', m);
              return null;
            }
            
            // Verifica se o usuário da mensagem existe
            if (!m.user || !m.user.name) {
              console.error('Usuário da mensagem inválido:', m);
              return null;
            }
            
            return (
              <div key={m.id} className={`message ${m.user.name === user.name ? 'own-message' : 'other-message'}`}>
                <div className="message-header">
                  <span className="username">{m.user.name}</span>
                  <span className="timestamp">
                    {new Date(m.createdAt).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="message-text">{m.content}</div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="input-container">
        <input
          className="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button 
          className="send-button" 
          onClick={sendMessage}
          disabled={!socket || !isConnected || !text.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <style>{`
        .chat-container {
          max-width: 800px;
          margin: 0 auto;
          height: 600px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .chat-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        .logout-button:active {
          transform: scale(0.95);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .status-indicator.connected {
          background: #4ade80;
          animation: pulse 2s infinite;
        }

        .status-indicator.disconnected {
          background: #ef4444;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .messages-container {
          flex: 1;
          overflow: hidden;
          background: #f8fafc;
        }

        .messages-list {
          height: 95%;
          overflow-y: auto;
          padding: 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .messages-list::-webkit-scrollbar {
          width: 6px;
        }

        .messages-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .messages-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .messages-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .message {
          max-width: 70%;
          animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .own-message {
          align-self: flex-end;
        }

        .other-message {
          align-self: flex-start;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          gap: 12px;
        }

        .username {
          font-weight: 600;
          font-size: 13px;
          color: #475569;
        }

        .own-message .username {
          color: #7c3aed;
        }

        .timestamp {
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
        }

        .message-text {
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #334155;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .own-message .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .input-container {
          display: flex;
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
          gap: 12px;
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .message-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .message-input::placeholder {
          color: #94a3b8;
        }

        .send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .send-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:active {
          transform: translateY(0);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .chat-container {
            height: 100vh;
            border-radius: 0;
            margin: 0;
          }

          .chat-header {
            padding: 16px 20px;
          }

          .chat-title {
            font-size: 20px;
          }

          .user-info {
            font-size: 12px;
            padding: 6px 12px;
          }

          .message {
            max-width: 85%;
          }

          .messages-list {
            padding: 16px;
          }

          .input-container {
            padding: 16px 20px;
          }
        }

        @media (max-width: 480px) {
          .message {
            max-width: 90%;
          }
          
          .message-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
          
          .own-message .message-header {
            align-items: flex-end;
          }
        }
      `}</style>
      </div>
    </ErrorBoundary>
  );
}