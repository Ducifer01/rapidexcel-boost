-- Adicionar email de suporte na configuração do site
INSERT INTO public.site_settings (key, value, description)
VALUES ('support_email', 'suporte@planilhaexpress.com.br', 'Email de suporte exibido quando Tawk.to está desativado')
ON CONFLICT (key) DO NOTHING;