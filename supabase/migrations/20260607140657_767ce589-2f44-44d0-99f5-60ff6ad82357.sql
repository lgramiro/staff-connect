-- Tabela de treinamentos
create table if not exists public.treinamentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  url_video text,
  duracao_minutos integer default 10,
  funcao text default 'todos',
  obrigatorio boolean default false,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

GRANT SELECT ON public.treinamentos TO anon;
GRANT SELECT ON public.treinamentos TO authenticated;
GRANT ALL ON public.treinamentos TO service_role;

alter table public.treinamentos enable row level security;

create policy "treinamentos_leitura_publica" on public.treinamentos
  for select using (ativo = true);

create policy "treinamentos_admin" on public.treinamentos
  for all using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Tabela de conclusões
create table if not exists public.treinamentos_concluidos (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid references public.profiles(id) on delete cascade,
  treinamento_id uuid references public.treinamentos(id) on delete cascade,
  concluido_at timestamptz default now(),
  unique(profissional_id, treinamento_id)
);

GRANT SELECT, INSERT ON public.treinamentos_concluidos TO authenticated;
GRANT ALL ON public.treinamentos_concluidos TO service_role;

alter table public.treinamentos_concluidos enable row level security;

create policy "tc_select_proprio" on public.treinamentos_concluidos
  for select using (profissional_id = auth.uid());

create policy "tc_insert_proprio" on public.treinamentos_concluidos
  for insert with check (profissional_id = auth.uid());

create policy "tc_admin" on public.treinamentos_concluidos
  for select using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Campos na tabela profissionais
alter table public.profissionais
  add column if not exists treinamento_concluido boolean default false,
  add column if not exists treinamento_nota integer,
  add column if not exists treinamento_data timestamptz;

-- Seed: conteúdo inicial
insert into public.treinamentos (titulo, descricao, duracao_minutos, funcao, obrigatorio, ordem) values
('Bem-vindo ao Tem Staff', 'Como funciona a plataforma, candidaturas, avaliações e Trust Score.', 8, 'todos', true, 1),
('Pontualidade e Compromisso', 'O que acontece com seu Trust Score quando você falta ou atrasa.', 10, 'todos', true, 2),
('Apresentação Pessoal', 'Checklist de higiene, uniforme e postura antes de sair de casa.', 8, 'todos', true, 3),
('Postura Profissional', 'Comportamento no ambiente de trabalho e como lidar com conflitos.', 8, 'todos', true, 4),
('Como Funciona a Avaliação', 'Trust Score, médias de estrelas e impacto no seu perfil.', 8, 'todos', true, 5),
('Segurança e Higiene Alimentar', 'Normas ANVISA, temperaturas seguras e zona de perigo.', 12, 'todos', true, 6),
('Técnicas de Serviço de Mesa', 'Mise en place, sequência de serviço e protocolo de atendimento.', 20, 'garcom', false, 7),
('Anotação e Confirmação de Pedidos', 'Como anotar pedidos, confirmar com o cliente e comunicar alergias.', 12, 'garcom', false, 8),
('Conhecimento do Cardápio', 'Como estudar o cardápio, sugerir pratos e lidar com alergênicos.', 10, 'garcom', false, 9),
('Mise en Place e Organização da Mesa', 'Montagem de mesa, reposição durante o serviço e fechamento.', 10, 'garcom', false, 10),
('Fechamento e Despedida', 'Conta, formas de pagamento e como despedir bem o cliente.', 8, 'garcom', false, 11),
('Mise en Place e Organização da Praça', 'PEPS, bancadas, câmara fria e organização antes do rush.', 15, 'cozinheiro', false, 12),
('Higiene na Cozinha', 'Lavagem de mãos, luvas, toucas e temperaturas seguras.', 12, 'cozinheiro', false, 13),
('Comunicação na Brigada', 'Hierarquia, avisos de circulação e como reportar falta de insumos.', 10, 'cozinheiro', false, 14),
('Velocidade, Qualidade e Execução', 'Padrão de produção, ponto dos alimentos e comunicação com o salão.', 12, 'cozinheiro', false, 15),
('Limpeza e Fechamento da Cozinha', 'Rotina de encerramento, descarte correto e registro de insumos.', 10, 'cozinheiro', false, 16),
('Mise en Place do Bar', 'Estoque, gelo, ferramentas e organização antes de abrir.', 12, 'bartender', false, 17),
('Técnicas Básicas de Coquetelaria', 'Build, stir, shake, blend e muddle — quando usar cada um.', 20, 'bartender', false, 18),
('Atendimento no Balcão', 'Como sugerir drinks, manter o balcão limpo e criar experiências.', 10, 'bartender', false, 19),
('Barback: Suporte e Reposição', 'Responsabilidades do barback no pico do serviço.', 8, 'bartender', false, 20),
('Responsabilidade no Serviço de Bebidas', 'Lei seca para menores, sinais de embriaguez e como recusar com elegância.', 10, 'bartender', false, 21),
('Primeiro Contato e Boas-vindas', 'Protocolo de recepção, linguagem corporal e primeiros 30 segundos.', 10, 'recepcionista', false, 22),
('Gestão de Filas e Reservas', 'Lista de espera, comunicação com clientes e como informar tempos.', 10, 'recepcionista', false, 23),
('Comunicação entre Recepção e Salão', 'Como repassar informações especiais e mesas liberadas.', 8, 'recepcionista', false, 24),
('Resolução de Conflitos na Recepção', 'Situações comuns: espera longa, reserva sem registro, cliente agressivo.', 10, 'recepcionista', false, 25),
('Organização e Segurança com a Chapa', 'Preparo, EPIs, cuidados durante o serviço e emergências.', 12, 'chapeiro', false, 26),
('Pontos de Carne e Técnicas de Cocção', 'Pontos mal ao bem passado, como não ressecar e temperatura interna.', 15, 'chapeiro', false, 27),
('Higiene e Limpeza da Chapa', 'Raspagem durante o serviço e rotina completa de fechamento.', 10, 'chapeiro', false, 28),
('Função e Limites do Cumim', 'O que é e o que não é responsabilidade do cumim.', 8, 'cumim', false, 29),
('Reposição Proativa de Mesa', 'Água, pão, utensílios — quando e como repor sem ser pedido.', 8, 'cumim', false, 30),
('Retirada de Louças e Organização', 'Quando retirar, como fazer silenciosamente e limpar a mesa.', 8, 'cumim', false, 31),
('Apresentação e Serviço do Vinho', 'Protocolo de abertura, confirmação do pedido e técnica de serviço.', 15, 'sommelier', false, 32),
('Temperatura e Decantação', 'Temperaturas por tipo de vinho e quando decantvar.', 12, 'sommelier', false, 33),
('Harmonização Básica com o Cardápio', 'Princípios de harmonização por tipo de prato e proteína.', 15, 'sommelier', false, 34);