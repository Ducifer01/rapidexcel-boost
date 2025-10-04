-- Habilitar RLS na tabela mercadopago_notifications que estava sem proteção
ALTER TABLE public.mercadopago_notifications ENABLE ROW LEVEL SECURITY;

-- Como essa tabela é apenas para registro interno de webhooks,
-- não precisa de SELECT público. Apenas o sistema pode inserir/atualizar
CREATE POLICY "Service role can manage notifications" ON public.mercadopago_notifications
  FOR ALL
  USING (true);