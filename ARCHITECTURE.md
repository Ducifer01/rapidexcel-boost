# Arquitetura do Projeto - Sistema de Vendas de Planilhas

## 📋 Visão Geral

Este documento descreve a arquitetura completa do sistema de vendas de planilhas digitais com área de membros.

## 🏗️ Estrutura Atual (Implementada)

### 1. **Landing Page**
- ✅ Página inicial com apresentação dos produtos
- ✅ Apenas "Planilhas 6k Pro" visível inicialmente
- ✅ Botão de compra redireciona para checkout

### 2. **Checkout com Upsell**
- ✅ Formulário de dados (Nome, Email, CPF com auto-formatação)
- ✅ Validação de CPF em tempo real
- ✅ Opção selecionável para adicionar "Dashboards+Bônus" (upsell)
- ✅ Integração com MercadoPago
- ✅ Validação de preços no servidor (segurança)
- ✅ Prova social (notificações de compras, contador de compradores)

### 3. **Backend - Edge Functions**
- ✅ `create-payment`: Cria preferência de pagamento no MercadoPago
  - Valida IDs de produtos
  - Define preços no servidor (não aceita do frontend)
  - Garante que Pack 2 só pode ser comprado junto com Pack 1
- ✅ `payment-webhook`: Recebe notificações do MercadoPago
  - Atualiza status de pagamento no banco de dados

### 4. **Banco de Dados**
- ✅ Tabela `purchases`: Registra todas as compras
- ✅ Tabela `mercadopago_notifications`: Log de notificações
- ✅ RLS policies: Usuários só veem suas próprias compras

### 5. **Páginas de Retorno**
- ✅ `/success`: Pagamento aprovado
- ✅ `/pending`: Pagamento pendente
- ✅ `/failure`: Pagamento recusado

---

## 🚧 Próximos Passos (A Implementar)

### **FASE 1: Autenticação e Área de Membros**

#### 1.1 Sistema de Login
```
Criar página /login ou /member-area
- Login apenas com email (magic link)
- Após pagamento aprovado, enviar email com link de acesso
- Link contém token único que autentica o usuário
```

**Implementação necessária:**
- Habilitar autenticação por email no Supabase
- Criar tabela `user_access` para vincular email com produtos comprados
- Edge function para enviar emails de acesso

#### 1.2 Área de Membros (/dashboard ou /minha-conta)
```
Página protegida que mostra:
- Produtos que o usuário comprou
- Links/botões para download de cada produto
- Histórico de pedidos
- Informações da conta
```

---

### **FASE 2: Sistema de Armazenamento de Arquivos**

#### 2.1 Supabase Storage
```sql
-- Criar bucket para planilhas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('planilhas', 'planilhas', false);

-- RLS Policy: Só usuários com compra aprovada podem baixar
CREATE POLICY "Users can download purchased files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'planilhas' AND
  EXISTS (
    SELECT 1 FROM purchases 
    WHERE user_email = auth.jwt() ->> 'email'
    AND payment_status = 'approved'
    AND products @> ARRAY[name]
  )
);
```

#### 2.2 Organização dos Arquivos
```
storage/planilhas/
├── pack_1/
│   ├── planilha_001.xlsx
│   ├── planilha_002.xlsx
│   └── ... (6000 planilhas)
└── pack_2/
    ├── planner-financeiro.xlsx
    ├── dashboard_001.xlsx
    └── ... (50 dashboards)
```

---

### **FASE 3: Envio de Emails Automatizado**

#### 3.1 Email após Pagamento Aprovado
**Trigger:** Quando `payment_webhook` atualiza status para "approved"

**Conteúdo do Email:**
```
Assunto: ✅ Seu acesso está liberado - Planilhas 6k Pro

Olá [NOME],

Seu pagamento foi confirmado! 🎉

Clique no link abaixo para acessar seus produtos:
👉 https://seusite.com/acesso?token=[TOKEN_UNICO]

Produtos incluídos na sua compra:
✅ Planilhas 6k Pro (6.000 planilhas Excel)
[Se comprou Pack 2]
✅ Dashboards+Bônus (Planner + 50 Dashboards)

Importante:
- Este link é único e pessoal
- Você tem 7 dias de garantia
- Dúvidas? Responda este email

Bom proveito! 📊
```

