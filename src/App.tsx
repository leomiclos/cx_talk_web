/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";


export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    
    if (token) {
      try {
        const decoded = jwtDecode<{ sub: string; name: string; email: string; exp: number }>(token);
        

        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setUser({ id: decoded.sub, name: decoded.name, email: decoded.email });
        } else {

          Cookies.remove("token");
        }
      } catch (error) {

        Cookies.remove("token");
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
        fontFamily: "Arial, sans-serif"
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLogin={(user) => setUser(user)} />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route
          path="/chat"
          element={user ? <ChatPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      
      {/* ToastContainer para notificações */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}
