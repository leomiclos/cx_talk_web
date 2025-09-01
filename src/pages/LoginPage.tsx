/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function LoginPage({
  onLogin,
}: {
  onLogin: (user: any) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const toRegister = () => {
    navigate("/register");
  };

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { access_token } = res.data;

      if (!access_token) {
        setError("Erro inesperado ao logar. Tente novamente.");
        return;
      }

      try {
        const decoded = jwtDecode<{
          sub: string;
          name: string;
          email: string;
          exp: number;
        }>(access_token);

        const currentTime = Date.now() / 1000;
        if (decoded.exp <= currentTime) {
          setError("Token expirado. Tente fazer login novamente.");
          return;
        }

        Cookies.set("token", access_token, { expires: 1 });

        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
        };
        setError("");
        onLogin(user);
        navigate("/chat");
      } catch {
        setError("Token inválido recebido do servidor. Tente novamente.");
        return;
      }
    } catch (err: any) {
      console.error("Erro no login:", err);

      if (err.response?.status === 401) {
        setError("Email ou senha incorretos.");
      } else if (err.response?.status === 404) {
        setError("Usuário não encontrado.");
      } else if (err.response?.status >= 500) {
        setError("Erro no servidor. Tente novamente mais tarde.");
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        setError("Erro de conexão. Verifique sua internet.");
      } else {
        const message = err.response?.data?.message || "";
        if (message.includes("Usuário não existe")) {
          setError("Usuário não existe. Cadastre-se primeiro.");
        } else if (message.includes("Senha incorreta")) {
          setError("Senha incorreta. Verifique e tente novamente.");
        } else {
          setError("Erro ao logar: " + (message || "Tente novamente."));
        }
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem 3rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        {error && (
          <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>
        )}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Entrar
        </button>
        <button
          onClick={toRegister}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#ffffffff",
            color: "#ff0000ff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "0.5rem",
          }}
        >
          Registre-se
        </button>
      </div>
    </div>
  );
}
