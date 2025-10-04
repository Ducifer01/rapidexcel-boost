-- Remover objetos do bucket primeiro
DELETE FROM storage.objects WHERE bucket_id = 'products';

-- Remover políticas do bucket
DROP POLICY IF EXISTS "Users can download purchased products" ON storage.objects;

-- Remover bucket do Storage
DELETE FROM storage.buckets WHERE id = 'products';

-- Criar tabela para armazenar links de download externos
CREATE TABLE public.product_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL UNIQUE,
  download_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS: Apenas service role pode gerenciar
ALTER TABLE public.product_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage downloads"
ON public.product_downloads
FOR ALL
USING (true);

-- Inserir produtos com URLs placeholder (você atualizará depois)
INSERT INTO public.product_downloads (product_name, download_url)
VALUES 
  ('Planilhas 6k Pro - 6.000 Planilhas Excel', 'https://drive.google.com/uc?export=download&id=SEU_ID_AQUI_1'),
  ('Dashboards+Bônus - Planner + 50 Dashboards', 'https://drive.google.com/uc?export=download&id=SEU_ID_AQUI_2');