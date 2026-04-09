# Sistema Pedagógico POT

Sistema completo de gestão pedagógica para o **Projeto POT** — um projeto social que oferece cursos profissionalizantes semanais para beneficiários da comunidade.

## 🎓 Cursos Gerenciados
| Curso | Descrição |
|-------|-----------|
| 💻 Informática | Fundamentos de computação, internet e pacote Office |
| ✂️ Barbearia | Técnicas de corte, barba e atendimento |
| 🛍️ Faça e Venda | Criação artesanal e empreendedorismo |
| 🧵 Costura | Corte, costura e criação de roupas |
| 📋 Administração | Gestão, finanças e mercado de trabalho |
| 🚗 Transita | Educação para o trânsito e cidadania |
| 💅 Manicure | Manicure, pedicure e nail art |

## 🛠️ Stack Tecnológica
- **Frontend**: React 18 + Vite + TailwindCSS + Recharts
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt

## 📁 Estrutura do Projeto
```
sistema-pedagogico/
├── backend/               # API Node.js + Express
│   ├── prisma/            # Schema e seed do banco
│   └── src/
│       ├── controllers/   # Lógica de negócios
│       ├── middleware/    # Auth, error handler
│       └── routes/        # Rotas da API
└── frontend/              # React app
    └── src/
        ├── contexts/      # AuthContext
        ├── pages/         # Dashboard, Beneficiários, etc.
        ├── components/    # Layout (Sidebar, Header)
        └── services/      # Axios API client
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+ (ou Docker)

### 1. Banco de Dados com Docker
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # Configure DATABASE_URL se necessário
npm install
npx prisma migrate dev      # Criar tabelas
node prisma/seed.js         # Popular dados iniciais
npm run dev                 # Iniciar servidor (porta 3001)
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # Iniciar app (porta 5173)
```

### 4. Acesso
- **App**: http://localhost:5173
- **API**: http://localhost:3001
- **PgAdmin**: http://localhost:5050

### 🔐 Credenciais Demo
| Campo | Valor |
|-------|-------|
| E-mail | admin@pot.com |
| Senha | admin123 |

## 📋 Funcionalidades
- **Dashboard** — Estatísticas em tempo real e gráficos
- **Beneficiários** — Cadastro completo com busca e paginação
- **Cursos** — CRUD com ícones e cores personalizadas
- **Turmas** — Gestão de turmas com dias, horários e salas
- **Presença** — Lista de chamada com marcação por clique
- **Instrutores** — Perfis e turmas dos instrutores
- **Relatórios** — Relatórios de presença e matrículas com gráficos
- **Certificados** — Emissão e visualização de certificados
- **Configurações** — Perfil e alteração de senha
