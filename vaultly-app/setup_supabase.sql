-- ============================================================
-- VAULTLY — Setup completo do Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Perfil financeiro
CREATE TABLE IF NOT EXISTS perfil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome text NOT NULL DEFAULT '',
  salario_liquido numeric NOT NULL DEFAULT 0,
  desconto_mei numeric NOT NULL DEFAULT 0,
  reserva_decimo_terceiro numeric NOT NULL DEFAULT 0,
  renda_disponivel numeric GENERATED ALWAYS AS (salario_liquido - desconto_mei - reserva_decimo_terceiro) STORED,
  reserva_atual numeric NOT NULL DEFAULT 0,
  meta_100k numeric NOT NULL DEFAULT 100000,
  data_meta date NOT NULL DEFAULT '2029-01-01',
  dia_pagamento integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own profile" ON perfil USING (auth.uid() = user_id);

-- Gastos fixos
CREATE TABLE IF NOT EXISTS gastos_fixos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  valor numeric NOT NULL,
  categoria text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  data_inicio date,
  data_fim date,
  observacao text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE gastos_fixos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own gastos_fixos" ON gastos_fixos USING (auth.uid() = user_id);

-- Categorias variáveis
CREATE TABLE IF NOT EXISTS categorias_variaveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  limite_mensal numeric NOT NULL DEFAULT 0,
  icone text,
  cor text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categorias_variaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own categorias" ON categorias_variaveis USING (auth.uid() = user_id);

-- Gastos variáveis
CREATE TABLE IF NOT EXISTS gastos_variaveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  categoria_id uuid REFERENCES categorias_variaveis(id),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE gastos_variaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own gastos_variaveis" ON gastos_variaveis USING (auth.uid() = user_id);

-- Caixinhas
CREATE TABLE IF NOT EXISTS caixinhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  meta numeric,
  saldo_atual numeric NOT NULL DEFAULT 0,
  aporte_mensal numeric NOT NULL DEFAULT 0,
  cor text,
  icone text,
  prazo_meses integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE caixinhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own caixinhas" ON caixinhas USING (auth.uid() = user_id);

-- Aportes nas caixinhas
CREATE TABLE IF NOT EXISTS aportes_caixinhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caixinha_id uuid REFERENCES caixinhas(id) ON DELETE CASCADE,
  valor numeric NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE aportes_caixinhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own aportes" ON aportes_caixinhas USING (auth.uid() = user_id);

-- Parcelas de terceiros no cartão
CREATE TABLE IF NOT EXISTS parcelas_terceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_devedor text NOT NULL,
  descricao text,
  valor_parcela numeric NOT NULL,
  parcela_atual integer NOT NULL DEFAULT 1,
  total_parcelas integer NOT NULL,
  mes_inicio text NOT NULL,
  mes_fim text NOT NULL,
  pago boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE parcelas_terceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own parcelas" ON parcelas_terceiros USING (auth.uid() = user_id);

-- Faturas do cartão
CREATE TABLE IF NOT EXISTS faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_referencia text NOT NULL,
  vencimento date NOT NULL,
  valor_total numeric NOT NULL,
  valor_terceiros numeric NOT NULL DEFAULT 0,
  valor_proprio numeric GENERATED ALWAYS AS (valor_total - valor_terceiros) STORED,
  paga boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own faturas" ON faturas USING (auth.uid() = user_id);

-- Histórico de poupança
CREATE TABLE IF NOT EXISTS historico_poupanca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_referencia text NOT NULL,
  valor_poupado numeric NOT NULL DEFAULT 0,
  acumulado numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE historico_poupanca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own historico" ON historico_poupanca USING (auth.uid() = user_id);

-- ============================================================
-- DADOS DO JOÃO VITOR
-- Substitua 'UUID_DO_JOAO_VITOR' pelo UUID real do usuário
-- criado via Authentication > Users no Dashboard do Supabase
-- ============================================================

-- INSERT INTO perfil (user_id, nome, salario_liquido, desconto_mei, reserva_decimo_terceiro, reserva_atual, data_meta, dia_pagamento)
-- VALUES ('UUID_DO_JOAO_VITOR', 'João Vitor', 3500, 86, 300, 1127, '2029-01-01', 10);

-- INSERT INTO gastos_fixos (user_id, nome, valor, categoria, data_fim, observacao) VALUES
-- ('UUID_DO_JOAO_VITOR', 'Parcela do carro', 1000, 'transporte', '2029-08-01', 'R$ 39.400 restantes, ~39 parcelas'),
-- ('UUID_DO_JOAO_VITOR', 'Gasolina', 400, 'transporte', null, 'Média entre R$300-500'),
-- ('UUID_DO_JOAO_VITOR', 'Consórcio', 216, 'transporte', '2026-09-01', 'Encerra setembro/26'),
-- ('UUID_DO_JOAO_VITOR', 'Financiamento Caixa', 210, 'moradia', null, 'Sua parte — divide com namorada. Seguro obra, aumenta com tempo'),
-- ('UUID_DO_JOAO_VITOR', 'Plano Nubank', 89, 'saude', null, null),
-- ('UUID_DO_JOAO_VITOR', 'Academia', 100, 'saude', null, null),
-- ('UUID_DO_JOAO_VITOR', 'Remédio', 44, 'saude', null, null),
-- ('UUID_DO_JOAO_VITOR', 'Cartão laranja', 63, 'obrigacoes', null, 'Vence dia 12'),
-- ('UUID_DO_JOAO_VITOR', 'MEI', 86, 'obrigacoes', null, 'Pago dia 7 do mês seguinte'),
-- ('UUID_DO_JOAO_VITOR', 'Reserva 13º PJ', 300, 'poupanca', null, 'Separar todo mês');

-- INSERT INTO categorias_variaveis (user_id, nome, limite_mensal, icone, cor) VALUES
-- ('UUID_DO_JOAO_VITOR', 'Saídas com namorada', 600, 'heart', '#534AB7'),
-- ('UUID_DO_JOAO_VITOR', 'Alimentação/trabalho', 260, 'utensils', '#0F6E56'),
-- ('UUID_DO_JOAO_VITOR', 'Barbearia', 40, 'scissors', '#854F0B'),
-- ('UUID_DO_JOAO_VITOR', 'Outros/misc', 0, 'shopping-bag', '#888780');

-- (ver briefing para INSERTs completos de caixinhas, parcelas_terceiros e faturas)
