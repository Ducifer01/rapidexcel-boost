-- Criar bucket para produtos digitais
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', false);

-- Política: Usuários podem baixar produtos que compraram
CREATE POLICY "Users can download purchased products"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products' 
  AND auth.uid() IN (
    SELECT auth_user_id FROM purchases 
    WHERE payment_status = 'approved'
    AND products @> ARRAY[name]
  )
);