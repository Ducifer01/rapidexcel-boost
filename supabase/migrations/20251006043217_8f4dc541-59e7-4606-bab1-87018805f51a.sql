-- Atualizar a compra de teste para vincular ao usuário autenticado
UPDATE public.purchases
SET auth_user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'teste@planilheiro.com'
)
WHERE user_email = 'teste@planilheiro.com'
  AND payment_status = 'approved'
  AND payment_id = 'TEST_PAYMENT_001';