**Implementação:**
- Edge function `send-access-email`
- Usar Resend ou outro serviço de email
- Gerar token JWT único para acesso
- Armazenar token na tabela `access_tokens`

---

### **FASE 4: Fluxo Completo do Usuário**

```mermaid
graph TD
    A[Landing Page] --> B[Clica em Comprar]
    B --> C[Checkout - Preenche Dados]
    C --> D{Adiciona Upsell?}
    D -->|Sim| E[Total: R$ 25,98]
    D -->|Não| F[Total: R$ 12,99]
    E --> G[Redireciona para MercadoPago]
    F --> G
    G --> H{Paga?}
    H -->|Sim| I[Webhook: approved]
    H -->|Pendente| J[/pending]
    H -->|Não| K[/failure]
    I --> L[Envia Email com Link de Acesso]
    L --> M[Usuário clica no link]
    M --> N[Autenticação Automática]
    N --> O[Área de Membros]
    O --> P[Baixa Planilhas]
```

---

## 🔐 Segurança Implementada

### ✅ Validações Atuais
1. **Preços definidos no servidor** - Frontend só envia IDs
2. **CPF validado** - Algoritmo matemático de validação
3. **Email validado** - Schema Zod
4. **RLS no banco** - Usuários só veem seus dados
5. **Pack 2 só com Pack 1** - Validação no backend

### 🔒 Segurança a Adicionar
1. **Rate limiting** em edge functions
2. **Validação de webhooks** do MercadoPago (signature)
3. **Tokens de acesso expiráveis** (ex: 7 dias para primeiro acesso)
4. **Log de downloads** para evitar compartilhamento massivo
5. **IP tracking** (opcional) para detectar abusos

---

## 📊 Banco de Dados - Estrutura Completa

### Tabelas Existentes
```sql
-- ✅ purchases: Registra compras
-- ✅ mercadopago_notifications: Log de webhooks
-- ✅ users: Dados básicos dos usuários
```

### Tabelas a Criar

```sql
-- Tokens de acesso único
CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Log de downloads
CREATE TABLE download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT
);
```

---

## 🎯 Prioridades de Implementação

### Alta Prioridade (Fazer Agora)
1. ✅ Checkout com upsell selecionável
2. **Sistema de envio de email** após pagamento
3. **Upload das planilhas** para Supabase Storage
4. **Página de área de membros** básica
5. **Autenticação por magic link**

### Média Prioridade
6. Dashboard administrativo
7. Sistema de cupons de desconto
8. Analytics de vendas
9. Melhorias na área de membros (busca, filtros)

### Baixa Prioridade
10. Sistema de afiliados
11. Versão mobile app
12. API pública

---

## 💡 Recomendações Técnicas

### Performance
- Comprimir planilhas antes do upload (.zip)
- Usar CDN para arquivos estáticos
- Implementar cache de downloads frequentes

### UX
- Progress bar durante downloads grandes
- Preview de algumas planilhas
- Sistema de favoritos
- Histórico de downloads

### Monetização
- Upsell pós-compra (novos pacotes)
- Assinatura para atualizações mensais
- Planos premium com suporte prioritário

---

## 📝 Variáveis de Ambiente Necessárias

```bash
# ✅ Já configuradas
MERCADOPAGO_ACCESS_TOKEN=xxx
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 🚧 A configurar
RESEND_API_KEY=xxx # Para envio de emails
SITE_URL=https://seudominio.com
JWT_SECRET=xxx # Para tokens de acesso
```

---

## 🚀 Como Continuar

1. **Decidir serviço de email** (Resend recomendado)
2. **Fazer upload das planilhas** para Supabase Storage
3. **Criar edge function** de envio de email
4. **Implementar página** de área de membros
5. **Testar fluxo completo** em ambiente de teste do MercadoPago

---

**Última atualização:** 2025-01-04
**Status:** Checkout e pagamento implementados ✅ | Área de membros pendente 🚧
