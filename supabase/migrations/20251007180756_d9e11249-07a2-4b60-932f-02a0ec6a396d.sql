-- Drop policy antiga que só permite ver compras aprovadas
DROP POLICY IF EXISTS "Users can view own approved purchases" ON purchases;

-- Criar nova policy que permite ver TODAS as compras do usuário
CREATE POLICY "Users can view ALL own purchases"
ON purchases FOR SELECT
USING (auth.uid() = auth_user_id);