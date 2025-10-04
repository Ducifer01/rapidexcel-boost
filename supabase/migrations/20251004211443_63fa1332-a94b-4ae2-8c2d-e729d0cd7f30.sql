-- Adicionar coluna auth_user_id na tabela purchases
ALTER TABLE public.purchases 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Adicionar coluna password_hash temporária para webhook criar usuário
ALTER TABLE public.purchases 
ADD COLUMN password_hash TEXT;

-- Criar índice para melhor performance
CREATE INDEX idx_purchases_auth_user_id ON public.purchases(auth_user_id);

-- Atualizar RLS policies para segurança máxima
-- Remover políticas antigas primeiro
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow webhook updates" ON public.purchases;

-- Nova política: Usuários só veem suas próprias compras aprovadas
CREATE POLICY "Users can view own approved purchases" ON public.purchases
  FOR SELECT
  USING (
    auth.uid() = auth_user_id 
    AND payment_status = 'approved'
  );

-- Política: Permitir inserção inicial (antes de auth criado)
CREATE POLICY "Allow insert pending purchases" ON public.purchases
  FOR INSERT
  WITH CHECK (payment_status = 'pending');

-- Política: Webhook pode atualizar qualquer compra (usa service role key)
CREATE POLICY "Service role can update purchases" ON public.purchases
  FOR UPDATE
  USING (true);

-- Criar tabela para controlar downloads e prevenir abuso
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios downloads
CREATE POLICY "Users can view own downloads" ON public.download_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Sistema pode registrar downloads
CREATE POLICY "Service can insert downloads" ON public.download_logs
  FOR INSERT
  WITH CHECK (true);

-- Criar índice para performance
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_product ON public.download_logs(product_name);

-- Função para verificar se usuário tem acesso ao produto
CREATE OR REPLACE FUNCTION public.user_has_product_access(
  _user_id UUID,
  _product_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.purchases
    WHERE auth_user_id = _user_id
      AND payment_status = 'approved'
      AND _product_name = ANY(products)
  );
$$;