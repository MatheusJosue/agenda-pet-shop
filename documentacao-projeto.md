# 📘 Documentação do Projeto SaaS --- Agenda Pet (Banho & Tosa)

## 1. 🎯 Visão Geral

Sistema SaaS multi-tenant para gestão de pet shops com foco em
agendamento de banho e tosa.

## 2. 🧱 Arquitetura

- Frontend: Next.js
- Backend/DB/Auth: Supabase
- UI: React Bootstrap
- Ícones: React Icons
- Notificações: React Toastify

## 3. 🧩 Modelo Multi-Tenant

- Uso de company_id em todas as tabelas
- Row Level Security (RLS)

## 4. 🗄️ Modelagem do Banco

### companies

- id
- name
- email
- created_at

### invites

- id
- code
- created_by
- used
- company_id
- expires_at

### users

- id
- email
- role
- company_id

### clients

- id
- company_id
- name
- phone

### pets

- id
- company_id
- client_id
- name
- breed
- size
- notes

### services

- id
- company_id
- name
- price_default

### plans

- id
- company_id
- name
- price
- interval_days

### appointments

- id
- company_id
- client_id
- pet_id
- service_id
- date
- time
- price
- status

## 5. 🔐 Autenticação

Fluxo via convite: 1. Admin gera código 2. Empresa se registra com
código 3. Sistema valida e cria dados iniciais

## 6. ⚙️ Setup Automático

Serviços padrão: - Banho - Tosa - Hidratação - Higiênica

Planos: - Semanal - Quinzenal - Mensal

## 7. 🧑‍💻 Funcionalidades

### Admin

- Gerenciar empresas
- Gerar convites
- Visualizar dados
- Impersonar empresa

### Empresa

- Dashboard
- Agenda
- Clientes
- Pets
- Planos
- Serviços

## 8. 🎨 UI/UX

- Gradient rosa/roxo
- Glassmorphism
- Mobile-first (empresa)
- Desktop-first (admin)

## 9. 🧠 Estrutura Frontend

/src /app /components /services /hooks /contexts /types

## 10. 🚀 MVP

1.  Auth + convite
2.  Cadastro empresa
3.  Clientes + pets
4.  Agendamento
5.  Dashboard

## 11. 🔮 Futuro

- WhatsApp
- Pagamentos
- Relatórios
- Assinatura SaaS
