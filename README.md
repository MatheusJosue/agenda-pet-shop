# 🐾 Agenda Pet

> SaaS multi-tenant para pet shops gerenciarem agendamentos de banho e tosa, clientes, pets e planos.

🔗 **Demo:** https://agenda-pet-shop.vercel.app

## ✨ Funcionalidades

**Para o pet shop**
- Dashboard e agenda de atendimentos
- Cadastro de clientes e pets (raça, porte, observações)
- Serviços e planos (semanal, quinzenal, mensal) criados automaticamente no cadastro

**Para o administrador**
- Gestão de empresas
- Cadastro de empresas por **código de convite**
- Acesso como empresa (impersonação) para suporte

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | Next.js · React · TypeScript · Tailwind CSS · Framer Motion |
| Back-end / Banco / Auth | Supabase (PostgreSQL com RLS) |
| Validação | Zod |
| Testes | Vitest (unitários) · Playwright (E2E) |

## 🧠 Decisões técnicas

- **Multi-tenant com `company_id` em todas as tabelas + Row Level Security**: o isolamento entre empresas é garantido no banco, não só na interface.
- **Cadastro por convite** para controlar quem entra na plataforma durante o MVP.
- **15 arquivos de testes unitários** (autenticação, validação, segurança, middleware e componentes) com Vitest, além de testes E2E com Playwright.

## ▶️ Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencha as chaves do Supabase
npm run dev

# testes
npm test           # unitários (Vitest)
npm run test:e2e   # ponta a ponta (Playwright)
```

---

Desenvolvido por [Matheus Cerqueira](https://www.linkedin.com/in/matheusxaviercerqueira/)
