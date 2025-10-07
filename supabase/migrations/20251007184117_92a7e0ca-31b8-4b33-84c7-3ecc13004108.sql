-- 1. Criar tabela site_settings para configurações do site
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler as configurações
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Policy: Apenas service role pode modificar
CREATE POLICY "Service role can manage settings"
ON public.site_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Inserir configurações padrão
INSERT INTO public.site_settings (key, value, description) VALUES
  ('youtube_video_id', 'dQw4w9WgXcQ', 'ID do vídeo do YouTube exibido na página inicial'),
  ('tawk_property_id', '68e55cc39cf08c194dc2d0e7', 'Property ID do Tawk.to'),
  ('tawk_widget_id', '1j6vv4nlm', 'Widget ID do Tawk.to'),
  ('tawk_enabled', 'true', 'Ativa/desativa o chat do Tawk.to');

-- 2. Função para expirar pedidos pending antigos (24 horas)
CREATE OR REPLACE FUNCTION public.expire_old_pending_purchases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.purchases
  SET 
    payment_status = 'expired',
    updated_at = now()
  WHERE 
    payment_status = 'pending'
    AND created_at < (now() - interval '24 hours');
END;
$$;

-- 3. Corrigir política RLS da tabela purchases
-- Remover política insegura que permite qualquer usuário inserir
DROP POLICY IF EXISTS "Allow insert pending purchases" ON public.purchases;

-- Criar política correta: apenas service role pode inserir
CREATE POLICY "Service role can insert purchases"
ON public.purchases
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();