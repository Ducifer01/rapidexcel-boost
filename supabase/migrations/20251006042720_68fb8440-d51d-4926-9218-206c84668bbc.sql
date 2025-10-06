-- Criar uma compra de teste aprovada para acesso à área de membros
INSERT INTO public.purchases (
  payment_id,
  user_email,
  products,
  total_amount,
  payment_status,
  auth_user_id
) VALUES (
  'TEST_PAYMENT_001',
  'teste@planilheiro.com',
  ARRAY['Planilheiro Plus'],
  12.99,
  'approved',
  NULL
)
ON CONFLICT DO NOTHING;