# Configuração do Banco de Dados Supabase

Este documento descreve como configurar as tabelas no Supabase para o PlanilhaExpress.

## Tabelas Necessárias

### 1. Tabela `purchases`

Esta tabela armazena todas as compras realizadas.

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  products TEXT[] NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  payment_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar performance de busca por email
CREATE INDEX idx_purchases_email ON purchases(user_email);

-- Índice para melhorar performance de busca por payment_id
CREATE INDEX idx_purchases_payment_id ON purchases(payment_id);

-- Habilitar Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias compras
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Política: Permitir inserção de novas compras (público)
CREATE POLICY "Allow insert purchases" ON purchases
  FOR INSERT
  WITH CHECK (true);

-- Política: Permitir atualização via webhook
CREATE POLICY "Allow webhook updates" ON purchases
  FOR UPDATE
  USING (true);
```

### 2. Tabela `users` (opcional, para área de membros)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);
```

## Configuração de Secrets

No painel do Supabase, adicione as seguintes secrets em **Edge Functions > Secrets**:

1. `MERCADOPAGO_ACCESS_TOKEN` - Seu Access Token do MercadoPago
2. `SUPABASE_SERVICE_ROLE_KEY` - Já está configurado automaticamente

## Configuração do MercadoPago

### Passo 1: Obter Credenciais

1. Acesse https://www.mercadopago.com.br/developers
2. Vá em "Suas integrações" > "Credenciais"
3. Copie:
   - **Public Key** (para usar no frontend)
   - **Access Token** (para usar no backend/edge functions)

### Passo 2: Configurar no Código

1. Adicione o Public Key em `src/services/mercadopago.ts`:
   ```typescript
   publicKey: 'SEU_PUBLIC_KEY_AQUI',
   ```

2. Adicione o Access Token nas Secrets do Supabase:
   - Nome: `MERCADOPAGO_ACCESS_TOKEN`
   - Valor: Seu Access Token

### Passo 3: Configurar Webhook

No painel do MercadoPago, configure a URL do webhook:
```
https://ezymopl1fpsjpklskgodn.supabase.co/functions/v1/payment-webhook
```

## Testando a Integração

1. Execute a função de criação de pagamento
2. Verifique se a compra foi registrada na tabela `purchases`
3. Complete o pagamento no MercadoPago
4. Verifique se o status foi atualizado via webhook

## Notas Importantes

- As edge functions já estão configuradas como públicas (`verify_jwt = false`)
- O webhook do MercadoPago atualizará automaticamente o status dos pagamentos
- Todos os dados de pagamento são processados de forma segura
