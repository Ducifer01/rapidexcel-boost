-- Adicionar campos do Stripe na tabela purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_customer ON purchases(stripe_customer_id);

-- Remover constraint antigo de payment_status se existir
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_payment_status_check;

-- Adicionar novo constraint para payment_status incluindo succeeded
ALTER TABLE purchases ADD CONSTRAINT purchases_payment_status_check 
  CHECK (payment_status IN ('pending', 'approved', 'rejected', 'succeeded'));

-- Atualizar política de SELECT para incluir succeeded
DROP POLICY IF EXISTS "Users can view own approved purchases" ON purchases;
CREATE POLICY "Users can view own approved purchases" ON purchases
  FOR SELECT
  USING (
    auth.uid() = auth_user_id 
    AND (payment_status = 'approved' OR payment_status = 'succeeded')
  );