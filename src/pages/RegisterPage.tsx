/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [erro, setErro] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const API_URL = import.meta.env.VITE_API_URL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      });

      alert("Cadastro realizado com sucesso!");

      console.log("Resposta da API:", res.data);

      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      setErro(error.response?.data?.message || "Erro ao cadastrar usuário.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            color: "#1f2937",
            marginBottom: 24,
          }}
        >
          Criar Conta
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
              }}
            />
          </div>
          {erro && (
            <div
              style={{
                color: "red",
                fontSize: 14,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {erro}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Registrar
          </button>
        </form>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Já tem uma conta?{" "}
          <a href="/login" style={{ color: "#4f46e5", fontWeight: 600 }}>
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
