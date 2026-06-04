CREATE OR REPLACE FUNCTION insert_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar dados de teste anteriores
  DELETE FROM estabelecimentos WHERE user_id = '00000000-0000-0000-0000-000000000001';
  DELETE FROM profissionais WHERE user_id = '00000000-0000-0000-0000-000000000002';

  -- Inserir estabelecimentos
  INSERT INTO estabelecimentos (nome, responsavel, telefone, endereco, cidade, estado, funcoes_utilizadas, onboarding_completo, user_id) VALUES
  ('Restaurante Bella Italia', 'Marco Rossi', '11999990001', 'Rua Augusta, 1200', 'São Paulo', 'SP', ARRAY['Garçom','Cozinheiro'], true, '00000000-0000-0000-0000-000000000001'),
  ('Churrascaria do Sul', 'Gaúcho Lima', '11999990002', 'Av. Paulista, 900', 'São Paulo', 'SP', ARRAY['Garçom','Bartender'], true, '00000000-0000-0000-0000-000000000001'),
  ('Sushi Sakura', 'Kenji Tanaka', '11999990003', 'Rua Liberdade, 50', 'São Paulo', 'SP', ARRAY['Auxiliar de Cozinha'], true, '00000000-0000-0000-0000-000000000001'),
  ('Café Central', 'Ana Beatriz', '11999990004', 'Rua Oscar Freire, 300', 'São Paulo', 'SP', ARRAY['Garçom','Caixa'], true, '00000000-0000-0000-0000-000000000001');

  -- Inserir profissionais
  INSERT INTO profissionais (nome, whatsapp, cidade, estado, funcoes, disponibilidade, diaria_minima, experiencia, trust_score, total_avaliacoes, onboarding_completo, user_id) VALUES
  ('Carlos Mendes', '11988880001', 'São Paulo', 'SP', ARRAY['Garçom'], ARRAY['Sexta','Sábado','Domingo'], 180, '5 anos em restaurantes finos', 4.8, 12, true, '00000000-0000-0000-0000-000000000002'),
  ('Fernanda Costa', '11988880002', 'São Paulo', 'SP', ARRAY['Cozinheiro','Auxiliar de Cozinha'], ARRAY['Segunda','Terça','Quarta'], 200, 'Chef formada pelo Senac', 4.5, 8, true, '00000000-0000-0000-0000-000000000002'),
  ('Rafael Oliveira', '11988880003', 'São Paulo', 'SP', ARRAY['Bartender'], ARRAY['Quinta','Sexta','Sábado'], 220, 'Bartender em bares e eventos', 4.9, 20, true, '00000000-0000-0000-0000-000000000002'),
  ('Juliana Santos', '11988880004', 'São Paulo', 'SP', ARRAY['Garçom','Recepcionista'], ARRAY['Sábado','Domingo'], 160, '3 anos em eventos corporativos', 4.2, 5, true, '00000000-0000-0000-0000-000000000002'),
  ('Pedro Alves', '11988880005', 'São Paulo', 'SP', ARRAY['Auxiliar de Cozinha'], ARRAY['Segunda','Quarta','Sexta'], 140, 'Iniciante com curso técnico', 3.8, 3, true, '00000000-0000-0000-0000-000000000002');
END;
$$;

GRANT EXECUTE ON FUNCTION insert_seed_data() TO anon, authenticated;

CREATE OR REPLACE FUNCTION delete_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM estabelecimentos WHERE user_id = '00000000-0000-0000-0000-000000000001';
  DELETE FROM profissionais WHERE user_id = '00000000-0000-0000-0000-000000000002';
END;
$$;

GRANT EXECUTE ON FUNCTION delete_seed_data() TO anon, authenticated;