CREATE OR REPLACE FUNCTION delete_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar profissionais de teste (incluindo o admin para resetar os dados de teste se necessário)
  DELETE FROM profissionais WHERE user_id IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '049d1308-3444-4ada-8a80-df7b19ae6e28' -- ID do lgramirodecampos
  );

  -- Deletar estabelecimento de teste
  DELETE FROM estabelecimentos WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001'
  );

  -- Deletar usuários de teste (apenas os hardcoded)
  DELETE FROM auth.users WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102'
  );
END;
$$;

CREATE OR REPLACE FUNCTION insert_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar dados anteriores
  PERFORM delete_seed_data();

  -- Criar usuários de teste no auth.users (se não existirem)
  INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  ('00000000-0000-0000-0000-000000000001', 'estabelecimento@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000101', 'profissional1@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'profissional2@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Inserir Estabelecimento de Teste
  INSERT INTO estabelecimentos (nome, responsavel, telefone, endereco, cidade, estado, funcoes_utilizadas, onboarding_completo, user_id)
  VALUES (
    'Restaurante Bella Italia', 
    'Marco Rossi', 
    '11999990001', 
    'Rua Augusta, 1200', 
    'São Paulo', 
    'SP', 
    ARRAY['Garçom','Cozinheiro'], 
    true, 
    '00000000-0000-0000-0000-000000000001'
  );

  -- Inserir 3 Profissionais (incluindo o admin)
  INSERT INTO profissionais (nome, whatsapp, cidade, estado, funcoes, disponibilidade, diaria_minima, trust_score, total_avaliacoes, onboarding_completo, user_id)
  VALUES 
  (
    'João Silva', 
    '11988880001', 
    'São Paulo', 
    'SP', 
    ARRAY['Garçom'], 
    ARRAY['Segunda','Terça','Quarta'], 
    150.00, 
    4.5, 
    10, 
    true, 
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    'Maria Oliveira', 
    '11988880002', 
    'São Paulo', 
    'SP', 
    ARRAY['Cozinheiro'], 
    ARRAY['Quinta','Sexta','Sábado'], 
    200.00, 
    4.8, 
    15, 
    true, 
    '00000000-0000-0000-0000-000000000102'
  ),
  (
    'Admin Teste (lgramiro)', 
    '11999998888', 
    'São Paulo', 
    'SP', 
    ARRAY['Garçom', 'Barman'], 
    ARRAY['Segunda','Sexta','Sábado','Domingo'], 
    180.00, 
    5.0, 
    20, 
    true, 
    '049d1308-3444-4ada-8a80-df7b19ae6e28'
  );
END;
$$;