CREATE OR REPLACE FUNCTION delete_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar estabelecimento de teste
  DELETE FROM estabelecimentos WHERE user_id = '00000000-0000-0000-0000-000000000001';
  
  -- Deletar profissionais de teste
  DELETE FROM profissionais WHERE user_id IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000002' -- Antigo ID usado no seed anterior
  );
END;
$$;

CREATE OR REPLACE FUNCTION insert_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar dados de teste anteriores
  PERFORM delete_seed_data();

  -- Inserir 1 Estabelecimento
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

  -- Inserir 2 Profissionais
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
  );
END;
$$;

GRANT EXECUTE ON FUNCTION insert_seed_data() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_seed_data() TO anon, authenticated;