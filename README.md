# 🚀 Sistema de Vendas de Planilhas Excel

Sistema completo de vendas de produtos digitais com integração MercadoPago, autenticação automática e área de membros segura.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Configuração do Supabase](#configuração-do-supabase)
- [Configuração de Pagamentos](#configuração-de-pagamentos)
- [Configuração de Downloads](#configuração-de-downloads)
- [Deploy da Aplicação](#deploy-da-aplicação)
- [Como Editar o Projeto](#como-editar-o-projeto)
- [Alternativas de Pagamento](#alternativas-de-pagamento)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)

---

## 📖 Sobre o Projeto

Este é um sistema completo de e-commerce para produtos digitais (planilhas Excel) que inclui:

- ✅ **Landing page** com showcase de produtos
- ✅ **Checkout integrado** com MercadoPago
- ✅ **Autenticação automática** após pagamento
- ✅ **Área de membros** com downloads protegidos
- ✅ **Sistema de logs** para auditoria
- ✅ **Design responsivo** e moderno

### Como Funciona

1. Cliente acessa o site e escolhe o produto
2. Preenche dados no checkout (incluindo senha)
3. Realiza pagamento via MercadoPago
4. Sistema cria conta automaticamente após aprovação
5. Cliente faz login e acessa área de downloads
6. Downloads são verificados e registrados

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **React Router** - Roteamento

### Backend
- **Supabase** - Backend completo
  - PostgreSQL (Banco de dados)
  - Auth (Autenticação)
  - Edge Functions (Serverless)
  - Row Level Security (RLS)

### Integrações
- **MercadoPago** - Gateway de pagamento
- **Google Drive/Dropbox** - Armazenamento de arquivos

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter:

- **Node.js** (versão 18 ou superior) - [Instalar com nvm](https://github.com/nvm-sh/nvm)
- **Conta no Supabase** - [Criar conta grátis](https://supabase.com)
- **Conta no MercadoPago** - [Criar conta](https://www.mercadopago.com.br)
- **Git** - Para clonar o repositório

---

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

---

## 🗄️ Configuração do Supabase

### Criando um Projeto do Zero

#### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha:
   - **Name**: Nome do seu projeto
   - **Database Password**: Senha forte (guarde essa senha!)
   - **Region**: Brazil (para melhor performance)
6. Aguarde a criação do projeto (~2 minutos)

#### 2. Obter Credenciais

Após criar o projeto, acesse **Settings > API**:

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJhbG...` (chave pública)
- **Service Role Key**: `eyJhbG...` (chave privada - guardar com segurança!)

#### 3. Configurar o Cliente Supabase

Edite o arquivo `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_PUBLISHABLE_KEY = "SUA_ANON_KEY_AQUI";
```

#### 4. Criar Tabelas do Banco de Dados

Acesse **SQL Editor** no Supabase e execute:

```sql
-- Tabela de usuários
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de compras
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  products TEXT[] NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  auth_user_id UUID,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de links de download
CREATE TABLE public.product_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL UNIQUE,
  download_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de logs de download
CREATE TABLE public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  ip_address TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações do MercadoPago
CREATE TABLE public.mercadopago_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  validated BOOLEAN DEFAULT false,
  validation_error TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercadopago_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas suas compras aprovadas
CREATE POLICY "Users can view own approved purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = auth_user_id AND payment_status = 'approved');

-- Política: Permitir inserção de compras pendentes
CREATE POLICY "Allow insert pending purchases"
ON public.purchases FOR INSERT
WITH CHECK (payment_status = 'pending');

-- Política: Service role pode atualizar compras
CREATE POLICY "Service role can update purchases"
ON public.purchases FOR UPDATE
USING (true);

-- Política: Usuários veem próprios logs
CREATE POLICY "Users can view own downloads"
ON public.download_logs FOR SELECT
USING (auth.uid() = user_id);

-- Política: Sistema pode inserir logs
CREATE POLICY "Service can insert downloads"
ON public.download_logs FOR INSERT
WITH CHECK (true);

-- Política: Apenas service role gerencia downloads
CREATE POLICY "Service role can manage downloads"
ON public.product_downloads FOR ALL
USING (true);

-- Política: Service role gerencia notificações
CREATE POLICY "Service role can manage notifications"
ON public.mercadopago_notifications FOR ALL
USING (true);

-- Política: Usuários veem seus próprios dados
CREATE POLICY "Users can view own data"
ON public.users FOR SELECT
USING ((auth.jwt() ->> 'email'::text) = email);
```

#### 6. Criar Função de Verificação de Acesso

```sql
CREATE OR REPLACE FUNCTION public.user_has_product_access(
  _user_id UUID,
  _product_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.purchases
    WHERE auth_user_id = _user_id
      AND payment_status = 'approved'
      AND _product_name = ANY(products)
  );
$$;
```

#### 7. Configurar Edge Functions

As Edge Functions estão em `supabase/functions/`. Para cada função, configure os secrets:

**Acesse Settings > Edge Functions > Manage secrets** e adicione:

- `MERCADOPAGO_ACCESS_TOKEN`: Token de acesso do MercadoPago
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave pública do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role

#### 8. Desabilitar Confirmação de Email (Recomendado para Testes)

Acesse **Authentication > Providers > Email**:
- Desmarque "Confirm email"
- Isso permite login imediato após cadastro

---

## 💳 Configuração de Pagamentos

### MercadoPago

#### 1. Criar Conta no MercadoPago

1. Acesse [https://www.mercadopago.com.br](https://www.mercadopago.com.br)
2. Crie uma conta ou faça login
3. Complete a verificação da conta

#### 2. Obter Credenciais

1. Acesse [https://www.mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Vá em **"Suas aplicações"** > **"Criar aplicação"**
3. Preencha os dados e crie
4. Copie o **Access Token** (modo produção)

#### 3. Configurar Webhook

No painel do MercadoPago:
1. Vá em **"Webhooks"**
2. Adicione nova URL de webhook:
   ```
   https://SEU_PROJETO.supabase.co/functions/v1/payment-webhook
   ```
3. Selecione evento: **Payments**

#### 4. Adicionar Token ao Supabase

No Supabase, vá em **Edge Functions > Manage Secrets** e adicione:
- **Nome**: `MERCADOPAGO_ACCESS_TOKEN`
- **Valor**: Seu Access Token do MercadoPago

#### 5. Configurar Produtos

Edite `src/pages/Checkout.tsx` para ajustar preços e nomes dos produtos:

```typescript
const PRODUCTS = [
  {
    id: 'planilhas-6k',
    name: 'Planilhas 6k Pro - 6.000 Planilhas Excel',
    price: 67.00,
    description: '6.000 planilhas Excel profissionais'
  },
  {
    id: 'dashboards',
    name: 'Dashboards+Bônus - Planner + 50 Dashboards',
    price: 67.00,
    description: '50 dashboards + bônus especial'
  }
];
```

---

## 📥 Configuração de Downloads

### Opção 1: Google Drive (Recomendado)

#### 1. Fazer Upload dos Arquivos

1. Acesse [Google Drive](https://drive.google.com)
2. Faça upload dos arquivos ZIP:
   - `planilhas-6k-pro.zip`
   - `dashboards-bonus.zip`

#### 2. Gerar Links Diretos

Para cada arquivo:
1. Clique com botão direito > "Obter link"
2. Altere para "Qualquer pessoa com o link"
3. Copie o ID do arquivo da URL:
   ```
   https://drive.google.com/file/d/SEU_ID_AQUI/view
   ```
4. Transforme em link direto:
   ```
   https://drive.google.com/uc?export=download&id=SEU_ID_AQUI
   ```

#### 3. Atualizar Links no Banco

No **SQL Editor do Supabase**, execute:

```sql
-- Atualizar link do produto 1
UPDATE public.product_downloads
SET download_url = 'https://drive.google.com/uc?export=download&id=SEU_ID_1'
WHERE product_name = 'Planilhas 6k Pro - 6.000 Planilhas Excel';

-- Atualizar link do produto 2
UPDATE public.product_downloads
SET download_url = 'https://drive.google.com/uc?export=download&id=SEU_ID_2'
WHERE product_name = 'Dashboards+Bônus - Planner + 50 Dashboards';
```

### Opção 2: Dropbox

#### 1. Fazer Upload

1. Acesse [Dropbox](https://www.dropbox.com)
2. Faça upload dos arquivos

#### 2. Gerar Links

1. Clique em "Compartilhar"
2. Copie o link
3. **Troque** `dl=0` por `dl=1` no final da URL:
   ```
   https://www.dropbox.com/s/abc123/arquivo.zip?dl=1
   ```

#### 3. Atualizar no Banco

Execute o mesmo comando SQL acima com os links do Dropbox.

---

## 🌐 Deploy da Aplicação

### Deploy via Lovable (Mais Fácil)

1. Acesse [Lovable](https://lovable.dev/projects/68090395-acbf-4538-9089-42a42f2edf4d)
2. Clique em **"Publish"** (canto superior direito)
3. Aguarde o deploy completar
4. Seu site estará disponível em: `seu-projeto.lovable.app`

### Deploy Manual (Vercel/Netlify)

#### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel
```

#### Netlify

```bash
# Build do projeto
npm run build

# Fazer upload da pasta dist/ no Netlify
```

### Conectar Domínio Customizado

1. No Lovable, vá em **Settings > Domains**
2. Clique em **"Connect Domain"**
3. Adicione seu domínio (ex: `meusite.com.br`)
4. Configure os registros DNS conforme instruções

---

## ✏️ Como Editar o Projeto

### Editar via Lovable (Recomendado)

1. Acesse o [projeto no Lovable](https://lovable.dev/projects/68090395-acbf-4538-9089-42a42f2edf4d)
2. Use prompts em português para fazer alterações:
   - "Altere a cor do botão para azul"
   - "Adicione um novo produto"
   - "Mude o texto do hero para..."
3. As mudanças são aplicadas automaticamente

### Editar via Visual Edits (Grátis)

1. Clique em **"Edit"** no chat (canto inferior esquerdo)
2. Selecione elementos na página
3. Edite textos, cores e fontes diretamente
4. Clique em **"Save"** para aplicar

### Editar Localmente (IDE)

```bash
# 1. Clone o repositório
git clone <URL_DO_REPO>
cd <NOME_DO_PROJETO>

# 2. Instale dependências
npm install

# 3. Inicie servidor de desenvolvimento
npm run dev

# 4. Faça suas alterações

# 5. Commit e push
git add .
git commit -m "Minhas alterações"
git push
```

### Arquivos Importantes

- `src/pages/Index.tsx` - Página inicial
- `src/pages/Checkout.tsx` - Página de checkout
- `src/pages/Dashboard.tsx` - Área de membros
- `src/index.css` - Estilos globais
- `tailwind.config.ts` - Configuração do Tailwind

---

## 💰 Alternativas de Pagamento

Além do MercadoPago, você pode integrar:

### 1. Stripe

**Vantagens:**
- Aceito internacionalmente
- Taxas competitivas (2.9% + R$0.40)
- APIs bem documentadas

**Como Implementar:**

1. **Criar conta no Stripe**
   - Acesse [stripe.com](https://stripe.com)
   - Complete verificação

2. **Instalar SDK**
   ```bash
   npm install @stripe/stripe-js
   ```

3. **Configurar Edge Function**
   ```typescript
   // supabase/functions/create-stripe-payment/index.ts
   import Stripe from 'stripe';
   
   const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
   
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: [{
       price_data: {
         currency: 'brl',
         product_data: { name: 'Seu Produto' },
         unit_amount: 6700, // R$ 67,00
       },
       quantity: 1,
     }],
     mode: 'payment',
     success_url: `${origin}/success`,
     cancel_url: `${origin}/`,
   });
   ```

4. **Adicionar Secret**
   - No Supabase: `STRIPE_SECRET_KEY`

### 2. PagSeguro

**Vantagens:**
- Popular no Brasil
- Múltiplos métodos de pagamento
- Boleto bancário

**Como Implementar:**

```typescript
// Similar ao MercadoPago, mas usando API do PagSeguro
const response = await fetch('https://ws.pagseguro.uol.com.br/v2/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: Deno.env.get('PAGSEGURO_EMAIL'),
    token: Deno.env.get('PAGSEGURO_TOKEN'),
    currency: 'BRL',
    itemId: '0001',
    itemDescription: 'Planilhas Excel',
    itemAmount: '67.00',
    itemQuantity: '1'
  })
});
```

### 3. Pix Direto

**Vantagens:**
- Taxas mais baixas
- Transferência instantânea
- Sem intermediários

**Como Implementar:**

1. **Gerar QR Code Pix**
   ```typescript
   // Use biblioteca como pix-utils
   import { createStaticPix } from 'pix-utils';
   
   const pixCode = createStaticPix({
     merchantName: 'Sua Empresa',
     merchantCity: 'Sua Cidade',
     pixKey: 'sua-chave@pix.com',
     infoAdicional: 'Pedido #123',
     transactionAmount: 67.00,
   });
   ```

2. **Verificar Pagamento**
   - Integrar com banco via API
   - Ou verificação manual via webhook

### 4. Comparação

| Gateway      | Taxa        | Pix  | Boleto | Internacional |
|--------------|-------------|------|--------|---------------|
| MercadoPago  | 4.99%       | ✅   | ✅     | ✅            |
| Stripe       | 2.9% + R$0.40 | ❌  | ❌     | ✅            |
| PagSeguro    | 3.99%       | ✅   | ✅     | ❌            |
| Pix Direto   | ~R$0        | ✅   | ❌     | ❌            |

---

## 📁 Estrutura do Projeto

```
projeto/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn/ui
│   │   ├── Hero.tsx        # Seção hero
│   │   ├── Benefits.tsx    # Benefícios
│   │   ├── Offers.tsx      # Ofertas
│   │   └── ...
│   ├── pages/              # Páginas
│   │   ├── Index.tsx       # Home
│   │   ├── Checkout.tsx    # Checkout
│   │   ├── Dashboard.tsx   # Área de membros
│   │   ├── Login.tsx       # Login
│   │   └── Success.tsx     # Sucesso
│   ├── integrations/       # Integrações
│   │   └── supabase/       # Cliente Supabase
│   ├── lib/                # Utilitários
│   ├── index.css           # Estilos globais
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── create-payment/
│   │   ├── payment-webhook/
│   │   └── verify-product-access/
│   └── config.toml         # Config do Supabase
├── public/                 # Arquivos estáticos
├── README.md               # Este arquivo
└── package.json            # Dependências
```

---

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação JWT** - Tokens seguros do Supabase
2. **Row Level Security (RLS)** - Isolamento de dados por usuário
3. **Hash de Senha** - SHA-256 no servidor
4. **Edge Functions** - Lógica sensível no backend
5. **Validação de Entrada** - Zod schema validation
6. **CORS Configurado** - Apenas origens permitidas
7. **Secrets Management** - Chaves fora do código
8. **Download Logs** - Auditoria completa

### Boas Práticas

- ✅ Nunca exponha `SERVICE_ROLE_KEY` no frontend
- ✅ Sempre valide dados no servidor
- ✅ Use HTTPS em produção
- ✅ Monitore logs regularmente
- ✅ Mantenha dependências atualizadas

---

## 📞 Suporte

- **Documentação Lovable**: [docs.lovable.dev](https://docs.lovable.dev)
- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Documentação MercadoPago**: [developers.mercadopago.com.br](https://www.mercadopago.com.br/developers)
- **Comunidade Lovable**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando Lovable**
