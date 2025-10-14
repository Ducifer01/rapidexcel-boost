-- Adicionar configurações do Facebook Pixel na tabela site_settings
INSERT INTO public.site_settings (key, value, description) VALUES
('facebook_pixel_id', '', 'ID do Facebook Pixel para tracking de conversões'),
('fb_pixel_enabled', 'true', 'Ativar/desativar Facebook Pixel')
ON CONFLICT (key) DO NOTHING;