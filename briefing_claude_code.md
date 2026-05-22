# Briefing: Vaultly — Dashboard Financeiro Pessoal

## Identidade
- **Nome do app:** Vaultly
- **Conceito:** controle financeiro pessoal — cofre do seu dinheiro
- **Paleta:** verde (#0F6E56), roxo (#534AB7), azul (#185FA5), âmbar (#854F0B), vermelho (#A32D2D)

---

## Stack
- React + Vite
- Supabase (banco de dados + auth)
- Tailwind CSS
- Recharts (gráficos)

---

## 1. Autenticação (Supabase Auth)

- Login/cadastro via email + senha
- Ao criar conta nova → perfil zerado, usuário cadastra tudo do zero
- Conta pré-criada do João Vitor já vem com todos os dados preenchidos
- Todas as tabelas têm `user_id uuid REFERENCES auth.users(id)` para isolar dados por usuário
- Row Level Security (RLS) ativado em todas as tabelas — usuário só vê seus próprios dados

### Criar conta do João Vitor via Supabase Auth Admin:
```
Email: joaovitor2004andrade@gmail.com
Senha: 21092004
```
Após criar o usuário no Auth, pegar o UUID gerado e usar nos INSERTs abaixo.

---

## 2. Configuração do Supabase

Execute os SQLs para criar as tabelas:

```sql
-- Perfil financeiro
CREATE TABLE perfil (
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
CREATE TABLE gastos_fixos (
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
CREATE TABLE categorias_variaveis (
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

-- Registro de gastos variáveis
CREATE TABLE gastos_variaveis (
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
CREATE TABLE caixinhas (
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
CREATE TABLE aportes_caixinhas (
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
CREATE TABLE parcelas_terceiros (
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
CREATE TABLE faturas (
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
CREATE TABLE historico_poupanca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_referencia text NOT NULL,
  valor_poupado numeric NOT NULL DEFAULT 0,
  acumulado numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE historico_poupanca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own historico" ON historico_poupanca USING (auth.uid() = user_id);
```

---

## 3. Dados iniciais do João Vitor

> Substitua `'UUID_DO_JOAO_VITOR'` pelo UUID real gerado pelo Supabase Auth.

```sql
-- Perfil
INSERT INTO perfil (user_id, nome, salario_liquido, desconto_mei, reserva_decimo_terceiro, reserva_atual, data_meta, dia_pagamento)
VALUES ('UUID_DO_JOAO_VITOR', 'João Vitor', 3500, 86, 300, 1127, '2029-01-01', 10);

-- Gastos fixos
INSERT INTO gastos_fixos (user_id, nome, valor, categoria, data_fim, observacao) VALUES
('UUID_DO_JOAO_VITOR', 'Parcela do carro', 1000, 'transporte', '2029-08-01', 'R$ 39.400 restantes, ~39 parcelas'),
('UUID_DO_JOAO_VITOR', 'Gasolina', 400, 'transporte', null, 'Média entre R$300-500'),
('UUID_DO_JOAO_VITOR', 'Consórcio', 216, 'transporte', '2026-09-01', 'Encerra setembro/26'),
('UUID_DO_JOAO_VITOR', 'Financiamento Caixa', 210, 'moradia', null, 'Sua parte — divide com namorada. Seguro obra, aumenta com tempo'),
('UUID_DO_JOAO_VITOR', 'Plano Nubank', 89, 'saude', null, null),
('UUID_DO_JOAO_VITOR', 'Academia', 100, 'saude', null, null),
('UUID_DO_JOAO_VITOR', 'Remédio', 44, 'saude', null, null),
('UUID_DO_JOAO_VITOR', 'Cartão laranja', 63, 'obrigacoes', null, 'Vence dia 12'),
('UUID_DO_JOAO_VITOR', 'MEI', 86, 'obrigacoes', null, 'Pago dia 7 do mês seguinte'),
('UUID_DO_JOAO_VITOR', 'Reserva 13º PJ', 300, 'poupanca', null, 'Separar todo mês');

-- Categorias variáveis
INSERT INTO categorias_variaveis (user_id, nome, limite_mensal, icone, cor) VALUES
('UUID_DO_JOAO_VITOR', 'Saídas com namorada', 600, 'heart', '#534AB7'),
('UUID_DO_JOAO_VITOR', 'Alimentação/trabalho', 260, 'utensils', '#0F6E56'),
('UUID_DO_JOAO_VITOR', 'Barbearia', 40, 'scissors', '#854F0B'),
('UUID_DO_JOAO_VITOR', 'Outros/misc', 0, 'shopping-bag', '#888780');

-- Caixinhas
INSERT INTO caixinhas (user_id, nome, meta, saldo_atual, aporte_mensal, cor, icone, prazo_meses) VALUES
('UUID_DO_JOAO_VITOR', 'Reserva de emergência', 15000, 1127, 0, '#0F6E56', 'shield', null),
('UUID_DO_JOAO_VITOR', 'Casamento + mobília', 100000, 0, 0, '#534AB7', 'heart', 31),
('UUID_DO_JOAO_VITOR', 'Entrada nova casa', null, 0, 0, '#185FA5', 'home', 24),
('UUID_DO_JOAO_VITOR', '13º salário PJ', null, 0, 300, '#854F0B', 'calendar', null);

-- Parcelas de terceiros
INSERT INTO parcelas_terceiros (user_id, nome_devedor, descricao, valor_parcela, parcela_atual, total_parcelas, mes_inicio, mes_fim) VALUES
('UUID_DO_JOAO_VITOR', 'Marquim', 'Compra 1 (220,50)', 220.50, 3, 4, 'mai/26', 'jul/26'),
('UUID_DO_JOAO_VITOR', 'Marquim', 'Compra 2 (161,03)', 161.03, 2, 4, 'mai/26', 'ago/26'),
('UUID_DO_JOAO_VITOR', 'Marquim', 'Compra 3 (50,00)', 50.00, 2, 2, 'mai/26', 'jun/26'),
('UUID_DO_JOAO_VITOR', 'Marquim', 'Compra 4 (236,11)', 236.11, 7, 10, 'mai/26', 'fev/27'),
('UUID_DO_JOAO_VITOR', 'Marquim', 'Compra 5 (263,11)', 263.11, 4, 10, 'ago/26', 'mar/27'),
('UUID_DO_JOAO_VITOR', 'Vinícius', 'Compra 1 (158,00)', 158.00, 2, 5, 'mai/26', 'set/26'),
('UUID_DO_JOAO_VITOR', 'Vinícius', 'Compra 2 (131,00)', 131.00, 1, 8, 'mai/26', 'jan/27'),
('UUID_DO_JOAO_VITOR', 'Vinícius', 'Compra 3 (41,00)', 41.00, 1, 1, 'mai/26', 'mai/26'),
('UUID_DO_JOAO_VITOR', 'Vinícius', 'Compra 4 (125,00)', 125.00, 5, 8, 'out/26', 'jan/27');

-- Faturas
INSERT INTO faturas (user_id, mes_referencia, vencimento, valor_total, valor_terceiros) VALUES
('UUID_DO_JOAO_VITOR', 'jun/26', '2026-05-31', 1108.09, 998.00),
('UUID_DO_JOAO_VITOR', 'jul/26', '2026-07-07', 1349.37, 906.64),
('UUID_DO_JOAO_VITOR', 'ago/26', '2026-08-07', 858.80, 685.14),
('UUID_DO_JOAO_VITOR', 'set/26', '2026-09-08', 697.77, 551.77),
('UUID_DO_JOAO_VITOR', 'out/26', '2026-10-07', 559.38, 393.38),
('UUID_DO_JOAO_VITOR', 'nov/26', '2026-11-09', 482.38, 393.38),
('UUID_DO_JOAO_VITOR', 'dez/26', '2026-12-07', 404.49, 387.74),
('UUID_DO_JOAO_VITOR', 'jan/27', '2027-01-07', 349.87, 387.74),
('UUID_DO_JOAO_VITOR', 'fev/27', '2027-02-10', 224.87, 263.11),
('UUID_DO_JOAO_VITOR', 'mar/27', '2027-03-08', 224.87, 263.11);
```

---

## 4. Estrutura do App React

```
src/
  components/
    Auth/
      Login.jsx
      Register.jsx
    Dashboard/
      index.jsx
      MetricCards.jsx
    Orcamento/
      index.jsx
    Caixinhas/
      index.jsx
      CaixinhaCard.jsx
    Faturas/
      index.jsx
    Projecao/
      index.jsx
    FluxoMensal/
      index.jsx
    GastosVariaveis/
      index.jsx
    Configuracoes/
      index.jsx       -- editar perfil, salário, gastos fixos
  lib/
    supabase.js
  hooks/
    usePerfil.js
    useGastos.js
    useCaixinhas.js
    useFaturas.js
  App.jsx
  main.jsx
```

---

## 5. Funcionalidades por aba

### Orçamento
- Fixos vindos do banco (editáveis em Configurações)
- Sliders para variáveis com limite por categoria
- Sobra = renda - fixos - variáveis em tempo real
- Alerta vermelho/amarelo/verde
- Salvar orçamento no Supabase

### Caixinhas
- Grid de caixinhas com saldo, meta, progress bar, projeção
- Botão "Registrar aporte" → atualiza saldo
- Adicionar/editar/remover caixinha

### Faturas
- Tabela de faturas com Marquim e Vinícius separados
- Marcar como paga
- Alerta para faturas próximas do vencimento

### Projeção 100k
- Slider de poupança mensal
- Gráfico de linha (Recharts): acumulado vs meta
- Marcos: consórcio encerra set/26, parcelas encerram mar/27

### Fluxo mensal
- Roteiro visual do dia 10
- Calendário de vencimentos
- Checklist interativo

### Gastos variáveis
- Registro rápido: categoria + valor + descrição
- Barra de progresso por categoria (gasto vs limite)
- Resumo do mês

### Configurações
- Editar perfil (nome, salário, dia de pagamento)
- Gerenciar gastos fixos (adicionar, editar, desativar)
- Gerenciar categorias variáveis
- Trocar senha

---

## 6. Detalhes financeiros importantes

- Salário cai **dia 10**
- Fatura Nubank fecha **dia 7**, vence **dia 31**
- Cartão laranja vence **dia 12**
- Financiamento Caixa vence **dia 7**
- MEI pago **dia 7 do mês seguinte**
- Renda disponível = 3.500 - 86 - 300 = **R$ 3.114**
- Consórcio encerra **set/26** → +R$216/mês
- Parcelas cartão encerram **mar/27** → +R$263/mês
- Carro: ~39 parcelas restantes até **ago/29**

---

## 7. Variáveis de ambiente (.env)

```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## 8. Aviso de segurança para o desenvolvedor

Após criar a conta do João Vitor, **orientar o usuário a trocar a senha** nas configurações do app. As credenciais foram fornecidas apenas para setup inicial.

