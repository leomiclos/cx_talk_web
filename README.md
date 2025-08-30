````markdown
# 💬 Chat Frontend

Frontend moderno para o sistema de chat em tempo real.  
Este projeto se conecta ao backend (NestJS) para envio e recebimento de mensagens, utilizando autenticação baseada em JWT.

---

## 🚀 Tecnologias

- **[React](https://reactjs.org/)** — Framework para construção da interface.
- **[Vite](https://vitejs.dev/)** — Build tool rápida para desenvolvimento.
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática.
- **[Axios](https://axios-http.com/)** — Cliente HTTP para comunicação com a API.

---

## 📦 Instalação

Clone o repositório e entre na pasta:

```bash
git clone https://github.com/seu-usuario/chat-frontend.git
cd chat-frontend
````

Instale as dependências:

```bash
npm install
# ou
yarn install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
API_URL=http://localhost:3000 
```

---

## ▶️ Executando

Para rodar em desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em:

```
http://localhost:5173
```

---

## 🔐 Autenticação

O token de sessão do usuário é armazenado em **cookies** (HTTP-only para mais segurança).

No frontend, você pode recuperar o token da seguinte forma:

```ts
import Cookies from "js-cookie";

const token = Cookies.get("token");
```

Esse token é enviado automaticamente em cada requisição **via `Authorization: Bearer <token>`** para o backend.

---

## 💬 API de Mensagens

### 🔹 Buscar últimas mensagens

```ts
import axios from "axios";

const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/last`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log(response.data); // array de mensagens
```

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev       # roda em modo desenvolvimento
npm run build     # gera build para produção
npm run preview   # visualiza build local
```

---

## ✅ Boas práticas

* Utilize **tokens HTTP-only** para mais segurança (já configurado).
* Evite salvar dados sensíveis no `localStorage`.
* Mantenha `services/api.ts` centralizando chamadas HTTP.
* Faça deploy no **Vercel**, **Netlify** ou similar.

---

## 📜 Licença

MIT License.
Feito com ❤️ por [Leonardo Miclos](https://github.com/leomiclos).

```
